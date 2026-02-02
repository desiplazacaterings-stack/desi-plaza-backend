/**
 * 📖 USAGE EXAMPLES: useUniqueMenuItems Hooks
 * 
 * How to use the custom hooks to prevent menu item duplication
 */

// ============================================================================
// EXAMPLE 1: Simple Dropdown (No Category Filter)
// ============================================================================

import { useState, useMemo } from 'react';
import { useUniqueMenuItems, useItemUnits, getPriceForItemUnit } from '../hooks/useUniqueMenuItems';
import useMenuItems from '../hooks/useMenuItems';

function SimpleMenuSelector() {
  const { menuItems } = useMenuItems();
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [qty, setQty] = useState(1);

  // ✅ Get unique items (deduped by itemName)
  const uniqueItems = useUniqueMenuItems(menuItems, "", "");

  // ✅ Get units for selected item
  const availableUnits = useItemUnits(menuItems, selectedItem);

  // ✅ Get price
  const price = getPriceForItemUnit(menuItems, selectedItem, selectedUnit);

  return (
    <div>
      <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
        <option value="">Select Item</option>
        {uniqueItems.map(item => (
          <option key={item._id} value={item.itemName}>
            {item.itemName}
          </option>
        ))}
      </select>

      <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} disabled={!selectedItem}>
        <option value="">Select Unit</option>
        {availableUnits.map(({ unit, price }) => (
          <option key={unit} value={unit}>
            {unit} - ${price}
          </option>
        ))}
      </select>

      <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />

      {selectedItem && selectedUnit && (
        <div>
          <p>Total: ${(price * qty).toFixed(2)}</p>
          <button>Add to Order</button>
        </div>
      )}
    </div>
  );
}

export default SimpleMenuSelector;

// ============================================================================
// EXAMPLE 2: With Search Filter
// ============================================================================

function MenuSelectorWithSearch() {
  const { menuItems } = useMenuItems();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Filtered items (respects search)
  const filteredItems = useUniqueMenuItems(menuItems, searchQuery, "");

  // ✅ Units for selected item
  const availableUnits = useItemUnits(menuItems, selectedItem);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        placeholder="Search menu items..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
      />

      {showDropdown && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #ccc', maxHeight: 200, overflowY: 'auto' }}>
          {filteredItems.length === 0 ? (
            <div style={{ padding: 10, color: '#888' }}>No items found</div>
          ) : (
            filteredItems.map(item => (
              <div
                key={item._id}
                style={{ padding: 10, cursor: 'pointer', borderBottom: '1px solid #eee' }}
                onMouseDown={() => {
                  setSelectedItem(item.itemName);
                  setSearchQuery(item.itemName);
                  setShowDropdown(false);
                }}
              >
                {item.itemName} ({item.category})
              </div>
            ))
          )}
        </div>
      )}

      <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} disabled={!selectedItem}>
        <option value="">Select Unit</option>
        {availableUnits.map(({ unit, price }) => (
          <option key={unit} value={unit}>
            {unit} - ${price}
          </option>
        ))}
      </select>
    </div>
  );
}

export default MenuSelectorWithSearch;

// ============================================================================
// EXAMPLE 3: With Category Filter (Full Pattern)
// ============================================================================

function MenuSelectorWithCategory() {
  const { menuItems } = useMenuItems();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");

  // ✅ Get all categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map(item => item.category)));
    return cats.sort();
  }, [menuItems]);

  // ✅ Get unique items with category filter
  const filteredItems = useUniqueMenuItems(menuItems, searchQuery, selectedCategory);

  // ✅ Get units for selected item
  const availableUnits = useItemUnits(menuItems, selectedItem);

  // ✅ Get price
  const price = getPriceForItemUnit(menuItems, selectedItem, selectedUnit);

  return (
    <div>
      {/* Category Filter */}
      <div>
        <label>Category:</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Search */}
      <div>
        <label>Search:</label>
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Item Selection */}
      <div>
        <label>Item:</label>
        <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
          <option value="">Select Item</option>
          {filteredItems.map(item => (
            <option key={item._id} value={item.itemName}>
              {item.itemName}
            </option>
          ))}
        </select>
      </div>

      {/* Unit Selection */}
      <div>
        <label>Unit:</label>
        <select value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} disabled={!selectedItem}>
          <option value="">Select Unit</option>
          {availableUnits.map(({ unit, price }) => (
            <option key={unit} value={unit}>
              {unit} - ${price}
            </option>
          ))}
        </select>
      </div>

      {/* Display Price */}
      {selectedItem && selectedUnit && (
        <div style={{ padding: 10, background: '#f0f0f0', borderRadius: 4, marginTop: 10 }}>
          <strong>Selected:</strong> {selectedItem} / {selectedUnit}
          <br />
          <strong>Price:</strong> ${price}
        </div>
      )}
    </div>
  );
}

export default MenuSelectorWithCategory;

// ============================================================================
// EXAMPLE 4: In InstantOrder.jsx (How to Refactor)
// ============================================================================

// BEFORE (With Duplication Issue)
// ❌ Inefficient deduplication
// const filteredMenuItems = dedupeByItemName(menuItems)
//   .filter(item => item.itemName.toLowerCase().includes(menuSearch.toLowerCase()))

// AFTER (Clean Pattern)
// ✅ Using custom hook
import { useUniqueMenuItems } from '../hooks/useUniqueMenuItems';

function InstantOrder() {
  const { menuItems } = useMenuItems();
  const [menuSearch, setMenuSearch] = useState("");

  // ✅ ONE LINE to get unique items with search!
  const filteredMenuItems = useUniqueMenuItems(menuItems, menuSearch, "");

  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        value={menuSearch}
        onChange={(e) => setMenuSearch(e.target.value)}
      />

      <select>
        {filteredMenuItems.map(item => (
          <option key={item._id} value={item.itemName}>
            {item.itemName}
          </option>
        ))}
      </select>
    </div>
  );
}

// ============================================================================
// KEY POINTS
// ============================================================================

/*
✅ ALWAYS USE:
- useUniqueMenuItems() for dropdown items
- useItemUnits() for unit selection
- item._id as key in map()

❌ NEVER USE:
- dedupeByItemName() - Old pattern
- index as key
- Flattening prices first

🎯 Result:
- Each item appears exactly once in dropdown
- All prices preserved and accessible
- No duplicates, no performance issues
- Works with search and category filters
*/
