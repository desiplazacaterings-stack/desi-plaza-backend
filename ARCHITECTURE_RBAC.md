# 🏗️ Role-Based User Management System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     DESI PLAZA CATERING                         │
│              Role-Based User Management System                   │
└─────────────────────────────────────────────────────────────────┘

                         ┌──────────────┐
                         │   User       │
                         │  Registers   │
                         └──────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    │                       │
              First User?            No - Customer
              │                       │
              Yes - Admin        Can create/view own orders
              │
              Can manage everything
```

## Frontend Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       FRONTEND (React)                      │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │   App.jsx        │      │   Navbar.jsx     │            │
│  │  (Routes)        │      │  (Navigation)    │            │
│  │ - /              │      │ - Conditional    │            │
│  │ - /admin         │      │   Admin Link     │            │
│  │ - /enquiries     │      │ - Reads Role     │            │
│  │ - /quotations    │      │   from Storage   │            │
│  └──────────────────┘      └──────────────────┘            │
│         │                                                    │
│         ├─────────────────┬──────────────┐                  │
│         │                 │              │                  │
│         ▼                 ▼              ▼                  │
│  ┌──────────────┐  ┌──────────────┐ ┌──────────┐          │
│  │  Regular     │  │   Admin      │ │ Other    │          │
│  │  Pages       │  │  Dashboard   │ │ Pages    │          │
│  │              │  │              │ │          │          │
│  │ - Home       │  │ Users List   │ │ - Menu   │          │
│  │ - Enquiries  │  │ Create User  │ │ - Items  │          │
│  │ - Quotations │  │ Edit User    │ │ - Orders │          │
│  │ - Orders     │  │ Delete User  │ │          │          │
│  │              │  │ Statistics   │ │          │          │
│  └──────────────┘  └──────────────┘ └──────────┘          │
│                            │                                │
│                    ┌───────┴────────┐                       │
│                    │                │                       │
│              API Calls         localStorage                │
│             (JWT Token)       (User Data)                  │
│                    │                │                       │
└────────────────────┼────────────────┼───────────────────────┘
                     │                │
                     └────────┬───────┘
                              │
```

## Backend Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       BACKEND (Node.js)                     │
├────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌──────────────────┐                     │
│                    │  server.js       │                     │
│                    │  - Express Setup │                     │
│                    │  - Routes Config │                     │
│                    │  - Error Handler │                     │
│                    └────────┬─────────┘                     │
│                             │                               │
│         ┌───────────────────┼───────────────────┐           │
│         │                   │                   │           │
│         ▼                   ▼                   ▼           │
│    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│    │  Auth       │   │  Admin      │   │  Other      │   │
│    │  Routes     │   │  Routes     │   │  Routes     │   │
│    │             │   │             │   │             │   │
│    │ /register   │   │ /users      │   │ /items      │   │
│    │ /login      │   │ /users/:id  │   │ /orders     │   │
│    │ /reset-pwd  │   │ /status     │   │ /quotations │   │
│    │             │   │ /role       │   │             │   │
│    │             │   │ /statistics │   │             │   │
│    └────────┬────┘   └─────┬───────┘   └─────────────┘   │
│             │              │                               │
│             ├──────────────┴───────────┐                   │
│             │                          │                   │
│             ▼                          ▼                   │
│    ┌──────────────────┐       ┌──────────────────┐       │
│    │  MIDDLEWARE      │       │  CONTROLLERS     │       │
│    │                  │       │                  │       │
│    │ ┌──────────────┐ │       │ ┌──────────────┐ │       │
│    │ │ auth.js      │ │       │ │authController│ │       │
│    │ │ - JWT verify │ │       │ │ - register   │ │       │
│    │ │ - Extract    │ │       │ │ - login      │ │       │
│    │ │   payload    │ │       │ │ - logout     │ │       │
│    │ └──────────────┘ │       │ └──────────────┘ │       │
│    │                  │       │                  │       │
│    │ ┌──────────────┐ │       │ ┌──────────────┐ │       │
│    │ │authz.js      │ │       │ │adminController
│    │ │ - requireAdmin│       │ │ - createUser │ │       │
│    │ │ - permissions│ │       │ │ - deleteUser │ │       │
│    │ │ - checkStatus│ │       │ │ - changeRole │ │       │
│    │ └──────────────┘ │       │ └──────────────┘ │       │
│    │                  │       │                  │       │
│    └──────────────────┘       └──────────────────┘       │
│             │                          │                   │
│             └──────────────┬───────────┘                   │
│                            │                               │
│                    ┌───────▼──────────┐                    │
│                    │  MODELS          │                    │
│                    │                  │                    │
│                    │ User.js:         │                    │
│                    │ - name           │                    │
│                    │ - email          │                    │
│                    │ - password       │                    │
│                    │ - role (enum)    │                    │
│                    │ - status (enum)  │                    │
│                    │ - permissions    │                    │
│                    │                  │                    │
│                    └────────┬─────────┘                    │
│                             │                              │
│                    ┌────────▼──────────┐                   │
│                    │   MongoDB         │                   │
│                    │   Database        │                   │
│                    │                   │                   │
│                    │ Users Collection: │                   │
│                    │ - admin (count)   │                   │
│                    │ - staff (count)   │                   │
│                    │ - customer (count)│                   │
│                    │ - active          │                   │
│                    │ - inactive        │                   │
│                    │ - suspended       │                   │
│                    │                   │                   │
│                    └───────────────────┘                   │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

