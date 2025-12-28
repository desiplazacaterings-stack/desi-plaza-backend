# Desi Plaza Caterings Backend - Production Setup Guide

## Overview
This is a production-ready Node.js + Express backend for the Desi Plaza Caterings catering business management system.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Environment**: dotenv for configuration

## Quick Start

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:
```
PORT=3000
MONGO_URI=mongodb://your_connection_string
NODE_ENV=production
```

### 3. Start Server
```bash
npm start
```

Server will run on the PORT specified in `.env` (default: 3000)

## Render Deployment

### 1. Create Render Account
- Go to https://render.com
- Sign up and connect your GitHub repository

### 2. Environment Variables on Render
Add these in Render Dashboard:
- `PORT`: (Render sets automatically, but can be 3000)
- `MONGO_URI`: Your MongoDB Atlas connection string
- `NODE_ENV`: production

### 3. Deploy
- Connect your GitHub repo to Render
- Set Build Command: `npm install`
- Set Start Command: `npm start`
- Deploy

## API Endpoints

### Health Check
```
GET /api/health
Response: { status: "ok", environment: "production", timestamp: "..." }
```

### Root
```
GET /
Response: { message: "...", version: "1.0.0", status: "running", environment: "..." }
```

## MongoDB Connection
- Uses Mongoose for ODM
- Connects via `process.env.MONGO_URI`
- Supports both local and MongoDB Atlas connections

## Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Server port |
| MONGO_URI | Yes | - | MongoDB connection string |
| NODE_ENV | No | development | Environment mode |

## Project Structure
```
backend/
├── index.js              # Main server file
├── package.json          # Dependencies
├── .env.example          # Example env variables
├── models/               # Mongoose schemas
├── routes/               # API routes
├── controllers/          # Business logic
├── middleware/           # Custom middleware
└── utils/                # Utility functions
```

## Important Notes
- ✅ No hardcoded ports - uses `process.env.PORT`
- ✅ No hardcoded database URLs - uses `process.env.MONGO_URI`
- ✅ CORS enabled for frontend communication
- ✅ JSON body parsing enabled
- ✅ Error handling middleware included
- ✅ Production-ready configuration

## Running Locally
```bash
# Install dependencies
npm install

# Create .env file with your configuration
cp .env.example .env

# Start development server
npm start
```

## Production Checklist
- [ ] Set `NODE_ENV=production` on Render
- [ ] Configure MongoDB URI (use MongoDB Atlas for production)
- [ ] Set appropriate PORT (Render assigns one automatically)
- [ ] Enable CORS for frontend domain
- [ ] Add JWT_SECRET for authentication
- [ ] Set up email configuration if needed

## Support
For issues or questions, refer to the project documentation.
