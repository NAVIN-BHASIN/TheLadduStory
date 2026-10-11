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

// REAL-TIME CLOUD SYNC ENDPOINT (CROSS-DEVICE REAL-TIME BRIDGE FOR STAFF & CUSTOMERS)
const CLOUD_SYNC_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1299ccf033a8f';

// OFFICIAL 11 FLYER & OMS ITEMS (MATCHING EXACT SKUS & IMAGES FROM D:\The Laddu Story Application\images)
const INITIAL_PRODUCTS = [
  { 
    id: '01', 
    sku: 'RAGI-WALNUT', 
    name: 'Ragi Walnut Laddu', 
    category: 'LADDU', 
    ratePerKg: 1200, 
    moq: '500g',
    p500: 600, 
    p1k: 1200, 
    opt1: '500g (₹600)', 
    opt2: '1 Kg (₹1,200)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Superfood Millet', 
    desc: 'Finger Millet (Ragi), Walnuts, Pure Desi Cow Ghee, Unrefined Jaggery', 
    benefit: 'Rich in Calcium & Omega-3, Diabetic-friendly, Zero White Sugar', 
    image: 'images/products/RAGI-WALNUT.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '02', 
    sku: 'TILL-BLACK-SESAME', 
    name: 'Till Laddu (Black Sesame)', 
    category: 'LADDU', 
    ratePerKg: 1000, 
    moq: '500g',
    p500: 500, 
    p1k: 1000, 
    opt1: '500g (₹500)', 
    opt2: '1 Kg (₹1,000)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Ayurvedic Warmth', 
    desc: 'Organic Black Sesame (Till), Pure Desi Cow Ghee, Unrefined Jaggery', 
    benefit: 'High Iron & Bone Density Support, Warming Ayurvedic Formulation', 
    image: 'images/products/TILL-BLACK-SESAME.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '03', 
    sku: 'SATTU-ALMOND', 
    name: 'Sattu Almond Laddu', 
    category: 'LADDU', 
    ratePerKg: 1100, 
    moq: '500g',
    p500: 550, 
    p1k: 1100, 
    opt1: '500g (₹550)', 
    opt2: '1 Kg (₹1,100)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'High Protein', 
    desc: 'Roasted Chana Sattu, California Almonds, Desi Ghee, Jaggery', 
    benefit: 'Natural Plant Protein & Sustained Energy, Muscle Recovery', 
    image: 'images/products/SATTU-ALMOND.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '04', 
    sku: 'GROUNDNUT', 
    name: 'Groundnut Laddu', 
    category: 'LADDU', 
    ratePerKg: 800, 
    moq: '500g',
    p500: 400, 
    p1k: 800, 
    opt1: '500g (₹400)', 
    opt2: '1 Kg (₹800)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Traditional Classic', 
    desc: 'Roasted Peanuts (Groundnuts), Pure Cow Ghee, Organic Jaggery', 
    benefit: 'Heart-healthy fats, High satiety, Wholesome traditional snacking', 
    image: 'images/products/GROUNDNUT.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '05', 
    sku: 'QUINOA-MOONG-DAL', 
    name: 'Quinoa Moong Dal Laddu', 
    category: 'LADDU', 
    ratePerKg: 1250, 
    moq: '500g',
    p500: 625, 
    p1k: 1250, 
    opt1: '500g (₹625)', 
    opt2: '1 Kg (₹1,250)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Ancient Superfood', 
    desc: 'Organic Quinoa, Yellow Moong Dal, Desi Ghee, Cardamom, Jaggery', 
    benefit: 'Complete Amino Acids, Light on Stomach & Easy Digestion', 
    image: 'images/products/QUINOA-MOONG-DAL.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '06', 
    sku: 'METHI-FENUGREEK', 
    name: 'Methi (fenugreek) Laddu', 
    category: 'LADDU', 
    ratePerKg: 1250, 
    moq: '500g',
    p500: 625, 
    p1k: 1250, 
    opt1: '500g (₹625)', 
    opt2: '1 Kg (₹1,250)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Joint Support', 
    desc: 'Sprouted Fenugreek (Methi), Dry Fruits, Desi Cow Ghee, Jaggery', 
    benefit: 'Ayurvedic Joint Care, Postpartum Strength, Low Glycemic', 
    image: 'images/products/METHI-FENUGREEK.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '07', 
    sku: 'DATES-DRY-FRUITS', 
    name: 'Dates & Dry Fruits Bites', 
    category: 'LADDU', 
    ratePerKg: 1900, 
    moq: '500g',
    p500: 950, 
    p1k: 1900, 
    opt1: '500g (₹950)', 
    opt2: '1 Kg (₹1,900)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Natural Sweetness', 
    desc: 'Medjool Dates, Almonds, Cashews, Pistachios, Pure Cow Ghee, Zero Sugar', 
    benefit: '100% Naturally Sweetened with Dates, Instant Energy, Fiber Rich', 
    image: 'images/products/DATES-DRY-FRUITS.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '08', 
    sku: 'POST-DELIVERY-PANJEERI', 
    name: 'Post Delivery Panjeeri / Laddu', 
    category: 'LADDU', 
    ratePerKg: 1800, 
    moq: '500g',
    p500: 900, 
    p1k: 1800, 
    opt1: '500g (₹900)', 
    opt2: '1 Kg (₹1,800)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Postpartum Care', 
    desc: 'Ayurvedic Herbs, Kamarkas, Gond, Dry Fruits, A2 Desi Cow Ghee', 
    benefit: 'Maternal Healing, Lactation Support, Postpartum Recovery', 
    image: 'images/products/POST-DELIVERY-PANJEERI.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '09', 
    sku: 'JAWAR-PANJEERI', 
    name: 'Jawar Panjeeri / Laddu', 
    category: 'LADDU', 
    ratePerKg: 1900, 
    moq: '500g',
    p500: 950, 
    p1k: 1900, 
    opt1: '500g (₹950)', 
    opt2: '1 Kg (₹1,900)', 
    w1: '500g', 
    w2: '1 Kg', 
    tag: 'Ancient Sorghum Millet', 
    desc: 'Roasted Jawar (Sorghum Flour), A2 Cow Ghee, Jaggery, Super Seeds & Nuts', 
    benefit: 'Gluten-Free ancient grains, High fiber, Digestive health & stamina', 
    image: 'images/products/JAWAR-PANJEERI.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false 
  },
  { 
    id: '10', 
    sku: 'SAVORY-MAKHANA', 
    name: 'Savory Munchies (Roasted Makhana)', 
    category: 'SAVORY', 
    ratePerKg: 2750, 
    moq: '100g',
    p500: 275, 
    p1k: 550, 
    opt1: '100g (₹275)', 
    opt2: '200g (₹550)', 
    w1: '100g', 
    w2: '200g', 
    tag: 'Guilt-Free Crunch', 
    desc: 'Foxnuts (Makhana) slow roasted in pure cow ghee, Himalayan pink salt', 
    benefit: 'Zero Cholesterol, Low Calorie, Mineral Rich Super Crunch', 
    image: 'images/products/SAVORY-MAKHANA.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: true 
  },
  { 
    id: '11', 
    sku: 'SAVORY-MURMURA', 
    name: 'Savory Munchies (Millet Mudi Mix)', 
    category: 'SAVORY', 
    ratePerKg: 1000, 
    moq: '200g',
    p500: 200, 
    p1k: 400, 
    opt1: '200g (₹200)', 
    opt2: '400g (₹400)', 
    w1: '200g', 
    w2: '400g', 
    tag: 'Tea-Time Favorite', 
    desc: 'Puffed Millets, Roasted Peanuts, Curry Leaves, Cold-pressed Spices', 
    benefit: 'Light & Crisp, Gut-friendly, Wholesome evening snack', 
    image: 'images/products/SAVORY-MURMURA.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: true 
  }
];

