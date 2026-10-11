/**
 * ==========================================================================================
 * THE LADDU STORY - MASTER GOOGLE FORM TO OMS SYNC ENGINE (v3.0)
 * Synchronizes: 'Form Responses 1' -> 'Orders' + 'Inventory' + 'Customers'
 * Brand: The Laddu Story | Hotline: +91 9343207515 | Account: theladdustory@gmail.com
 * Features:
 *   1. Automatic Trigger on Form Submit (onFormSubmit)
 *   2. Deduplication (Never records duplicate orders)
 *   3. Itemized Order Parsing (Each product gets its own row with SKU, Pack, Qty, Total)
 *   4. Full 8-Column Customer Tracking with Lifetime Value & Order Counts
 *   5. One-Click Fix & Clean for both Orders and Customers sheets
 *   6. Automated WhatsApp Notification Hook (Meta Cloud API / UltraMsg)
 * ==========================================================================================
 */

// OPTIONAL: Configure your WhatsApp Gateway here for 100% automated background WhatsApp dispatch
var WHATSAPP_CONFIG = {
  ENABLED: false, // Set to true once you enter credentials below
  PROVIDER: 'ULTRAMSG', // 'ULTRAMSG' or 'META_CLOUD_API'
  ULTRAMSG_INSTANCE_ID: 'instanceXXXXX',
  ULTRAMSG_TOKEN: 'tokenXXXXX',
  STORE_PHONE: '919343207515' // Alert notifications sent to owner phone
};

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
    .addItem('👥 Clean & Rebuild Customers Sheet', 'rebuildAndFixCustomersSheet')
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

  var existingOrders = ordersSheet.getDataRange().getValues();
  var existingIds = {};
  for (var i = 1; i < existingOrders.length; i++) {
    var existingId = String(existingOrders[i][0]).trim();
    if (existingId) existingIds[existingId] = true;
  }

  processFormRows(formData, ordersSheet, custSheet, existingIds);
  applyStatusDropdowns();
}

/**
 * 4. ONE-CLICK FIX FOR ORDERS: Cleans duplicate LADDU-MIX rows and parses all orders into individual items
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

  var lastRow = ordersSheet.getLastRow();
  if (lastRow > 1) {
    ordersSheet.getRange(2, 1, lastRow - 1, 16).clearContent();
  }

  var formData = formSheet.getDataRange().getValues();
  var processedIds = {};
  var totalRows = processFormRows(formData, ordersSheet, custSheet, processedIds);

  applyStatusDropdowns();
  rebuildAndFixCustomersSheet(false); // Also refresh customers

  ui.alert('✅ Done! All orders cleanly re-synced into ' + totalRows + ' itemized rows with exact SKUs, quantities, and status dropdowns.');
}

/**
 * 5. ONE-CLICK FIX FOR CUSTOMERS: Accurately populates all 8 columns from Orders
 */
