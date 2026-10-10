import React, { useState } from 'react';
import QRCode from 'qrcode';

const PRODUCTS = [
  { sku: 'MOTI-500G', name: 'Motichoor Laddu (500g)', price: 420, tag: 'Best Seller' },
  { sku: 'MOTI-1KG', name: 'Motichoor Laddu (1kg)', price: 800, tag: 'Value Pack' },
  { sku: 'BESAN-500G', name: 'Shahi Besan Laddu (500g)', price: 450, tag: 'Pure Ghee' },
  { sku: 'BESAN-1KG', name: 'Shahi Besan Laddu (1kg)', price: 850, tag: 'Popular' },
  { sku: 'GOND-500G', name: 'Gond Immunity Laddu (500g)', price: 650, tag: 'Dry Fruit' },
  { sku: 'ATTA-500G', name: 'Traditional Atta Pinni (500g)', price: 480, tag: 'Heritage' },
  { sku: 'KAJU-500G', name: 'Royal Kaju Katli (500g)', price: 600, tag: 'Silver Vark' },
  { sku: 'FESTIVE-HAMPER-16', name: 'Celebration Hamper (16 Pcs)', price: 1250, tag: 'Gift Box' },
  { sku: 'BOX-SAMPLER-4PC', name: 'Signature Sampler (4 Pcs)', price: 220, tag: 'Taster' }
];

export default function POSView({ onOrderCreated }) {
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);

  const addToCart = (product) => {
    const existing = cart.find((i) => i.sku === product.sku);
    if (existing) {
      setCart(cart.map((i) => (i.sku === product.sku ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (sku, delta) => {
    setCart(
      cart
        .map((i) => {
          if (i.sku === sku) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const orderId = `TLS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      channel: 'WALK_IN',
      customerName: customerName || 'Walk-in Guest',
      customerPhone: customerPhone || 'Counter',
      items: cart,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'CASH' ? 'PAID' : 'PENDING',
      orderStatus: 'DELIVERED'
    };

    setActiveOrder(newOrder);

    if (paymentMethod === 'UPI') {
      const upiString = `upi://pay?pa=theladdu@bank&pn=TheLadduStory&am=${totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('The Laddu Story ' + orderId)}`;
      try {
        const url = await QRCode.toDataURL(upiString, { width: 220, margin: 1, color: { dark: '#4A121E', light: '#FFFFFF' } });
        setQrCodeDataUrl(url);
        setShowQR(true);
      } catch (err) {
        console.error(err);
      }
    } else {
      finalizeOrder(newOrder);
    }
  };

  const finalizeOrder = (order) => {
    onOrderCreated(order);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setShowQR(false);
    setActiveOrder(null);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '14px', color: '#4a121e' }}>
          Fresh Handcrafted Sweets Menu
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '14px' }}>
          {PRODUCTS.map((prod) => (
            <div
              key={prod.sku}
              onClick={() => addToCart(prod)}
              style={{
                background: '#fff',
                border: '1px solid #e7dfd8',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <span style={{ fontSize: '0.7rem', background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                  {prod.tag}
                </span>
                <div style={{ margin: '8px 0 4px', fontSize: '0.95rem', fontWeight: '700', color: '#37141b' }}>{prod.name}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#831843' }}>₹{prod.price}</span>
                <button style={{ background: '#831843', color: '#fff', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '700' }}>
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e7dfd8', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 12px', color: '#4a121e', borderBottom: '2px solid #faf7f4', paddingBottom: '10px' }}>
          Walk-in Cart ({cart.reduce((a, b) => a + b.qty, 0)} items)
        </h3>

        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '280px', margin: '12px 0' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '60px' }}>Select sweets on the left to add to bill</div>
          ) : (
            cart.map((item) => (
              <div key={item.sku} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #e7dfd8' }}>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1f2937' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>₹{item.price} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => updateQty(item.sku, -1)} style={{ width: '26px', height: '26px', border: '1px solid #e7dfd8', background: '#f9fafb', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>-</button>
                  <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.sku, 1)} style={{ width: '26px', height: '26px', border: '1px solid #e7dfd8', background: '#f9fafb', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>+</button>
                  <span style={{ fontWeight: '800', minWidth: '55px', textAlign: 'right', color: '#831843' }}>₹{item.price * item.qty}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ borderTop: '2px solid #faf7f4', paddingTop: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e7dfd8', fontSize: '0.85rem' }}
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e7dfd8', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
            {['UPI', 'CASH', 'CARD'].map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  border: paymentMethod === m ? '2px solid #831843' : '1px solid #e7dfd8',
                  background: paymentMethod === m ? '#fdf2f8' : '#fff',
                  color: paymentMethod === m ? '#831843' : '#1f2937'
                }}
              >
                {m === 'UPI' ? '📱 UPI QR' : m === 'CASH' ? '💵 Cash' : '💳 Card'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '600', color: '#6b7280' }}>Bill Total:</span>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#831843' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              background: cart.length === 0 ? '#9ca3af' : '#831843',
              color: '#fff',
              fontWeight: '800',
              fontSize: '1rem',
              border: 'none',
              cursor: cart.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {paymentMethod === 'UPI' ? 'Generate Dynamic UPI QR & Pay' : `Complete ${paymentMethod} Order`}
          </button>
        </div>
      </div>

      {showQR && activeOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '18px', textAlign: 'center', width: '380px' }}>
            <div style={{ background: '#fdf2f8', color: '#831843', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', marginBottom: '12px' }}>
              THE LADDU STORY - DYNAMIC UPI
            </div>
            <h3 style={{ margin: '0 0 4px', color: '#4a121e' }}>Scan & Pay ₹{activeOrder.totalAmount.toLocaleString('en-IN')}</h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#6b7280' }}>Accepts GPay, PhonePe, Paytm, BHIM</p>
            {qrCodeDataUrl && (
              <img src={qrCodeDataUrl} alt="UPI QR" style={{ width: '220px', height: '220px', margin: '0 auto 16px', display: 'block', borderRadius: '12px', border: '2px dashed #831843', padding: '8px' }} />
            )}
            <div style={{ fontSize: '0.85rem', background: '#fdf2f8', padding: '8px 12px', borderRadius: '8px', color: '#831843', marginBottom: '18px', fontWeight: '600' }}>
              Order ID: <b>{activeOrder.orderId}</b>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => finalizeOrder({ ...activeOrder, paymentStatus: 'PAID' })}
                style={{ flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                ✅ Payment Verified
              </button>
              <button
                onClick={() => setShowQR(false)}
                style={{ padding: '12px 18px', background: '#e5e7eb', color: '#1f2937', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}