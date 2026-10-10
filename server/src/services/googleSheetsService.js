/**
 * Google Sheets API v4 Integration Service
 */
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { SHEETS } = require('../config/constants');

class GoogleSheetsService {
  constructor() {
    this.sheets = null;
    this.spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    this.initClient();
  }

  initClient() {
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../config/google-service-account.json');
    if (fs.existsSync(credentialsPath)) {
      const auth = new google.auth.GoogleAuth({
        keyFile: credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
      this.sheets = google.sheets({ version: 'v4', auth });
    }
  }

  async appendOrder(order) {
    if (!this.sheets || !this.spreadsheetId) {
      console.warn('[GoogleSheetsService] Running in offline/stub mode (no cloud credentials).');
      return { success: true, stub: true };
    }

    const row = [
      order.orderId,
      order.createdAt || new Date().toISOString(),
      order.channel,
      order.customerName,
      order.customerPhone,
      order.sku,
      order.quantity,
      order.unitAmount,
      order.totalAmount,
      order.paymentMethod,
      order.paymentStatus,
      order.orderStatus,
      order.notes || ''
    ];

    const res = await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: ${SHEETS.ORDERS}!A:M,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });

    return res.data;
  }

  async fetchInventory() {
    if (!this.sheets || !this.spreadsheetId) {
      return [];
    }

    const res = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: ${SHEETS.INVENTORY}!A2:I
    });

    const rows = res.data.values || [];
    return rows.map(r => ({
      sku: r[0],
      productName: r[1],
      category: r[2],
      unitPrice: Number(r[3]),
      initialStock: Number(r[4]),
      unitsSold: Number(r[5] || 0),
      currentStock: Number(r[6] || 0),
      minThreshold: Number(r[7] || 0),
      reorderStatus: r[8] || 'HEALTHY'
    }));
  }

  async logSyncEvent(log) {
    if (!this.sheets || !this.spreadsheetId) return;
    const row = [
      log.logId || LOG-,
      new Date().toISOString(),
      log.source,
      log.action,
      log.status,
      log.payloadSummary || ''
    ];
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: ${SHEETS.SYNC_LOGS}!A:F,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    });
  }
}

module.exports = new GoogleSheetsService();
