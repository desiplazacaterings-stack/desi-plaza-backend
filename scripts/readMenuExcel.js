const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// Load Excel file
const filePath = path.join(__dirname, "../data/DP MENU.xlsx");
const workbook = XLSX.readFile(filePath);

// Read first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert sheet to JSON
const rows = XLSX.utils.sheet_to_json(sheet);

// ---- 1️⃣ SHOW UNITS OF MEASURE ----
const units = [...new Set(rows.map(r => r["Unit of Measure"]))];
console.log("✅ Units of Measure found:");
console.log(units);

// ---- 2️⃣ CONVERT TO MONGODB FORMAT ----
const menuMap = {};

rows.forEach(row => {
  const key = row["Item Name"];

  if (!menuMap[key]) {
    menuMap[key] = {
      itemName: row["Item Name"],
      category: row["Category"],
      prices: [],
    };
  }

  menuMap[key].prices.push({
    unit: row["Unit of Measure"],
    units: row["Units"],
    price: row["Price"]
  });
});

// Final array
const finalMenu = Object.values(menuMap);

// Save to JSON
const outputPath = path.join(__dirname, "../output/menu.mongodb.json");
fs.writeFileSync(outputPath, JSON.stringify(finalMenu, null, 2));

console.log("✅ MongoDB-ready file created:");
console.log(outputPath);

