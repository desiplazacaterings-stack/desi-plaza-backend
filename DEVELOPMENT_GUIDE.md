# Development Setup Guide

## Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB running locally or connection string ready
- Git (optional)

### Backend Setup

```bash
cd backend
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# Update: MONGO_URI, JWT_SECRET, CORS_ORIGIN

# Start server
npm start          # Production mode
npm run dev        # Development mode with nodemon
```

**Expected Output:**
```
MongoDB connected
Server running on port 3000
```

### Frontend Setup

```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env

# Edit .env if needed (default uses localhost:3000)

# Start development server
npm run dev
```

**Expected Output:**
```
VITE v7.2.5 ready in XXX ms
➜  Local:   http://localhost:5175/
➜  Press h + enter to show help
```

Visit: http://localhost:5175

---

## API Endpoints Reference

### Enquiries
```
GET    /api/enquiries              - Get all enquiries
POST   /api/enquiries              - Create new enquiry
GET    /api/enquiries/:id          - Get single enquiry
PATCH  /api/enquiries/:id          - Update enquiry
DELETE /api/enquiries/:id          - Delete enquiry
```

### Quotations
```
GET    /api/quotations             - Get all quotations
POST   /api/quotations             - Create new quotation
GET    /api/quotations/:id         - Get single quotation
PATCH  /api/quotations/:id         - Update quotation status
DELETE /api/quotations/:id         - Delete quotation
```

### Items
```
GET    /api/items                  - Get all items
POST   /api/items                  - Create new item
GET    /api/items/:id              - Get single item
PATCH  /api/items/:id              - Update item
DELETE /api/items/:id              - Delete item
```

### Orders
```
GET    /api/orders                 - Get all orders
POST   /api/orders                 - Create new order
GET    /api/orders/:id             - Get single order
PATCH  /api/orders/:id             - Update order status
DELETE /api/orders/:id             - Delete order
```

### Schedules
```
GET    /api/schedules              - Get all schedules
POST   /api/schedules              - Create new schedule
GET    /api/schedules/:id          - Get single schedule
PATCH  /api/schedules/:id          - Update schedule
PATCH  /api/schedules/:id/complete - Mark schedule complete
DELETE /api/schedules/:id          - Delete schedule
```

---

## Using Centralized API Configuration

### In Your Components

```javascript
// Import the config
import { API_ENDPOINTS } from '../config.js';

// Use in your component
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
      setItems(response.data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  };
  fetchData();
}, []);

// For dynamic IDs
const getOneItem = (itemId) => {
  axios.get(API_ENDPOINTS.ITEMS.GET_ONE(itemId));
};

// For creating
const createItem = (itemData) => {
  axios.post(API_ENDPOINTS.ITEMS.CREATE, itemData);
};
```

---

## Database Structure

### Enquiry Schema
```javascript
{
  _id: ObjectId,
  customerName: String (required),
  mobile: String (required),
  email: String (required),
  eventType: String,
  eventDate: String,
  location: String,
  guests: String,
  notes: String,
  createdAt: Date
}
```

### Quotation Schema
```javascript
{
  _id: ObjectId,
  quotationId: String (unique, required),
  enquiry: {
    customerName, mobile, email, eventType, eventDate, location, guests, notes
  },
  items: [{ itemName, unit, qty, price, category }],
  total: Number,
  status: String (default: 'Pending'),
  createdAt: Date
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  customerName: String (required),
  mobile: String (required),
  email: String,
  address: String,
  eventType: String,
  eventDate: Date,
  eventPlace: String,
  subEvents: String,
  eventManager: String,
  items: [{ itemName, qty, price, category, unit }],
  totalAmount: Number,
  advance: Number,
  balance: Number,
  status: Enum ['Placed', 'Preparing', 'Ready', 'Delivered', 'Confirmed'],
  quotationId: ObjectId (ref: Quotation),
  timestamps: true
}
```

