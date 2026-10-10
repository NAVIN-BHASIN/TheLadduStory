/**
 * =========================================================================
 * THE LADDU STORY - Master OMS & Order Management Hub
 * Account: theladdustory@gmail.com | Hotline: +91 9343207515
 * Exact Brand Pamphlet Styling: Teal (#187A90) & Pistachio Green (#D6E5BA)
 * =========================================================================
 */

function doGet() {
  return HtmlService.createHtmlOutputFromFile('OrderForm')
    .setTitle('The Laddu Story - Official Online Order Form')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * Custom Menu inside Google Sheets
 * When the user opens the Google Sheet, they get a 1-click styling menu!
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('✨ The Laddu Story')
    .addItem('🎨 Apply Pamphlet Flyer Look & Feel', 'applyFlyerTheme')
    .addItem('📦 Re-verify Inventory Formulas', 'reverifyFormulas')
    .addToUi();
}

/**
 * 1-Click Function to style the Google Sheet with the exact Flyer Layout & Colors!
 */
function applyFlyerTheme() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // -------------------------------------------------------------
  // 1. MENU & INVENTORY TAB (Pamphlet Look & Feel)
  // -------------------------------------------------------------
  let inv = ss.getSheetByName('Menu_&_Inventory') || ss.getSheetByName('Inventory');
  if (!inv) {
    inv = ss.insertSheet('Menu_&_Inventory', 0);
  } else {
    inv.setName('Menu_&_Inventory');
  }
  
  inv.clear();
  inv.setTabColor('#187A90');

  // Brand Header Banner (Rows 1 to 3)
  inv.getRange('A1:I1').merge()
    .setValue('- The Laddu Story -')
    .setFontFamily('Georgia')
    .setFontSize(16)
    .setFontWeight('bold')
    .setFontColor('#4A121E')
    .setBackground('#FAF6F0')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  inv.setRowHeight(1, 40);

  inv.getRange('A2:I2').merge()
    .setValue('Homemade healthy snacks: Ancient Indian traditions and superfoods | Hotline: 9343207515')
    .setFontFamily('Segoe UI')
    .setFontSize(10)
    .setFontWeight('bold')
    .setFontColor('#065F46')
    .setBackground('#ECFDF5')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  inv.setRowHeight(2, 28);

  inv.getRange('A3:I3').merge()
    .setValue('Laddus are made using pure cow ghee and unrefined jaggery powder as sweetener (Minimum order quantity- 500gms)')
    .setFontFamily('Segoe UI')
    .setFontSize(9)
    .setFontStyle('italic')
    .setFontColor('#92400E')
    .setBackground('#FEF3C7')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  inv.setRowHeight(3, 26);

  // Table Headers (Row 5 in Teal #187A90)
  const headers = [
    ['#', 'Item', 'Category', 'Official Price', 'Opening Stock (Packs)', 'Packs Sold (=SUMIF)', 'Current Stock', 'Min Threshold', 'Reorder Alert']
  ];
  inv.getRange('A5:I5').setValues(headers)
    .setFontFamily('Segoe UI')
    .setFontSize(11)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#187A90')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  inv.setRowHeight(5, 32);

  // 11 Official Catalog Items
  const items = [
    ['01', 'Ragi Walnut Laddu', 'LADDU', '₹1,200 / Kg (Min 500g: ₹600)', 50, '=SUMIF(Orders!G:G, B6, Orders!I:I)', '=E6-F6', 10, '=IF(G6<=H6, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['02', 'Till Laddu (Black Sesame)', 'LADDU', '₹1,000 / Kg (Min 500g: ₹500)', 50, '=SUMIF(Orders!G:G, B7, Orders!I:I)', '=E7-F7', 10, '=IF(G7<=H7, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['03', 'Sattu Almond Laddu', 'LADDU', '₹1,100 / Kg (Min 500g: ₹550)', 50, '=SUMIF(Orders!G:G, B8, Orders!I:I)', '=E8-F8', 10, '=IF(G8<=H8, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['04', 'Groundnut Laddu', 'LADDU', '₹800 / Kg (Min 500g: ₹400)', 50, '=SUMIF(Orders!G:G, B9, Orders!I:I)', '=E9-F9', 10, '=IF(G9<=H9, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['05', 'Quinoa Moong Dal Laddu', 'LADDU', '₹1,250 / Kg (Min 500g: ₹625)', 50, '=SUMIF(Orders!G:G, B10, Orders!I:I)', '=E10-F10', 10, '=IF(G10<=H10, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['06', 'Methi (fenugreek) Laddu', 'LADDU', '₹1,250 / Kg (Min 500g: ₹625)', 50, '=SUMIF(Orders!G:G, B11, Orders!I:I)', '=E11-F11', 10, '=IF(G11<=H11, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['07', 'Dates & Dry Fruits Bites', 'LADDU', '₹1,900 / Kg (Min 500g: ₹950)', 50, '=SUMIF(Orders!G:G, B12, Orders!I:I)', '=E12-F12', 10, '=IF(G12<=H12, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['08', 'Post Delivery Panjeeri / Laddu', 'LADDU', '₹1,800 / Kg (Min 500g: ₹900)', 50, '=SUMIF(Orders!G:G, B13, Orders!I:I)', '=E13-F13', 10, '=IF(G13<=H13, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['09', 'Jawar Panjeeri / Laddu', 'LADDU', '₹1,900 / Kg (Min 500g: ₹950)', 50, '=SUMIF(Orders!G:G, B14, Orders!I:I)', '=E14-F14', 10, '=IF(G14<=H14, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['10', 'Savory Munchies (Makhana)', 'SAVORY', 'Roasted Makhana (₹275/100g)', 50, '=SUMIF(Orders!G:G, B15, Orders!I:I)', '=E15-F15', 10, '=IF(G15<=H15, "⚠️ REORDER NOW", "✅ HEALTHY")'],
    ['11', 'Savory Munchies (Murmura)', 'SAVORY', 'Millet Mudi Mix (₹200/200g)', 50, '=SUMIF(Orders!G:G, B16, Orders!I:I)', '=E16-F16', 10, '=IF(G16<=H16, "⚠️ REORDER NOW", "✅ HEALTHY")']
  ];

  inv.getRange(6, 1, items.length, 9).setValues(items);
  inv.getRange(6, 1, items.length, 9).setFontFamily('Segoe UI').setFontSize(10);

  // Row heights and Alternating colors
  for (let r = 6; r <= 16; r++) {
    inv.setRowHeight(r, 26);
    const range = inv.getRange(r, 1, 1, 9);
    if (r >= 15) {
      // Pistachio green for Munchies (rows 15 and 16)
      range.setBackground('#D6E5BA');
    } else if (r % 2 === 0) {
      range.setBackground('#F2F8FA'); // Subtle soft teal tint
    } else {
      range.setBackground('#FFFFFF');
    }
  }

  // Text formatting
  inv.getRange('A6:A16').setHorizontalAlignment('center').setFontWeight('bold');
  inv.getRange('B6:B16').setHorizontalAlignment('left').setFontWeight('bold');
  inv.getRange('C6:C16').setHorizontalAlignment('center');
  inv.getRange('D6:D16').setHorizontalAlignment('left').setFontWeight('bold');
  inv.getRange('E6:H16').setHorizontalAlignment('center');
  inv.getRange('G6:G16').setFontWeight('bold'); // Current Stock
  inv.getRange('I6:I16').setHorizontalAlignment('center').setFontWeight('bold');

  // Borders & Freeze
  inv.getRange('A5:I16').setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);
  inv.setFrozenRows(5);

  // Auto-resize columns
  for (let c = 1; c <= 9; c++) {
    inv.autoResizeColumn(c);
  }

  // -------------------------------------------------------------
  // 2. ORDERS TAB (Live Order Ledger with Teal Header)
  // -------------------------------------------------------------
  let orders = ss.getSheetByName('Orders');
  if (!orders) {
    orders = ss.insertSheet('Orders', 1);
  }
  orders.setTabColor('#187A90');

  const orderHeaders = [
    ['OrderID', 'Timestamp', 'Channel', 'CustomerName', 'CustomerPhone', 'SKU', 'ItemName', 'PackWeight', 'Quantity', 'UnitAmount', 'TotalAmount', 'PaymentMethod', 'PaymentStatus', 'OrderStatus', 'DeliveryAddress', 'Notes']
  ];

  orders.getRange('A1:P1').setValues(orderHeaders)
    .setFontFamily('Segoe UI')
    .setFontSize(10)
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#187A90')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
  orders.setRowHeight(1, 30);
  orders.setFrozenRows(1);
  orders.getRange('A1:P1').setBorder(true, true, true, true, true, true, '#CBD5E1', SpreadsheetApp.BorderStyle.SOLID);

  SpreadsheetApp.getUi().alert('✨ Success! The Pamphlet Flyer Look & Feel has been applied to your Google Sheet.');
}

/**
 * Re-calculate stock formulas safely
 */
function reverifyFormulas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const inv = ss.getSheetByName('Menu_&_Inventory');
  if (inv) {
    for (let r = 6; r <= 16; r++) {
      inv.getRange('F' + r).setFormula(`=SUMIF(Orders!G:G, B${r}, Orders!I:I)`);
      inv.getRange('G' + r).setFormula(`=E${r}-F${r}`);
      inv.getRange('I' + r).setFormula(`=IF(G${r}<=H${r}, "⚠️ REORDER NOW", "✅ HEALTHY")`);
    }
  }
}

/**
 * Handles incoming order submission from the Customer Order Form
 */
function submitCustomerOrder(orderData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ensure Orders Sheet exists
    let ordersSheet = ss.getSheetByName('Orders');
    if (!ordersSheet) {
      applyFlyerTheme();
      ordersSheet = ss.getSheetByName('Orders');
    }

    const orderId = 'TLS-' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyyMMdd') + '-' + Math.floor(1000 + Math.random() * 9000);
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');

    // Append each ordered item
    orderData.items.forEach(item => {
      ordersSheet.appendRow([
        orderId,
        timestamp,
        'ONLINE_WEB_APP',
        orderData.name,
        "'" + orderData.phone,
        item.sku,
        item.name,
        item.pack,
        item.qty,
        item.unitPrice,
        item.unitPrice * item.qty,
        orderData.paymentMethod || 'UPI',
        orderData.paymentMethod === 'CASH' ? 'UNPAID' : 'PENDING_UPI',
        'RECEIVED',
        orderData.address || '',
        orderData.notes || ''
      ]);
    });

    return { success: true, orderId: orderId, total: orderData.totalAmount };
  } catch (err) {
    return { success: false, error: err.toString() };
  }
}
