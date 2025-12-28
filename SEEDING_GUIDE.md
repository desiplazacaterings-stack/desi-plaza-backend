# Seeding Menu Items to MongoDB Atlas

## Problem
The frontend shows "No items found" because the MongoDB Atlas database doesn't have any menu items.

## Solution
Seed the database with menu items from `output/menu.mongodb.json`.

## How to Seed

### Option 1: Run Locally (if you have MongoDB Atlas connection string)
```bash
cd backend
MONGO_URI="your_mongodb_atlas_connection_string" npm run seed
```

### Option 2: Run on Render (One-Time)
1. Go to your Render Backend Service
2. Click "Shell" tab (or SSH into the service)
3. Run the seed command:
```bash
npm run seed
```

### Option 3: Run via Render Job (Create a One-Time Job)
On Render dashboard:
1. Go to your Backend Service
2. Click on "Jobs" tab
3. Create a new job
4. Command: `npm run seed`
5. Run it once
6. The job will complete and seed the database

## What Gets Seeded
- Menu items from `backend/output/menu.mongodb.json`
- 100+ menu items with categories and pricing
- Automatically categorizes as Veg/Non-Veg based on keywords
- All items stored in MongoDB Items collection

## Verification
After seeding, you should see:
```
✓ Seeded XXX menu items successfully
✓ Total items in database: XXX

📊 Items by Category:
   Biryani: X items
   Curry: X items
   ...
```

## Check Backend is Returning Items
Visit in browser or curl:
```
GET https://desi-plaza-backend.onrender.com/api/items
```

Should return an array of menu items (not an empty array).

## Next Steps
1. Seed the database using one of the options above
2. Refresh the frontend
3. "Add Menu Items" dropdown should now show menu items
4. Instant Orders and Quotations will now work

## Troubleshooting
If seeding fails:
- Verify `MONGO_URI` environment variable is set on Render
- Check that MongoDB Atlas network access includes Render IP
- Verify `output/menu.mongodb.json` file exists with data
- Check Render logs for detailed error messages
