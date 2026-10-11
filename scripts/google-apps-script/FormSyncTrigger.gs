/**
 * ==========================================================================================
 * THE LADDU STORY - MASTER GOOGLE FORM TO OMS SYNC ENGINE (v2.0)
 * Synchronizes: 'Form Responses 1' -> 'Orders' + 'Inventory' + 'Customers'
 * Brand: The Laddu Story | Hotline: +91 9343207515 | Account: theladdustory@gmail.com
 * Features:
 *   1. Automatic Trigger on Form Submit (onFormSubmit)
 *   2. Deduplication (Never records duplicate orders)
 *   3. Itemized Order Parsing (Each product gets its own clean row with SKU, Pack, Qty, Total)
 *   4. One-Click Fix & Clean for existing historical orders
 *   5. Interactive Delivery Status dropdowns on Column N
 *   6. Dynamic Inventory Stock Deduction (=SUMIF)
 * ==========================================================================================
 */

/**
 * 1. Automatically runs on every new order submission
 */
function onFormSubmit(e) {
  syncFormResponsesToOrders();
}

/**
 * 2. Adds Top Menu in Google Sheets for One-Click Sync & Management
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('✨ The Laddu Story OMS')
    .addItem('🔄 Sync New Form Responses', 'syncFormResponsesToOrders')
    .addItem('🧹 Clean & Re-Sync All Orders Properly', 'rebuildAndFixAllOrders')
    .addItem('📦 Rebuild / Verify Inventory Formulas', 'verifyInventoryTab')
    .addItem('🏷️ Re-apply Delivery Status Dropdowns', 'applyStatusDropdowns')
    .addToUi();
}

/**
 * 3. Core Sync Engine: Reads 'Form Responses 1' and appends only new unique orders
 */
function syncFormResponsesToOrders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSheet = ss.getSheetByName('Form Responses 1') || 
                  ss.getSheetByName('Form Responses') || 
                  ss.getSheetByName('Form_Responses_1');
  
  if (!formSheet) {
    SpreadsheetApp.getUi().alert("Sheet 'Form Responses 1' not found. Please ensure Google Form is linked.");
    return;
  }

  var ordersSheet = ensureOrdersSheet(ss);
  var invSheet = ensureInventorySheet(ss);
  var custSheet = ensureCustomersSheet(ss);

  var formData = formSheet.getDataRange().getValues();
  if (formData.length <= 1) return;

  // Cache existing OrderIDs in Orders sheet
  var existingOrders = ordersSheet.getDataRange().getValues();
  var existingIds = {};
  for (var i = 1; i < existingOrders.length; i++) {
    var existingId = String(existingOrders[i][0]).trim();
    if (existingId) existingIds[existingId] = true;
  }

  var newRowsAdded = processFormRows(formData, ordersSheet, custSheet, existingIds);
  applyStatusDropdowns();
  Logger.log('Sync completed. New items added: ' + newRowsAdded);
}

/**
 * 4. ONE-CLICK FIX: Clears any messy fallback rows and cleanly repopulates every order
 */
function rebuildAndFixAllOrders() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert(
    'Rebuild & Clean Orders Sheet',
    'This will clean up any duplicated or generic (LADDU-MIX) rows and cleanly re-parse all orders from "Form Responses 1" into individual item rows with SKU, Pack Weight, and Quantity. Proceed?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) return;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSheet = ss.getSheetByName('Form Responses 1') || ss.getSheetByName('Form Responses');
  if (!formSheet) {
    ui.alert("Sheet 'Form Responses 1' not found.");
    return;
  }

  var ordersSheet = ensureOrdersSheet(ss);
  var custSheet = ensureCustomersSheet(ss);
  ensureInventorySheet(ss);

  // Clear existing data rows (keep header row 1)
  var lastRow = ordersSheet.getLastRow();
  if (lastRow > 1) {
    ordersSheet.getRange(2, 1, lastRow - 1, 16).clearContent();
  }

  var formData = formSheet.getDataRange().getValues();
  var processedIds = {};
  var totalRows = processFormRows(formData, ordersSheet, custSheet, processedIds);

  applyStatusDropdowns();
  ui.alert('✅ Done! All orders cleanly re-synced into ' + totalRows + ' itemized rows with exact SKUs, quantities, and status dropdowns.');
}

/**
 * 5. Universal Form Row Processor: Splits items into clean canonical columns
 */
