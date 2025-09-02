const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gameType: {
        type: String,
        default: 'coin_flip',
        enum: ['coin_flip']
    },
    betAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    userChoice: {
        type: String,
        enum: ['heads', 'tails'],
        required: true
    },
    result: {
        type: String,
        enum: ['heads', 'tails'],
        required: true
    },
    outcome: {
        type: String,
        enum: ['win', 'lose'],
        required: true
    },
    winnings: {
        type: Number,
        default: 0
    },
    isBetPlaced: {
        type: Boolean,
        default: false
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for better query performance
gameSchema.index({ userId: 1, playedAt: -1 });
gameSchema.index({ isBetPlaced: 1 });

module.exports = mongoose.model('Game', gameSchema); 