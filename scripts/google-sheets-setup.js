/**
 * Automated Google Sheets Provisioner Script
 * Provisions "The Laddu Story - Master_OMS_Database"
 * Primary Google Account: theladdustory@gmail.com
 * Official Catalog: 11 Items (9 Laddus + 2 Savory Munchies)
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const { OFFICIAL_CATALOG, BRAND_INFO } = require("./seed-data");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const TARGET_GOOGLE_ACCOUNT = process.env.GOOGLE_USER_EMAIL || "theladdustory@gmail.com";

async function provisionGoogleSheets() {
  console.log("==================================================================");
  console.log("  The Laddu Story - Master OMS Google Sheets Provisioner");
  console.log(`  Owner Account: ${TARGET_GOOGLE_ACCOUNT}`);
  console.log(`  Hotline: ${BRAND_INFO.contactNumber} | MOQ: 500g`);
  console.log("==================================================================");

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./config/google-service-account.json";
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

  if (!fs.existsSync(credentialsPath)) {
    console.warn(`[WARNING] Service account credentials not found at: ${credentialsPath}`);
    console.log(`To connect your live Google Drive:`);
    console.log(`1. Place your Google Cloud Service Account JSON key in server/config/google-service-account.json`);
    console.log(`2. The script will automatically create the sheet and grant Editor rights to: ${TARGET_GOOGLE_ACCOUNT}`);
    console.log(`\n[MOCK MODE] Displaying Master_OMS_Database Layout & Formulas ready for ${TARGET_GOOGLE_ACCOUNT}...`);
    printSheetLayoutPreview();
    return;
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  });

  const sheets = google.sheets({ version: "v4", auth });
  const drive = google.drive({ version: "v3", auth });

  try {
    let targetSpreadsheetId = spreadsheetId;

    if (!targetSpreadsheetId) {
      console.log("[INFO] Creating new Google Spreadsheet: The Laddu Story - Master_OMS_Database...");
      const createRes = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: "The Laddu Story - Master_OMS_Database"
          },
          sheets: [
            { properties: { title: "Orders", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Inventory", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Customers", gridProperties: { frozenRowCount: 1 } } },
            { properties: { title: "Sync_Logs", gridProperties: { frozenRowCount: 1 } } }
          ]
        }
      });
      targetSpreadsheetId = createRes.data.spreadsheetId;
      console.log(`[SUCCESS] Spreadsheet created! ID: ${targetSpreadsheetId}`);

      // Share spreadsheet with theladdustory@gmail.com
      try {
        console.log(`[INFO] Sharing spreadsheet with owner: ${TARGET_GOOGLE_ACCOUNT}...`);
        await drive.permissions.create({
          fileId: targetSpreadsheetId,
          requestBody: {
            role: "writer",
            type: "user",
            emailAddress: TARGET_GOOGLE_ACCOUNT
          }
        });
        console.log(`[SUCCESS] Edit permissions successfully granted to ${TARGET_GOOGLE_ACCOUNT}!`);
      } catch (permErr) {
        console.warn(`[NOTICE] Could not auto-share via Drive API (${permErr.message}). You can manually share the sheet.`);
      }
    }

    // Headers
    const orderHeaders = [
      ["OrderID", "CreatedAt", "Channel", "CustomerName", "CustomerPhone", "SKU", "ItemName", "PackWeight", "Quantity", "UnitAmount", "TotalAmount", "PaymentMethod", "PaymentStatus", "OrderStatus", "Notes"]
    ];

    const inventoryHeaders = [
      ["#", "SKU", "ItemName", "Category", "Rate_Description", "Price_MinPack", "Opening_Stock_Packs", "Packs_Sold", "Current_Stock_Packs", "MinThreshold", "Reorder_Status"]
    ];

    const customerHeaders = [
      ["PhoneNumber", "CustomerName", "FirstChannel", "TotalOrders", "LifetimeValue", "LastOrderDate", "Address", "Notes"]
    ];

    const syncLogHeaders = [
      ["LogID", "Timestamp", "Source", "Action", "Status", "PayloadSummary"]
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: "Orders!A1:O1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: orderHeaders }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: "Inventory!A1:K1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: inventoryHeaders }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: "Customers!A1:H1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: customerHeaders }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: "Sync_Logs!A1:F1",
      valueInputOption: "USER_ENTERED",
      requestBody: { values: syncLogHeaders }
    });

    // Seed official 11 items
    console.log("[INFO] Populating official 11 items with dynamic SUMIF inventory formulas...");
    const inventoryRows = OFFICIAL_CATALOG.map((item, index) => {
      const rowNum = index + 2;
      return [
        item.id,
        item.sku,
        item.name,
        item.category,
        item.unitDescription,
        item.priceMinQty,
        50, // Initial stock packs
        `=SUMIF(Orders!F:F, B${rowNum}, Orders!I:I)`, // Packs_Sold (Summing Quantity in Col I where SKU matches)
        `=G${rowNum} - H${rowNum}`,                   // Current_Stock_Packs (Opening - Sold)
        10,                                           // MinThreshold
        `=IF(I${rowNum}<=J${rowNum}, "⚠️ REORDER NOW", "✅ HEALTHY")` // Reorder_Status
      ];
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: targetSpreadsheetId,
      range: `Inventory!A2:K${inventoryRows.length + 1}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: inventoryRows }
    });

    console.log("[SUCCESS] Master_OMS_Database fully configured for theladdustory@gmail.com!");
  } catch (error) {
    console.error("[ERROR] Provisioning failed:", error.message);
  }
}

function printSheetLayoutPreview() {
  console.log(`
------------------------------------------------------------------
GOOGLE SHEETS LAYOUT (Assigned to: ${TARGET_GOOGLE_ACCOUNT})
------------------------------------------------------------------
Sheet 1: Orders (Live stream from Web App, Mobile, WhatsApp, POS)
Columns: OrderID | CreatedAt | Channel | CustomerName | CustomerPhone |
         SKU | ItemName | PackWeight | Quantity | UnitAmount | TotalAmount |
         PaymentMethod | PaymentStatus | OrderStatus | Notes

Sheet 2: Inventory (11 Official Items with Dynamic Formulas)
Row 01: Ragi Walnut Laddu           | ₹1,200/Kg (Min 500g: ₹600)  | Formula: UnitsSold, CurrentStock
Row 02: Till Laddu (Black Sesame)   | ₹1,000/Kg (Min 500g: ₹500)  | Formula: UnitsSold, CurrentStock
Row 03: Sattu Almond Laddu          | ₹1,100/Kg (Min 500g: ₹550)  | Formula: UnitsSold, CurrentStock
Row 04: Groundnut Laddu             | ₹800/Kg   (Min 500g: ₹400)  | Formula: UnitsSold, CurrentStock
Row 05: Quinoa Moong Dal Laddu      | ₹1,250/Kg (Min 500g: ₹625)  | Formula: UnitsSold, CurrentStock
Row 06: Methi (fenugreek) Laddu     | ₹1,250/Kg (Min 500g: ₹625)  | Formula: UnitsSold, CurrentStock
Row 07: Dates & Dry Fruits Bites    | ₹1,900/Kg (Min 500g: ₹950)  | Formula: UnitsSold, CurrentStock
Row 08: Post Delivery Panjeeri      | ₹1,800/Kg (Min 500g: ₹900)  | Formula: UnitsSold, CurrentStock
Row 09: Jawar Panjeeri / Laddu      | ₹1,900/Kg (Min 500g: ₹950)  | Formula: UnitsSold, CurrentStock
Row 10: Savory Munchies (Makhana)   | Roasted Makhana (₹275/100g) | Formula: UnitsSold, CurrentStock
Row 11: Savory Munchies (Murmura)   | Millet Mudi Mix (₹200/200g) | Formula: UnitsSold, CurrentStock
------------------------------------------------------------------`);
}

if (require.main === module) {
  provisionGoogleSheets();
}

module.exports = { provisionGoogleSheets };
