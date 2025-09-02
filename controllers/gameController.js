const Game = require('../models/Game');
const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// Generate random coin flip result
const flipCoin = () => {
    return Math.random() < 0.5 ? 'heads' : 'tails';
};

// Play coin flip game
const playCoinFlip = async (req, res) => {
    try {
        const { choice, betAmount = 0 } = req.body;
        const userId = req.user._id;

        // Validate choice
        if (!['heads', 'tails'].includes(choice)) {
            return res.status(400).json({ message: 'Invalid choice. Must be heads or tails.' });
        }

        // Check if user has enough balance for betting
        const user = await User.findById(userId);
        if (betAmount > 0 && user.walletBalance < betAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance for this bet.' });
        }

        // Generate coin flip result
        const result = flipCoin();
        const outcome = choice === result ? 'win' : 'lose';
        
        // Calculate winnings based on bet amount (higher bets = higher returns)
        let multiplier = 1.2; // Base multiplier
        if (betAmount >= 100) multiplier = 1.5; // Higher returns for bigger bets
        if (betAmount >= 500) multiplier = 2.0; // Even higher returns for very big bets
        
        const winnings = outcome === 'win' ? Math.floor(betAmount * multiplier) : 0;
        const isBetPlaced = betAmount > 0;

        // Create game record
        const game = new Game({
            userId,
            userChoice: choice,
            result,
            outcome,
            betAmount,
            winnings,
            isBetPlaced
        });

        await game.save();

        // Update wallet if bet was placed
        let balanceBefore = user.walletBalance;
        let balanceAfter = user.walletBalance;

        if (isBetPlaced) {
            // Deduct bet amount
            balanceBefore = user.walletBalance;
            user.walletBalance -= betAmount;
            
            // Add winnings if won
            if (outcome === 'win') {
                user.walletBalance += winnings;
            }
            
            balanceAfter = user.walletBalance;
            await user.save();

            // Create wallet transaction for bet
            await new WalletTransaction({
                userId,
                type: 'bet',
                amount: -betAmount,
                balanceBefore,
                balanceAfter: balanceBefore - betAmount,
                gameId: game._id,
                description: `Bet placed on coin flip - ${choice}`
            }).save();

            // Create wallet transaction for winnings if won
            if (outcome === 'win') {
                await new WalletTransaction({
                    userId,
                    type: 'win',
                    amount: winnings,
                    balanceBefore: balanceBefore - betAmount,
                    balanceAfter,
                    gameId: game._id,
                    description: `Won coin flip bet - ${winnings}`
                }).save();
            } else {
                await new WalletTransaction({
                    userId,
                    type: 'loss',
                    amount: -betAmount,
                    balanceBefore,
                    balanceAfter,
                    gameId: game._id,
                    description: `Lost coin flip bet - ${betAmount}`
                }).save();
            }
        }

        res.json({
            message: 'Game completed successfully',
            game: {
                id: game._id,
                userChoice: choice,
                result,
                outcome,
                betAmount,
                winnings,
                isBetPlaced,
                playedAt: game.playedAt
            },
            walletBalance: user.walletBalance
        });
    } catch (error) {
        console.error('Coin flip error:', error);
        res.status(500).json({ message: 'Server error during game' });
    }
};

// Get user's game history
const getGameHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const games = await Game.find({ userId })
            .sort({ playedAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalGames = await Game.countDocuments({ userId });

        res.json({
            games,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalGames / limit),
                totalGames,
                hasNext: page * limit < totalGames,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get game history error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get game statistics
const getGameStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Game.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: null,
                    totalGames: { $sum: 1 },
                    totalWins: { $sum: { $cond: [{ $eq: ['$outcome', 'win'] }, 1, 0] } },
                    totalLosses: { $sum: { $cond: [{ $eq: ['$outcome', 'lose'] }, 1, 0] } },
                    totalBetAmount: { $sum: '$betAmount' },
                    totalWinnings: { $sum: '$winnings' },
                    gamesWithBet: { $sum: { $cond: ['$isBetPlaced', 1, 0] } }
                }
            }
        ]);

        const userStats = stats[0] || {
            totalGames: 0,
            totalWins: 0,
            totalLosses: 0,
            totalBetAmount: 0,
            totalWinnings: 0,
            gamesWithBet: 0
        };

        const winRate = userStats.totalGames > 0 
            ? (userStats.totalWins / userStats.totalGames * 100).toFixed(2)
            : 0;

        res.json({
            stats: {
                ...userStats,
                winRate: parseFloat(winRate),
                netProfit: userStats.totalWinnings - userStats.totalBetAmount
            }
        });
    } catch (error) {
        console.error('Get game stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    playCoinFlip,
    getGameHistory,
    getGameStats
}; 