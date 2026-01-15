const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthorizedError, NotFoundError } = require('../errors');

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  const { role, status, search } = req.query;
  
  // Build filter
  const filter = {};
  
  if (role) {
    filter.role = role;
  }
  
  if (status) {
    filter.status = status;
  }
  
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } }
    ];
  }
  
  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 });
  
  res.status(StatusCodes.OK).json({
    success: true,
    count: users.length,
    data: { users }
  });
};

// Get single user (Admin only)
const getUser = async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id).select('-password');
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { user }
  });
};

// Create new user (Admin only)
const createUser = async (req, res) => {
  const { name, email, password, mobile, role, status } = req.body;
  
  console.log('=== CREATE USER REQUEST ===');
  console.log('Body:', JSON.stringify(req.body));
  console.log('Parsed fields:', { name, email, password, mobile, role, status });
  
  // Validate required fields
  if (!name || !email || !password || !mobile || !role) {
    console.log('Validation failed - missing fields');
    throw new BadRequestError('Please provide all required fields: name, email, password, mobile, role');
  }
  
  // Validate role
  const validRoles = ['admin', 'staff', 'customer'];
  if (!validRoles.includes(role)) {
    console.log('Invalid role:', role);
    throw new BadRequestError(`Role must be one of: ${validRoles.join(', ')}`);
  }
  
  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log('User already exists with email:', email);
    throw new BadRequestError('User with this email already exists');
  }
  
  // Create user
  console.log('Creating user with data:', { name, email, mobile, role, status: status || 'active' });
  const user = await User.create({
    name,
    email,
    password,
    mobile,
    role,
    status: status || 'active',
    emailVerified: true // Admin-created users are pre-verified
  });
  
  console.log('User created successfully:', user._id);
  
  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      }
    }
  });
};

// Update user (Admin only)
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, role, status } = req.body;
  
  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Update allowed fields
  if (name) user.name = name;
  if (mobile) user.mobile = mobile;
  if (role) {
    const validRoles = ['admin', 'staff', 'customer'];
    if (!validRoles.includes(role)) {
      throw new BadRequestError(`Role must be one of: ${validRoles.join(', ')}`);
    }
    user.role = role;
  }
  if (status) {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    user.status = status;
  }
  
  // Email update (only if different from current)
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }
    user.email = email;
  }
  
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin,
        updatedAt: user.updatedAt
      }
    }
  });
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  
  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Prevent deleting the only admin
  if (user.role === 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 1) {
      throw new BadRequestError('Cannot delete the last admin user');
    }
  }
  
  await User.findByIdAndDelete(id);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User deleted successfully'
  });
};

// Change user status (Admin only)
const changeUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    throw new BadRequestError('Please provide status');
  }
  
  const validStatuses = ['active', 'inactive', 'suspended'];
  if (!validStatuses.includes(status)) {
    throw new BadRequestError(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: `User status changed to ${status}`,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  });
};

// Change user role (Admin only)
const changeUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  
  if (!role) {
    throw new BadRequestError('Please provide role');
  }
  
  const validRoles = ['admin', 'staff', 'customer'];
  if (!validRoles.includes(role)) {
    throw new BadRequestError(`Role must be one of: ${validRoles.join(', ')}`);
  }
  
  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Prevent removing admin from the last admin
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 1) {
      throw new BadRequestError('Cannot remove admin role from the last admin user');
    }
  }
  
  user.role = role;
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: `User role changed to ${role}`,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    }
  });
};

// Reset user password (Admin only)
const resetUserPassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  
  if (!newPassword) {
    throw new BadRequestError('Please provide new password');
  }
  
  if (newPassword.length < 8) {
    throw new BadRequestError('Password must be at least 8 characters long');
  }
  
  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User password reset successfully'
  });
};

// Get user statistics (Admin only)
const getUserStatistics = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const adminCount = await User.countDocuments({ role: 'admin' });
  const staffCount = await User.countDocuments({ role: 'staff' });
  const customerCount = await User.countDocuments({ role: 'customer' });
  const activeUsers = await User.countDocuments({ status: 'active' });
  const inactiveUsers = await User.countDocuments({ status: 'inactive' });
  const suspendedUsers = await User.countDocuments({ status: 'suspended' });
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      statistics: {
        totalUsers,
        byRole: {
          admin: adminCount,
          staff: staffCount,
          customer: customerCount
        },
        byStatus: {
          active: activeUsers,
          inactive: inactiveUsers,
          suspended: suspendedUsers
        }
      }
    }
  });
};

// Get available roles
const getAvailableRoles = async (req, res) => {
  const roles = User.getRoles();
  const rolesWithPermissions = {};
  
  roles.forEach(role => {
    rolesWithPermissions[role] = User.getRolePermissions(role);
  });
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      roles,
      rolesWithPermissions
    }
  });
};

// Get user permissions (Admin only)
const getUserPermissions = async (req, res) => {
  console.log('=== getUserPermissions called ===');
  console.log('req.user:', req.user);
  console.log('ID from params:', req.params.id);
  
  const { id } = req.params;
  
  try {
    // Validate req.user exists
    if (!req.user) {
      console.error('req.user is undefined');
      throw new UnauthorizedError('User authentication failed');
    }
    
    // Validate req.user._id exists
    if (req.user._id === undefined || req.user._id === null) {
      console.error('req.user._id is null or undefined:', req.user._id);
      throw new UnauthorizedError('User authentication failed - missing user ID');
    }
    
    // Convert both to strings for safe comparison
    const currentUserId = String(req.user._id);
    const requestedUserId = String(id);
    
    console.log('Comparing IDs - current:', currentUserId, 'requested:', requestedUserId, 'role:', req.user.role);
    
    if (currentUserId !== requestedUserId && req.user.role !== 'admin') {
      throw new UnauthorizedError('Access denied. You can only view your own permissions.');
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Ensure customPermissions is always an object, even if null/undefined
    const customPermissions = user.customPermissions || {};
    
    console.log('getUserPermissions - User found:', user._id);
    console.log('getUserPermissions - customPermissions:', Object.keys(customPermissions));
    
    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        userId: user._id,
        role: user.role,
        customPermissions: customPermissions
      }
    });
  } catch (error) {
    console.error('getUserPermissions error:', error);
    throw error;
  }
};

// Update user permissions (Admin only)
const updateUserPermissions = async (req, res) => {
  const { id } = req.params;
  const { customPermissions } = req.body;
  
  if (!customPermissions || typeof customPermissions !== 'object') {
    throw new BadRequestError('Valid permissions object is required');
  }
  
  // Merge permissions with existing ones instead of replacing
  const user = await User.findById(id);
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Initialize customPermissions if null/undefined
  if (!user.customPermissions) {
    user.customPermissions = {};
  }
  
  // Merge new permissions with existing ones
  user.customPermissions = {
    ...user.customPermissions,
    ...customPermissions
  };
  
  console.log('updateUserPermissions - Merged permissions:', user.customPermissions);
  
  await user.save();
  
  // Return updated user with all permissions
  const updatedUser = await User.findById(id);
  
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'User permissions updated successfully',
    data: { 
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        customPermissions: updatedUser.customPermissions
      }
    }
  });
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  changeUserStatus,
  changeUserRole,
  resetUserPassword,
  getUserStatistics,
  getAvailableRoles,
  getUserPermissions,
  updateUserPermissions
};
