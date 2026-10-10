/**
 * Meta Cloud Webhook Parser & Processor (WhatsApp & Instagram)
 */
const sheetsService = require('./googleSheetsService');
const upiService = require('./upiService');
const { CHANNELS, PAYMENT_METHODS, PAYMENT_STATUSES, ORDER_STATUSES } = require('../config/constants');

class MetaWebhookService {
  /**
   * Validates Meta Challenge Handshake
   */
  verifyWebhook(req) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    const verifyToken = process.env.META_VERIFY_TOKEN || 'the_laddu_story_secret_token_2026';

    if (mode && token === verifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Processes Inbound Messages from WhatsApp and Instagram
   */
  async processInboundPayload(payload) {
    if (!payload.entry || !payload.entry.length) return null;

    for (const entry of payload.entry) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const val = change.value;
        if (!val || !val.messages || !val.messages.length) continue;

        const channel = val.messaging_product === 'whatsapp' ? CHANNELS.WHATSAPP : CHANNELS.INSTAGRAM;
        const msg = val.messages[0];
        const contact = val.contacts ? val.contacts[0] : null;

        const customerPhone = msg.from;
        const customerName = contact ? contact.profile.name : 'Valued Customer';
        const bodyText = (msg.text ? msg.text.body : '').trim();

        // Simple token parser for demo / MVP:
        // format expected: ORDER <SKU> <QTY> or auto-detection
        const parsedOrder = this.parseMessageText(bodyText, customerName, customerPhone, channel);
        if (parsedOrder) {
          const upiString = upiService.generateUPIString({
            orderId: parsedOrder.orderId,
            amount: parsedOrder.totalAmount,
            note: Payment for 
          });
          const qrCodeUrl = await upiService.generateQRCodeDataURL({
            orderId: parsedOrder.orderId,
            amount: parsedOrder.totalAmount
          });

          parsedOrder.upiString = upiString;
          parsedOrder.qrCodeUrl = qrCodeUrl;

          // Commit to Google Sheets cloud ledger
          await sheetsService.appendOrder(parsedOrder);
          return parsedOrder;
        }
      }
    }
    return null;
  }

  parseMessageText(text, name, phone, channel) {
    const orderId = TLS--;
    const lower = text.toLowerCase();

    let sku = 'MOTI-500G';
    let unitAmount = 420;
    let qty = 1;

    if (lower.includes('besan')) {
      sku = 'BESAN-500G';
      unitAmount = 450;
    } else if (lower.includes('gond') || lower.includes('dry fruit')) {
      sku = 'GOND-500G';
      unitAmount = 650;
    } else if (lower.includes('kaju')) {
      sku = 'KAJU-500G';
      unitAmount = 600;
    } else if (lower.includes('hamper')) {
      sku = 'FESTIVE-HAMPER-16';
      unitAmount = 1250;
    }

    const qtyMatch = text.match(/\b([1-9]|10)\b/);
    if (qtyMatch) {
      qty = parseInt(qtyMatch[1], 10);
    }

    return {
      orderId,
      createdAt: new Date().toISOString(),
      channel,
      customerName: name,
      customerPhone: phone,
      sku,
      quantity: qty,
      unitAmount,
      totalAmount: unitAmount * qty,
      paymentMethod: PAYMENT_METHODS.UPI,
      paymentStatus: PAYMENT_STATUSES.UNPAID,
      orderStatus: ORDER_STATUSES.RECEIVED,
      notes: Inbound chat query: "
 };
 }
}

module.exports = new MetaWebhookService();
