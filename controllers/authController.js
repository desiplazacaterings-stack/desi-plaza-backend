const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Register a new user
const register = async (req, res) => {
  // First registered user will be an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'customer';

  const user = await User.create({ ...req.body, role });
  
  // Generate email verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  
  // Send verification email
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
  const message = `Please verify your email by clicking on the following link: \n\n ${verifyUrl}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message
    });
    
    res.status(StatusCodes.CREATED).json({ 
      success: true,
      message: 'Verification email sent',
      data: { 
        user: { 
          name: user.name, 
          email: user.email, 
          role: user.role 
        }
      }
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new Error('There was an error sending the verification email. Please try again later.');
  }
};

// Login user
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  // Check if user is active
  if (user.status !== 'active') {
    throw new UnauthenticatedError('Your account is not active. Please contact support.');
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  const token = user.createJWT();
  
  res.status(StatusCodes.OK).json({ 
    success: true,
    data: { 
      user: { 
        _id: user._id,
        name: user.name, 
        email: user.email, 
        role: user.role,
        status: user.status,
        customPermissions: user.customPermissions
      },
      token 
    }
  });
};

// Forgot password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new BadRequestError('Please provide email');
  }
  
  const user = await User.findOne({ email });
  
  if (!user) {
    // Don't reveal if user exists for security reasons
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'If your email is registered, you will receive a password reset link'
    });
  }
  
  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  
  // Send email with reset token
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested a password reset. Please make a PUT request to: \n\n ${resetUrl}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });
    
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Password reset token sent to email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new Error('There was an error sending the email. Please try again later.');
  }
};

// Reset password
const resetPassword = async (req, res) => {
  // Get token and hash it
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new BadRequestError('Token is invalid or has expired');
  }
  
  // Set new password
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();
  await user.save();
  
  // Log the user in, send JWT
  const token = user.createJWT();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token 
    }
  });
};

// Update password
const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Please provide current and new password');
  }
  
  const user = await User.findById(req.user.userId).select('+password');
  
  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new UnauthenticatedError('Current password is incorrect');
  }
  
  // Update password
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  
  // Generate new token
  const token = user.createJWT();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      token 
    }
  });
};

// Verify email
const verifyEmail = async (req, res) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new BadRequestError('Token is invalid or has expired');
  }
  
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Email verified successfully',
    data: { 
      user: { 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }
    }
  });
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    throw new BadRequestError('Please provide email');
  }
  
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new BadRequestError('No user found with this email');
  }
  
  if (user.emailVerified) {
    throw new BadRequestError('Email already verified');
  }
  
  // Generate new verification token
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  
  // Send verification email
  const verifyUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/verify-email/${verificationToken}`;
  const message = `Please verify your email by clicking on the following link: \n\n ${verifyUrl}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message
    });
    
    res.status(StatusCodes.OK).json({ 
      success: true,
      message: 'Verification email resent'
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    throw new Error('There was an error sending the verification email. Please try again later.');
  }
};

// Get current user
const getMe = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-__v -createdAt -updatedAt');
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { user }
  });
};

// Logout user (client should delete the token)
const logout = (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Successfully logged out'
  });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  resendVerificationEmail,
  getMe,
  logout
};