## Authentication & Authorization Flow

```
┌─────────────────────────────────────────────────────────────┐
│             USER LOGIN FLOW                                  │
└─────────────────────────────────────────────────────────────┘

1. User submits credentials
   POST /api/auth/login
   {email, password}
         │
         ▼
2. Controller verifies credentials
   - Find user by email
   - Check password matches
   - Verify status === 'active'
         │
         ▼
3. Generate JWT Token
   Header:   {alg: HS256, typ: JWT}
   Payload:  {userId, name, role, status, permissions}
   Verify:   SECRET_KEY
         │
         ▼
4. Return token to frontend
   {token, user: {name, email, role, status}}
         │
         ▼
5. Frontend stores in localStorage
   token + user object
         │
         ▼
6. Future requests include Authorization header
   Authorization: Bearer {token}
         │
         ▼
7. Middleware verifies token
   - Decode JWT
   - Validate signature
   - Extract user data
   - Attach to req.user
         │
         ▼
8. Controller receives authenticated user
   Access req.user for role/permissions
         │
         ▼
9. Authorization check
   - Is user admin? ✓ / ✗
   - Does user have permission? ✓ / ✗
   - Is user status active? ✓ / ✗
         │
         ▼
10. Execute controller action
    - Perform database operations
    - Return results


┌─────────────────────────────────────────────────────────────┐
│             ADMIN ROUTE PROTECTION                           │
└─────────────────────────────────────────────────────────────┘

Request → authenticateUser → requireAdmin → Controller
  │           middleware        middleware      │
  │             │                  │            │
  │             │                  │            ▼
  │             ▼                  ▼         Execute if all pass
  │         Extract JWT       Check role === 'admin'
  │         Verify token      Throw error if not admin
  │         Add to req.user
  │             │
  │             └──► req.user populated with:
  │                  - userId
  │                  - name
  │                  - role
  │                  - status
  │                  - permissions {}
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────┐
│              CREATE NEW USER FLOW                           │
└────────────────────────────────────────────────────────────┘

Admin User Interface
│
├─ Clicks "Create New User"
│
├─ Modal form appears
│  {name, email, password, mobile, role}
│
├─ Submits form
│  POST /api/admin/users
│  Authorization: Bearer {admin_token}
│           │
│           ▼
│    Backend: adminController.createUser()
│    │
│    ├─ Validate all required fields ✓
│    │
│    ├─ Validate role is valid ✓
│    │
│    ├─ Check email not already used ✓
│    │
│    ├─ Hash password with bcrypt ✓
│    │
│    ├─ Create User document in MongoDB ✓
│    │
│    ├─ Set emailVerified = true ✓
│    │
│    └─ Return success response
│       {success: true, user: {id, name, email, role}}
│
└─ Frontend shows success message
   User appears in table
   Statistics updated
```

## Role Permission Matrix

