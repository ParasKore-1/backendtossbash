const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed',
            errors: errors.array() 
        });
    }
    next();
};

const validateSignup = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

const validateCoinFlip = [
    body('choice')
        .isIn(['heads', 'tails'])
        .withMessage('Choice must be either heads or tails'),
    body('betAmount')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Bet amount must be a positive number'),
    handleValidationErrors
];

const validateWalletUpdate = [
    body('amount')
        .isFloat({ min: 0 })
        .withMessage('Amount must be a positive number'),
    handleValidationErrors
];

module.exports = {
    validateSignup,
    validateLogin,
    validateCoinFlip,
    validateWalletUpdate,
    handleValidationErrors
}; 