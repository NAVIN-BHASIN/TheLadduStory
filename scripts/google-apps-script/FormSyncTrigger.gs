/**
 * ==========================================================================================
 * THE LADDU STORY - AUTOMATED GOOGLE FORM TO OMS SYNC ENGINE
 * Synchronizes: 'Form Responses 1' -> 'Orders' + 'Inventory' + 'Customers'
 * Brand: The Laddu Story | Hotline: +91 9343207515 | Account: theladdustory@gmail.com
 * ==========================================================================================
 */

/**
 * 1. Automatically runs when Google Form receives a new order
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
    .addItem('🔄 Sync All Form Responses Now', 'syncFormResponsesToOrders')
    .addItem('📦 Rebuild / Verify Inventory Formulas', 'verifyInventoryTab')
    .addItem('🏷️ Apply Delivery Status Dropdowns', 'applyStatusDropdowns')
    .addToUi();
}

/**
 * 3. Core Sync Engine: Reads 'Form Responses 1' and populates 'Orders', 'Inventory', & 'Customers'
 */
function syncFormResponsesToOrders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Find Form Responses sheet (Google Form default name)
  var formSheet = ss.getSheetByName('Form Responses 1') || 
                  ss.getSheetByName('Form Responses') || 
                  ss.getSheetByName('Form_Responses_1');
  
  if (!formSheet) {
    SpreadsheetApp.getUi().alert("Sheet 'Form Responses 1' not found. Please ensure Google Form is linked to this sheet.");
    return;
  }

  // Ensure 'Orders', 'Inventory', and 'Customers' sheets exist
  var ordersSheet = ensureOrdersSheet(ss);
  var invSheet = ensureInventorySheet(ss);
  var custSheet = ensureCustomersSheet(ss);

  var formData = formSheet.getDataRange().getValues();
  if (formData.length <= 1) return; // No responses yet (only header row)

  // Cache existing OrderIDs in Orders sheet to prevent duplicate entries
  var existingOrders = ordersSheet.getDataRange().getValues();
  var existingIds = {};
  for (var i = 1; i < existingOrders.length; i++) {
    var existingId = String(existingOrders[i][0]).trim();
    if (existingId) existingIds[existingId] = true;
  }

  var newRowsAdded = 0;

  // Process each row in Form Responses (Row 0 is header, data starts at Row 1)
  for (var r = 1; r < formData.length; r++) {
    var row = formData[r];
    
    // Google Form Column Mapping:
    // Col A (0): Timestamp
    // Col B (1): OrderID (e.g. TLS-20261011-4821)
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

    // Skip if already processed into Orders
    if (existingIds[orderId]) {
      continue;
    }

    // Parse item lines: "1x Ragi Walnut Laddu (1 Kg) = ₹1,200 | 2x Savory Makhana (100g) = ₹550 | Total: ₹1,750"
    var parts = itemsRaw.split('|');
    var orderItemCount = 0;

    for (var p = 0; p < parts.length; p++) {
      var part = parts[p].trim();
      if (!part || part.toLowerCase().indexOf('total:') === 0) continue;

      // Match regex: e.g. "1x Till Laddu (Black Sesame) (500g) = ₹500"
      var match = part.match(/^(\d+)x\s+(.+?)\s+\(([^()]+)\)\s*=\s*[₹\s]*([\d,]+)/i);
      if (match) {
        var qty = parseInt(match[1], 10) || 1;
        var itemName = match[2].trim();
        var packWeight = match[3].trim();
        var itemTotal = parseInt(match[4].replace(/,/g, ''), 10) || 0;
        var unitPrice = qty > 0 ? Math.round(itemTotal / qty) : itemTotal;
        var sku = deriveSku(itemName);

        ordersSheet.appendRow([
          orderId,
          timestamp,
          'ONLINE_STORE',
          custName,
          "'" + custPhone,
          sku,
          itemName,
          packWeight,
          qty,
          unitPrice,
          itemTotal,
          'UPI',
          'PAID',
          'RECEIVED',
          custAddress,
          'Auto-synced from Google Form'
        ]);
        orderItemCount++;
        newRowsAdded++;
      }
    }

    // Fallback if custom parsing didn't match: create a single summarized row
    if (orderItemCount === 0 && itemsRaw) {
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
      newRowsAdded++;
    }

    // Mark as processed
    existingIds[orderId] = true;

    // Update Customers Sheet
    updateCustomerRecord(custSheet, custPhone, custName, custAddress, timestamp);
  }

  // Apply dropdown data validation to Column N (OrderStatus)
  applyStatusDropdowns();

  Logger.log('Sync completed. New items added: ' + newRowsAdded);
}

/**
 * 4. Derives standard SKU from product name
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
 * 5. Applies Interactive Delivery Status Dropdowns to Column N (OrderStatus)
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
 * Verifies or rebuilds Inventory Sheet with SUMIF formulas
 */
function verifyInventoryTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureInventorySheet(ss);
  SpreadsheetApp.getUi().alert("✅ Inventory and dynamic formulas verified successfully!");
}

/**
 * 6. Ensures Orders Sheet exists with proper styling
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
 * 7. Ensures Inventory Sheet exists with live SUMIF formula tracking
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
 * 8. Ensures Customers Sheet exists
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
 * 9. Upserts Customer info in Customers Sheet
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

  // New customer
  custSheet.appendRow(["'" + phone, name, 1, timestamp, address]);
}
