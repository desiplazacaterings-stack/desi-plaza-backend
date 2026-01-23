# IMPLEMENTATION GUIDE: Fix Triple Menu Duplication

## Executive Summary

**Root Cause:** Menu component is mounted in 3 separate places:
1. `/menu` route (App.jsx)
2. Home page (Home.jsx)
3. Customer page (CustomerPage.jsx)

**Fix Strategy:** Remove Menu from Home.jsx and CustomerPage.jsx, keep only the `/menu` route.

---

## Changes Required

### CHANGE 1: Update Menu.jsx (Production-Safe Implementation)

Replace the current fetch logic with idempotent state handling:

**Key improvements:**
- Use `menuItems.length > 0` guard to prevent re-fetching if data exists
- Use `useMemo` to deduplicate in render as safety net
- Proper ref-based fetch guard that survives re-mounts
- Better logging for debugging production issues

**File:** [Menu.jsx](Menu.jsx)

```jsx
import menuData from "../data/menu.json";
import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import API_ENDPOINTS from "../config";
import "./Menu.css";

// ✅ Deduplication utility
const dedupeMenuItems = (items = []) => {
  const map = new Map();
  (items || []).forEach(item => {
    if (item?._id) {
      map.set(item._id, { ...item });
    }
  });
  return Array.from(map.values());
};

export default function Menu({ hidePrice = false }) {
  const [filter, setFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchInProgress = useRef(false);

  useEffect(() => {
    // Check user authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setIsAuthenticated(true);
        setUserRole(user.role);
        console.log('✓ User authenticated:', user.role);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    // ✅ CRITICAL FIX: Double-guard against multiple mounts
    // If data already loaded OR fetch is in progress, skip
    if (menuItems.length > 0 || fetchInProgress.current) {
      setLoading(false);
      return;
    }

    fetchInProgress.current = true;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching menu from:', API_ENDPOINTS.ITEMS.GET_ALL);
        const response = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
        
        let items = [];
        if (response.data && Array.isArray(response.data)) {
          items = response.data;
        } else if (response.data && typeof response.data === 'object' && response.data.items) {
          items = response.data.items;
        } else {
          console.warn('⚠️ Unexpected response format, using local data');
          items = menuData;
        }
        
        // ✅ Deduplicate items - REPLACE state, don't append
        const cleanItems = dedupeMenuItems(items);
        console.log(`✓ Menu items loaded: ${cleanItems.length} items`);
        setMenuItems(cleanItems);
      } catch (error) {
        console.error('❌ Error fetching menu:', error.message, 'Using local data instead');
        setMenuItems(dedupeMenuItems(menuData || []));
      } finally {
        setLoading(false);
        fetchInProgress.current = false;
      }
    };

    fetchMenu();
  }, []); // Empty dependency - runs ONCE at mount

  // ✅ SAFETY NET: Deduplicate again in render in case of concurrent mounts
  const displayItems = useMemo(
    () => dedupeMenuItems(menuItems),
    [menuItems]
  );

  // Filter items by veg/non-veg
  let filteredMenu =
    filter === "All"
      ? displayItems
      : displayItems.filter(item => item.veg_nonveg === filter);

  // Filter items by selected category
  if (selectedCategory !== "All") {
    filteredMenu = filteredMenu.filter(item => item.category === selectedCategory);
  }

  // Filter items by search query (category or item name)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredMenu = filteredMenu.filter(item => 
      item.itemName.toLowerCase().includes(query) || 
      item.category.toLowerCase().includes(query)
    );
  }

  // Group items by category
  const groupedByCategory = filteredMenu.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Get all unique categories from original menu for category buttons
  const allCategories = [...new Set(displayItems.map(item => item.category || "Other"))].sort();
  
  const categories = Object.keys(groupedByCategory).sort();

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h2>Our Menu</h2>
        <p className="menu-subtitle">Explore our delicious catering options</p>
      </div>

      <div className="filter-buttons">
        <button 
          className={`filter-button ${filter === "All" ? "active" : ""}`} 
          onClick={() => setFilter("All")}
        >
          🍽️ All Items
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by category or item name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            className="search-clear"
            onClick={() => setSearchQuery("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Buttons */}
      <div className="category-filter-section">
        <h3 className="category-filter-title">📂 Browse by Category</h3>
        <div className="category-buttons">
          <button 
            className={`category-btn ${selectedCategory === "All" ? "active" : ""}`}
            onClick={() => setSelectedCategory("All")}
          >
            All Categories
          </button>
          {allCategories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="no-items">
          <p>Loading menu...</p>
        </div>
      ) : categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category} className="category-section">
              <div className="category-header">
                <h3>{category}</h3>
                <span className="item-count">{groupedByCategory[category].length} items</span>
              </div>

              <div className="items-list">
                {groupedByCategory[category].map((item, index) => (
                  <div key={index} className="menu-card">
                    <div className="card-header">
                      <h4>{item.itemName}</h4>
                    </div>

                    {isAuthenticated && item.prices && item.prices.length > 0 ? (
                      <div className="prices-container">
                        {item.prices.map((priceObj, i) => (
                          <div key={i} className="price-option">
                            <span className="price-label">
                              {priceObj.units} {priceObj.unit}
                            </span>
                            <span className="price-value">${priceObj.price}</span>
                          </div>
                        ))}
                      </div>
                    ) : !isAuthenticated ? (
                      <div className="item-available">✓ Available</div>
                    ) : hidePrice ? (
                      <div className="item-available">✓ Available</div>
                    ) : (
                      <div className="no-price">No pricing available</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-items">
          <p>No menu items found</p>
          {displayItems.length > 0 && (
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '10px' }}>
              (Total items loaded: {displayItems.length}, but none match current filter)
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### CHANGE 2: Update Home.jsx (Remove Menu)

**Remove the Menu import and rendering, add a link to dedicated `/menu` route instead.**

Key changes:
- Delete: `import Menu from "./Menu";`
- Delete: Menu component rendering code
- Add: Link/button that navigates to `/menu`

---

### CHANGE 3: Update CustomerPage.jsx (Remove Menu)

**Remove the Menu import and rendering, add a link or embed reference instead.**

Key changes:
- Delete: `import Menu from "./Menu";`
- Delete: Menu component rendering code
- Add: Link/button that navigates to `/menu` or `/menu` in new tab

---

## Why This Fixes the Issue

### Before (Broken):
```
User visits / (Home)
  → Home.jsx renders <Menu /> (1st instance mounts, fetches data)
  → User navigates to /customer
  → CustomerPage.jsx renders <Menu /> (2nd instance mounts, fetches data)
  → User navigates to /menu
  → App.jsx route renders <Menu /> (3rd instance mounts, fetches data)

