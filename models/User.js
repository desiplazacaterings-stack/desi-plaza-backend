const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Define permissions for each role
const rolePermissions = {
  admin: {
    canManageUsers: true,
    canManageMenu: true,
    canManageOrders: true,
    canViewReports: true,
    canManageSettings: true,
  },
  staff: {
    canManageUsers: false,
    canManageMenu: false,
    canManageOrders: true,
    canViewReports: true,
    canManageSettings: false,
  },
  customer: {
    canManageUsers: false,
    canManageMenu: false,
    canManageOrders: false,
    canViewReports: false,
    canManageSettings: false,
  }
};

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Please provide name'],
    maxlength: 50,
    minlength: 3,
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Please provide email'],
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 8,
    select: false // Don't return password in queries
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'customer'],
    default: 'customer',
  },
  mobile: { 
    type: String,
    required: [true, 'Please provide mobile number'],
    match: [/^[0-9]{10,15}$/, 'Please provide a valid mobile number'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  },
  lastLogin: {
    type: Date,
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Create JWT with user data
userSchema.methods.createJWT = function() {
  const payload = { 
    userId: this._id, 
    name: this.name, 
    role: this.role,
    status: this.status,
    permissions: rolePermissions[this.role] || {}
  };
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: process.env.JWT_LIFETIME || '30d' }
  );
};

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Check if user has permission
userSchema.methods.hasPermission = function(permission) {
  return rolePermissions[this.role]?.[permission] || false;
};

// Static method to get all roles
userSchema.statics.getRoles = function() {
  return Object.keys(rolePermissions);
};

// Static method to get role permissions
userSchema.statics.getRolePermissions = function(role) {
  return rolePermissions[role] || {};
};

module.exports = mongoose.model('User', userSchema);
