# Production Triple Duplication Issue - Root Cause Analysis

## Problem Summary
Menu items appear **exactly 3 times** in production but work correctly on localhost:5173.

---

## Root Causes (Frontend-Only)

### **CAUSE 1: React.StrictMode in Production Build**
Your `main.jsx` wraps `<App />` in `<React.StrictMode>`:

```jsx
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**In Development (Vite):**
- React.StrictMode intentionally double-invokes effects → you see this behavior
- HMR (hot module reload) remounts components, but you're aware of the double-invoke
- You likely added the `menuFetched.current` ref to prevent duplicate fetches

**In Production (Build Output):**
- React.StrictMode still exists in your production bundle
- BUT the behavior manifests differently due to how build files are served
- If the Menu component mounts **3 times** instead of 2, you get 3x data

### **CAUSE 2: Multiple Route Definitions Rendering Menu**
If `<Menu />` is rendered in multiple places:

```jsx
// In App.jsx - could be rendering Menu in multiple routes
<Routes>
  <Route path="/" element={<Home />} />  // ← if Home imports Menu
  <Route path="/menu" element={<Menu />} />  // ← Menu here
  <Route path="/enquiry" element={<Enquiry />} />  // ← if Enquiry imports Menu
</Routes>
```

If `Home`, `Enquiry`, and a Layout component all render `<Menu />`, data gets appended 3 times.

### **CAUSE 3: Lazy Loading / Code Splitting**
Vite may chunk routes differently:
- Dev mode: Components loaded eagerly
- Production: Components code-split → may instantiate multiple times during lazy load

### **CAUSE 4: Data Accumulation via useRef Pattern**
Your current code uses:
```jsx
const menuFetched = useRef(false);

useEffect(() => {
  if (menuFetched.current) return;
  menuFetched.current = true;
  // fetch...
}, []);
```

**Problem:** If the component unmounts/remounts in production (due to routing, layout changes, or Suspense boundaries), the **ref is lost** and fetch happens again.

---

## Why Vite Dev Hides This Issue

1. **HMR doesn't unmount completely** - refs persist across hot updates
2. **Eager loading** - all components loaded, not lazy-split
3. **No React.StrictMode strictness applied** to mounting (only effects)
4. **Single-instance serving** - you're hitting one dev server, not cached static files

---

## The Real Fix: Idempotent State Updates

The issue is that your `setMenuItems()` is **appending/setting state**:

```jsx
const cleanItems = dedupeMenuItems(items);
setMenuItems(cleanItems);  // ← This REPLACES state
```

If called 3 times:
1. First call: `menuItems = [item1, item2, item3]`
2. Second call: `menuItems = [item1, item2, item3]` again (replaces)
3. Third call: `menuItems = [item1, item2, item3]` again (replaces)

**But if you're using append logic somewhere:**
```jsx
setMenuItems(prev => [...prev, ...cleanItems]);  // ← THIS APPENDS (WRONG!)
```

Then 3 mounts = 9 items!

---

## Solutions

### **Solution 1: Render Menu in Only One Place** ✅
Check your routes and ensure Menu is only instantiated once:

```jsx
<Routes>
  <Route path="/home" element={<Home />} />
  <Route path="/menu" element={<Menu />} /> {/* Only here */}
  <Route path="/enquiry" element={<Enquiry />} /> {/* Not imported here */}
</Routes>
```

### **Solution 2: Use Idempotent State Updates** ✅
Ensure state is **replaced, never appended**:

```jsx
const fetchMenu = async () => {
  const cleanItems = dedupeMenuItems(items);
  setMenuItems(cleanItems);  // ← REPLACE, don't append
};
```

### **Solution 3: Prevent Re-mounting with SessionStorage** ✅
Use sessionStorage to track if data was loaded:

```jsx
const MENU_CACHE_KEY = 'menu_items_cache';

useEffect(() => {
  const cached = sessionStorage.getItem(MENU_CACHE_KEY);
  if (cached) {
    try {
      setMenuItems(JSON.parse(cached));
      setLoading(false);
      return;
    } catch {}
  }

  const fetchMenu = async () => {
    const cleanItems = dedupeMenuItems(items);
    sessionStorage.setItem(MENU_CACHE_KEY, JSON.stringify(cleanItems));
    setMenuItems(cleanItems);
  };
  
  fetchMenu();
}, []);
```

### **Solution 4: Remove React.StrictMode from Production** ⚠️
Not recommended, but if you want to disable it:

```jsx
// main.jsx
const isProduction = import.meta.env.MODE === 'production';

ReactDOM.createRoot(document.getElementById("root")).render(
  isProduction ? (
    <App />
  ) : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
```

### **Solution 5: Use useMemo for Deduplication** ✅
Cache the deduplicated result:

```jsx
import { useMemo } from 'react';

const displayItems = useMemo(
  () => dedupeMenuItems(menuItems),
  [menuItems]
);

// Use displayItems instead of menuItems in render
```

---

## Best Practice: Production-Safe Implementation

```jsx
import { useState, useEffect, useMemo, useRef } from 'react';

export default function Menu({ hidePrice = false }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Prevent multiple fetches
  const fetchInProgress = useRef(false);

  useEffect(() => {
    // Double-check guard for concurrent mounts
    if (fetchInProgress.current || menuItems.length > 0) return;
    
    fetchInProgress.current = true;

    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.ITEMS.GET_ALL);
        
        let items = Array.isArray(response.data) 
          ? response.data 
          : response.data.items || [];
        
        // Deduplicate and SET (replace, not append)
        const cleanItems = dedupeMenuItems(items);
        setMenuItems(cleanItems);
        
        console.log(`✓ Loaded ${cleanItems.length} unique items`);
      } catch (error) {
        console.error('Menu fetch error:', error);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []); // Empty dependency array - runs once

  // Deduplicate in render as safety net
  const displayItems = useMemo(
    () => dedupeMenuItems(menuItems),
    [menuItems]
  );

  return (
    <div className="menu-container">
      {/* Render displayItems instead of menuItems */}
    </div>
  );
}
```

---

## Debugging Checklist

- [ ] Search codebase for how many places render `<Menu />`
- [ ] Check if Menu is imported in Home, Enquiry, or any Layout component
- [ ] Verify no `setMenuItems(prev => [...prev, ...])` append logic exists
- [ ] Check Network tab in production - how many API calls?
- [ ] Add `console.log('Menu mounted')` at component start
- [ ] Check browser DevTools React Profiler - how many Menu instances?

