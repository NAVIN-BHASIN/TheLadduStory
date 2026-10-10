/**
 * Express Server Bootstrap
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const metaService = require('./services/metaWebhookService');
const upiService = require('./services/upiService');
const sheetsService = require('./services/googleSheetsService');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
 res.json({
 status: 'ONLINE',
 system: 'The Laddu Story - Omnichannel OMS Middleware',
 timestamp: new Date().toISOString()
 });
});

// Meta Webhook Verification Handshake
app.get('/webhook/meta', (req, res) => {
 const challenge = metaService.verifyWebhook(req);
 if (challenge) {
 res.status(200).send(challenge);
 } else {
 res.status(403).send('Verification Token Mismatch');
 }
});

// Inbound Meta Webhook Receiver
app.post('/webhook/meta', async (req, res) => {
 try {
 const result = await metaService.processInboundPayload(req.body);
 res.status(200).json({ status: 'PROCESSED', order: result });
 } catch (err) {
 console.error('Webhook error:', err);
 res.status(500).json({ error: err.message });
 }
});

// POS Order Creation Endpoint
app.post('/api/orders/pos', async (req, res) => {
 try {
 const { customerName, customerPhone, sku, quantity, unitAmount, paymentMethod, notes } = req.body;
 const orderId = TLS--;
 const totalAmount = (unitAmount || 420) * (quantity || 1);

 const order = {
 orderId,
 createdAt: new Date().toISOString(),
 channel: 'WALK_IN',
 customerName: customerName || 'Walk-in Guest',
 customerPhone: customerPhone || 'Counter',
 sku: sku || 'MOTI-500G',
 quantity: quantity || 1,
 unitAmount: unitAmount || 420,
 totalAmount,
 paymentMethod: paymentMethod || 'CASH',
 paymentStatus: paymentMethod === 'PENDING' ? 'UNPAID' : 'PAID',
 orderStatus: 'DELIVERED',
 notes: notes || 'Counter billing'
 };

 let qrCodeUrl = null;
 let upiString = null;

 if (paymentMethod === 'UPI') {
 upiString = upiService.generateUPIString({
 orderId,
 amount: totalAmount,
 note: The Laddu Story: 
 });
 qrCodeUrl = await upiService.generateQRCodeDataURL({
 orderId,
 amount: totalAmount
 });
 }

 await sheetsService.appendOrder(order);

 res.status(201).json({
 success: true,
 order,
 upiString,
 qrCodeUrl
 });
 } catch (err) {
 res.status(500).json({ success: false, error: err.message });
 }
});

// Inventory Listing Endpoint
app.get('/api/inventory', async (req, res) => {
 try {
 const inventory = await sheetsService.fetchInventory();
 res.json({ success: true, count: inventory.length, inventory });
 } catch (err) {
 res.status(500).json({ success: false, error: err.message });
 }
});

if (require.main === module) {
 app.listen(PORT, () => {
 console.log([SERVER] The Laddu Story OMS Middleware running on port );
 });
}

module.exports = app;
