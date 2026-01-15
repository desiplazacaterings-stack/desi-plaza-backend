/**
 * Mock Data Handler
 * Provides mock responses when MongoDB is unavailable
 */

const mockUsers = {
  'test@example.com': {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'test123456', // Mock password
    role: 'customer',
    status: 'active',
    customPermissions: {}
  },
  'admin@example.com': {
    _id: '507f1f77bcf86cd799439012',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123456',
    role: 'admin',
    status: 'active',
    customPermissions: {}
  }
};

// Mock JWT token generator
const generateMockToken = (user) => {
  // Simple base64 encoded token (not a real JWT)
  const payload = {
    _id: user._id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000)
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Mock login handler
const mockLogin = (email, password) => {
  const user = mockUsers[email];
  
  if (!user) {
    return {
      success: false,
      error: 'Invalid Credentials'
    };
  }

  if (user.password !== password) {
    return {
      success: false,
      error: 'Invalid Credentials'
    };
  }

  const token = generateMockToken(user);

  return {
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
  };
};

// Mock register handler
const mockRegister = (email, password, name) => {
  if (mockUsers[email]) {
    return {
      success: false,
      error: 'Email already registered'
    };
  }

  const newUser = {
    _id: `507f1f77bcf86cd799${Math.floor(Math.random() * 1000000)}`,
    name: name || email.split('@')[0],
    email,
    password,
    role: 'customer',
    status: 'active',
    customPermissions: {}
  };

  mockUsers[email] = newUser;

  return {
    success: true,
    message: 'Registration successful',
    data: {
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }
  };
};

// Mock verify token
const mockVerifyToken = (token) => {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return {
      success: true,
      data: {
        _id: decoded._id,
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid token'
    };
  }
};

module.exports = {
  mockLogin,
  mockRegister,
  mockVerifyToken,
  mockUsers,
  generateMockToken
};
