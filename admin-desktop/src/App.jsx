import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

// OFFICIAL 11 FLYER ITEMS ONLY
const PRODUCTS = [
  { id: '01', sku: 'RAGI-WALNUT', name: 'Ragi Walnut Laddu', category: 'LADDU', ratePerKg: 1200, p500: 600, p1k: 1200, opt1: '500g (₹600)', opt2: '1 Kg (₹1,200)', tag: 'Superfood Millet', desc: 'Finger Millet (Ragi), Walnuts, Pure Cow Ghee, Unrefined Jaggery', benefit: 'Rich in Calcium & Omega-3, Diabetic-friendly, Zero White Sugar', isMunchy: false },
  { id: '02', sku: 'TILL-BLACK-SESAME', name: 'Till Laddu (Black Sesame)', category: 'LADDU', ratePerKg: 1000, p500: 500, p1k: 1000, opt1: '500g (₹500)', opt2: '1 Kg (₹1,000)', tag: 'Ayurvedic Warmth', desc: 'Organic Black Sesame (Till), Pure Desi Cow Ghee, Unrefined Jaggery', benefit: 'High Iron & Bone Density Support, Warming Ayurvedic Formulation', isMunchy: false },
  { id: '03', sku: 'SATTU-ALMOND', name: 'Sattu Almond Laddu', category: 'LADDU', ratePerKg: 1100, p500: 550, p1k: 1100, opt1: '500g (₹550)', opt2: '1 Kg (₹1,100)', tag: 'High Protein', desc: 'Roasted Chana Sattu, California Almonds, Desi Ghee, Jaggery', benefit: 'Natural Plant Protein & Sustained Energy, Muscle Recovery', isMunchy: false },
  { id: '04', sku: 'GROUNDNUT', name: 'Groundnut Laddu', category: 'LADDU', ratePerKg: 800, p500: 400, p1k: 800, opt1: '500g (₹400)', opt2: '1 Kg (₹800)', tag: 'Traditional Classic', desc: 'Roasted Peanuts (Groundnuts), Pure Cow Ghee, Organic Jaggery', benefit: 'Heart-healthy fats, High satiety, Wholesome traditional snacking', isMunchy: false },
  { id: '05', sku: 'QUINOA-MOONG-DAL', name: 'Quinoa Moong Dal Laddu', category: 'LADDU', ratePerKg: 1250, p500: 625, p1k: 1250, opt1: '500g (₹625)', opt2: '1 Kg (₹1,250)', tag: 'Ancient Superfood', desc: 'Organic Quinoa, Yellow Moong Dal, Pure Cow Ghee, Jaggery Powder', benefit: 'Complete Amino Acid Profile, Easy Digestion, Low Glycemic Index', isMunchy: false },
  { id: '06', sku: 'METHI-FENUGREEK', name: 'Methi (fenugreek) Laddu', category: 'LADDU', ratePerKg: 1250, p500: 625, p1k: 1250, opt1: '500g (₹625)', opt2: '1 Kg (₹1,250)', tag: 'Joint Health', desc: 'Fenugreek Seeds, Wheat Flour, Gond, Dry Fruits, Ghee, Jaggery', benefit: 'Relieves Joint Stiffness, Balances Vata, Enhances Digestion', isMunchy: false },
  { id: '07', sku: 'DATES-DRY-FRUITS', name: 'Dates & Dry Fruits Bites', category: 'LADDU', ratePerKg: 1900, p500: 950, p1k: 1900, opt1: '500g (₹950)', opt2: '1 Kg (₹1,900)', tag: 'Zero Added Sweetener', desc: 'Medjool Dates, Almonds, Pistachios, Cashews, Walnuts, Cow Ghee', benefit: 'Sweetened purely with Dates, Instant Stamina & Antioxidants', isMunchy: false },
  { id: '08', sku: 'POST-DELIVERY-PANJEERI', name: 'Post Delivery Panjeeri / Laddu', category: 'LADDU', ratePerKg: 1800, p500: 900, p1k: 1800, opt1: '500g (₹900)', opt2: '1 Kg (₹1,800)', tag: 'Postpartum Care', desc: 'Kamarkas, Gond, Dry Fruits, Ayurvedic Herbs, Cow Ghee, Jaggery', benefit: 'Traditional Postpartum Recovery, Strengthens Spine & Lactation', isMunchy: false },
  { id: '09', sku: 'JAWAR-PANJEERI', name: 'Jawar Panjeeri / Laddu', category: 'LADDU', ratePerKg: 1900, p500: 950, p1k: 1900, opt1: '500g (₹950)', opt2: '1 Kg (₹1,900)', tag: 'Gluten-Free Millet', desc: 'Sorghum (Jawar), Assorted Dry Fruits, Gond, Pure Cow Ghee, Jaggery', benefit: 'Rich in Fiber & Micronutrients, Cooling & Gut-healthy superfood', isMunchy: false },
  { id: '10', sku: 'SAVORY-MAKHANA', name: 'Savory Munchies (Roasted Makhana)', subname: 'Roasted Makhana (₹275/100g)', category: 'SAVORY', ratePerKg: 2750, p500: 275, p1k: 550, opt1: '100g (₹275)', opt2: '200g (₹550)', tag: 'Guilt-Free Crunch', desc: 'Fox Nuts (Phool Makhana), Roasted in Pure Cow Ghee, Rock Salt', benefit: 'Zero Cholesterol, Low Calorie, High Potassium & Magnesium', isMunchy: true },
  { id: '11', sku: 'SAVORY-MURMURA', name: 'Savory Munchies (Millet Mudi Mix)', subname: 'Millet Mudi Mix (₹200/200g)', category: 'SAVORY', ratePerKg: 1000, p500: 200, p1k: 400, opt1: '200g (₹200)', opt2: '400g (₹400)', tag: 'Tea-Time Crunch', desc: 'Puffed Millets, Roasted Peanuts, Curry Leaves, Cold-pressed Oil', benefit: 'Light on Stomach, 100% Roasted, Ancient Grain Healthy Alternative', isMunchy: true }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('store'); // 'store', 'admin', 'pos', 'sheets'
  const [cart, setCart] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState(localStorage.getItem('tls_webhook_url') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Orders State (Master OMS synced)
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('tls_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        orderId: 'TLS-20261010-1001',
        time: '2026-10-10 10:15 AM',
        channel: 'ONLINE_APP',
        name: 'Priya Sharma',
        phone: '+91 98450 12345',
        address: 'Villa 12, Palm Meadows, Whitefield, Bangalore - 560066',
        items: [{ sku: 'RAGI-WALNUT', name: 'Ragi Walnut Laddu', packLabel: '1 Kg (₹1,200)', unitPrice: 1200, qty: 1 }],
        total: 1200,
        status: 'DELIVERED',
        paymentMethod: 'UPI'
      },
      {
        orderId: 'TLS-20261010-1002',
        time: '2026-10-10 11:30 AM',
        channel: 'WHATSAPP',
        name: 'Arun Kumar',
        phone: '+91 99001 88776',
        address: '4th Cross, 12th Main, Indiranagar, Bangalore - 560038',
        items: [{ sku: 'POST-DELIVERY-PANJEERI', name: 'Post Delivery Panjeeri / Laddu', packLabel: '500g (₹900)', unitPrice: 900, qty: 2 }],
        total: 1800,
        status: 'PACKED',
        paymentMethod: 'UPI'
      },
      {
        orderId: 'TLS-20261010-1003',
        time: '2026-10-10 12:05 PM',
        channel: 'WALK_IN',
        name: 'Meera Nambiar',
        phone: '+91 93432 07515',
        address: 'Store Counter Pickup',
        items: [{ sku: 'SAVORY-MAKHANA', name: 'Savory Munchies (Roasted Makhana)', packLabel: '100g (₹275)', unitPrice: 275, qty: 2 }],
        total: 550,
        status: 'RECEIVED',
        paymentMethod: 'CASH'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('tls_orders', JSON.stringify(orders));
  }, [orders]);

  const saveWebhook = (val) => {
    setWebhookUrl(val);
    localStorage.setItem('tls_webhook_url', val);
  };

  const getWeight = (sku) => selectedWeights[sku] || 'OPT1';
  const setWeight = (sku, val) => setSelectedWeights({ ...selectedWeights, [sku]: val });

  const addToCart = (product) => {
    const choice = getWeight(product.sku);
    const packLabel = choice === 'OPT1' ? product.opt1 : product.opt2;
    const unitPrice = choice === 'OPT1' ? product.p500 : product.p1k;
    const cartKey = `${product.sku}-${packLabel}`;

    const existing = cart.find(i => i.cartKey === cartKey);
    if (existing) {
      setCart(cart.map(i => i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { cartKey, sku: product.sku, name: product.name, packLabel, unitPrice, qty: 1 }]);
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

  const cartTotal = cart.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);

  // Sync order to Google Sheets
  const syncToGoogleSheets = async (orderPayload) => {
    if (!webhookUrl) return;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      console.log('Order successfully sent to Google Sheets webhook!');
    } catch (e) {
      console.warn('Google Sheets sync warning:', e);
    }
  };

  // Place Order
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty! Please select items first.');
      return;
    }
    if (!custName || !custPhone) {
      alert('Please enter Customer Name and Mobile Number.');
      return;
    }

    setIsSubmitting(true);
    const orderId = `TLS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      orderId,
      time: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      channel: activeTab === 'pos' ? 'WALK_IN' : 'ONLINE_APP',
      name: custName,
      phone: custPhone,
      address: custAddress || 'Direct Pickup / Express Delivery',
      items: [...cart],
      total: cartTotal,
      status: 'RECEIVED',
      paymentMethod: 'UPI'
    };

    setActiveOrder(newOrder);
    setOrders([newOrder, ...orders]);

    // Send to Google Sheets backend
    const sheetData = {
      orderId: newOrder.orderId,
      name: newOrder.name,
      phone: newOrder.phone,
      address: newOrder.address,
      paymentMethod: 'UPI',
      totalAmount: newOrder.total,
      items: newOrder.items.map(it => ({
        sku: it.sku,
        name: it.name,
        pack: it.packLabel,
        qty: it.qty,
        unitPrice: it.unitPrice
      }))
    };
    syncToGoogleSheets(sheetData);

    const upiString = `upi://pay?pa=theladdu@bank&pn=TheLadduStory&am=${cartTotal.toFixed(2)}&cu=INR&tn=${encodeURIComponent(orderId)}`;
    try {
      const url = await QRCode.toDataURL(upiString, { width: 220, margin: 1, color: { dark: '#187A90', light: '#FFFFFF' } });
      setQrCodeDataUrl(url);
      setShowQR(true);
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const confirmPaymentDone = () => {
    setCart([]);
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setShowQR(false);
    alert(`🎉 Order ${activeOrder?.orderId} confirmed & logged into Google Sheets!`);
  };

  // Status Updater (Admin Screen)
  const updateOrderStatus = (orderId, newStatus) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
  };

  const sendWhatsApp = () => {
    if (cart.length === 0) { alert('Please select items first!'); return; }
    const itemsText = cart.map((i) => `• ${i.name} (${i.packLabel}) x ${i.qty} = ₹${i.unitPrice * i.qty}`).join('%0A');
    const name = encodeURIComponent(custName || 'Customer');
    const addr = encodeURIComponent(custAddress || 'Bangalore Delivery');
    const msg = `*Namaste The Laddu Story!* 🙏%0A%0AI would like to order:%0A${itemsText}%0A%0A*Total: ₹${cartTotal}*%0A*Customer:* ${name}%0A*Phone:* ${custPhone}%0A*Address:* ${addr}%0A%0APlease confirm my fresh batch dispatch!`;
    window.open(`https://wa.me/919343207515?text=${msg}`, '_blank');
  };

  // Filtered orders for Admin
  const filteredOrders = orders.filter(o => {
    const matchStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchQuery = !searchQuery || 
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone.includes(searchQuery);
    return matchStatus && matchQuery;
  });

  const statusColor = (s) => {
    switch (s) {
      case 'RECEIVED': return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'PREPARING': return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
      case 'PACKED': return { bg: '#EDE9FE', text: '#6D28D9', border: '#DDD6FE' };
      case 'OUT_FOR_DELIVERY': return { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' };
      case 'DELIVERED': return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
      default: return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  return (
    <div style={{ fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif', background: '#F8FAF9', minHeight: '100vh', color: '#1E293B' }}>
      
      {/* BRAND TOP BANNER (TEAL PAMPHLET THEME) */}
      <header style={{ background: '#187A90', color: '#fff', borderBottom: '3px solid #0F5869', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#FAF6F0', color: '#4A121E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
              LS
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '800', fontFamily: 'Georgia, serif', letterSpacing: '-0.3px' }}>
                The Laddu Story
              </h1>
              <div style={{ fontSize: '0.78rem', opacity: 0.95, fontWeight: '500' }}>
                Homemade Healthy Snacks: Ancient Indian Traditions & Superfoods | 📞 <b>9343207515</b>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <nav style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.18)', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setActiveTab('store')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: activeTab === 'store' ? '#fff' : 'transparent',
                color: activeTab === 'store' ? '#187A90' : '#E0F2FE'
              }}
            >
              🛒 Customer Store
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: activeTab === 'admin' ? '#fff' : 'transparent',
                color: activeTab === 'admin' ? '#187A90' : '#E0F2FE'
              }}
            >
              📦 Admin Order Manager ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('sheets')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
                background: activeTab === 'sheets' ? '#fff' : 'transparent',
                color: activeTab === 'sheets' ? '#187A90' : '#E0F2FE'
              }}
            >
              📊 Google Sheets OMS
            </button>
          </nav>
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
        </div>
      </div>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: CUSTOMER STOREFRONT (MATCHING FLYER LAYOUT) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'store' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '28px' }}>
            
            {/* Catalog Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
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
                  const packLabel = choice === 'OPT1' ? prod.opt1 : prod.opt2;

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
                        boxShadow: '0 4px 12px rgba(24, 122, 144, 0.05)',
                        position: 'relative'
                      }}
                    >
                      <div>
                        {/* Tag & Rate */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: '800', background: prod.isMunchy ? '#D6E5BA' : '#E0F2FE', color: prod.isMunchy ? '#2D4A1D' : '#0369A1', padding: '3px 8px', borderRadius: '6px' }}>
                            #{prod.id} {prod.tag}
                          </span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#187A90' }}>
                            ₹{prod.ratePerKg.toLocaleString('en-IN')}/Kg
                          </span>
                        </div>

                        {/* Item Name */}
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: '0 0 6px' }}>
                          {prod.name}
                        </h3>

                        {/* Ingredients */}
                        <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '8px', lineHeight: 1.4 }}>
                          <b>Ingredients:</b> {prod.desc}
                        </div>

                        {/* Health Benefits */}
                        <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: '600', marginBottom: '14px', background: '#ECFDF5', padding: '6px 8px', borderRadius: '6px' }}>
                          ✨ {prod.benefit}
                        </div>
                      </div>

                      {/* Weight Selector & Add Button */}
                      <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                          <button
                            type="button"
                            onClick={() => setWeight(prod.sku, 'OPT1')}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              border: choice === 'OPT1' ? '2px solid #187A90' : '1px solid #CBD5E1',
                              background: choice === 'OPT1' ? '#187A90' : '#fff',
                              color: choice === 'OPT1' ? '#fff' : '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            {prod.opt1}
                          </button>
                          <button
                            type="button"
                            onClick={() => setWeight(prod.sku, 'OPT2')}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: '700',
                              border: choice === 'OPT2' ? '2px solid #187A90' : '1px solid #CBD5E1',
                              background: choice === 'OPT2' ? '#187A90' : '#fff',
                              color: choice === 'OPT2' ? '#fff' : '#334155',
                              cursor: 'pointer'
                            }}
                          >
                            {prod.opt2}
                          </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Payable:</span>
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                              ₹{price}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => addToCart(prod)}
                            style={{
                              background: '#187A90',
                              color: '#fff',
                              border: 'none',
                              padding: '10px 18px',
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

            {/* Sticky Order Cart */}
            <div>
              <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '22px', position: 'sticky', top: '90px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F1F5F9', paddingBottom: '12px', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0F5869', fontWeight: '800' }}>
                    🛒 Your Order Cart ({cart.reduce((s,i) => s + i.qty, 0)})
                  </h3>
                  {cart.length > 0 && (
                    <button onClick={() => setCart([])} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>
                      Clear Cart
                    </button>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 10px', color: '#94A3B8' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🛍️</div>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>Your cart is empty.</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Select your favourite laddus from the left.</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
                      {cart.map(item => (
                        <div key={item.cartKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #E2E8F0' }}>
                          <div style={{ maxWidth: '65%' }}>
                            <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.packLabel}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', background: '#F8FAFC' }}>
                              <button onClick={() => updateCartQty(item.cartKey, -1)} style={{ border: 'none', background: 'none', padding: '3px 8px', cursor: 'pointer', fontWeight: '800' }}>-</button>
                              <span style={{ fontSize: '0.85rem', fontWeight: '800', minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                              <button onClick={() => updateCartQty(item.cartKey, 1)} style={{ border: 'none', background: 'none', padding: '3px 8px', cursor: 'pointer', fontWeight: '800' }}>+</button>
                            </div>
                            <b style={{ fontSize: '0.9rem', minWidth: '60px', textAlign: 'right' }}>₹{item.unitPrice * item.qty}</b>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Customer Inputs */}
                    <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '8px' }}>
                        DELIVERY & CONTACT DETAILS
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
                        placeholder="Mobile Number (+91...) *"
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: '700', color: '#475569' }}>Total Payable:</span>
                      <span style={{ fontSize: '1.8rem', fontWeight: '900', color: '#187A90' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleCheckout}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#187A90',
                        color: '#fff',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(24, 122, 144, 0.3)',
                        marginBottom: '8px'
                      }}
                    >
                      {isSubmitting ? 'Processing...' : '⚡ Place Order & Pay via UPI QR'}
                    </button>

                    <button
                      type="button"
                      onClick={sendWhatsApp}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: '#059669',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      💬 Order via WhatsApp (9343207515)
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: ADMIN ORDER MANAGER (TRACK & CHANGE STATUS) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'admin' && (
          <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
            
            {/* Header with Stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px', borderBottom: '2px solid #F1F5F9', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0F5869', fontSize: '1.4rem', fontWeight: '800' }}>
                  📦 Admin Order Management & Dispatch Center
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#64748B' }}>
                  Manage batches, update preparation, dispatch, and delivery status in real time.
                </p>
              </div>

              {/* Status Counters */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ background: '#FEF3C7', color: '#92400E', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                  Received: {orders.filter(o => o.status === 'RECEIVED').length}
                </span>
                <span style={{ background: '#EDE9FE', color: '#6D28D9', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                  Packed: {orders.filter(o => o.status === 'PACKED' || o.status === 'PREPARING').length}
                </span>
                <span style={{ background: '#DCFCE7', color: '#15803D', padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800' }}>
                  Delivered: {orders.filter(o => o.status === 'DELIVERED').length}
                </span>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['ALL', 'RECEIVED', 'PREPARING', 'PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      border: statusFilter === st ? '2px solid #187A90' : '1px solid #CBD5E1',
                      background: statusFilter === st ? '#187A90' : '#fff',
                      color: statusFilter === st ? '#fff' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {st.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="🔍 Search Order ID, Customer, Phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem', minWidth: '260px' }}
              />
            </div>

            {/* Orders Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
                  No orders match this filter.
                </div>
              ) : (
                filteredOrders.map(order => {
                  const style = statusColor(order.status);

                  return (
                    <div
                      key={order.orderId}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderLeft: `6px solid ${style.text}`,
                        borderRadius: '12px',
                        padding: '18px 20px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: '900', fontSize: '1rem', color: '#0F5869' }}>
                              {order.orderId}
                            </span>
                            <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                              {order.channel}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                              🕒 {order.time}
                            </span>
                          </div>
                          <div style={{ fontWeight: '800', fontSize: '1.05rem', marginTop: '4px' }}>
                            {order.name} <span style={{ fontWeight: '500', color: '#64748B', fontSize: '0.85rem' }}>({order.phone})</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                            📍 {order.address}
                          </div>
                        </div>

                        {/* Status Badge & Interactive Action Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}`, padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '800' }}>
                            ● {order.status.replace(/_/g, ' ')}
                          </span>

                          <select
                            value={order.status}
                            onChange={e => updateOrderStatus(order.orderId, e.target.value)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid #CBD5E1',
                              fontWeight: '700',
                              fontSize: '0.82rem',
                              background: '#F8FAFC',
                              color: '#0F172A',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="RECEIVED">🟡 Mark as RECEIVED</option>
                            <option value="PREPARING">🍳 Mark as PREPARING</option>
                            <option value="PACKED">📦 Mark as PACKED</option>
                            <option value="OUT_FOR_DELIVERY">🚚 Mark as OUT FOR DELIVERY</option>
                            <option value="DELIVERED">🟢 Mark as DELIVERED</option>
                            <option value="CANCELLED">🔴 Mark as CANCELLED</option>
                          </select>
                        </div>
                      </div>

                      {/* Items Ordered List */}
                      <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#64748B', marginBottom: '4px' }}>
                            ITEMS IN ORDER:
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem' }}>
                            {order.items.map((it, idx) => (
                              <span key={idx} style={{ background: '#fff', border: '1px solid #CBD5E1', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                <b>{it.qty}x</b> {it.name} ({it.packLabel})
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Value:</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F5869' }}>
                            ₹{order.total.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: GOOGLE SHEETS OMS & WEBHOOK CONFIGURATION */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'sheets' && (
          <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #F1F5F9', paddingBottom: '14px', marginBottom: '18px' }}>
              <div>
                <h2 style={{ margin: 0, color: '#0F5869', fontSize: '1.35rem', fontWeight: '800' }}>
                  📊 Google Sheets Live Ledger (theladdustory@gmail.com)
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600', marginTop: '4px' }}>
                  Cloud Ledger: Master_OMS_Database | Dynamic `=SUMIF` Inventory Deduction Active
                </div>
              </div>
              <span style={{ background: '#ECFDF5', color: '#065F46', padding: '6px 14px', borderRadius: '20px', fontWeight: '700', fontSize: '0.8rem', border: '1px solid #A7F3D0' }}>
                ● Auto-Sync Active
              </span>
            </div>

            {/* Webhook Configuration Bar */}
            <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
              <div style={{ fontWeight: '800', color: '#0369A1', fontSize: '0.9rem', marginBottom: '6px' }}>
                🔗 Google Apps Script Webhook URL (For Direct Google Sheets Sync)
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.82rem', color: '#334155' }}>
                Paste your deployed Google Apps Script `/exec` URL below. Every customer order placed on GitHub Pages will automatically save into your Google Sheet!
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={webhookUrl}
                  onChange={e => saveWebhook(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '0.85rem' }}
                />
                <button
                  onClick={() => alert('Webhook URL Saved!')}
                  style={{ background: '#187A90', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save URL
                </button>
              </div>
            </div>

            {/* Table Representation matching Flyer */}
            <h3 style={{ fontSize: '1.1rem', color: '#0F5869', margin: '0 0 12px' }}>
              Sheet: Menu_&_Inventory (Exact Pamphlet Styling)
            </h3>
            <div style={{ overflowX: 'auto', marginBottom: '28px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#187A90', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>#</th>
                    <th style={{ padding: '12px' }}>Item</th>
                    <th style={{ padding: '12px' }}>Category</th>
                    <th style={{ padding: '12px' }}>Brochure Price</th>
                    <th style={{ padding: '12px' }}>Opening Stock</th>
                    <th style={{ padding: '12px' }}>Sold (=SUMIF)</th>
                    <th style={{ padding: '12px' }}>Current Stock</th>
                    <th style={{ padding: '12px' }}>Reorder Status</th>
                  </tr>
                </thead>
                <tbody>
                  {PRODUCTS.map((p, idx) => {
                    const sold = orders.flatMap(o => o.items).filter(i => i.sku === p.sku).reduce((s, i) => s + i.qty, 0);
                    const current = 50 - sold;
                    return (
                      <tr
                        key={p.sku}
                        style={{
                          background: p.isMunchy ? '#D6E5BA' : (idx % 2 === 0 ? '#FFFFFF' : '#F2F8FA'),
                          color: p.isMunchy ? '#2D4A1D' : '#1E293B',
                          borderBottom: '1px solid #E2E8F0'
                        }}
                      >
                        <td style={{ padding: '10px 12px', fontWeight: '800' }}>#{p.id}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '700' }}>{p.name}</td>
                        <td style={{ padding: '10px 12px' }}>{p.category}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '700' }}>{p.opt1} | {p.opt2}</td>
                        <td style={{ padding: '10px 12px' }}>50 packs</td>
                        <td style={{ padding: '10px 12px', fontWeight: '800', color: '#0F5869' }}>{sold} packs</td>
                        <td style={{ padding: '10px 12px', fontWeight: '800', color: current <= 10 ? '#DC2626' : '#059669' }}>{current} packs</td>
                        <td style={{ padding: '10px 12px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '3px 8px', borderRadius: '4px', background: current <= 10 ? '#FEF2F2' : '#ECFDF5', color: current <= 10 ? '#991B1B' : '#065F46' }}>
                            {current <= 10 ? '⚠️ REORDER NOW' : '✅ HEALTHY'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* UPI QR PAYMENT MODAL */}
      {showQR && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '30px', maxWidth: '380px', width: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ background: '#E0F2FE', color: '#0369A1', padding: '4px 12px', borderRadius: '20px', fontWeight: '800', fontSize: '0.78rem', display: 'inline-block', marginBottom: '12px' }}>
              THE LADDU STORY - DYNAMIC UPI QR
            </div>
            <h3 style={{ margin: '0 0 6px', color: '#0F5869', fontSize: '1.4rem' }}>
              Scan & Pay ₹{cartTotal.toLocaleString('en-IN')}
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748B' }}>
              Pay to <b>theladdu@bank</b> via Google Pay, PhonePe, Paytm, BHIM
            </p>

            {qrCodeDataUrl && (
              <img
                src={qrCodeDataUrl}
                alt="UPI QR Code"
                style={{ width: '200px', height: '200px', margin: '0 auto 16px', border: '2px dashed #187A90', borderRadius: '16px', padding: '10px', display: 'block' }}
              />
            )}

            <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '700', color: '#334155', marginBottom: '18px' }}>
              Order ID: <span style={{ color: '#0F5869' }}>{activeOrder?.orderId}</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={confirmPaymentDone}
                style={{ flex: 1, padding: '12px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}
              >
                ✅ Payment Done
              </button>
              <button
                onClick={() => setShowQR(false)}
                style={{ padding: '12px 16px', background: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