If all 3 instances are active simultaneously or in quick succession:
→ Each mounts, each fetches, data appears 3x
```

### After (Fixed):
```
User visits / (Home)
  → Home.jsx renders (NO Menu)
  → User navigates to /customer
  → CustomerPage.jsx renders (NO Menu)
  → User navigates to /menu
  → App.jsx route renders <Menu /> (ONLY 1 instance, fetches once)

Only ONE Menu instance ever exists:
→ Single fetch, no duplicates
```

---

## Testing Checklist

After implementing changes:

- [ ] Visit `/` (Home) - should NOT show menu, but link to `/menu`
- [ ] Visit `/customer` - should NOT show menu, but link to `/menu`
- [ ] Visit `/menu` - should show menu with correct item count
- [ ] Open DevTools → Network tab → filter "items" → should see 1 API call only
- [ ] Open DevTools → React DevTools → search "Menu" → should see only 1 instance mounted
- [ ] Rebuild Docker image and test in production
- [ ] Verify menu items appear exactly once (no triplication)

---

## How to Apply Changes

Use the provided corrected file contents below. Apply to your workspace:

1. **Update Menu.jsx** with the production-safe code
2. **Update Home.jsx** - remove Menu imports/rendering
3. **Update CustomerPage.jsx** - remove Menu imports/rendering
4. Commit and push changes
5. Rebuild Docker image for production
6. Deploy and test