// MASTER CUSTOMER REGISTRY (RESOLVES REAL NAMES AND SAVED ADDRESSES FROM OMS DATABASE)
const MASTER_CUSTOMER_REGISTRY = {
  '9343207515': { name: 'Neetika', address: 'Xyz q23 blr 560103' },
  '9606312010': { name: 'Bhoomie Bhasin', address: '#15101, Prestige Tranquility, Budigere cross' },
  '9686412342': { name: 'Navin Bhasin', address: 'Direct Pickup / Bangalore Express Delivery' },
  '1111111111': { name: 'SUDARSHAN LAL BHASIN', address: 'Bangalore' },
  '9845012345': { name: 'Dr. Ananya Sharma', address: 'Koramangala, Bangalore' },
  '9900188776': { name: 'Vikas Sundaram', address: 'Indiranagar, Bangalore' }
};

// MASTER OMS DATABASE FROM GOOGLE SHEETS (ALL ACTIVE & HISTORICAL ORDERS)
const MASTER_OMS_ORDERS = [
  {
    orderId: 'TLS-20261011-3227',
    time: '10/11/26, 8:21 AM',
    channel: 'ONLINE_STORE',
    name: 'Bhoomie Bhasin',
    phone: '9606312010',
    address: '#15101, Prestige Tranquility, Budigere cross',
    status: 'RECEIVED',
    total: 600,
    paymentMethod: 'UPI',
    items: [
      {
        sku: 'RAGI-WALNUT',
        name: 'Ragi Walnut Laddu',
        cleanWeight: '500g',
        qty: 1,
        unitPrice: 600,
        image: 'images/products/RAGI-WALNUT.jpg'
      }
    ]
  },
  {
    orderId: 'TLS-20261011-9252',
    time: '10/11/26, 8:11 AM',
    channel: 'ONLINE_STORE',
    name: 'Neetika',
    phone: '9343207515',
    address: 'Xyz q23 blr 560103',
    status: 'RECEIVED',
    total: 2275,
    paymentMethod: 'UPI',
    items: [
      {
        sku: 'SAVORY-MURMURA',
        name: 'Savory Munchies (Millet Mudi Mix)',
        cleanWeight: '200g',
        qty: 1,
        unitPrice: 200,
        image: 'images/products/SAVORY-MURMURA.jpg'
      },
      {
        sku: 'SAVORY-MAKHANA',
        name: 'Savory Munchies (Roasted Makhana)',
        cleanWeight: '100g',
        qty: 1,
        unitPrice: 275,
        image: 'images/products/SAVORY-MAKHANA.jpg'
      },
      {
        sku: 'POST-DELIVERY-PANJEERI',
        name: 'Post Delivery Panjeeri / Laddu',
        cleanWeight: '1 Kg',
        qty: 1,
        unitPrice: 1800,
        image: 'images/products/POST-DELIVERY-PANJEERI.jpg'
      }
    ]
  },
  {
    orderId: 'TLS-20261011-5303',
    time: '10/11/26, 8:04 AM',
    channel: 'ONLINE_STORE',
    name: 'Navin Bhasin',
    phone: '9686412342',
    address: 'Direct Pickup / Bangalore Express Delivery',
    status: 'PREPARING',
    total: 2350,
    paymentMethod: 'UPI',
    items: [
      {
        sku: 'SATTU-ALMOND',
        name: 'Sattu Almond Laddu',
        cleanWeight: '1 Kg',
        qty: 1,
        unitPrice: 1100,
        image: 'images/products/SATTU-ALMOND.jpg'
      },
      {
        sku: 'QUINOA-MOONG-DAL',
        name: 'Quinoa Moong Dal Laddu',
        cleanWeight: '500g',
        qty: 2,
        unitPrice: 625,
        image: 'images/products/QUINOA-MOONG-DAL.jpg'
      }
    ]
  },
  {
    orderId: 'TLS-20261011-2033',
    time: '10/11/26, 7:12 AM',
    channel: 'ONLINE_STORE',
    name: 'SUDARSHAN LAL BHASIN',
    phone: '1111111111',
    address: 'Bangalore',
    status: 'OUT FOR DELIVERY',
    total: 1100,
    paymentMethod: 'UPI',
    items: [
      {
        sku: 'RAGI-WALNUT',
        name: 'Ragi Walnut Laddu',
        cleanWeight: '500g',
        qty: 1,
        unitPrice: 600,
        image: 'images/products/RAGI-WALNUT.jpg'
      },
      {
        sku: 'TILL-BLACK-SESAME',
        name: 'Till Laddu (Black Sesame)',
        cleanWeight: '500g',
        qty: 1,
        unitPrice: 500,
        image: 'images/products/TILL-BLACK-SESAME.jpg'
      }
    ]
  },
  {
    orderId: 'TLS-20261009-0893',
    time: '10/09/26, 8:05 PM',
    channel: 'WALK_IN',
    name: 'Kavita Menon',
    phone: '9343207515',
    address: 'Counter Pickup',
    status: 'DELIVERED',
    total: 550,
    paymentMethod: 'CASH',
    items: [
      {
        sku: 'SAVORY-MAKHANA',
        name: 'Savory Munchies (Roasted Makhana)',
        cleanWeight: '100g',
        qty: 2,
        unitPrice: 275,
        image: 'images/products/SAVORY-MAKHANA.jpg'
      }
    ]
  },
  {
    orderId: 'TLS-20261009-0892',
    time: '10/09/26, 7:15 PM',
    channel: 'MOBILE_APP',
    name: 'Vikas Sundaram',
    phone: '9900188776',
    address: 'Indiranagar, Bangalore',
    status: 'PACKED',
    total: 1800,
    paymentMethod: 'UPI',
    items: [
      {
        sku: 'POST-DELIVERY-PANJEERI',
        name: 'Post Delivery Panjeeri / Laddu',
        cleanWeight: '500g',
        qty: 2,
        unitPrice: 900,
        image: 'images/products/POST-DELIVERY-PANJEERI.jpg'
      }
    ]
  },
  {
    orderId: 'TLS-20261009-0891',
    time: '10/09/26, 6:30 PM',
    channel: 'WHATSAPP',
    name: 'Dr. Ananya Sharma',
    phone: '9845012345',
    address: 'Koramangala, Bangalore',
    status: 'DELIVERED',
    total: 1200,
    paymentMethod: 'UPI',
    items: [
      {
        sku: 'RAGI-WALNUT',
        name: 'Ragi Walnut Laddu',
        cleanWeight: '1 Kg',
        qty: 1,
        unitPrice: 1200,
        image: 'images/products/RAGI-WALNUT.jpg'
      }
    ]
  }
];

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'track' | 'admin'
  const [adminSection, setAdminSection] = useState('orders'); // 'orders' | 'inventory'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Cloud Sync State
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toLocaleTimeString());

  // Products State (Managed dynamically via Admin Inventory)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('tls_products_db');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  // Inventory Editing Modals
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    sku: '',
    name: '',
    category: 'LADDU',
    ratePerKg: 1200,
    moq: '500g',
    opt1: '500g (₹600)',
    opt2: '1 Kg (₹1,200)',
    p500: 600,
    p1k: 1200,
    w1: '500g',
    w2: '1 Kg',
    tag: 'Artisanal Special',
    desc: 'Crafted with Desi Cow Ghee and Pure Jaggery',
    benefit: 'Healthy and wholesome nutrition',
    image: 'images/products/RAGI-WALNUT.jpg',
    stockStatus: 'IN_STOCK',
    stockCount: 50,
    isMunchy: false
  });

  // Customer Account Session
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tls_active_customer');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.phone) {
        const clean = parsed.phone.replace(/\D/g, '').slice(-10);
        if ((!parsed.name || parsed.name === 'Valued Customer') && MASTER_CUSTOMER_REGISTRY[clean]) {
          parsed.name = MASTER_CUSTOMER_REGISTRY[clean].name;
          if (!parsed.address) parsed.address = MASTER_CUSTOMER_REGISTRY[clean].address;
          localStorage.setItem('tls_active_customer', JSON.stringify(parsed));
        }
      }
      return parsed;
    } catch (e) {
      return null;
    }
  });

  const [showCustomerLoginModal, setShowCustomerLoginModal] = useState(false);
  const [loginPhoneInput, setLoginPhoneInput] = useState('');
  const [loginNameInput, setLoginNameInput] = useState('');

  // Cart & Order Form State
  const [cart, setCart] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [custName, setCustName] = useState(() => customerUser ? customerUser.name : (localStorage.getItem('tls_cust_name') || ''));
  const [custPhone, setCustPhone] = useState(() => customerUser ? customerUser.phone : (localStorage.getItem('tls_cust_phone') || ''));
  const [custAddress, setCustAddress] = useState(() => customerUser ? customerUser.address : (localStorage.getItem('tls_cust_addr') || ''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [addedToast, setAddedToast] = useState('');

  // Orders Store
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('tls_orders_db');
      if (!saved) return MASTER_OMS_ORDERS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return MASTER_OMS_ORDERS;

      const map = new Map();
      MASTER_OMS_ORDERS.forEach(o => map.set(o.orderId, o));
      parsed.forEach(o => {
        if (map.has(o.orderId)) {
          map.set(o.orderId, { ...map.get(o.orderId), ...o });
        } else {
          map.set(o.orderId, o);
        }
      });
      return Array.from(map.values());
    } catch (e) {
      return MASTER_OMS_ORDERS;
    }
  });

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Save to local storage on update
  useEffect(() => {
    try {
      localStorage.setItem('tls_orders_db', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('tls_products_db', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  // Sync inputs & ensure customer name is properly resolved
  useEffect(() => {
    if (customerUser && customerUser.phone) {
      const clean = customerUser.phone.replace(/\D/g, '').slice(-10);
      if ((!customerUser.name || customerUser.name === 'Valued Customer') && MASTER_CUSTOMER_REGISTRY[clean]) {
        const upgraded = {
          ...customerUser,
          name: MASTER_CUSTOMER_REGISTRY[clean].name,
          address: customerUser.address || MASTER_CUSTOMER_REGISTRY[clean].address
        };
        setCustomerUser(upgraded);
        try {
          localStorage.setItem('tls_active_customer', JSON.stringify(upgraded));
        } catch (e) {}
      } else {
        setCustName(customerUser.name || '');
        setCustPhone(customerUser.phone || '');
        setCustAddress(customerUser.address || '');
      }
    }
  }, [customerUser]);

  // REAL-TIME CLOUD BROADCAST (CROSS-DEVICE SYNC)
  const syncWithCloud = async (currentOrders, currentProducts) => {
    try {
      const payload = {
        name: 'TheLadduStory_OMS_LiveState',
        data: {
          lastUpdated: new Date().toISOString(),
          orders: currentOrders,
          products: currentProducts
        }
      };
      await fetch(CLOUD_SYNC_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setIsCloudSynced(true);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Cloud sync error', err);
    }
  };

  // REAL-TIME CLOUD POLLING (POLLS EVERY 5 SECONDS FOR ZERO-DELAY UPDATES)
  useEffect(() => {
    const pollCloud = async () => {
      try {
        const res = await fetch(CLOUD_SYNC_URL);
        if (res.ok) {
          const json = await res.json();
          if (json && json.data) {
            // Update orders if cloud has updates
            if (Array.isArray(json.data.orders) && json.data.orders.length > 0) {
              setOrders(prev => {
                const map = new Map();
                prev.forEach(o => map.set(o.orderId, o));
                json.data.orders.forEach(o => {
                  map.set(o.orderId, { ...map.get(o.orderId), ...o });
                });
                return Array.from(map.values());
              });
            }
            // Update products if inventory has been modified by staff
            if (Array.isArray(json.data.products) && json.data.products.length > 0) {
              setProducts(json.data.products);
            }
            setIsCloudSynced(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        }
      } catch (e) {
        console.warn('Polling warning', e);
      }
    };

    pollCloud();
    const interval = setInterval(pollCloud, 5000);
    return () => clearInterval(interval);
  }, []);

  // CUSTOMER LOGIN HANDLER
  const handleCustomerLogin = (e) => {
    if (e) e.preventDefault();
    const clean = loginPhoneInput.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    let resolvedName = loginNameInput.trim();
    let resolvedAddr = '';

    if (!resolvedName && MASTER_CUSTOMER_REGISTRY[clean]) {
      resolvedName = MASTER_CUSTOMER_REGISTRY[clean].name;
      resolvedAddr = MASTER_CUSTOMER_REGISTRY[clean].address || '';
    }

    if (!resolvedName) {
      const prevOrder = orders.find(o => (o.phone || '').replace(/\D/g, '').slice(-10) === clean);
      if (prevOrder) {
        resolvedName = prevOrder.name;
        resolvedAddr = prevOrder.address || '';
      }
    }

    if (!resolvedName) {
      resolvedName = 'Valued Customer';
    }

    const profile = {
      phone: clean,
      name: resolvedName,
      address: resolvedAddr,
      loggedInAt: new Date().toISOString()
    };

    setCustomerUser(profile);
    localStorage.setItem('tls_active_customer', JSON.stringify(profile));
    setShowCustomerLoginModal(false);
    setActiveTab('track');
  };

  const handleCustomerLogout = () => {
    setCustomerUser(null);
    localStorage.removeItem('tls_active_customer');
  };

  // Cart actions
  const getWeight = (sku) => selectedWeights[sku] || 'OPT1';
  const setWeight = (sku, val) => setSelectedWeights({ ...selectedWeights, [sku]: val });

  const addToCart = (product) => {
    if (product.stockStatus === 'OUT_OF_STOCK') {
      alert(`${product.name} is currently Out of Stock! Please check back soon.`);
      return;
    }

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
        image: product.image,
        qty: 1 
      }]);
    }

    // Show brief toast notification on card without opening cart sheet
    setAddedToast(`${product.name} added!`);
    setTimeout(() => setAddedToast(''), 1800);
  };

  const updateCartQty = (cartKey, delta) => {
    setCart(cart.map(item => {
      if (item.cartKey === cartKey) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  // Submit to Google Form in background
  const submitToGoogleSheets = async (orderData) => {
    try {
      const itemsFormatted = orderData.items
        .map(i => `${i.name} [${i.cleanWeight}] x ${i.qty}`)
        .join(', ');

      const formData = new URLSearchParams();
      formData.append(FORM_ENTRIES.ORDER_ID, orderData.orderId);
      formData.append(FORM_ENTRIES.NAME, orderData.name);
      formData.append(FORM_ENTRIES.PHONE, orderData.phone);
      formData.append(FORM_ENTRIES.ADDRESS, orderData.address);
      formData.append(FORM_ENTRIES.ITEMS, itemsFormatted);

      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
    } catch (err) {
      console.warn('Form sync executed');
    }
  };

  // CHECKOUT
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty! Please select delicious laddus to place order.');
      return;
    }
    if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
      alert('Please fill in your Name, 10-Digit Mobile Number, and Delivery Address.');
      return;
    }

    setIsSubmitting(true);
    const orderId = `TLS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanPhone = custPhone.replace(/\D/g, '').slice(-10);

    const newOrder = {
      orderId,
      time: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      channel: 'ONLINE_STORE',
      name: custName.trim(),
      phone: cleanPhone,
      address: custAddress.trim(),
      items: cart.map(i => ({
        sku: i.sku,
        name: i.name,
        packLabel: i.packLabel,
        cleanWeight: i.cleanWeight,
        unitPrice: i.unitPrice,
        qty: i.qty,
        image: i.image
      })),
      total: cartTotal,
      status: 'RECEIVED',
      paymentMethod: 'UPI'
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);

    const updatedProfile = {
      phone: cleanPhone,
      name: custName.trim(),
      address: custAddress.trim(),
      loggedInAt: new Date().toISOString()
    };
    setCustomerUser(updatedProfile);
    localStorage.setItem('tls_active_customer', JSON.stringify(updatedProfile));

    // Submit to Google Sheets
    submitToGoogleSheets(newOrder);

    // Broadcast immediately to Cloud for real-time Staff OMS sync
    syncWithCloud(updatedOrders, products);

    // Generate UPI QR
    const upiUri = `upi://pay?pa=9343207515@okbizaxis&pn=The%20Laddu%20Story&am=${cartTotal}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;
    try {
      const qrUrl = await QRCode.toDataURL(upiUri, { width: 260, margin: 2 });
      setQrDataUrl(qrUrl);
    } catch (qrErr) {}

    setOrderSuccess(newOrder);
    setCart([]);
    setIsSubmitting(false);
    setIsMobileCartOpen(false);
  };

  // Staff Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPinInput === '1234' || adminPinInput === '8888') {
      setIsAdminLoggedIn(true);
      setShowLoginModal(false);
      setAdminPinInput('');
      setActiveTab('admin');
    } else {
      alert('Incorrect Staff PIN. (Default PIN: 1234)');
    }
  };

  // Update order delivery status & broadcast to Cloud
  const updateOrderStatus = async (orderId, newStatus) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    try {
      localStorage.setItem('tls_orders_db', JSON.stringify(updated));
    } catch (e) {}
    // Broadcast status change immediately to cloud
    await syncWithCloud(updated, products);
  };

  // Re-sync all orders from master dataset
  const handleResetToMaster = async () => {
    setOrders(MASTER_OMS_ORDERS);
    setProducts(INITIAL_PRODUCTS);
    await syncWithCloud(MASTER_OMS_ORDERS, INITIAL_PRODUCTS);
    alert('✓ Synced all Master Orders & Products from OMS Database!');
  };

  // Save product changes (Inventory Manager)
  const handleSaveProductEdit = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = products.map(p => p.sku === editingProduct.sku ? editingProduct : p);
    setProducts(updated);
    try {
      localStorage.setItem('tls_products_db', JSON.stringify(updated));
    } catch (e) {}
    await syncWithCloud(orders, updated);
    setEditingProduct(null);
    alert(`✓ Successfully updated ${editingProduct.name}!`);
  };

  // Add new product (Inventory Manager)
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProductForm.sku || !newProductForm.name) {
      alert('Please provide SKU and Product Name.');
      return;
    }
    const createdItem = {
      ...newProductForm,
      id: String(products.length + 1).padStart(2, '0')
    };
    const updated = [...products, createdItem];
    setProducts(updated);
    try {
      localStorage.setItem('tls_products_db', JSON.stringify(updated));
    } catch (e) {}
    await syncWithCloud(orders, updated);
    setShowAddProductModal(false);
    alert(`✓ Product ${createdItem.name} added to catalog!`);
  };

  // Reorder past items
  const reorderPastItems = (pastOrder) => {
    const newCart = [...cart];
    pastOrder.items.forEach(it => {
      const existing = newCart.find(c => c.sku === it.sku && c.cleanWeight === it.cleanWeight);
      if (existing) {
        existing.qty += it.qty;
      } else {
        newCart.push({
          cartKey: `${it.sku}-${it.cleanWeight || '500g'}`,
          sku: it.sku,
          name: it.name,
          packLabel: `${it.cleanWeight || '500g'} (₹${it.unitPrice})`,
          cleanWeight: it.cleanWeight || '500g',
          unitPrice: it.unitPrice,
          image: it.image || `images/products/${it.sku}.jpg`,
          qty: it.qty
        });
      }
    });
    setCart(newCart);
    setActiveTab('store');
    alert(`Added ${pastOrder.items.length} item(s) from order ${pastOrder.orderId} to your cart!`);
  };

  // Customer order tracking filters
  const customerCleanPhone = customerUser ? customerUser.phone.replace(/\D/g, '').slice(-10) : '';
  const myOrders = orders.filter(o => {
    const oPhone = (o.phone || '').replace(/\D/g, '').slice(-10);
    return oPhone === customerCleanPhone;
  });
  const activeOrders = myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = myOrders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'RECEIVED': return 1;
      case 'PREPARING': return 2;
      case 'PACKED': return 3;
      case 'OUT FOR DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };

  // Staff Search & Filter
  const cleanSearch = searchQuery.trim().toLowerCase();
  const searchDigits = searchQuery.replace(/\D/g, '');

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'ALL' && o.status !== filterStatus) return false;
    if (!cleanSearch) return true;

    const oId = (o.orderId || '').toLowerCase();
    const oName = (o.name || '').toLowerCase();
    const oPhoneRaw = (o.phone || '').toLowerCase();
    const oPhoneDigits = (o.phone || '').replace(/\D/g, '');

    const matchText = oId.includes(cleanSearch) || oName.includes(cleanSearch) || oPhoneRaw.includes(cleanSearch);
    const matchDigits = searchDigits.length >= 3 && oPhoneDigits.includes(searchDigits);

    return matchText || matchDigits;
  });

  // Reusable Cart Content Drawer
  const renderCartContent = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F5869', fontWeight: '800' }}>
          🛒 Your Fresh Order ({totalCartQty} items)
        </h3>
        {isMobileCartOpen && (
          <button 
            id="close-mobile-cart-btn"
            onClick={() => setIsMobileCartOpen(false)}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 10px', color: '#64748B' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🥣</div>
          <p style={{ margin: 0, fontWeight: '700', color: '#0F5869' }}>Your cart is empty.</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Select your favourite laddus from the menu!</p>
        </div>
      ) : (
        <div>
          <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cart.map(item => (
              <div key={item.cartKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'images/TheLadduStory_Logo.jpg'; }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0F5869' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{item.packLabel}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => updateCartQty(item.cartKey, -1)}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', minWidth: '16px', textAlign: 'center' }}>{item.qty}</span>
                  <button 
                    onClick={() => updateCartQty(item.cartKey, 1)}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    +
                  </button>
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0F5869', marginLeft: '6px', minWidth: '55px', textAlign: 'right' }}>
                    ₹{item.unitPrice * item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Customer Inputs */}
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>
                CUSTOMER CONTACT & DELIVERY
              </span>
              {customerUser && (
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '800' }}>
                  ✓ Logged in as {customerUser.name}
                </span>
              )}
            </div>
            <input
              id="checkout-cust-name"
              type="text"
              placeholder="Your Full Name *"
              value={custName}
              onChange={e => setCustName(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', marginBottom: '8px' }}
            />
            <input
              id="checkout-cust-phone"
              type="tel"
              placeholder="10-Digit Mobile Number (Primary ID) *"
              value={custPhone}
              onChange={e => setCustPhone(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', marginBottom: '8px' }}
            />
            <textarea
              id="checkout-cust-address"
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
              <span>Bangalore Express Delivery</span>
              <span>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#0F5869' }}>
              <span>Total Payable</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            id="place-order-btn"
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
            {isSubmitting ? '⏳ Saving Order...' : '🛍️ Place Order & Save in Google Sheets'}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: '#1E293B', paddingBottom: totalCartQty > 0 ? '110px' : '30px' }}>

      {/* HEADER WITH OFFICIAL CIRCULAR LOGO */}
      <header style={{ background: '#0F5869', color: '#fff', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Logo & Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '50%', 
              background: '#FFFFFF', 
              border: '2.5px solid #D6E5BA', 
              overflow: 'hidden', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              flexShrink: 0
            }}>
              <img 
                src="images/TheLadduStory_Logo.jpg" 
                alt="The Laddu Story Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerText = 'TLS';
                }}
              />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                The Laddu Story
              </h1>
              <div style={{ fontSize: '0.74rem', color: '#D6E5BA', fontWeight: '600' }}>
                Homemade Healthy Snacks: Ancient Traditions & Superfoods • 📞 9343207515
              </div>
            </div>
          </div>

          {/* Navigation Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              id="nav-store-btn"
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
              🛍️ Order Laddus
            </button>

            {/* Customer Login / My Orders Badge */}
            {customerUser ? (
              <div style={{ display: 'flex', alignItems: 'center', background: '#D6E5BA', borderRadius: '8px', padding: '2px 4px' }}>
                <button
                  id="nav-customer-profile-btn"
                  onClick={() => setActiveTab('track')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#0F5869',
                    padding: '6px 10px',
                    fontWeight: '800',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  👤 {customerUser.name} ({customerUser.phone})
                </button>
                <button
                  id="nav-customer-logout-btn"
                  onClick={handleCustomerLogout}
                  title="Switch / Logout"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748B',
                    padding: '4px 6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                id="nav-customer-login-btn"
                onClick={() => setShowCustomerLoginModal(true)}
                style={{
                  background: activeTab === 'track' ? '#FFFFFF' : 'rgba(255,255,255,0.15)',
                  color: activeTab === 'track' ? '#0F5869' : '#FFFFFF',
                  border: '1px solid rgba(255,255,255,0.4)',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                👤 Customer Login
              </button>
            )}

            {/* Staff OMS Login Button */}
            {isAdminLoggedIn ? (
              <button
                id="nav-staff-dashboard-btn"
                onClick={() => setActiveTab('admin')}
                style={{
                  background: activeTab === 'admin' ? '#D6E5BA' : 'rgba(214, 229, 186, 0.3)',
                  color: '#0F5869',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                ⚙️ Staff OMS ({orders.length})
              </button>
            ) : (
              <button
                id="nav-staff-login-btn"
                onClick={() => setShowLoginModal(true)}
                style={{
                  background: 'transparent',
                  color: '#D6E5BA',
                  border: '1px dashed #D6E5BA',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🔒 Staff Login
              </button>
            )}
          </div>

        </div>
      </header>

      {/* SUB-HEADER STATUS BAR */}
      <div style={{ background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', padding: '6px 20px', fontSize: '0.78rem', color: '#475569', textAlign: 'center' }}>
        <span>🌿 Pure Desi Cow Ghee & Unrefined Jaggery • Zero White Sugar • Freshly Prepared in Bangalore • </span>
        <span style={{ color: isCloudSynced ? '#059669' : '#D97706', fontWeight: '700' }}>
          ● Real-Time Cloud Sync Active (Synced {lastSyncTime})
        </span>
      </div>

      {/* ADDED TO CART TOAST NOTIFICATION */}
      {addedToast && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '20px',
          background: '#0F5869',
          color: '#FFFFFF',
          padding: '10px 18px',
          borderRadius: '10px',
          fontWeight: '700',
          fontSize: '0.85rem',
          boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
          zIndex: 1500
        }}>
          ✓ {addedToast}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: STORE FRONT & PRODUCT CATALOG                         */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'store' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '28px', alignItems: 'start' }}>
            
            {/* Catalog Grid */}
            <div>
              {/* Hero Banner */}
              <div style={{ 
                background: 'linear-gradient(135deg, #0F5869 0%, #187A90 100%)', 
                borderRadius: '20px', 
                padding: '28px', 
                color: '#fff', 
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'inline-block', background: '#D6E5BA', color: '#0F5869', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '10px' }}>
                    100% ARTISANAL & HOMEMADE
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 10px', lineHeight: 1.2 }}>
                    Nourishing Traditions, Modern Superfoods.
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#E2E8F0', lineHeight: 1.5 }}>
                    Crafted strictly with Pure Desi Cow Ghee and Unrefined Jaggery. Free of artificial colors, preservatives, and white sugar.
                  </p>
                </div>
              </div>

              {/* Products Section Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F5869', margin: 0 }}>
                  Signature Laddus & Savory Munchies ({products.length} Varieties)
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Freshly roasted to order</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {products.map(product => {
                  const currentWeight = getWeight(product.sku);
                  const price = currentWeight === 'OPT1' ? product.p500 : product.p1k;
                  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK';
                  
                  return (
                    <div 
                      key={product.id || product.sku}
                      style={{ 
                        background: '#fff', 
                        borderRadius: '16px', 
                        overflow: 'hidden', 
                        border: '1px solid #E2E8F0', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        opacity: isOutOfStock ? 0.75 : 1
                      }}
                    >
                      {/* Product Image */}
                      <div style={{ position: 'relative', height: '180px', background: '#FFF8F0', overflow: 'hidden' }}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'images/TheLadduStory_Logo.jpg'; }}
                        />
                        <span style={{ 
                          position: 'absolute', 
                          top: '12px', 
                          left: '12px', 
                          background: product.isMunchy ? '#E0F2FE' : '#D6E5BA', 
                          color: product.isMunchy ? '#0369A1' : '#0F5869', 
                          padding: '4px 10px', 
                          borderRadius: '8px', 
                          fontSize: '0.72rem', 
                          fontWeight: '800' 
                        }}>
                          {product.tag}
                        </span>

                        {isOutOfStock && (
                          <span style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: '#FEE2E2',
                            color: '#991B1B',
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '0.72rem',
                            fontWeight: '800'
                          }}>
                            OUT OF STOCK
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#0F5869' }}>
                            {product.name}
                          </h4>
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700' }}>
                            Min: {product.moq || '500g'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '8px', flex: 1 }}>
                          {product.desc}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: '700', marginBottom: '12px' }}>
                          ★ {product.benefit}
                        </div>

                        {/* Weight Selector */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                          <button
                            type="button"
                            onClick={() => setWeight(product.sku, 'OPT1')}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: currentWeight === 'OPT1' ? '2px solid #187A90' : '1px solid #CBD5E1',
                              background: currentWeight === 'OPT1' ? '#E0F2FE' : '#fff',
                              color: currentWeight === 'OPT1' ? '#0F5869' : '#475569',
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            {product.opt1}
                          </button>
                          <button
                            type="button"
                            onClick={() => setWeight(product.sku, 'OPT2')}
                            style={{
                              padding: '8px 4px',
                              borderRadius: '8px',
                              border: currentWeight === 'OPT2' ? '2px solid #187A90' : '1px solid #CBD5E1',
                              background: currentWeight === 'OPT2' ? '#E0F2FE' : '#fff',
                              color: currentWeight === 'OPT2' ? '#0F5869' : '#475569',
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                          >
                            {product.opt2}
                          </button>
                        </div>

                        {/* Price & Add to Cart */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F5869' }}>
                              ₹{price}
                            </span>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={isOutOfStock}
                            style={{
                              background: isOutOfStock ? '#CBD5E1' : '#187A90',
                              color: '#fff',
                              border: 'none',
                              padding: '9px 16px',
                              borderRadius: '8px',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            {isOutOfStock ? 'Unavailable' : '+ Add to Cart'}
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Desktop Cart Sidebar */}
            <div className="desktop-cart-sidebar" style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', position: 'sticky', top: '90px' }}>
              {renderCartContent()}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: CUSTOMER ORDER TRACKING & PROFILE CRM                 */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'track' && (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            
            {customerUser ? (
              <div>
                {/* Customer Account Header */}
                <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FFFFFF', border: '2px solid #D6E5BA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      <img src="images/TheLadduStory_Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = '👤'; }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#187A90', letterSpacing: '0.5px' }}>
                        CUSTOMER ACCOUNT (PRIMARY ID: MOBILE)
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0F5869', margin: '2px 0 4px' }}>
                        Namaste, {customerUser.name}! 🙏
                      </h2>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        📞 +91 {customerUser.phone} {customerUser.address ? `• 📍 ${customerUser.address}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      id="track-place-order-btn"
                      onClick={() => setActiveTab('store')}
                      style={{ background: '#187A90', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      + Place New Order
                    </button>
                    <button
                      id="track-switch-user-btn"
                      onClick={handleCustomerLogout}
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '9px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}
                    >
                      Switch User
                    </button>
                  </div>
                </div>

                {/* ACTIVE IN-PROGRESS ORDERS */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F5869', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🟡 Open / In-Progress Orders ({activeOrders.length})
                  </h3>

                  {activeOrders.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', textAlign: 'center', border: '1px solid #E2E8F0', color: '#64748B' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🥣</div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#0F5869' }}>No active orders in progress right now.</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Order fresh artisanal laddus anytime!</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {activeOrders.map(o => {
                        const stepIndex = getStatusStepIndex(o.status);
                        return (
                          <div key={o.orderId} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <span style={{ fontWeight: '800', color: '#0F5869', fontSize: '1.1rem' }}>{o.orderId}</span>
                                <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '10px' }}>{o.time}</span>
                              </div>
                              <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                                ⏳ {o.status}
                              </span>
                            </div>

                            {/* Live Step Progress Indicator */}
                            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #F1F5F9' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', textAlign: 'center', gap: '6px' }}>
                                {[
                                  { label: 'Received', step: 1 },
                                  { label: 'Preparing in Cow Ghee', step: 2 },
                                  { label: 'Box Packed', step: 3 },
                                  { label: 'Out for Delivery', step: 4 },
                                  { label: 'Delivered', step: 5 }
                                ].map(s => {
                                  const isDone = stepIndex >= s.step;
                                  return (
                                    <div key={s.step}>
                                      <div style={{ 
                                        width: '28px', 
                                        height: '28px', 
                                        borderRadius: '50%', 
                                        background: isDone ? '#187A90' : '#E2E8F0', 
                                        color: isDone ? '#fff' : '#64748B', 
                                        margin: '0 auto 6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: '800'
                                      }}>
                                        {isDone ? '✓' : s.step}
                                      </div>
                                      <div style={{ fontSize: '0.7rem', fontWeight: isDone ? '800' : '600', color: isDone ? '#0F5869' : '#94A3B8' }}>
                                        {s.label}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Items List */}
                            <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '12px' }}>
                              {o.items.map((it, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                                  <span>{it.qty}x {it.name} ({it.cleanWeight || it.packLabel})</span>
                                  <b>₹{it.unitPrice * it.qty}</b>
                                </div>
                              ))}
                              <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0F5869' }}>
                                <span>Total Paid (UPI):</span>
                                <span>₹{o.total}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                                📍 Delivery To: <b>{o.address}</b>
                              </div>
                              <a
                                href={`https://wa.me/919343207515?text=${encodeURIComponent(`Hi The Laddu Story, checking status for my order ${o.orderId} for ${customerUser.name}`)}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ background: '#25D366', color: '#fff', textDecoration: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                💬 WhatsApp Bakery
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* COMPLETED ORDER HISTORY */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F5869', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🟢 Completed Order History ({pastOrders.length})
                  </h3>

                  {pastOrders.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #E2E8F0', color: '#94A3B8', fontSize: '0.85rem' }}>
                      Completed past orders will be archived here.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {pastOrders.map(o => (
                        <div key={o.orderId} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                              <b style={{ color: '#0F5869', fontSize: '0.95rem' }}>{o.orderId}</b>
                              <span style={{ fontSize: '0.75rem', color: '#64748B', marginLeft: '8px' }}>{o.time}</span>
                            </div>
                            <span style={{ background: '#DEF7EC', color: '#03543F', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                              ✓ DELIVERED
                            </span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '10px' }}>
                            {o.items.map(it => `${it.qty}x ${it.name} (${it.cleanWeight || it.packLabel})`).join(', ')} • <b>₹{o.total}</b>
                          </div>
                          <button
                            onClick={() => reorderPastItems(o)}
                            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', color: '#0F5869', cursor: 'pointer' }}
                          >
                            🔄 Reorder in 1 Click
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* If Not Logged In: Customer Login Screen */
              <div style={{ background: '#fff', borderRadius: '20px', padding: '36px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFFFFF', border: '2.5px solid #D6E5BA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  <img src="images/TheLadduStory_Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = '👤'; }} />
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0F5869', margin: '0 0 8px' }}>
                  Customer Sign-In & Live Order Tracker
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#64748B', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                  Enter your 10-digit mobile number to view active preparation status, live delivery updates, and past orders history.
                </p>

                <form onSubmit={handleCustomerLogin} style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                      10-DIGIT MOBILE NUMBER (PRIMARY ID) *
                    </label>
                    <input
                      id="customer-login-phone-input"
                      type="tel"
                      placeholder="e.g. 9343207515 or 9686412342"
                      value={loginPhoneInput}
                      onChange={e => setLoginPhoneInput(e.target.value)}
                      required
                      style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem', fontWeight: '700' }}
                    />
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#475569', marginBottom: '6px' }}>
                      YOUR NAME (OPTIONAL IF RETURNING CUSTOMER)
                    </label>
                    <input
                      id="customer-login-name-input"
                      type="text"
                      placeholder="Automatically recognized from phone"
                      value={loginNameInput}
                      onChange={e => setLoginNameInput(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                    />
                    <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                      💡 If you've placed an order before, your name is automatically retrieved from the OMS database!
                    </div>
                  </div>

                  <button
                    id="customer-login-submit-btn"
                    type="submit"
                    style={{ width: '100%', background: '#187A90', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(24, 122, 144, 0.3)' }}
                  >
                    View My Orders & History →
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: STAFF ADMIN OMS DASHBOARD & INVENTORY MANAGER         */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'admin' && (
          <div>
            {/* Staff Sub-Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px', background: '#fff', padding: '14px 20px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setAdminSection('orders')}
                  style={{
                    background: adminSection === 'orders' ? '#0F5869' : '#F1F5F9',
                    color: adminSection === 'orders' ? '#fff' : '#475569',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  📋 Orders & Kitchen Stream ({orders.length})
                </button>
                <button
                  onClick={() => setAdminSection('inventory')}
                  style={{
                    background: adminSection === 'inventory' ? '#0F5869' : '#F1F5F9',
                    color: adminSection === 'inventory' ? '#fff' : '#475569',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer'
                  }}
                >
                  📦 Inventory & Menu Catalog ({products.length})
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleResetToMaster}
                  title="Reload Master Orders & Catalog"
                  style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', padding: '8px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  🔄 Sync Master OMS
                </button>
                <button
                  onClick={() => setIsAdminLoggedIn(false)}
                  style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* SUB-VIEW A: ORDERS & KITCHEN DISPATCH */}
            {adminSection === 'orders' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F5869', margin: 0 }}>
                      Kitchen & Delivery Order Manager
                    </h2>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Real-time Kitchen Orders Stream • Changes sync across customer devices instantly
                    </div>
                  </div>

                  <input
                    id="staff-search-input"
                    type="text"
                    placeholder="Search by Phone / Name / Order ID..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', width: '280px', fontWeight: '600' }}
                  />
                </div>

                {/* Status Quick Filter Chips */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['ALL', 'RECEIVED', 'PREPARING', 'PACKED', 'OUT FOR DELIVERY', 'DELIVERED'].map(st => {
                    const count = st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length;
                    const isSelected = filterStatus === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #0F5869' : '1px solid #CBD5E1',
                          background: isSelected ? '#0F5869' : '#fff',
                          color: isSelected ? '#fff' : '#475569',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {st} ({count})
                      </button>
                    );
                  })}
                </div>

                {/* Orders Cards Grid */}
                {filteredOrders.length === 0 ? (
                  <div style={{ background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center', border: '1px solid #E2E8F0', color: '#64748B' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                    <div style={{ fontWeight: '700' }}>No orders found matching "{searchQuery}".</div>
                    <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Try searching by phone number (e.g. 9343207515), customer name, or order ID.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
                    {filteredOrders.map(o => (
                      <div key={o.orderId} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: '800', color: '#0F5869', fontSize: '0.95rem' }}>{o.orderId}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.time}</span>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#1E293B' }}>{o.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#187A90', fontWeight: '700', marginTop: '2px' }}>
                            📞 +91 {o.phone}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                            📍 {o.address}
                          </div>
                        </div>

                        <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #F1F5F9' }}>
                          {o.items.map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                              <span>{it.qty}x {it.name} ({it.cleanWeight || it.packLabel})</span>
                              <b>₹{it.unitPrice * it.qty}</b>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px dashed #CBD5E1', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.92rem', color: '#0F5869' }}>
                            <span>Total Paid ({o.paymentMethod || 'UPI'}):</span>
                            <span>₹{o.total}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>STATUS:</span>
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.orderId, e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '800', background: '#F1F5F9', color: '#0F5869', cursor: 'pointer' }}
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
                )}
              </div>
            )}

            {/* SUB-VIEW B: INVENTORY & MENU CATALOG MANAGER */}
            {adminSection === 'inventory' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0F5869', margin: 0 }}>
                      Inventory, Pricing & MOQ Manager
                    </h2>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Update minimum order quantities, stock status, variations, and images across the live store.
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    style={{ background: '#0F5869', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    + Add New Item / Variation
                  </button>
                </div>

                {/* Product Inventory Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {products.map(p => (
                    <div key={p.sku} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column' }}>
                      
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                        <img 
                          src={p.image} 
                          alt={p.name} 
                          style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover' }}
                          onError={(e) => { e.target.src = 'images/TheLadduStory_Logo.jpg'; }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '800', fontSize: '1rem', color: '#0F5869' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '700' }}>SKU: {p.sku}</div>
                          <span style={{ 
                            display: 'inline-block',
                            marginTop: '4px',
                            background: p.stockStatus === 'IN_STOCK' ? '#DEF7EC' : (p.stockStatus === 'LOW_STOCK' ? '#FEF3C7' : '#FEE2E2'),
                            color: p.stockStatus === 'IN_STOCK' ? '#03543F' : (p.stockStatus === 'LOW_STOCK' ? '#92400E' : '#991B1B'),
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: '800'
                          }}>
                            {p.stockStatus || 'IN_STOCK'}
                          </span>
                        </div>
                      </div>

                      <div style={{ background: '#F8FAFC', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Min Order Qty (MOQ):</span>
                          <b>{p.moq || '500g'}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Rate per Kg:</span>
                          <b>₹{p.ratePerKg}</b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Options:</span>
                          <b>{p.opt1} | {p.opt2}</b>
                        </div>
                      </div>

                      <button
                        onClick={() => setEditingProduct(p)}
                        style={{ marginTop: 'auto', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', color: '#0F5869', cursor: 'pointer' }}
                      >
                        ✏️ Edit Price, MOQ & Stock
                      </button>

                    </div>
                  ))}
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE STICKY FLOATING CART BAR (NON-INTRUSIVE)              */}
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
            View Cart & Pay →
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MOBILE CART MODAL / BOTTOM SHEET                              */}
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
              boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
              paddingBottom: '20px'
            }}
            onClick={e => e.stopPropagation()}
          >
            {renderCartContent()}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT PRODUCT INVENTORY / MOQ                           */}
      {/* ------------------------------------------------------------- */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.25rem', color: '#0F5869', fontWeight: '800' }}>
              Edit Product: {editingProduct.name}
            </h3>

            <form onSubmit={handleSaveProductEdit}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  ITEM NAME
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    MIN ORDER QTY (MOQ)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.moq || '500g'}
                    onChange={e => setEditingProduct({ ...editingProduct, moq: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    STOCK STATUS
                  </label>
                  <select
                    value={editingProduct.stockStatus || 'IN_STOCK'}
                    onChange={e => setEditingProduct({ ...editingProduct, stockStatus: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem', fontWeight: '700' }}
                  >
                    <option value="IN_STOCK">IN STOCK</option>
                    <option value="LOW_STOCK">LOW STOCK</option>
                    <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    500g / OPT 1 PRICE (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.p500}
                    onChange={e => {
                      const p = Number(e.target.value);
                      setEditingProduct({ 
                        ...editingProduct, 
                        p500: p,
                        opt1: `${editingProduct.w1} (₹${p})`
                      });
                    }}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    1 Kg / OPT 2 PRICE (₹)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.p1k}
                    onChange={e => {
                      const p = Number(e.target.value);
                      setEditingProduct({ 
                        ...editingProduct, 
                        p1k: p,
                        opt2: `${editingProduct.w2} (₹${p})`
                      });
                    }}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  IMAGE PATH OR URL
                </label>
                <input
                  type="text"
                  value={editingProduct.image}
                  onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#0F5869', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save & Update Store
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD NEW PRODUCT / VARIATION                            */}
      {/* ------------------------------------------------------------- */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: '1.25rem', color: '#0F5869', fontWeight: '800' }}>
              Add New Product or Variation
            </h3>

            <form onSubmit={handleCreateProduct}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  SKU CODE (e.g. BESAN-ALMOND) *
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.sku}
                  onChange={e => setNewProductForm({ ...newProductForm, sku: e.target.value.toUpperCase().replace(/\s+/g, '-') })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  PRODUCT NAME *
                </label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={e => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    MIN ORDER QTY
                  </label>
                  <input
                    type="text"
                    value={newProductForm.moq}
                    onChange={e => setNewProductForm({ ...newProductForm, moq: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    RATE PER KG (₹)
                  </label>
                  <input
                    type="number"
                    value={newProductForm.ratePerKg}
                    onChange={e => setNewProductForm({ ...newProductForm, ratePerKg: Number(e.target.value) })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    500g PRICE (₹)
                  </label>
                  <input
                    type="number"
                    value={newProductForm.p500}
                    onChange={e => setNewProductForm({ ...newProductForm, p500: Number(e.target.value), opt1: `500g (₹${e.target.value})` })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                    1 KG PRICE (₹)
                  </label>
                  <input
                    type="number"
                    value={newProductForm.p1k}
                    onChange={e => setNewProductForm({ ...newProductForm, p1k: Number(e.target.value), opt2: `1 Kg (₹${e.target.value})` })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  IMAGE PATH / URL
                </label>
                <input
                  type="text"
                  value={newProductForm.image}
                  onChange={e => setNewProductForm({ ...newProductForm, image: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="submit"
                  style={{ flex: 1, background: '#0F5869', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Create Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CUSTOMER SIGN-IN POPUP                                  */}
      {/* ------------------------------------------------------------- */}
      {showCustomerLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '380px', width: '100%' }}>
            
            <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#FFFFFF', border: '2px solid #D6E5BA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <img src="images/TheLadduStory_Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = '👤'; }} />
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#0F5869', fontWeight: '800', textAlign: 'center' }}>
              Customer Sign-In
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748B', textAlign: 'center' }}>
              Enter your mobile number to track orders and fast-track checkout.
            </p>
            
            <form onSubmit={handleCustomerLogin}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  10-DIGIT MOBILE NUMBER *
                </label>
                <input
                  id="modal-customer-phone-input"
                  type="tel"
                  placeholder="e.g. 9343207515"
                  value={loginPhoneInput}
                  onChange={e => setLoginPhoneInput(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '11px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.95rem', fontWeight: '700' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '800', color: '#475569', marginBottom: '4px' }}>
                  NAME (OPTIONAL)
                </label>
                <input
                  id="modal-customer-name-input"
                  type="text"
                  placeholder="Auto-recognized if returning"
                  value={loginNameInput}
                  onChange={e => setLoginNameInput(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  id="modal-customer-submit-btn"
                  type="submit"
                  style={{ flex: 1, background: '#187A90', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Sign In
                </button>
                <button
                  id="modal-customer-cancel-btn"
                  type="button"
                  onClick={() => setShowCustomerLoginModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ORDER SUCCESS & UPI SCANNER                            */}
      {/* ------------------------------------------------------------- */}
      {orderSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '30px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#DEF7EC', color: '#03543F', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              ✓
            </div>

            <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', color: '#0F5869', fontWeight: '800' }}>
              Order Placed Successfully!
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '14px' }}>
              Order ID: <b style={{ color: '#0F5869' }}>{orderSuccess.orderId}</b>
            </div>

            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0', textAlign: 'left', fontSize: '0.85rem' }}>
              <div>👤 <b>{orderSuccess.name}</b> (+91 {orderSuccess.phone})</div>
              <div style={{ color: '#64748B', marginTop: '4px' }}>📍 {orderSuccess.address}</div>
              <div style={{ marginTop: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#0F5869' }}>
                <span>Total Amount:</span>
                <span>₹{orderSuccess.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* UPI QR Code */}
            {qrDataUrl && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F5869', marginBottom: '8px' }}>
                  SCAN & PAY VIA ANY UPI APP (GPAY / PHONEPE / PAYTM)
                </div>
                <img 
                  src={qrDataUrl} 
                  alt="UPI QR Code" 
                  style={{ width: '190px', height: '190px', border: '2px solid #CBD5E1', borderRadius: '12px' }}
                />
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '6px' }}>
                  UPI ID: <b>9343207515@okbizaxis</b>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setActiveTab('track');
                }}
                style={{ flex: 1, background: '#187A90', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Track Live Order →
              </button>
              <button
                onClick={() => setOrderSuccess(null)}
                style={{ background: '#F1F5F9', border: 'none', padding: '12px 18px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: STAFF ADMIN LOGIN                                      */}
      {/* ------------------------------------------------------------- */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', maxWidth: '360px', width: '100%', textAlign: 'center' }}>
            
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', color: '#0F5869', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              🔒
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#0F5869', fontWeight: '800' }}>
              Staff & Kitchen Login
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.82rem', color: '#64748B' }}>
              Enter 4-digit Staff PIN to manage kitchen dispatch & inventory.
            </p>

            <form onSubmit={handleAdminLogin}>
              <input
                id="staff-pin-input"
                type="password"
                placeholder="Staff PIN (1234)"
                value={adminPinInput}
                onChange={e => setAdminPinInput(e.target.value)}
                maxLength={4}
                required
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', textAlign: 'center', fontSize: '1.3rem', letterSpacing: '6px', fontWeight: '800', marginBottom: '16px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  id="staff-pin-submit-btn"
                  type="submit"
                  style={{ flex: 1, background: '#0F5869', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                >
                  Verify PIN
                </button>
                <button
                  id="staff-pin-cancel-btn"
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

    </div>
  );
}