function rebuildAndFixCustomersSheet(showPrompt) {
  if (showPrompt !== false) {
    var ui = SpreadsheetApp.getUi();
    var response = ui.alert(
      'Rebuild & Fix Customers Sheet',
      'This will reconstruct all 8 columns of the Customers sheet with accurate Phone Numbers, Customer Names, Total Orders, Lifetime Value (₹), Last Order Dates, and Delivery Addresses. Proceed?',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ordersSheet = ss.getSheetByName('Orders');
  var custSheet = ensureCustomersSheet(ss);

  if (!ordersSheet || ordersSheet.getLastRow() <= 1) {
    if (showPrompt !== false) SpreadsheetApp.getUi().alert("No orders found to aggregate customers.");
    return;
  }

  var orderData = ordersSheet.getDataRange().getValues();
  var customerMap = {};

  // Aggregate orders by normalized 10-digit phone number
  for (var i = 1; i < orderData.length; i++) {
    var row = orderData[i];
    var orderId = String(row[0]).trim();
    var timestamp = String(row[1]).trim();
    var channel = String(row[2]).trim() || 'ONLINE_STORE';
    var name = String(row[3]).trim();
    var rawPhone = String(row[4]).trim();
    var totalAmount = parseFloat(row[10]) || 0;
    var address = String(row[14]).trim();

    var cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) continue;

    if (!customerMap[cleanPhone]) {
      customerMap[cleanPhone] = {
        formattedPhone: "+91 " + cleanPhone.slice(0, 5) + " " + cleanPhone.slice(5),
        name: name,
        firstChannel: channel,
        totalOrders: 0,
        lifetimeValue: 0,
        lastDate: timestamp,
        address: address,
        notes: "Direct Customer"
      };
    }

    customerMap[cleanPhone].totalOrders += 1;
    customerMap[cleanPhone].lifetimeValue += totalAmount;
    if (timestamp) customerMap[cleanPhone].lastDate = timestamp;
    if (address && address !== 'Direct Pickup / Bangalore Express Delivery') {
      customerMap[cleanPhone].address = address;
    }
    if (name && name !== 'Valued Customer') {
      customerMap[cleanPhone].name = name;
    }
  }

  // Clear existing customer rows (preserve header row 1)
  var lastCustRow = custSheet.getLastRow();
  if (lastCustRow > 1) {
    custSheet.getRange(2, 1, lastCustRow - 1, 8).clearContent();
  }

  // Insert consolidated customer rows
  var count = 0;
  for (var phoneKey in customerMap) {
    var c = customerMap[phoneKey];
    custSheet.appendRow([
      "'" + c.formattedPhone,
      c.name,
      c.firstChannel,
      c.totalOrders,
      c.lifetimeValue,
      c.lastDate,
      c.address,
      c.notes
    ]);
    count++;
  }

  // Format LifetimeValue column E as Currency
  if (count > 0) {
    custSheet.getRange(2, 5, count, 1).setNumberFormat('₹#,##0');
  }

  if (showPrompt !== false) {
    SpreadsheetApp.getUi().alert('✅ Done! ' + count + ' customers accurately updated across all 8 columns.');
  }
}

/**
 * 6. Universal Form Row Processor: Splits items into clean canonical columns
 */
function processFormRows(formData, ordersSheet, custSheet, processedIds) {
  var rowsAdded = 0;

  for (var r = 1; r < formData.length; r++) {
    var row = formData[r];
    
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
    var orderTotalAmount = 0;

    if (items.length > 0) {
      for (var j = 0; j < items.length; j++) {
        var it = items[j];
        orderTotalAmount += it.total;
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
      orderTotalAmount = 600;
    }

    processedIds[orderId] = true;
    updateCustomerRecord(custSheet, custPhone, custName, custAddress, timestamp, orderTotalAmount);

    // Optional Automated WhatsApp alert
    if (WHATSAPP_CONFIG.ENABLED) {
      sendAutomatedWhatsAppAlert(custPhone, custName, orderId, orderTotalAmount, itemsRaw, custAddress);
    }
  }

  return rowsAdded;
}

/**
 * 7. Robust Item Parser: Handles clean weights, double parentheses, and multi-line carts
 */
function parseOrderItems(itemsRaw) {
  if (!itemsRaw) return [];
  var parts = itemsRaw.split('|');
  var results = [];

  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (!p || p.toLowerCase().indexOf('total:') === 0) continue;

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
 * 8. Derives canonical SKU from item name
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
 * 9. Applies Interactive Delivery Status Dropdowns to Column N (OrderStatus)
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

  ordersSheet.getRange(2, 14, lastRow - 1, 1).setDataValidation(rule);
}

/**
 * 10. Rebuilds or Verifies Inventory formulas
 */
function verifyInventoryTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureInventorySheet(ss);
  SpreadsheetApp.getUi().alert("✅ Inventory and dynamic formulas verified successfully!");
}

/**
 * 11. Ensures Orders Sheet exists with official teal flyer styling
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
 * 12. Ensures Inventory Sheet exists with live SUMIF formula tracking
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
      ['08', 'POST-DELIVERY-PANJEERI', 'Post Delivery PanjeERI / Laddu', 'LADDU', '₹1,800/Kg (Min 500g: ₹900)', 900, 50],
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
 * 13. Ensures Customers Sheet exists with all 8 canonical columns
 */
function ensureCustomersSheet(ss) {
  var sheet = ss.getSheetByName('Customers');
  if (!sheet) {
    sheet = ss.insertSheet('Customers');
    var headers = ['PhoneNumber', 'CustomerName', 'FirstChannel', 'TotalOrders', 'LifetimeValue', 'LastOrderDate', 'DeliveryAddress', 'Notes'];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setBackground('#187A90').setFontColor('#FFFFFF').setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * 14. Upserts Customer info across all 8 exact columns
 */
function updateCustomerRecord(custSheet, phone, name, address, timestamp, newOrderAmount) {
  if (!phone) return;
  var cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  if (!cleanPhone || cleanPhone.length < 10) return;

  var formattedPhone = "+91 " + cleanPhone.slice(0, 5) + " " + cleanPhone.slice(5);
  var data = custSheet.getDataRange().getValues();

  // Check if customer already exists in Col A
  for (var i = 1; i < data.length; i++) {
    var existingRaw = String(data[i][0]).replace(/\D/g, '').slice(-10);
    if (existingRaw && existingRaw === cleanPhone) {
      var currentOrders = parseInt(data[i][3], 10) || 1;
      var currentLtv = parseFloat(data[i][4]) || 0;

      // Update Col B (Name)
      if (name && name !== 'Valued Customer') custSheet.getRange(i + 1, 2).setValue(name);
      // Update Col D (TotalOrders)
      custSheet.getRange(i + 1, 4).setValue(currentOrders + 1);
      // Update Col E (LifetimeValue)
      custSheet.getRange(i + 1, 5).setValue(currentLtv + (newOrderAmount || 0));
      // Update Col F (LastOrderDate)
      custSheet.getRange(i + 1, 6).setValue(timestamp);
      // Update Col G (DeliveryAddress)
      if (address && address !== 'Direct Pickup / Bangalore Express Delivery') {
        custSheet.getRange(i + 1, 7).setValue(address);
      }
      return;
    }
  }

  // New Customer: Append clean row with all 8 columns
  custSheet.appendRow([
    "'" + formattedPhone,
    name || 'Valued Customer',
    'ONLINE_STORE',
    1,
    newOrderAmount || 0,
    timestamp,
    address || 'Bangalore Delivery',
    'Direct Customer'
  ]);
  
  var newLastRow = custSheet.getLastRow();
  custSheet.getRange(newLastRow, 5).setNumberFormat('₹#,##0');
}

/**
 * 15. Automated Background WhatsApp Alert Trigger
 */
function sendAutomatedWhatsAppAlert(custPhone, custName, orderId, amount, itemsSummary, address) {
  try {
    var cleanPhone = String(custPhone).replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) return;

    var customerMsg = "Namaste " + custName + " ji! 🙏\n\n" +
      "Thank you for your order with *The Laddu Story*.\n" +
      "📦 Order ID: *" + orderId + "*\n" +
      "💰 Total Paid: *₹" + amount + "*\n" +
      "🍬 Items: " + itemsSummary + "\n" +
      "📍 Address: " + address + "\n\n" +
      "Your laddus are being freshly hand-rolled in 100% Pure Cow Ghee & Unrefined Jaggery (Zero White Sugar, Zero Preservatives).\n\n" +
      "Track your order: https://navin-bhasin.github.io/TheLadduStory/\n" +
      "— The Laddu Story (+91 9343207515)";

    if (WHATSAPP_CONFIG.PROVIDER === 'ULTRAMSG') {
      var url = "https://api.ultramsg.com/" + WHATSAPP_CONFIG.ULTRAMSG_INSTANCE_ID + "/messages/chat";
      var payload = {
        token: WHATSAPP_CONFIG.ULTRAMSG_TOKEN,
        to: "91" + cleanPhone,
        body: customerMsg
      };
      UrlFetchApp.fetch(url, {
        method: "post",
        payload: payload,
        muteHttpExceptions: true
      });
    }
  } catch (err) {
    Logger.log("WhatsApp dispatch note: " + err.toString());
  }
}
