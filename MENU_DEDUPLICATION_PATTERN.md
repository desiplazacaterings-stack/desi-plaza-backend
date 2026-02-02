# Menu Item Duplication: Anti-Pattern vs Clean React Pattern

## 🔴 THE ANTI-PATTERN (What causes duplication)

### Backend Structure
```javascript
// 745 unique items with price variants
[
  { _id: "1", itemName: "Afghani Chicken Kebab", category: "Starters", prices: [{unit: "kg", price: 500}, {unit: "serving", price: 50}] },
  { _id: "2", itemName: "Afghani Chicken Kebab", category: "Starters", prices: [{unit: "piece", price: 80}] },
  { _id: "3", itemName: "Biryani", category: "Rice", prices: [{unit: "kg", price: 600}, {unit: "serving", price: 60}] },
]
```

### ❌ WRONG: Flattening Then Deduping (Common Mistake)

```javascript
// ANTI-PATTERN 1: Flatten prices to array of items
const flattenedItems = menuItems.flatMap(item => 
  item.prices.map(price => ({
    itemName: item.itemName,
    unit: price.unit,
    price: price.price
  }))
);

// Then try to dedupe (TOO LATE! Already has duplicates)
const deduped = dedupeByItemName(flattenedItems); // Still shows duplicates
```

**Result:** Afghani Chicken Kebab appears 3 times (once per price variant)

---

### ❌ WRONG: Looping Through Prices in Render

```javascript
// ANTI-PATTERN 2: Map over prices directly in dropdown
{menuItems.map(item => 
  item.prices.map(price => (
    <option key={`${item._id}-${price.unit}`}>
      {item.itemName} ({price.unit})
    </option>
  ))
)}
```

**Result:** Creates duplicate item names in dropdown list

---

### ❌ WRONG: Deduping by itemName Only

```javascript
const dedupeByItemName = (items = []) => {
  const map = new Map();
  items.forEach(item => {
    if (!map.has(item.itemName)) {  // Only keeps FIRST
      map.set(item.itemName, item);  // Discards others
    }
  });
  return Array.from(map.values());
};

// Problem: If first variant doesn't have all prices, missing units!
const filtered = dedupeByItemName(menuItems);
```

**Result:** Some price variants lost; incomplete unit selection

---

## ✅ THE CLEAN REACT PATTERN

### Step 1: Extract Unique Menu Items (useMemo)

```javascript
import { useMemo } from 'react';

export function MenuSelector() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  // ✅ STEP 1: Get unique menu items (dedupe by itemName)
  const uniqueMenuItems = useMemo(() => {
    const uniqueNames = Array.from(new Set(
      menuItems.map(item => item.itemName)
    ));
    
    // Return ONE representative of each itemName
    // (still has access to ALL prices through prices array)
    return uniqueNames
      .map(name => menuItems.find(item => item.itemName === name))
      .filter(Boolean)
      .sort((a, b) => a.itemName.localeCompare(b.itemName));
  }, [menuItems]);

  // ✅ STEP 2: Collect ALL units across ALL variants of selected item
  const availableUnits = useMemo(() => {
    if (!selectedItem) return [];
    
    // Find ALL items with this name (all variants)
    const allVariants = menuItems.filter(
      item => item.itemName === selectedItem
    );
    
    // Collect unique units from all variants
    const unitMap = new Map();
    allVariants.forEach(item => {
      (item.prices || []).forEach(priceObj => {
        const key = priceObj.unit;
        if (!unitMap.has(key)) {
          unitMap.set(key, priceObj.price);
        }
      });
    });
    
    return Array.from(unitMap.entries()).map(([unit, price]) => ({
      unit,
      price
    }));
  }, [selectedItem, menuItems]);

  return (
    <div>
      {/* ✅ Dropdown 1: Show each item ONCE */}
      <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
        <option value="">-- Select Item --</option>
        {uniqueMenuItems.map(item => (
          <option key={item._id} value={item.itemName}>
            {item.itemName}
          </option>
        ))}
      </select>

      {/* ✅ Dropdown 2: Show ALL units for selected item */}
      <select 
        value={selectedUnit} 
        onChange={(e) => setSelectedUnit(e.target.value)}
        disabled={!selectedItem}
      >
        <option value="">-- Select Unit --</option>
        {availableUnits.map(({ unit, price }) => (
          <option key={unit} value={unit}>
            {unit} (${price})
          </option>
        ))}
      </select>
    </div>
  );
}
```