```
┌─────────────────────────────────────────────────────────────┐
│            PERMISSIONS BY ROLE                              │
├──────────────────┬──────────────┬──────────────┬───────────┤
│ Permission       │ Customer     │ Staff        │ Admin      │
├──────────────────┼──────────────┼──────────────┼───────────┤
│ canManageUsers   │ ✗ NO         │ ✗ NO         │ ✓ YES      │
│ canManageMenu    │ ✗ NO         │ ✗ NO         │ ✓ YES      │
│ canManageOrders  │ ✗ NO         │ ✓ YES        │ ✓ YES      │
│ canViewReports   │ ✗ NO         │ ✓ YES        │ ✓ YES      │
│ canManageSettings│ ✗ NO         │ ✗ NO         │ ✓ YES      │
├──────────────────┼──────────────┼──────────────┼───────────┤
│ Features:                                                    │
│ - View Profile   │ ✓ Own only   │ ✓ Own only   │ ✓ All      │
│ - Create Order   │ ✓ Own        │ ✓ Any        │ ✓ Any      │
│ - View Orders    │ ✓ Own only   │ ✓ All        │ ✓ All      │
│ - Manage Menu    │ ✗            │ ✗            │ ✓          │
│ - View Users     │ ✗            │ ✗            │ ✓          │
│ - Create User    │ ✗            │ ✗            │ ✓          │
│ - Edit User      │ ✗            │ ✗            │ ✓          │
│ - Delete User    │ ✗            │ ✗            │ ✓          │
│ - Change Role    │ ✗            │ ✗            │ ✓          │
│ - Change Status  │ ✗            │ ✗            │ ✓          │
│ - View Reports   │ ✗            │ ✓            │ ✓          │
│ - Admin Settings │ ✗            │ ✗            │ ✓          │
└──────────────────┴──────────────┴──────────────┴───────────┘
```

## API Request/Response Flow

```
ADMIN CREATES USER:

CLIENT REQUEST:
┌──────────────────────────────────────────┐
│ POST /api/admin/users                    │
│ Authorization: Bearer eyJhbGciOiJIUzI1NiI │
│                                          │
│ {                                        │
│   "name": "John Staff",                 │
│   "email": "john@example.com",          │
│   "password": "password123",            │
│   "mobile": "9876543210",               │
│   "role": "staff"                       │
│ }                                        │
└──────────────────────────────────────────┘
         │
         ▼
SERVER PROCESSING:
┌──────────────────────────────────────────┐
│ 1. Verify JWT Token                     │
│ 2. Check user role === 'admin'          │
│ 3. Validate input data                  │
│ 4. Hash password                        │
│ 5. Save to MongoDB                      │
│ 6. Return created user                  │
└──────────────────────────────────────────┘
         │
         ▼
SERVER RESPONSE:
┌──────────────────────────────────────────┐
│ HTTP 201 CREATED                        │
│                                          │
│ {                                        │
│   "success": true,                      │
│   "message": "User created successfully",│
│   "data": {                             │
│     "user": {                           │
│       "id": "507f1f77bcf86cd799439011", │
│       "name": "John Staff",             │
│       "email": "john@example.com",      │
│       "mobile": "9876543210",           │
│       "role": "staff",                  │
│       "status": "active",               │
│       "createdAt": "2024-01-15..."      │
│     }                                    │
│   }                                      │
│ }                                        │
└──────────────────────────────────────────┘
         │
         ▼
CLIENT PROCESSING:
┌──────────────────────────────────────────┐
│ 1. Parse response JSON                  │
│ 2. Show success message to user         │
│ 3. Add user to table                    │
│ 4. Update statistics                    │
│ 5. Close create modal                   │
│ 6. Refresh user list                    │
└──────────────────────────────────────────┘
```

## Component Hierarchy

```
App
│
├── CompanyHeader
│
├── Navbar
│   └── (Conditionally shows Admin Dashboard link)
│       └── IF user.role === 'admin'
│
└── Routes
    │
    ├── /home → Home Page
    │
    ├── /enquiries → EnquiriesTable
    │
    ├── /quotations → ViewQuotations
    │
    ├── /menu → Menu
    │
    ├── /admin → AdminDashboard (Protected)
    │   │
    │   └── AdminDashboard Component
    │       ├── Statistics Cards
    │       ├── Users Table
    │       │   ├── Search Input
    │       │   ├── Role Filter
    │       │   ├── Status Filter
    │       │   └── Action Buttons
    │       ├── Create User Modal
    │       ├── Edit User Modal
    │       └── Settings Tab
    │
    └── /...other routes
```

## Database Schema

