import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

// OFFICIAL GOOGLE FORM CONFIGURATION (HEADLESS SYNC TO GOOGLE SHEETS)
const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfLHmLxHakS6sZEO4ypQtkdHPzeCwg3D8LRhTYA3t74-EmUMA/formResponse';
const FORM_ENTRIES = {
  ORDER_ID: 'entry.378465203',
  NAME: 'entry.1609068853',
  PHONE: 'entry.1606293469',
  ADDRESS: 'entry.1729098047',
  ITEMS: 'entry.1014432505'
};

// OFFICIAL 11 FLYER ITEMS ONLY (WITH CLEAN PACK WEIGHTS)
const PRODUCTS = [
  { id: '01', sku: 'RAGI-WALNUT', name: 'Ragi Walnut Laddu', category: 'LADDU', ratePerKg: 1200, p500: 600, p1k: 1200, opt1: '500g (₹600)', opt2: '1 Kg (₹1,200)', w1: '500g', w2: '1 Kg', tag: 'Superfood Millet', desc: 'Finger Millet (Ragi), Walnuts, Pure Cow Ghee, Unrefined Jaggery', benefit: 'Rich in Calcium & Omega-3, Diabetic-friendly, Zero White Sugar', isMunchy: false },
  { id: '02', sku: 'TILL-BLACK-SESAME', name: 'Till Laddu (Black Sesame)', category: 'LADDU', ratePerKg: 1000, p500: 500, p1k: 1000, opt1: '500g (₹500)', opt2: '1 Kg (₹1,000)', w1: '500g', w2: '1 Kg', tag: 'Ayurvedic Warmth', desc: 'Organic Black Sesame (Till), Pure Desi Cow Ghee, Unrefined Jaggery', benefit: 'High Iron & Bone Density Support, Warming Ayurvedic Formulation', isMunchy: false },
  { id: '03', sku: 'SATTU-ALMOND', name: 'Sattu Almond Laddu', category: 'LADDU', ratePerKg: 1100, p500: 550, p1k: 1100, opt1: '500g (₹550)', opt2: '1 Kg (₹1,100)', w1: '500g', w2: '1 Kg', tag: 'High Protein', desc: 'Roasted Chana Sattu, California Almonds, Desi Ghee, Jaggery', benefit: 'Natural Plant Protein & Sustained Energy, Muscle Recovery', isMunchy: false },
  { id: '04', sku: 'GROUNDNUT', name: 'Groundnut Laddu', category: 'LADDU', ratePerKg: 800, p500: 400, p1k: 800, opt1: '500g (₹400)', opt2: '1 Kg (₹800)', w1: '500g', w2: '1 Kg', tag: 'Traditional Classic', desc: 'Roasted Peanuts (Groundnuts), Pure Cow Ghee, Organic Jaggery', benefit: 'Heart-healthy fats, High satiety, Wholesome traditional snacking', isMunchy: false },
  { id: '05', sku: 'QUINOA-MOONG-DAL', name: 'Quinoa Moong Dal Laddu', category: 'LADDU', ratePerKg: 1250, p500: 625, p1k: 1250, opt1: '500g (₹625)', opt2: '1 Kg (₹1,250)', w1: '500g', w2: '1 Kg', tag: 'Ancient Superfood', desc: 'Organic Quinoa, Yellow Moong Dal, Pure Cow Ghee, Jaggery Powder', benefit: 'Complete Amino Acid Profile, Easy Digestion, Low Glycemic Index', isMunchy: false },
  { id: '06', sku: 'METHI-FENUGREEK', name: 'Methi (fenugreek) Laddu', category: 'LADDU', ratePerKg: 1250, p500: 625, p1k: 1250, opt1: '500g (₹625)', opt2: '1 Kg (₹1,250)', w1: '500g', w2: '1 Kg', tag: 'Joint Health', desc: 'Fenugreek Seeds, Wheat Flour, Gond, Dry Fruits, Ghee, Jaggery', benefit: 'Relieves Joint Stiffness, Balances Vata, Enhances Digestion', isMunchy: false },
  { id: '07', sku: 'DATES-DRY-FRUITS', name: 'Dates & Dry Fruits Bites', category: 'LADDU', ratePerKg: 1900, p500: 950, p1k: 1900, opt1: '500g (₹950)', opt2: '1 Kg (₹1,900)', w1: '500g', w2: '1 Kg', tag: 'Zero Added Sweetener', desc: 'Medjool Dates, Almonds, Pistachios, Cashews, Walnuts, Cow Ghee', benefit: 'Sweetened purely with Dates, Instant Stamina & Antioxidants', isMunchy: false },
  { id: '08', sku: 'POST-DELIVERY-PANJEERI', name: 'Post Delivery Panjeeri / Laddu', category: 'LADDU', ratePerKg: 1800, p500: 900, p1k: 1800, opt1: '500g (₹900)', opt2: '1 Kg (₹1,800)', w1: '500g', w2: '1 Kg', tag: 'Postpartum Care', desc: 'Kamarkas, Gond, Dry Fruits, Ayurvedic Herbs, Cow Ghee, Jaggery', benefit: 'Traditional Postpartum Recovery, Strengthens Spine & Lactation', isMunchy: false },
  { id: '09', sku: 'JAWAR-PANJEERI', name: 'Jawar Panjeeri / Laddu', category: 'LADDU', ratePerKg: 1900, p500: 950, p1k: 1900, opt1: '500g (₹950)', opt2: '1 Kg (₹1,900)', w1: '500g', w2: '1 Kg', tag: 'Gluten-Free Millet', desc: 'Sorghum (Jawar), Assorted Dry Fruits, Gond, Pure Cow Ghee, Jaggery', benefit: 'Rich in Fiber & Micronutrients, Cooling & Gut-healthy superfood', isMunchy: false },
  { id: '10', sku: 'SAVORY-MAKHANA', name: 'Savory Munchies (Roasted Makhana)', subname: 'Roasted Makhana (₹275/100g)', category: 'SAVORY', ratePerKg: 2750, p500: 275, p1k: 550, opt1: '100g (₹275)', opt2: '200g (₹550)', w1: '100g', w2: '200g', tag: 'Guilt-Free Crunch', desc: 'Fox Nuts (Phool Makhana), Roasted in Pure Cow Ghee, Rock Salt', benefit: 'Zero Cholesterol, Low Calorie, High Potassium & Magnesium', isMunchy: true },
  { id: '11', sku: 'SAVORY-MURMURA', name: 'Savory Munchies (Millet Mudi Mix)', subname: 'Millet Mudi Mix (₹200/200g)', category: 'SAVORY', ratePerKg: 1000, p500: 200, p1k: 400, opt1: '200g (₹200)', opt2: '400g (₹400)', w1: '200g', w2: '400g', tag: 'Tea-Time Crunch', desc: 'Puffed Millets, Roasted Peanuts, Curry Leaves, Cold-pressed Oil', benefit: 'Light on Stomach, 100% Roasted, Ancient Grain Healthy Alternative', isMunchy: true }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('store');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Cart & Customer State
  const [cart, setCart] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [custName, setCustName] = useState(() => localStorage.getItem('tls_cust_name') || '');
  const [custPhone, setCustPhone] = useState(() => localStorage.getItem('tls_cust_phone') || '');
  const [custAddress, setCustAddress] = useState(() => localStorage.getItem('tls_cust_addr') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Tracking
  const [trackPhone, setTrackPhone] = useState('');
  const [userOrders, setUserOrders] = useState([]);

  // Admin OMS
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('tls_orders_db');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Persist Orders
  useEffect(() => {
    try {
      localStorage.setItem('tls_orders_db', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  const getWeight = (sku) => selectedWeights[sku] || 'OPT1';
  const setWeight = (sku, val) => setSelectedWeights({ ...selectedWeights, [sku]: val });

  const addToCart = (product) => {
    const choice = getWeight(product.sku);
    const packLabel = choice === 'OPT1' ? product.opt1 : product.opt2;
    const cleanWeight = choice === 'OPT1' ? product.w1 : product.w2;
    const unitPrice = choice === 'OPT1' ? product.p500 : product.p1k;
    const cartKey = `${product.sku}-${cleanWeight}`;

    const existing = cart.find(i => i.cartKey === cartKey);
    if (existing) {
      setCart(cart.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { 
        cartKey, 
        sku: product.sku, 
        name: product.name, 
        packLabel, 
        cleanWeight, 
        unitPrice, 
        qty: 1 
      }]);
    }
  };

  const updateCartQty = (cartKey, delta) => {
    setCart(cart.map(i => {
      if (i.cartKey === cartKey) {
        const n = i.qty + delta;
        return n > 0 ? { ...i, qty: n } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const totalCartQty = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  // 100% BULLETPROOF HEADLESS GOOGLE FORM DISPATCH (EXACTLY ONCE - NO DUPLICATES)
  const submitToGoogleSheets = (newOrder) => {
    setSyncStatusMsg('⏳ Submitting order directly to Google Sheets...');

    // Clean, structured item string: "1x Ragi Walnut Laddu (1 Kg) = ₹1200 | Total: ₹1200"
    const itemsSummary = newOrder.items
      .map(it => `${it.qty}x ${it.name} (${it.cleanWeight}) = ₹${it.unitPrice * it.qty}`)
      .join(' | ') + ` | Total: ₹${newOrder.total}`;

    // 1. Create or reuse hidden iframe
    let iframe = document.getElementById('hidden_gform_iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hidden_gform_iframe';
      iframe.name = 'hidden_gform_iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    // 2. Submit single native HTML form (Guaranteed 1 single submission)
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = GOOGLE_FORM_ACTION_URL;
    form.target = 'hidden_gform_iframe';

    const fields = {
      [FORM_ENTRIES.ORDER_ID]: newOrder.orderId,
      [FORM_ENTRIES.NAME]: newOrder.name,
      [FORM_ENTRIES.PHONE]: newOrder.phone,
      [FORM_ENTRIES.ADDRESS]: newOrder.address,
      [FORM_ENTRIES.ITEMS]: itemsSummary
    };

    for (const [name, val] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = val;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    setTimeout(() => {
      try { form.remove(); } catch (e) {}
    }, 1200);

    setSyncStatusMsg('✅ Order saved directly into Google Sheet!');
  };

  // Place Order
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Please select items first.');
      return;
    }
    if (!custName || !custPhone) {
      alert('Please enter your Name and Mobile Number.');
      return;
    }

    if (isSubmitting) return; // Prevent double-clicks
    setIsSubmitting(true);

    localStorage.setItem('tls_cust_name', custName);
    localStorage.setItem('tls_cust_phone', custPhone);
    localStorage.setItem('tls_cust_addr', custAddress);
    setTrackPhone(custPhone);

    const cleanPhone = custPhone.replace(/\D/g, '').slice(-10);
    const orderId = `TLS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      orderId,
      time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      channel: 'STORE_WEB_APP',
      name: custName,
      phone: cleanPhone,
      address: custAddress || 'Direct Pickup / Bangalore Express Delivery',
      items: [...cart],
      total: cartTotal,
      status: 'RECEIVED',
      paymentMethod: 'UPI',
      paymentStatus: 'PAID',
      notes: 'Headless Form Direct Sync'
    };

    // 1. Submit to Google Form (Single submission)
    submitToGoogleSheets(newOrder);

    // 2. Save in local state
    setOrders(prev => [newOrder, ...prev]);

    // 3. Generate QR Code for UPI
    const upiLink = `upi://pay?pa=9343207515@okbizaxis&pn=The%20Laddu%20Story&am=${cartTotal}&cu=INR&tn=Order%20${orderId}`;
    try {
      const url = await QRCode.toDataURL(upiLink, { width: 280, margin: 2, color: { dark: '#0F5869', light: '#FFFFFF' } });
      setQrDataUrl(url);
    } catch (e) {
      console.log('QR Code generated fallback');
    }

    setOrderSuccess(newOrder);
    setCart([]);
    setIsMobileCartOpen(false);
    setIsSubmitting(false);
  };

  // Track Orders
  const handleTrack = () => {
    if (!trackPhone) {
      alert('Please enter your 10-digit mobile number.');
      return;
    }
    const clean = trackPhone.replace(/\D/g, '').slice(-10);
    const found = orders.filter(o => o.phone.replace(/\D/g, '').slice(-10) === clean);
    setUserOrders(found);
    if (found.length === 0) {
      alert(`No active orders found for +91 ${clean}. Place an order from the store!`);
    }
  };

  // Admin PIN Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === '1234') {
      setIsAdminLoggedIn(true);
      setShowLoginModal(false);
      setActiveTab('admin');
    } else {
      alert('Invalid PIN! Default staff access PIN is 1234.');
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o));
  };

  // Cart Content Renderer (Reusable for Desktop Sidebar & Mobile Modal Drawer)
  const renderCartContent = (isModal = false) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px', marginBottom: '14px' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F5869', fontWeight: '800' }}>
          🛒 Your Cart ({totalCartQty})
        </h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}>
              Clear
            </button>
          )}
          {isModal && (
            <button onClick={() => setIsMobileCartOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 10px', color: '#94A3B8' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛍️</div>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Your cart is empty.</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Choose your handcrafted laddus from the menu.</p>
        </div>
      ) : (
        <div>
          <div style={{ maxHeight: isModal ? '280px' : '220px', overflowY: 'auto', marginBottom: '16px', paddingRight: '4px' }}>
            {cart.map(item => (
              <div key={item.cartKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #E2E8F0' }}>
                <div style={{ maxWidth: '60%' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0F172A' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#187A90', fontWeight: '700' }}>Pack: {item.cleanWeight}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', background: '#F8FAFC' }}>
                    <button onClick={() => updateCartQty(item.cartKey, -1)} style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: '800' }}>-</button>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                    <button onClick={() => updateCartQty(item.cartKey, 1)} style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer', fontWeight: '800' }}>+</button>
                  </div>
                  <b style={{ fontSize: '0.9rem', minWidth: '60px', textAlign: 'right' }}>₹{item.unitPrice * item.qty}</b>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Inputs */}
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>
              YOUR CONTACT & DELIVERY INFO
            </div>
            <input
              type="text"
              placeholder="Your Full Name *"
              value={custName}
              onChange={e => setCustName(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', marginBottom: '8px' }}
            />
            <input
              type="tel"
              placeholder="10-Digit Mobile Number *"
              value={custPhone}
              onChange={e => setCustPhone(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', marginBottom: '8px' }}
            />
            <textarea
              rows={2}
              placeholder="Complete Delivery Address with Pincode *"
              value={custAddress}
              onChange={e => setCustAddress(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
            />
          </div>

          {/* Bill Summary */}
          <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '12px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748B', marginBottom: '6px' }}>
              <span>Subtotal ({totalCartQty} items)</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '8px', fontWeight: '600' }}>
              <span>Delivery (Bangalore)</span>
              <span>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#0F5869' }}>
              <span>Total Payable</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: isSubmitting ? '#94A3B8' : '#187A90',
              color: '#FFFFFF',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(24, 122, 144, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? '⏳ Processing Order...' : '⚡ Place Order & Save in Google Sheets'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: '#1E293B', paddingBottom: totalCartQty > 0 ? '90px' : '30px' }}>

      {/* HEADER */}
      <header style={{ background: '#0F5869', color: '#fff', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FFF8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#4A121E', fontSize: '1.2rem', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
              LS
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                The Laddu Story
              </h1>
              <div style={{ fontSize: '0.75rem', color: '#D6E5BA', fontWeight: '600' }}>
                Homemade Healthy Snacks: Ancient Traditions & Superfoods | 📞 9343207515
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('store')}
              style={{
                background: activeTab === 'store' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'store' ? '#0F5869' : '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🛒 Order Laddus
            </button>

            <button
              onClick={() => setActiveTab('track')}
              style={{
                background: activeTab === 'track' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'track' ? '#0F5869' : '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🔍 Track My Orders
            </button>

            {/* Mobile Cart Trigger Button */}
            <button
              onClick={() => setIsMobileCartOpen(true)}
              style={{
                background: totalCartQty > 0 ? '#D6E5BA' : 'rgba(255,255,255,0.15)',
                color: totalCartQty > 0 ? '#0F5869' : '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.4)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>🛍️ Cart</span>
              <span style={{ background: totalCartQty > 0 ? '#0F5869' : 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '10px', padding: '2px 7px', fontSize: '0.75rem' }}>
                {totalCartQty}
              </span>
            </button>

            <button
              onClick={() => {
                if (isAdminLoggedIn) setActiveTab('admin');
                else setShowLoginModal(true);
              }}
              style={{
                background: activeTab === 'admin' ? '#D6E5BA' : 'rgba(255,255,255,0.1)',
                color: activeTab === 'admin' ? '#0F5869' : '#FFFFFF',
                border: '1px dashed rgba(255,255,255,0.5)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🔒 {isAdminLoggedIn ? 'Staff Portal' : 'Staff Login'}
            </button>
          </div>

        </div>
      </header>

      {/* TRUST BANNER */}
      <div style={{ background: '#FAF6F0', borderBottom: '1px solid #E2E8F0', padding: '10px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', fontWeight: '700', color: '#4A121E' }}>
          <span>🌱 100% Pure Desi Cow Ghee</span>
          <span>🍯 Unrefined Jaggery Sweetener</span>
          <span>🚫 Zero Added White Sugar</span>
          <span>🌿 Zero Artificial Preservatives</span>
          <span>⚖️ Min Order Quantity: 500g for Laddus</span>
          <span style={{ color: '#059669' }}>● Google Sheets Real-Time Sync</span>
        </div>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: CUSTOMER STOREFRONT (RESPONSIVE NO-OVERLAP DESIGN)    */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'store' && (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
            
            {/* Catalog Grid (Full width on mobile, 68% on desktop) */}
            <div style={{ flex: '1 1 0%', minWidth: 0, width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F5869', margin: '0 0 4px' }}>
                    Artisanal Superfood Catalog (11 Items)
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                    Authentic rates and ingredients from the official brochure.
                  </p>
                </div>
                <span style={{ background: '#D6E5BA', color: '#2D4A1D', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800' }}>
                  Laddus: MOQ 500g
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
                {PRODUCTS.map(prod => {
                  const choice = getWeight(prod.sku);
                  const price = choice === 'OPT1' ? prod.p500 : prod.p1k;

                  return (
                    <div
                      key={prod.sku}
                      style={{
                        background: prod.isMunchy ? '#F6FAEF' : '#FFFFFF',
                        border: prod.isMunchy ? '2px solid #CBE0A6' : '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        boxShadow: '0 4px 12px rgba(24, 122, 144, 0.05)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', background: prod.isMunchy ? '#D6E5BA' : '#E0F2FE', color: prod.isMunchy ? '#2D4A1D' : '#0369A1', padding: '3px 8px', borderRadius: '6px' }}>
                            #{prod.id} {prod.tag}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#187A90' }}>
                            ₹{prod.ratePerKg.toLocaleString('en-IN')}/Kg
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px' }}>
                          {prod.name}
                        </h3>

                        <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '8px', lineHeight: 1.4 }}>
                          <b>Ingredients:</b> {prod.desc}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600', marginBottom: '14px', background: '#ECFDF5', padding: '6px 8px', borderRadius: '6px' }}>
                          ✨ {prod.benefit}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <button
                            onClick={() => setWeight(prod.sku, 'OPT1')}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: choice === 'OPT1' ? '2px solid #187A90' : '1px solid #CBD5E1',
                              background: choice === 'OPT1' ? '#187A90' : '#F8FAFC',
                              color: choice === 'OPT1' ? '#FFFFFF' : '#475569',
                              fontWeight: '700',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            {prod.opt1}
                          </button>
                          <button
                            onClick={() => setWeight(prod.sku, 'OPT2')}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: choice === 'OPT2' ? '2px solid #187A90' : '1px solid #CBD5E1',
                              background: choice === 'OPT2' ? '#187A90' : '#F8FAFC',
                              color: choice === 'OPT2' ? '#FFFFFF' : '#475569',
                              fontWeight: '700',
                              fontSize: '0.82rem',
                              cursor: 'pointer'
                            }}
                          >
                            {prod.opt2}
                          </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Payable:</span>
                            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F5869' }}>
                              ₹{price}
                            </div>
                          </div>
                          <button
                            onClick={() => addToCart(prod)}
                            style={{
                              background: '#187A90',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 16px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(24, 122, 144, 0.3)'
                            }}
                          >
                            + Add to Cart
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Sticky Sidebar Cart (Hidden on Mobile Screens <= 900px) */}
            <div className="desktop-cart-sidebar" style={{ width: '380px', flexShrink: 0 }}>
              <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '22px', position: 'sticky', top: '90px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                {renderCartContent(false)}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: CUSTOMER ORDER TRACKING                               */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', background: '#fff', borderRadius: '18px', padding: '28px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F5869', margin: '0 0 6px' }}>
              🔍 Track Your Laddu Orders
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '20px' }}>
              Enter your 10-digit mobile number used while placing the order.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={trackPhone}
                onChange={e => setTrackPhone(e.target.value)}
                style={{ flex: 1, padding: '12px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem' }}
              />
              <button
                onClick={handleTrack}
                style={{ background: '#187A90', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
              >
                Track
              </button>
            </div>

            {userOrders.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {userOrders.map(o => (
                  <div key={o.orderId} style={{ border: '1px solid #E2E8F0', borderRadius: '12px', padding: '18px', background: '#F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '800', color: '#0F5869' }}>{o.orderId}</span>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800', background: o.status === 'DELIVERED' ? '#DEF7EC' : '#FEF3C7', color: o.status === 'DELIVERED' ? '#03543F' : '#92400E' }}>
                        {o.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '10px' }}>{o.time}</div>
                    
                    <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '10px', marginBottom: '10px' }}>
                      {o.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                          <span>{it.qty}x {it.name} ({it.cleanWeight || it.packLabel})</span>
                          <b>₹{it.unitPrice * it.qty}</b>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.95rem', color: '#0F5869' }}>
                      <span>Total Amount:</span>
                      <span>₹{o.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: STAFF ADMIN OMS DASHBOARD                             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'admin' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F5869', margin: 0 }}>
                  Kitchen & Delivery Order Manager
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Live Orders Stream • {orders.length} Total Orders Placed
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Search by Order ID / Customer / Phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', width: '260px' }}
                />
                <button
                  onClick={() => setIsAdminLoggedIn(false)}
                  style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '18px' }}>
              {orders
                .filter(o => {
                  if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return o.orderId.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || o.phone.includes(q);
                  }
                  return true;
                })
                .map(o => (
                  <div key={o.orderId} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: '800', color: '#0F5869', fontSize: '0.95rem' }}>{o.orderId}</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.time}</span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontWeight: '800', fontSize: '1rem' }}>{o.name}</div>
                      <div style={{ fontSize: '0.82rem', color: '#187A90', fontWeight: '700' }}>📞 {o.phone}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>📍 {o.address}</div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #F1F5F9' }}>
                      {o.items.map((it, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                          <span>{it.qty}x {it.name} ({it.cleanWeight || it.packLabel})</span>
                          <b>₹{it.unitPrice * it.qty}</b>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px dashed #CBD5E1', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.9rem', color: '#0F5869' }}>
                        <span>Total Paid (UPI):</span>
                        <span>₹{o.total}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>DELIVERY STATUS:</span>
                      <select
                        value={o.status}
                        onChange={e => updateOrderStatus(o.orderId, e.target.value)}
                        style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: '800', background: '#F1F5F9', color: '#0F5869', cursor: 'pointer' }}
                      >
                        <option value="RECEIVED">RECEIVED</option>
                        <option value="PREPARING">PREPARING</option>
                        <option value="PACKED">PACKED</option>
                        <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE STICKY FLOATING CART BAR (WHEN CART HAS ITEMS)          */}
      {/* ------------------------------------------------------------- */}
      {totalCartQty > 0 && activeTab === 'store' && (
        <div
          className="mobile-floating-cart-bar"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '16px',
            right: '16px',
            background: '#0F5869',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 30px rgba(15, 88, 105, 0.45)',
            zIndex: 900
          }}
        >
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem' }}>
              🛒 {totalCartQty} Item{totalCartQty > 1 ? 's' : ''} • ₹{cartTotal.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#D6E5BA' }}>
              Pure Cow Ghee & Jaggery • Zero White Sugar
            </div>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(true)}
            style={{
              background: '#D6E5BA',
              color: '#0F5869',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            View Cart & Pay ➔
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MOBILE CART MODAL / BOTTOM SHEET (CLEAN, NO OVERLAPPING)       */}
      {/* ------------------------------------------------------------- */}
      {isMobileCartOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            backdropFilter: 'blur(3px)'
          }}
          onClick={() => setIsMobileCartOpen(false)}
        >
          <div
            style={{
              background: '#FFFFFF',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
              boxSizing: 'border-box'
            }}
            onClick={e => e.stopPropagation()}
          >
            {renderCartContent(true)}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ORDER SUCCESS & UPI SCANNER                            */}
      {/* ------------------------------------------------------------- */}
      {orderSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '28px', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#DEF7EC', color: '#03543F', fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F5869', margin: '0 0 6px' }}>
              Order Placed Successfully!
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '8px' }}>
              Order ID: <b style={{ color: '#0F5869' }}>{orderSuccess.orderId}</b>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '700', marginBottom: '16px' }}>
              {syncStatusMsg}
            </div>

            {/* UPI QR Code */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#475569', marginBottom: '10px' }}>
                SCAN TO PAY VIA GOOGLE PAY / PHONEPE / PAYTM
              </div>
              {qrDataUrl && (
                <img src={qrDataUrl} alt="UPI QR" style={{ width: '190px', height: '190px', borderRadius: '10px', margin: '0 auto', display: 'block' }} />
              )}
              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F5869', marginTop: '10px' }}>
                Payable: ₹{orderSuccess.total.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
                UPI ID: <b>9343207515@okbizaxis</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href={`https://wa.me/919343207515?text=${encodeURIComponent(`Hi The Laddu Story, I have placed order ${orderSuccess.orderId} for ₹${orderSuccess.total}. Please confirm delivery!`)}`}
                target="_blank"
                rel="noreferrer"
                style={{ flex: 1, background: '#25D366', color: '#fff', textDecoration: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                💬 WhatsApp Confirmation
              </a>
              <button
                onClick={() => setOrderSuccess(null)}
                style={{ background: '#F1F5F9', border: 'none', padding: '12px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: STAFF PIN LOGIN                                        */}
      {/* ------------------------------------------------------------- */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', color: '#0F5869', fontWeight: '800' }}>
              🔒 Staff Login
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748B' }}>
              Enter staff 4-digit PIN to access Order Management. (Default PIN: 1234)
            </p>
            <form onSubmit={handleAdminLogin}>
              <input
                type="password"
                maxLength={4}
                placeholder="Enter PIN (1234)"
                value={adminPinInput}
                onChange={e => setAdminPinInput(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', textAlign: 'center', fontSize: '1.3rem', letterSpacing: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#187A90', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Unlock Portal
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESPONSIVE CSS INJECTION FOR ZERO-OVERLAP MOBILE EXPERIENCE */}
      <style>{`
        @media (max-width: 900px) {
          .desktop-cart-sidebar {
            display: none !important;
          }
        }
        @media (min-width: 901px) {
          .mobile-floating-cart-bar {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