### Item Schema
```javascript
{
  _id: ObjectId,
  itemName: String (required),
  category: String,
  unit: String,
  price: {
    veg: Number,
    nonVeg: Number,
    eggBased: Number
  },
  description: String,
  available: Boolean,
  createdAt: Date
}
```

---

## Common Workflows

### Add Item to Database
```bash
# 1. Connect to MongoDB
mongosh

# 2. Switch to database
use desi_plaza

# 3. Insert item
db.items.insertOne({
  itemName: "Biryani",
  category: "Main Course",
  unit: "kg",
  price: {
    veg: 300,
    nonVeg: 450,
    eggBased: 350
  }
})
```

### Seed Database
```bash
cd backend
node seed.js
```

### Check MongoDB Connection
```bash
curl http://localhost:3000/ping
# Expected response: {"status":"ok","timestamp":"2024-12-24T..."}
```

---

## Troubleshooting

### Backend Issues

**Error: Cannot find module 'mongoose'**
```bash
npm install
```

**Error: MongoDB connection failed**
- Check if MongoDB is running: `mongosh`
- Verify MONGO_URI in .env file
- Default: `mongodb://127.0.0.1:27017/desi_plaza`

**Error: Port 3000 already in use**
```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Frontend Issues

**Error: Cannot find module axios**
```bash
npm install
```

**Blank page or errors**
- Open DevTools (F12)
- Check Console tab for errors
- Check Network tab for API calls
- Verify backend is running (http://localhost:3000/ping)

**API calls failing with CORS error**
- Ensure backend CORS is configured for frontend URL
- Check .env VITE_API_BASE_URL
- Restart both servers

---

## File Structure Reference

```
frontend/src/
├── pages/
│   ├── Home.jsx                 # Landing page
│   ├── Enquiry.jsx              # Create enquiry
│   ├── Menu.jsx                 # View menu items
│   ├── Quotation.jsx            # Create quotation
│   ├── ViewQuotations.jsx       # List & confirm quotations
│   ├── Confirm.jsx              # Order confirmation
│   ├── Event.jsx                # View confirmed orders
│   ├── InstantOrder.jsx         # Create quick orders
│   ├── ScheduledMeetings.jsx    # Manage meetings
│   └── [other pages...]
├── components/
│   ├── Navbar.jsx               # Navigation sidebar
│   ├── WorkflowTabs.jsx         # Tab navigation
│   └── ScheduleMeetingModal.jsx # Modal component
├── context/
│   └── EnquiryContext.jsx       # Global enquiry state
├── config.js                    # 🆕 API endpoint config
├── App.jsx                      # Main app with routes
└── index.css & App.css          # Global styles

backend/
├── models/
│   ├── User.js, Enquiry.js, Quotation.js, Item.js, Order.js, Schedule.js
├── routes/
│   ├── auth.js, enquiries.js, quotations.js, items.js, orders.js, schedules.js
├── controllers/
│   └── [Business logic]
├── middleware/
│   └── auth.js
├── server.js                    # Main server file
└── package.json
```

---

## Best Practices

### ✅ DO
- Use centralized API config for all endpoints
- Handle errors with try-catch blocks
- Validate data before sending to API
- Use React hooks (useState, useEffect)
- Keep components focused and small
- Use CSS variables for theming

### ❌ DON'T
- Hard-code URLs in components
- Ignore error responses
- Send unvalidated data to API
- Use deprecated React patterns
- Create massive components
- Use hard-coded colors (use CSS variables)

---

## Next Steps

1. **Setup Environment**
   - Copy .env.example to .env
   - Update credentials
   - Run `npm install` in both directories

2. **Start Development**
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2: `cd frontend && npm run dev`
   - Open http://localhost:5175

3. **Import Config**
   - Update all API calls to use `API_ENDPOINTS` from config.js

4. **Test Workflow**
   - Create enquiry → Create quotation → Confirm order → View in events

5. **Monitor Logs**
   - Backend console for server logs
   - Frontend DevTools for client errors

---

Last Updated: December 24, 2025
