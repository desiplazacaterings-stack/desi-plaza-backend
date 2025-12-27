# Role-Based User Management System Documentation

## Overview

The Desi Plaza Caterings application includes a comprehensive role-based user management system with three user roles: **Admin**, **Staff**, and **Customer**. This system provides fine-grained control over access and permissions within the application.

## User Roles

### 1. Admin
**Full System Access**
- Can manage all users (create, read, update, delete)
- Can manage menu items and pricing
- Can manage all orders
- Can view system reports and analytics
- Can access system settings
- Can change user roles and statuses
- Can reset user passwords

**Permissions:**
```javascript
{
  canManageUsers: true,
  canManageMenu: true,
  canManageOrders: true,
  canViewReports: true,
  canManageSettings: true
}
```

### 2. Staff
**Limited Management Access**
- Can manage customer orders
- Can view reports
- Cannot manage other users or system settings
- Cannot manage menu items

**Permissions:**
```javascript
{
  canManageUsers: false,
  canManageMenu: false,
  canManageOrders: true,
  canViewReports: true,
  canManageSettings: false
}
```

### 3. Customer
**Personal Account Access Only**
- Can create and manage their own orders
- Can create and manage quotations
- Cannot access admin features
- Cannot view other users' data

**Permissions:**
```javascript
{
  canManageUsers: false,
  canManageMenu: false,
  canManageOrders: false,
  canViewReports: false,
  canManageSettings: false
}
```

## User Status

All users have one of three statuses:

### Active
- User can access the system normally
- Default status for new users

### Inactive
- User account is disabled
- User cannot log in
- Admin can reactivate at any time

### Suspended
- User account is suspended (typically due to violation)
- User cannot log in
- Requires admin action to restore

## Admin Dashboard

### Access
Only users with the `admin` role can access the admin dashboard:
- **Frontend:** Navigate to `/admin` route
- **Navigation:** The admin link appears in the sidebar only for admin users

### Features

#### User Management Tab
1. **View All Users**
   - Search by name, email, or phone number
   - Filter by role (Admin, Staff, Customer)
   - Filter by status (Active, Inactive, Suspended)

2. **Create New User**
   - Admin can manually create users
   - Set initial role and status
   - Pre-verify email (no verification needed)

3. **Edit User**
   - Update user information (name, email, mobile)
   - Change user role
   - Change user status

4. **Delete User**
   - Remove users from system
   - Protection: Cannot delete the last admin user

5. **User Statistics**
   - Total user count
   - Users by role (Admin, Staff, Customer)
   - Users by status (Active, Inactive, Suspended)

#### Settings Tab
- View role permissions documentation
- View user role descriptions
- View user status explanations

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login user
POST   /api/auth/forgot-password       - Request password reset
PUT    /api/auth/reset-password/:token - Reset password
GET    /api/auth/verify-email/:token   - Verify email
GET    /api/auth/me                    - Get current user (protected)
PUT    /api/auth/update-password       - Update password (protected)
GET    /api/auth/logout                - Logout (protected)
```

### Admin Endpoints (Protected - Admin Only)
```
GET    /api/admin/users                - Get all users (with filters)
POST   /api/admin/users                - Create new user
GET    /api/admin/users/:id            - Get specific user
PATCH  /api/admin/users/:id            - Update user
DELETE /api/admin/users/:id            - Delete user
PATCH  /api/admin/users/:id/status     - Change user status
PATCH  /api/admin/users/:id/role       - Change user role
PATCH  /api/admin/users/:id/reset-password - Reset user password
GET    /api/admin/statistics/users     - Get user statistics
GET    /api/admin/roles/available      - Get available roles and permissions
```

## JWT Token Structure

When a user logs in, they receive a JWT token containing:

```javascript
{
  userId: "user_id",
  name: "User Name",
  role: "admin|staff|customer",
  status: "active|inactive|suspended",
  permissions: {
    canManageUsers: boolean,
    canManageMenu: boolean,
    canManageOrders: boolean,
    canViewReports: boolean,
    canManageSettings: boolean
  },
  iat: timestamp,
  exp: timestamp (30 days)
}
```

## Backend Implementation

### User Model (`models/User.js`)
- Stores user information and credentials
- Hash passwords using bcrypt (10 salt rounds)
- Includes role-based permission system
- Supports email verification
- Supports password reset functionality

### Authorization Middleware (`middleware/authorization.js`)
```javascript
requireAdmin                - Check if user is admin
requireStaffOrAdmin         - Check if user is staff or admin
requirePermission(permission) - Check specific permission
checkUserStatus             - Check if user status is active
```

### Admin Controller (`controllers/adminController.js`)
Provides all admin operations:
- `getAllUsers()` - Fetch users with filters
- `getUser()` - Fetch single user
- `createUser()` - Create new user
- `updateUser()` - Update user info
- `deleteUser()` - Delete user
- `changeUserStatus()` - Change user status
- `changeUserRole()` - Change user role
- `resetUserPassword()` - Reset user password
- `getUserStatistics()` - Get statistics
- `getAvailableRoles()` - Get role information

## Frontend Implementation

### AdminDashboard Component (`pages/AdminDashboard.jsx`)
Main admin interface with:
- User listing and management
- Create/edit/delete users
- Change user roles and status
- Real-time statistics
- Search and filtering

### Navbar Component (`components/Navbar.jsx`)
- Conditionally displays admin link
- Only visible to admin users
- Reads user role from localStorage

## Security Features

1. **JWT Authentication**
   - All protected routes require valid JWT token
   - Token expires in 30 days
   - Token includes user permissions

2. **Role-Based Access Control**
   - Middleware validates user role before executing actions
   - Admin-only routes are protected at the middleware level

3. **Password Security**
   - Passwords hashed using bcrypt
   - Minimum 8 characters
   - Password reset tokens expire in 10 minutes

4. **Email Verification**
   - New users receive verification email
   - Email tokens expire in 24 hours
   - Admin-created users are pre-verified

5. **Account Protection**
   - Users have status field (active/inactive/suspended)
   - Inactive/suspended users cannot log in
   - Cannot delete the last admin user

## First User Setup

When the first user registers:
- Automatically assigned the `admin` role
- Other users registered after default to `customer` role
- This ensures the system always has at least one admin

## Usage Examples

### Login and Get Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Create New Staff Member
```bash
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "mobile": "9876543210",
    "role": "staff"
  }'
