/**
 * Dynamic UPI QR Code & Deep Link Service
 */
const QRCode = require('qrcode');

class UPIService {
  constructor() {
    this.merchantVPA = process.env.UPI_MERCHANT_VPA || 'theladdu@bank';
    this.merchantName = process.env.UPI_MERCHANT_NAME || 'TheLadduStory';
    this.currency = process.env.UPI_CURRENCY || 'INR';
  }

  /**
   * Generates a standard NPCI UPI payment deep link string
   * Example: upi://pay?pa=theladdu@bank&pn=TheLadduStory&am=450&cu=INR&tn=TLS-20261009-1001
   */
  generateUPIString({ orderId, amount, note }) {
    const safeNote = encodeURIComponent(note || Order );
    const safeName = encodeURIComponent(this.merchantName);
    return upi://pay?pa=&pn=&am=&cu=&tn=;
  }

  /**
   * Generates a base64 Data URL for an instant QR Code display
   */
  async generateQRCodeDataURL({ orderId, amount, note }) {
    const upiString = this.generateUPIString({ orderId, amount, note });
    return await QRCode.toDataURL(upiString, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 320,
      color: {
        dark: '#4A1521', // Royal maroon
        light: '#FFFFFF'
      }
    });
  }
}

module.exports = new UPIService();
