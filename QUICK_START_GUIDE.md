# Quick Start Guide - Role-Based User Management

## Getting Started

### Step 1: First User Setup
1. Navigate to the registration page
2. Create your account with name, email, phone, and password
3. The **first user is automatically assigned the ADMIN role**
4. Your account will be marked as `active` immediately

### Step 2: Login as Admin
1. Login with your credentials
2. Upon successful login, your role is stored in localStorage
3. You should see "🔧 Admin Dashboard" in the sidebar navigation

### Step 3: Access Admin Dashboard
1. Click "🔧 Admin Dashboard" in the sidebar
2. View user statistics and management interface
3. You now have full control over user management

## Common Tasks

### Creating a New User

**From Admin Dashboard:**
1. Click "➕ Create New User"
2. Fill in the form:
   - **Name**: User's full name
   - **Email**: Unique email address
   - **Phone**: 10-15 digit phone number
   - **Password**: At least 8 characters
   - **Role**: Select from Admin, Staff, or Customer
3. Click "Create User"
4. User will receive verification email (pre-verified by admin)

### Promoting a User to Staff
1. In Admin Dashboard, find the user in the table
2. In the **Role** column, change dropdown from "Customer" to "Staff"
3. Role change takes effect immediately
4. User will have staff permissions on next login

### Deactivating a User Account
1. In Admin Dashboard, find the user in the table
2. In the **Status** column, change dropdown from "Active" to "Inactive"
3. User will not be able to login anymore
4. User can be reactivated by changing status back to "Active"

### Searching for Users
1. Use the search box to find users by name, email, or phone
2. Results update instantly as you type
3. Search is case-insensitive

### Filtering Users
Use the filter dropdowns:
- **Role Filter**: Show only Admin, Staff, or Customer
- **Status Filter**: Show only Active, Inactive, or Suspended users

## User Roles Explained

### Admin 👤
**Your Role** (if first user)
- Can manage all users
- Can manage menu items
- Can manage all orders
- Can view all reports
- Can access system settings

### Staff 👨‍💼
**For Employees**
- Can manage customer orders
- Can view reports
- Cannot create other users
- Cannot change menu items

### Customer 🛒
**For Regular Users**
- Can create and manage their own orders
- Can request quotations
- Cannot see other users' data
- Cannot access admin features

## User Status Levels

### Active ✅
- User can login normally
- Default for new users created by admin
- Most common status

### Inactive ⏸️
- User cannot login
- Account is temporarily disabled
- Admin can reactivate at any time

### Suspended 🚫
- User cannot login
- Used for policy violations
- Requires admin review to restore

## Navigation Tips

### For Admin Users
- **Sidebar** shows: Home, Instant Order, Enquiries, Quotations, Meetings, **Admin Dashboard** ⭐
- **Admin Dashboard** only appears for admin users

### For Non-Admin Users
- **Sidebar** shows: Home, Instant Order, Enquiries, Quotations, Meetings
- **Admin Dashboard** link will NOT appear

## Keyboard Shortcuts in Admin Dashboard

| Action | Shortcut |
|--------|----------|
| Close modal | Esc or click × |
| Close message | Click × button |
| Toggle menu | ☰ button (top right) |

## Important Rules

⚠️ **Cannot delete last admin**
- If you're the only admin, you cannot be deleted
- Create another admin user first if needed

✅ **Automatic admin assignment**
- First registered user becomes admin automatically
- Subsequent users default to customer role

🔒 **Password requirements**
- Minimum 8 characters
- Cannot be empty
- Must be confirmed on registration

📧 **Email verification**
- Regular users receive verification emails
- Admin-created users are pre-verified
- Verification link expires in 24 hours

## Troubleshooting

### Admin Dashboard not showing?
**Solution:** 
1. Verify you're logged in
2. Check that your role is "admin"
3. Refresh the page
4. Clear browser cache

### Cannot create user with email error?
**Solution:**
1. Email must be unique (not used by another user)
2. Double-check spelling
3. Try a different email address

### User cannot login after I deactivate them?
**That's expected!** When status is "Inactive" or "Suspended", users cannot login.
- Change status back to "Active" to restore access

### Forgot your password?
1. On login page, click "Forgot Password"
2. Enter your email
3. Check email for reset link
4. Password reset link expires in 10 minutes

## Best Practices

### For Admin Users

✅ **DO:**
- Create strong passwords (mix uppercase, lowercase, numbers)
- Regularly review user list
- Deactivate unused accounts
- Document user role changes
- Backup user data regularly

❌ **DON'T:**
- Share admin credentials
- Create duplicate user accounts
- Leave inactive accounts permanently
- Change roles without notification
- Delete users without backup

### For New Admins
1. Start by reviewing the user list
2. Create test staff account for training
3. Set up at least 2 admin accounts for backup
4. Document your admin procedures
5. Set a regular user review schedule

## Security Reminders

🔒 Your admin account controls everything. Protect it!
- Use a unique, strong password
- Never share login credentials
- Log out when not in use
- Report suspicious activity immediately

## Getting Help

For issues with the role-based system:
1. Check [ROLE_BASED_USER_MANAGEMENT.md](ROLE_BASED_USER_MANAGEMENT.md) for detailed documentation
2. Review the troubleshooting section
3. Check browser console for error messages (F12)
4. Verify API is running (http://localhost:3000)

## Quick Reference

```
ADMIN DASHBOARD URL:     http://localhost:3000/admin
API BASE URL:            http://localhost:3000/api
AUTH ENDPOINT:           http://localhost:3000/api/auth
ADMIN ENDPOINT:          http://localhost:3000/api/admin

TOKEN EXPIRATION:        30 days
PASSWORD MIN LENGTH:     8 characters
EMAIL VERIFICATION:      24 hours
PASSWORD RESET TIMEOUT:  10 minutes
```

---

**Need More Help?** See [ROLE_BASED_USER_MANAGEMENT.md](ROLE_BASED_USER_MANAGEMENT.md) for complete documentation.

**Last Updated:** 2024