```

### Get All Users with Filters
```bash
curl -X GET "http://localhost:3000/api/admin/users?role=staff&status=active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Change User Role
```bash
curl -X PATCH http://localhost:3000/api/admin/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "customer"}'
```

## Testing the System

### Test Scenarios

1. **Admin Access**
   - Register first user (becomes admin)
   - Login with admin account
   - Access `/admin` dashboard
   - Create new users

2. **Staff Access**
   - Create staff user from admin panel
   - Login with staff account
   - Verify cannot access admin dashboard
   - Verify staff can only manage orders

3. **Customer Access**
   - Create customer user from admin panel
   - Login with customer account
   - Verify cannot access admin features
   - Verify limited to personal orders

4. **User Status Changes**
   - Create user with active status
   - Login successfully
   - Admin changes status to inactive
   - Verify user cannot login
   - Admin changes back to active
   - Verify user can login again

## Troubleshooting

### Admin Dashboard Not Showing
- Verify user is logged in
- Check user role is 'admin'
- Check token is valid (not expired)
- Check localStorage contains user data

### Cannot Create Users
- Verify you are logged in as admin
- Check email is not already in use
- Verify all required fields provided
- Check network requests in browser dev tools

### Token Expires Too Quickly
- Tokens expire in 30 days by default
- Check `JWT_LIFETIME` environment variable
- Use `/api/auth/me` to verify token validity

### Cannot Delete Admin User
- System prevents deletion of last admin
- Promote another user to admin first
- Then delete the original admin

## Environment Variables

```env
JWT_SECRET=your-secret-key-here          # For signing JWT tokens
JWT_LIFETIME=30d                          # Token expiration time
MONGO_URI=mongodb://localhost:27017/desi_plaza  # Database connection
PORT=3000                                 # Server port
```

## Future Enhancements

1. Role customization and creation
2. Fine-grained permission settings
3. User activity logging and auditing
4. Bulk user import/export
5. User groups and team management
6. API key generation for staff
7. Two-factor authentication
8. Role-based route restrictions on frontend

## File Structure

```
backend/
├── controllers/
│   ├── authController.js         # Authentication logic
│   └── adminController.js        # Admin operations
├── middleware/
│   ├── auth.js                   # Authentication middleware
│   └── authorization.js          # Authorization & role checking
├── models/
│   └── User.js                   # User schema with roles
├── routes/
│   ├── auth.js                   # Auth endpoints
│   └── admin.js                  # Admin endpoints
└── utils/
    └── asyncHandler.js           # Error handling wrapper

frontend/
├── src/
│   ├── components/
│   │   └── Navbar.jsx            # Nav with admin link
│   ├── pages/
│   │   ├── AdminDashboard.jsx    # Admin interface
│   │   └── AdminDashboard.css    # Admin styles
│   └── App.jsx                   # Routes setup
```

---

**Last Updated:** 2024
**Version:** 1.0.0
