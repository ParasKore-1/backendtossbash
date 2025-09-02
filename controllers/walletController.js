const User = require('../models/User');
const WalletTransaction = require('../models/WalletTransaction');

// Get wallet balance
const getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('walletBalance');
        res.json({
            balance: user.walletBalance
        });
    } catch (error) {
        console.error('Get wallet balance error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get wallet transactions
const getWalletTransactions = async (req, res) => {
    try {
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const transactions = await WalletTransaction.find({ userId })
            .sort({ transactionDate: -1 })
            .skip(skip)
            .limit(limit)
            .populate('gameId', 'userChoice result outcome betAmount winnings');

        const totalTransactions = await WalletTransaction.countDocuments({ userId });

        res.json({
            transactions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTransactions / limit),
                totalTransactions,
                hasNext: page * limit < totalTransactions,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get wallet transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Add money to wallet (for testing/demo purposes)
const addMoney = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user._id;

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        const user = await User.findById(userId);
        const balanceBefore = user.walletBalance;
        user.walletBalance += amount;
        const balanceAfter = user.walletBalance;

        await user.save();

        // Create transaction record
        await new WalletTransaction({
            userId,
            type: 'deposit',
            amount,
            balanceBefore,
            balanceAfter,
            description: `Added ${amount} diamonds to wallet`
        }).save();

        res.json({
            message: 'Money added successfully',
            balance: user.walletBalance
        });
    } catch (error) {
        console.error('Add money error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Withdraw money from wallet
const withdrawMoney = async (req, res) => {
    try {
        const { amount } = req.body;
        const userId = req.user._id;

        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be positive' });
        }

        const user = await User.findById(userId);

        if (user.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient balance for withdrawal' });
        }

        const balanceBefore = user.walletBalance;
        user.walletBalance -= amount;
        const balanceAfter = user.walletBalance;

        await user.save();

        // Create transaction record
        await new WalletTransaction({
            userId,
            type: 'withdrawal',
            amount: -amount,
            balanceBefore,
            balanceAfter,
            description: `Withdrew ${amount} diamonds from wallet`
        }).save();

        res.json({
            message: 'Money withdrawn successfully',
            balance: user.walletBalance
        });
    } catch (error) {
        console.error('Withdraw money error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get wallet statistics
const getWalletStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await WalletTransaction.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: null,
                    totalDeposits: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', 'deposit'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    totalWithdrawals: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', 'withdrawal'] },
                                { $abs: '$amount' },
                                0
                            ]
                        }
                    },
                    totalBets: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', 'bet'] },
                                { $abs: '$amount' },
                                0
                            ]
                        }
                    },
                    totalWins: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', 'win'] },
                                '$amount',
                                0
                            ]
                        }
                    },
                    totalLosses: {
                        $sum: {
                            $cond: [
                                { $eq: ['$type', 'loss'] },
                                { $abs: '$amount' },
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const userStats = stats[0] || {
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalBets: 0,
            totalWins: 0,
            totalLosses: 0
        };

        const user = await User.findById(userId);
        const currentBalance = user.walletBalance;

        res.json({
            stats: {
                ...userStats,
                currentBalance,
                netGamingProfit: userStats.totalWins - userStats.totalBets,
                totalNetFlow: userStats.totalDeposits - userStats.totalWithdrawals
            }
        });
    } catch (error) {
        console.error('Get wallet stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getWalletBalance,
    getWalletTransactions,
    addMoney,
    withdrawMoney,
    getWalletStats
}; 