```
MongoDB: desi_plaza database
Collection: users

User Document:
{
  _id: ObjectId,
  name: String,                    // Required
  email: String,                   // Unique, required
  password: String,                // Hashed, required
  mobile: String,                  // Required
  role: String,                    // Enum: admin|staff|customer
  status: String,                  // Enum: active|inactive|suspended
  emailVerified: Boolean,           // Default: false
  emailVerificationToken: String,   // Optional
  emailVerificationExpires: Date,   // Optional
  passwordResetToken: String,       // Optional
  passwordResetExpires: Date,       // Optional
  lastLogin: Date,                  // Optional
  passwordChangedAt: Date,          // Optional
  createdAt: Date,                  // Auto generated
  updatedAt: Date                   // Auto generated
}

Indexes:
- email (unique)
- role
- status
- createdAt
```

## Security Layers

```
┌────────────────────────────────────────────────────┐
│          SECURITY LAYERS (Top to Bottom)           │
├────────────────────────────────────────────────────┤
│                                                    │
│  LAYER 1: HTTPS/TLS (Transport Security)          │
│  ─────────────────────────────────────────────    │
│  ✓ Encrypted communication                        │
│  ✓ Certificate validation                         │
│                                                    │
│  LAYER 2: CORS & Headers                          │
│  ────────────────────────                         │
│  ✓ Cross-origin requests validated                │
│  ✓ Security headers set                           │
│  ✓ XSS protection enabled                         │
│                                                    │
│  LAYER 3: JWT Authentication                      │
│  ───────────────────────────                      │
│  ✓ Token verification                             │
│  ✓ Secret key signing                             │
│  ✓ Token expiration (30 days)                     │
│  ✓ Signature validation                           │
│                                                    │
│  LAYER 4: Authorization (Middleware)              │
│  ──────────────────────────────────              │
│  ✓ Role validation (admin only)                   │
│  ✓ Permission checking                            │
│  ✓ Status validation (active only)                │
│                                                    │
│  LAYER 5: Input Validation                        │
│  ──────────────────────────────                   │
│  ✓ Email format validation                        │
│  ✓ Phone number validation                        │
│  ✓ Required field checking                        │
│  ✓ Type validation                                │
│                                                    │
│  LAYER 6: Password Security                       │
│  ───────────────────────────                      │
│  ✓ Bcrypt hashing (10 rounds)                     │
│  ✓ Minimum 8 characters                           │
│  ✓ Reset tokens (10 min expiry)                   │
│                                                    │
│  LAYER 7: Database Protection                     │
│  ──────────────────────────────                   │
│  ✓ Mongoose schema validation                     │
│  ✓ Unique email constraint                        │
│  ✓ Enum validation (role, status)                 │
│  ✓ No sensitive data in responses                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│           PRODUCTION DEPLOYMENT                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐         ┌────────────────┐   │
│  │ Domain      │         │ CDN (Optional) │   │
│  │ Name        │         │ Static Assets  │   │
│  │ example.com │         │ Caching        │   │
│  └─────────────┘         └────────────────┘   │
│        │                         │             │
│        └────────────┬────────────┘             │
│                     │                         │
│        ┌────────────▼────────────┐            │
│        │    Load Balancer        │            │
│        │    (SSL/TLS Termination)│            │
│        └────────────┬────────────┘            │
│                     │                         │
│        ┌────────────▼────────────┐            │
│        │   Frontend Servers      │            │
│        │   (React Vite Build)    │            │
│        │   - app.js              │            │
│        │   - admin.js            │            │
│        └────────────┬────────────┘            │
│                     │                         │
│        ┌────────────▼────────────┐            │
│        │   Backend Servers       │            │
│        │   (Node.js/Express)     │            │
│        │   - API Routes          │            │
│        │   - Controllers         │            │
│        │   - Middleware          │            │
│        └────────────┬────────────┘            │
│                     │                         │
│        ┌────────────▼────────────┐            │
│        │    MongoDB Instance     │            │
│        │   (Primary + Replica)   │            │
│        │   - users collection    │            │
│        │   - Backups             │            │
│        └────────────────────────┘            │
│                                              │
└─────────────────────────────────────────────┘
```

---

**This architecture diagram shows the complete structure of the role-based user management system.**

For detailed documentation, see:
- [ROLE_BASED_USER_MANAGEMENT.md](ROLE_BASED_USER_MANAGEMENT.md) - Technical details
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - User guide
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Deployment guide
