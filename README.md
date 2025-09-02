# TossBash Backend API

A complete backend for the TossBash gaming application featuring coin flip game with wallet functionality.

## Features

- **User Authentication**: Signup, login, and profile management
- **Coin Flip Game**: Play with or without betting
- **Wallet System**: Balance management and transaction tracking
- **Game History**: Track all games and results
- **Statistics**: Comprehensive gaming and wallet statistics

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `config.env` and update the values:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure secret key for JWT tokens
     - `PORT`: Server port (default: 5000)

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas cloud service

5. **Run the application**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "username": "player123",
  "email": "player@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "username": "player123",
    "email": "player@example.com",
    "walletBalance": 1000
  },
  "token": "jwt_token"
}
```

#### POST `/api/auth/login`
Login to existing account.

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "username": "player123",
    "email": "player@example.com",
    "walletBalance": 1000
  },
  "token": "jwt_token"
}
```

#### GET `/api/auth/profile`
Get user profile (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

#### PUT `/api/auth/profile`
Update user profile (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### Game

#### POST `/api/game/coin-flip`
Play coin flip game (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "choice": "heads",
  "betAmount": 100
}
```

**Response:**
```json
{
  "message": "Game completed successfully",
  "game": {
    "id": "game_id",
    "userChoice": "heads",
    "result": "tails",
    "outcome": "lose",
    "betAmount": 100,
    "winnings": 0,
    "isBetPlaced": true,
    "playedAt": "2023-01-01T00:00:00.000Z"
  },
  "walletBalance": 900
}
```

#### GET `/api/game/history`
Get game history (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### GET `/api/game/stats`
Get game statistics (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "stats": {
    "totalGames": 50,
    "totalWins": 25,
    "totalLosses": 25,
    "totalBetAmount": 5000,
    "totalWinnings": 6000,
    "gamesWithBet": 40,
    "winRate": 50.0,
    "netProfit": 1000
  }
}
```

### Wallet

#### GET `/api/wallet/balance`
Get wallet balance (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "balance": 1000
}
```

#### GET `/api/wallet/transactions`
Get wallet transactions (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### POST `/api/wallet/add-money`
Add money to wallet (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "amount": 500
}
```

#### POST `/api/wallet/withdraw`
Withdraw money from wallet (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Request Body:**
```json
{
  "amount": 200
}
```

#### GET `/api/wallet/stats`
Get wallet statistics (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "stats": {
    "totalDeposits": 2000,
    "totalWithdrawals": 500,
    "totalBets": 3000,
    "totalWins": 3500,
    "totalLosses": 1500,
    "currentBalance": 1000,
    "netGamingProfit": 500,
    "totalNetFlow": 1500
  }
}
```

## Database Schema

### User
- `username`: String (unique, required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `walletBalance`: Number (default: 1000)
- `isActive`: Boolean (default: true)
- `lastLogin`: Date
- `timestamps`: Created/Updated timestamps

### Game
- `userId`: ObjectId (reference to User)
- `gameType`: String (default: 'coin_flip')
- `betAmount`: Number (default: 0)
- `userChoice`: String ('heads' or 'tails')
- `result`: String ('heads' or 'tails')
- `outcome`: String ('win' or 'lose')
- `winnings`: Number (default: 0)
- `isBetPlaced`: Boolean (default: false)
- `playedAt`: Date
- `timestamps`: Created/Updated timestamps

### WalletTransaction
- `userId`: ObjectId (reference to User)
- `type`: String ('bet', 'win', 'loss', 'deposit', 'withdrawal')
- `amount`: Number
- `balanceBefore`: Number
- `balanceAfter`: Number
- `gameId`: ObjectId (reference to Game, optional)
- `description`: String
- `transactionDate`: Date
- `timestamps`: Created/Updated timestamps

## Game Rules

1. **Coin Flip**: 50/50 chance of heads or tails
2. **Betting**: Optional - users can play without betting
3. **Winnings**: 2x bet amount if user wins
4. **Data Storage**: Only games with bets are saved to database
5. **Starting Balance**: New users start with 1000 coins

## Error Handling

The API returns appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `404`: Not Found
- `500`: Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with express-validator
- CORS enabled
- Helmet for security headers
- Request logging with Morgan

## Development

To run in development mode with auto-restart:
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the port specified in config.env).

## Testing

You can test the API using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

Remember to include the JWT token in the Authorization header for protected routes:
```
Authorization: Bearer your_jwt_token_here
``` 