---

## 🎯 WHY THIS WORKS

### Backend Data (3 items, 745 total entries)
```javascript
menuItems = [
  { _id: "1", itemName: "Afghani", prices: [{unit: "kg", price: 500}, {unit: "serving", price: 50}] },
  { _id: "2", itemName: "Afghani", prices: [{unit: "piece", price: 80}] },  // Different variant
  { _id: "3", itemName: "Biryani", prices: [{unit: "kg", price: 600}] }
]
```

### Step 1: Extract Unique Names
```javascript
uniqueNames = Set(["Afghani", "Afghani", "Biryani"])
            = ["Afghani", "Biryani"]  // 2 unique
```

### Step 2: Get Representatives
```javascript
uniqueMenuItems = [
  { _id: "1", itemName: "Afghani", prices: [{unit: "kg", price: 500}, {unit: "serving", price: 50}] },
  { _id: "3", itemName: "Biryani", prices: [{unit: "kg", price: 600}] }
]
// Dropdown shows: Afghani, Biryani (2 items, NO DUPLICATES)
```

### Step 3: Get All Units When Item Selected
```javascript
// User selects "Afghani"
allVariants = [_id: "1", _id: "2"]  // Both Afghani variants
availableUnits = [
  { unit: "kg", price: 500 },
  { unit: "serving", price: 50 },
  { unit: "piece", price: 80 }
]
// Units dropdown shows: kg ($500), serving ($50), piece ($80)
```

---

## 📋 CORRECT JSX PATTERN FOR ALL THREE FILES

### InstantOrder.jsx / Quotation.jsx / CreateEvent.jsx

```jsx
// ✅ PATTERN 1: Simple dropdown without categories

const filteredMenuItems = useMemo(() => {
  const uniqueNames = Array.from(new Set(
    menuItems.map(item => item.itemName)
  ));
  
  return uniqueNames
    .map(name => menuItems.find(item => item.itemName === name))
    .filter(item => 
      item?.itemName.toLowerCase().includes(menuSearch.toLowerCase())
    )
    .sort((a, b) => a.itemName.localeCompare(b.itemName));
}, [menuItems, menuSearch]);

// In JSX:
{showDropdown && (
  <div className="dropdown">
    {filteredMenuItems.length === 0 ? (
      <div>No items found</div>
    ) : (
      filteredMenuItems.map(item => (
        <div
          key={item._id}  // Use _id as key, never index!
          onClick={() => setSelectedItem(item.itemName)}
        >
          {item.itemName}
        </div>
      ))
    )}
  </div>
)}

// ✅ PATTERN 2: With category filter

const filteredMenuItems = useMemo(() => {
  // Get unique items (by itemName)
  const uniqueNames = Array.from(new Set(
    menuItems.map(item => item.itemName)
  ));
  
  return uniqueNames
    .map(name => 
      menuItems.find(item => 
        item.itemName === name && 
        (!selectedCategory || item.category === selectedCategory)
      )
    )
    .filter(item => 
      item && 
      item.itemName.toLowerCase().includes(menuSearch.toLowerCase())
    )
    .sort((a, b) => a.itemName.localeCompare(b.itemName));
}, [menuItems, menuSearch, selectedCategory]);
```

---

## 🔑 KEY PRINCIPLES