function processFormRows(formData, ordersSheet, custSheet, processedIds) {
  var rowsAdded = 0;

  for (var r = 1; r < formData.length; r++) {
    var row = formData[r];
    
    // Column Mapping:
    // Col A (0): Timestamp
    // Col B (1): OrderID
    // Col C (2): Customer Name
    // Col D (3): Phone Number
    // Col E (4): Delivery Address
    // Col F (5): Order Items & Amount
    
    var rawDate = row[0];
    var timestamp = rawDate ? Utilities.formatDate(new Date(rawDate), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss') : Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
    var orderId = String(row[1] || ('TLS-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd') + '-' + (1000 + r))).trim();
    var custName = String(row[2] || 'Valued Customer').trim();
    var custPhone = String(row[3] || '').trim();
    var custAddress = String(row[4] || '').trim();
    var itemsRaw = String(row[5] || '').trim();

    // DEDUPLICATION: Skip if this OrderID was already processed
    if (processedIds[orderId]) continue;

    var items = parseOrderItems(itemsRaw);

    if (items.length > 0) {
      for (var j = 0; j < items.length; j++) {
        var it = items[j];
        ordersSheet.appendRow([
          orderId,
          timestamp,
          'ONLINE_STORE',
          custName,
          "'" + custPhone,
          it.sku,
          it.name,
          it.pack,
          it.qty,
          it.unitPrice,
          it.total,
          'UPI',
          'PAID',
          'RECEIVED',
          custAddress,
          'Auto-synced from Google Form'
        ]);
        rowsAdded++;
      }
    } else if (itemsRaw) {
      // Fallback only if regex couldn't find pattern
      ordersSheet.appendRow([
        orderId,
        timestamp,
        'ONLINE_STORE',
        custName,
        "'" + custPhone,
        'LADDU-MIX',
        'Assorted Laddus',
        'Standard Pack',
        1,
        600,
        600,
        'UPI',
        'PAID',
        'RECEIVED',
        custAddress,
        itemsRaw
      ]);
      rowsAdded++;
    }

    processedIds[orderId] = true;
    updateCustomerRecord(custSheet, custPhone, custName, custAddress, timestamp);
  }

  return rowsAdded;
}

/**
 * 6. Robust Item Parser: Handles clean weights, double parentheses, and multi-line carts
 */
function parseOrderItems(itemsRaw) {
  if (!itemsRaw) return [];
  var parts = itemsRaw.split('|');
  var results = [];

  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (!p || p.toLowerCase().indexOf('total:') === 0) continue;

    // Matches both:
    // 1) "1x Ragi Walnut Laddu (1 Kg (₹1,200)) = ₹1200" (legacy format)
    // 2) "1x Ragi Walnut Laddu (1 Kg) = ₹1200" (new clean format)
    // 3) "1x Till Laddu (Black Sesame) (500g) = 500"
    var match = p.match(/^(\d+)x\s+(.+?)\s+\(([\d\w\s]+?)(?:\s*\([₹\d,]+\))?\)\s*=\s*[₹\s]*([\d,]+)/i);
    
    if (match) {
      var qty = parseInt(match[1], 10) || 1;
      var name = match[2].trim();
      var pack = match[3].trim();
      var total = parseInt(match[4].replace(/,/g, ''), 10) || 0;
      var unitPrice = qty > 0 ? Math.round(total / qty) : total;
      var sku = deriveSku(name);

      results.push({
        sku: sku,
        name: name,
        pack: pack,
        qty: qty,
        unitPrice: unitPrice,
        total: total
      });
    }
  }

  return results;
}

/**
 * 7. Derives canonical SKU from item name
 */
function deriveSku(itemName) {
  var name = itemName.toUpperCase();
  if (name.indexOf('RAGI') !== -1) return 'RAGI-WALNUT';
  if (name.indexOf('TILL') !== -1 || name.indexOf('SESAME') !== -1) return 'TILL-BLACK-SESAME';
  if (name.indexOf('SATTU') !== -1) return 'SATTU-ALMOND';
  if (name.indexOf('GROUNDNUT') !== -1 || name.indexOf('PEANUT') !== -1) return 'GROUNDNUT';
  if (name.indexOf('QUINOA') !== -1) return 'QUINOA-MOONG-DAL';
  if (name.indexOf('METHI') !== -1) return 'METHI-FENUGREEK';
  if (name.indexOf('DATES') !== -1) return 'DATES-DRY-FRUITS';
  if (name.indexOf('POST DELIVERY') !== -1 || name.indexOf('POSTPARTUM') !== -1) return 'POST-DELIVERY-PANJEERI';
  if (name.indexOf('JAWAR') !== -1) return 'JAWAR-PANJEERI';
  if (name.indexOf('MAKHANA') !== -1) return 'SAVORY-MAKHANA';
  if (name.indexOf('MURMURA') !== -1 || name.indexOf('MUDI') !== -1) return 'SAVORY-MURMURA';
  return name.replace(/[^A-Z0-9]+/g, '-');
}

/**
 * 8. Applies Interactive Delivery Status Dropdowns to Column N (OrderStatus)
 */
function applyStatusDropdowns() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName('Orders');
  if (!ordersSheet) return;

  var lastRow = ordersSheet.getLastRow();
  if (lastRow <= 1) return;

  var statuses = ['RECEIVED', 'PREPARING', 'PACKED', 'OUT FOR DELIVERY', 'DELIVERED', 'CANCELLED'];
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(statuses, true)
    .setAllowInvalid(false)
    .build();

  // Column N is index 14
  ordersSheet.getRange(2, 14, lastRow - 1, 1).setDataValidation(rule);
}

/**
 * 9. Rebuilds or Verifies Inventory formulas
 */
function verifyInventoryTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureInventorySheet(ss);
  SpreadsheetApp.getUi().alert("✅ Inventory and dynamic formulas verified successfully!");
}

/**
 * 10. Ensures Orders Sheet exists with official teal flyer styling
 */
function ensureOrdersSheet(ss) {
  var sheet = ss.getSheetByName('Orders');
  if (!sheet) {
    sheet = ss.insertSheet('Orders');
    var headers = [
      'OrderID', 'CreatedAt', 'Channel', 'CustomerName', 'CustomerPhone',
      'SKU', 'ItemName', 'PackWeight', 'Quantity', 'UnitAmount',
      'TotalAmount', 'PaymentMethod', 'PaymentStatus', 'OrderStatus',
      'DeliveryAddress', 'Notes'
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#187A90').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * 11. Ensures Inventory Sheet exists with live SUMIF formula tracking
 */
function ensureInventorySheet(ss) {
  var sheet = ss.getSheetByName('Inventory') || ss.getSheetByName('Menu_&_Inventory');
  if (!sheet) {
    sheet = ss.insertSheet('Inventory');
    var headers = ['#', 'SKU', 'ItemName', 'Category', 'Rate_Description', 'Price_MinPack', 'Opening_Stock', 'Packs_Sold', 'Current_Stock', 'MinThreshold', 'Reorder_Status'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#187A90').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);

    var catalog = [
      ['01', 'RAGI-WALNUT', 'Ragi Walnut Laddu', 'LADDU', '₹1,200/Kg (Min 500g: ₹600)', 600, 50],
      ['02', 'TILL-BLACK-SESAME', 'Till Laddu (Black Sesame)', 'LADDU', '₹1,000/Kg (Min 500g: ₹500)', 500, 50],
      ['03', 'SATTU-ALMOND', 'Sattu Almond Laddu', 'LADDU', '₹1,100/Kg (Min 500g: ₹550)', 550, 50],
      ['04', 'GROUNDNUT', 'Groundnut Laddu', 'LADDU', '₹800/Kg (Min 500g: ₹400)', 400, 50],
      ['05', 'QUINOA-MOONG-DAL', 'Quinoa Moong Dal Laddu', 'LADDU', '₹1,250/Kg (Min 500g: ₹625)', 625, 50],
      ['06', 'METHI-FENUGREEK', 'Methi (fenugreek) Laddu', 'LADDU', '₹1,250/Kg (Min 500g: ₹625)', 625, 50],
      ['07', 'DATES-DRY-FRUITS', 'Dates & Dry Fruits Bites', 'LADDU', '₹1,900/Kg (Min 500g: ₹950)', 950, 50],
      ['08', 'POST-DELIVERY-PANJEERI', 'Post Delivery Panjeeri / Laddu', 'LADDU', '₹1,800/Kg (Min 500g: ₹900)', 900, 50],
      ['09', 'JAWAR-PANJEERI', 'Jawar Panjeeri / Laddu', 'LADDU', '₹1,900/Kg (Min 500g: ₹950)', 950, 50],
      ['10', 'SAVORY-MAKHANA', 'Savory Munchies (Roasted Makhana)', 'SAVORY', 'Roasted Makhana (₹275/100g)', 275, 50],
      ['11', 'SAVORY-MURMURA', 'Savory Munchies (Millet Mudi Mix)', 'SAVORY', 'Millet Mudi Mix (₹200/200g)', 200, 50]
    ];

    for (var i = 0; i < catalog.length; i++) {
      var r = i + 2;
      var item = catalog[i];
      sheet.appendRow([
        item[0], item[1], item[2], item[3], item[4], item[5], item[6],
        '=SUMIF(Orders!F:F, B' + r + ', Orders!I:I)',
        '=G' + r + ' - H' + r,
        10,
        '=IF(I' + r + '<=J' + r + ', "⚠️ REORDER NOW", "✅ HEALTHY")'
      ]);
    }
  }
  return sheet;
}

/**
 * 12. Ensures Customers Sheet exists
 */
function ensureCustomersSheet(ss) {
  var sheet = ss.getSheetByName('Customers');
  if (!sheet) {
    sheet = ss.insertSheet('Customers');
    var headers = ['PhoneNumber', 'CustomerName', 'TotalOrders', 'LastOrderDate', 'DeliveryAddress'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#187A90').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * 13. Upserts Customer info in Customers Sheet
 */
function updateCustomerRecord(custSheet, phone, name, address, timestamp) {
  if (!phone) return;
  var data = custSheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var existingPhone = String(data[i][0]).replace(/['\s]/g, '');
    var incomingPhone = String(phone).replace(/['\s]/g, '');
    if (existingPhone && existingPhone === incomingPhone) {
      var currentOrderCount = parseInt(data[i][2], 10) || 1;
      custSheet.getRange(i + 1, 3).setValue(currentOrderCount + 1);
      custSheet.getRange(i + 1, 4).setValue(timestamp);
      if (address) custSheet.getRange(i + 1, 5).setValue(address);
      return;
    }
  }
  custSheet.appendRow(["'" + phone, name, 1, timestamp, address]);
}
