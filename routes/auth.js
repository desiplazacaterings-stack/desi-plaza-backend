const express = require('express');
const { 
  register, 
  login, 
  forgotPassword, 
  resetPassword, 
  updatePassword, 
  verifyEmail, 
  resendVerificationEmail,
  getMe,
  logout
} = require('../controllers/authController');
const { authenticateUser } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// Public routes
router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.put('/reset-password/:token', asyncHandler(resetPassword));
router.get('/verify-email/:token', asyncHandler(verifyEmail));
router.post('/resend-verification-email', asyncHandler(resendVerificationEmail));

// Protected routes (require authentication)
router.use(authenticateUser);
router.get('/me', asyncHandler(getMe));
router.put('/update-password', asyncHandler(updatePassword));
router.get('/logout', asyncHandler(logout));

module.exports = router;