| Principle | Why | Implementation |
|-----------|-----|-----------------|
| **Dedupe by itemName, not prices** | Prices are variants, not duplicates | Use Set + map to representative |
| **Use useMemo** | Prevent re-computation on every render | Depends: [menuItems, menuSearch, selectedCategory] |
| **Keep all variants** | Users need ALL price options | Store in `prices[]` array on ONE item |
| **Two-step selection** | Pick item first, then unit | Item dropdown → Unit dropdown |
| **Use _id as key** | Never use index, prevents React bugs | `key={item._id}` in map |
| **Filter AFTER deduping** | Prevent duplicates from slipping through | Don't flatten first! |

---

## ❌ DON'T DO THIS

```javascript
// ❌ Flattening first (creates duplicates)
menuItems.flatMap(item => 
  item.prices.map(price => ({...}))
).filter(...)

// ❌ Using index as key
{filteredMenuItems.map((item, index) => (
  <option key={index}>  // 🔴 WRONG
}

// ❌ Deduping after filtering
const filtered = menuItems.filter(...);
const deduped = dedupeByItemName(filtered);  // 🔴 Late!

// ❌ Multiple .find() calls
filteredMenuItems.forEach(item => {
  const prices = menuItems.find(...)  // Inefficient!
})

// ❌ No useMemo (recalculates every render)
const filteredMenuItems = menuItems
  .filter(...)  // 🔴 Runs 100+ times per second
```

---

## ✅ DO THIS

```javascript
// ✅ Dedupe first using Set
const uniqueNames = Array.from(new Set(menuItems.map(item => item.itemName)));

// ✅ Map to representatives
const filteredMenuItems = uniqueNames
  .map(name => menuItems.find(item => item.itemName === name))
  .filter(item => item && searchMatches(item))
  .sort((a, b) => a.itemName.localeCompare(b.itemName));

// ✅ Wrap in useMemo
const filteredMenuItems = useMemo(() => { ... }, [menuItems, menuSearch, selectedCategory]);

// ✅ Use _id as key
{filteredMenuItems.map(item => (
  <option key={item._id}>
}

// ✅ Collect all variants when needed
const allVariants = menuItems.filter(item => item.itemName === selectedItem);
const allUnits = allVariants.flatMap(item => item.prices);
```

---

## 🧪 VERIFICATION CHECKLIST

After implementing this pattern:

- [ ] Each item name appears **exactly once** in dropdown
- [ ] Unit dropdown shows **ALL** price variants for selected item
- [ ] Searching filters correctly without duplicates
- [ ] Category filter works without duplicates
- [ ] Browser console shows no warnings
- [ ] React DevTools shows correct component memoization
- [ ] Selecting different items updates units correctly
- [ ] No duplicate keys warning in console

---

## 📊 DATA FLOW DIAGRAM

```
Backend: 745 items (some with same itemName)
         ↓
useMenuItems hook: Dedupe by _id
         ↓
Component receives: menuItems array
         ↓
useMemo + Set: Extract unique itemNames
         ↓
Dropdown 1: Show 745→500 unique items (ONE per name)
         ↓
User selects item
         ↓
useMemo + filter: Collect ALL price variants
         ↓
Dropdown 2: Show unit options for all variants
         ↓
User selects unit → Add to cart with qty
```

---

## 🚀 CURRENT IMPLEMENTATION (Already Applied)

Your three files have been updated to use this pattern:

```javascript
// InstantOrder.jsx (Lines 130-138)
// Quotation.jsx (Lines 339-345)
// CreateEvent.jsx (Lines 203-209)

const uniqueItemNames = Array.from(new Set(menuItems.map(item => item.itemName)));
const filteredMenuItems = uniqueItemNames
  .map(name => menuItems.find(item => item.itemName === name && (...filters)))
  .filter(item => item && item.itemName.toLowerCase().includes(menuSearch.toLowerCase()))
  .sort((a, b) => a.itemName.localeCompare(b.itemName));
```

This is now the **clean React pattern** with no duplicates! ✅
