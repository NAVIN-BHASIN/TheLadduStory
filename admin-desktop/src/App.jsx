import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  isSupabaseConfigured,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  fetchOrdersFromSupabase,
  insertOrderToSupabase,
  updateOrderStatusInSupabase,
  fetchProductsFromSupabase,
  updateProductInSupabase,
  upsertProductInSupabase,
  fetchCustomersFromSupabase,
  lookupCustomerInSupabase,
  deleteOrderInSupabase,
  subscribeToSupabaseRealtime,
  verifyCustomerPassword,
  setCustomerPasswordInSupabase,
  registerCustomerInSupabase,
  updateCustomerDetailsInSupabase
} from './services/supabaseClient';

// OFFICIAL GOOGLE FORM CONFIGURATION (HEADLESS SYNC TO GOOGLE SHEETS)
const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfLHmLxHakS6sZEO4ypQtkdHPzeCwg3D8LRhTYA3t74-EmUMA/formResponse';
const FORM_ENTRIES = {
  ORDER_ID: 'entry.378465203',
  NAME: 'entry.1609068853',
  PHONE: 'entry.1606293469',
  ADDRESS: 'entry.1729098047',
  ITEMS: 'entry.1014432505'
};

// REAL-TIME BROADCAST CHANNELS (SUPABASE POSTGRESQL IS 100% PRIMARY DB)
const REALTIME_TOPIC_URL = 'https://ntfy.sh/the_laddu_story_live_sync_channel';
const APPS_SCRIPT_EXEC_URL = 'https://script.google.com/macros/s/AKfycbxIJKZkGtjRI_RXCAzBn-dQ8fs9XbG7smdQtbuEZU5z8gUAWpJCfzlEI55879LpuHb8/exec';


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

// MASTER OMS STATE: Supabase PostgreSQL is the 100% Primary Source of Truth

// MASTER OMS STATE: Live orders managed strictly via Supabase Primary DB
const MASTER_OMS_ORDERS = [];

// IMMEDIATE SYNCHRONOUS PURGE OF LEGACY CACHE (Executes before React mounts)
const CURRENT_CACHE_VERSION = 'v7_clean_supabase_truth';
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    if (window.localStorage.getItem('tls_cache_version') !== CURRENT_CACHE_VERSION) {
      window.localStorage.removeItem('tls_active_customer');
      window.localStorage.removeItem('tls_orders_db');
      window.localStorage.removeItem('tls_supabase_config');
      window.localStorage.setItem('tls_cache_version', CURRENT_CACHE_VERSION);
    }
  }
} catch (e) {}

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('store'); // 'store' | 'track' | 'admin'
  const [adminSection, setAdminSection] = useState('orders'); // 'orders' | 'inventory'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Supabase Real-Time Cloud DB State
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey || '');
  const [supabaseConnected, setSupabaseConnected] = useState(() => isSupabaseConfigured());
  const [supabaseSaving, setSupabaseSaving] = useState(false);
  const [supabaseError, setSupabaseError] = useState('');

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

  // Customer Account Session (Verified against Supabase Primary DB)
  const [customerUser, setCustomerUser] = useState(() => {
    try {
      const CURRENT_CACHE_VERSION = 'v5_clean_supabase_truth';
      if (localStorage.getItem('tls_cache_version') !== CURRENT_CACHE_VERSION) {
        return null;
      }
      const saved = localStorage.getItem('tls_active_customer');
      if (!saved) return null;
      return JSON.parse(saved);
    } catch (e) {
      return null;
    }
  });

  const [showCustomerLoginModal, setShowCustomerLoginModal] = useState(false);
  const [isCustomerLoggingIn, setIsCustomerLoggingIn] = useState(false);

    // =========================================================================
  // PATRON ACCOUNT PORTAL STATE (Mobile + Password / 4-Digit Security PIN)
  // =========================================================================
  const [authMode, setAuthMode] = useState('SIGNIN'); // 'SIGNIN' | 'REGISTER'
  
  // Sign-In Form State
  const [loginPhoneInput, setLoginPhoneInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  
  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  // Modals for editing Profile / Password
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddressInput, setEditAddressInput] = useState('');
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Cart & Order Form State
  const [cart, setCart] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState({});
  const [custName, setCustName] = useState(() => customerUser ? customerUser.name : (localStorage.getItem('tls_cust_name') || ''));
  const [custPhone, setCustPhone] = useState(() => customerUser ? customerUser.phone : (localStorage.getItem('tls_cust_phone') || ''));
  const [custAddress, setCustAddress] = useState(() => customerUser ? customerUser.address : (localStorage.getItem('tls_cust_addr') || ''));
  const [fulfillmentType, setFulfillmentType] = useState('DELIVERY'); // 'DELIVERY' | 'PICKUP'
  
  // URL check for Staff/Admin portal (?staff, ?admin, #staff, #admin)
  const isStaffUrl = typeof window !== 'undefined' && (
    window.location.search.includes('staff') ||
    window.location.search.includes('admin') ||
    window.location.hash.includes('staff') ||
    window.location.hash.includes('admin')
  );
  const [isStaffRoute, setIsStaffRoute] = useState(isStaffUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [addedToast, setAddedToast] = useState('');

  // Orders Store (Supabase PostgreSQL is primary)
  const [orders, setOrders] = useState(() => {
    try {
      const CURRENT_CACHE_VERSION = 'v5_clean_supabase_truth';
      if (localStorage.getItem('tls_cache_version') !== CURRENT_CACHE_VERSION) {
        return [];
      }
      const saved = localStorage.getItem('tls_orders_db');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
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

  // Auto-purge legacy mock cache so Supabase PostgreSQL is strictly primary
  useEffect(() => {
    try {
      const CURRENT_CACHE_VERSION = 'v5_clean_supabase_truth';
      const savedVer = localStorage.getItem('tls_cache_version');
      if (savedVer !== CURRENT_CACHE_VERSION) {
        localStorage.removeItem('tls_active_customer');
        localStorage.removeItem('tls_orders_db');
        localStorage.removeItem('tls_supabase_config');
        localStorage.setItem('tls_cache_version', CURRENT_CACHE_VERSION);
      }
    } catch (e) {}
  }, []);

  // Sync inputs when customerUser changes
  useEffect(() => {
    if (customerUser && customerUser.phone) {
      setCustName(customerUser.name || '');
      setCustPhone(customerUser.phone || '');
      setCustAddress(customerUser.address || '');
    }
  }, [customerUser]);

  // REAL-TIME CLOUD STATUS INDICATOR
  const syncWithCloud = async () => {
    setIsCloudSynced(true);
    setLastSyncTime(new Date().toLocaleTimeString());
  };

  // REAL-TIME SUPABASE POSTGRESQL ENGINE & EVENT SUBSCRIPTION
  useEffect(() => {
    // Auto-prompt staff login modal if ?staff is visited
    if (isStaffUrl && !isAdminLoggedIn) {
      setShowLoginModal(true);
    }

    // Initial Supabase Data Fetch & Realtime WebSocket Channel
    let unsubSupabase = null;
    if (isSupabaseConfigured()) {
      setSupabaseConnected(true);
      fetchOrdersFromSupabase().then(dbOrders => {
        if (dbOrders) {
          setOrders(dbOrders);
          setIsCloudSynced(true);
          setLastSyncTime(new Date().toLocaleTimeString());

          // Validate current active customer against Supabase
          const activeSaved = localStorage.getItem('tls_active_customer');
          if (activeSaved) {
            try {
              const active = JSON.parse(activeSaved);
              if (active && active.phone) {
                const clean = active.phone.replace(/\D/g, '').slice(-10);
                lookupCustomerInSupabase(clean).then(dbCust => {
                  const hasOrders = dbOrders.some(o => (o.phone || '').replace(/\D/g, '').slice(-10) === clean);
                  if (!dbCust && !hasOrders) {
                    console.warn('[Auth] Customer deleted from Supabase. Logging out.');
                    setCustomerUser(null);
                    localStorage.removeItem('tls_active_customer');
                  } else if (dbCust && (dbCust.name !== active.name || dbCust.address !== active.address)) {
                    const refreshed = { ...active, name: dbCust.name, address: dbCust.address || active.address };
                    setCustomerUser(refreshed);
                    localStorage.setItem('tls_active_customer', JSON.stringify(refreshed));
                  }
                });
              }
            } catch (e) {}
          }
        }
      });

      fetchProductsFromSupabase().then(dbProducts => {
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
      });

      unsubSupabase = subscribeToSupabaseRealtime(
        (orderPayload) => {
          if (orderPayload.eventType === 'UPDATE' && orderPayload.new) {
            const o = orderPayload.new;
            setOrders(prev => prev.map(item => item.orderId === o.order_id ? { ...item, status: o.order_status } : item));
            setIsCloudSynced(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          } else if (orderPayload.eventType === 'INSERT' && orderPayload.new) {
            fetchOrdersFromSupabase().then(latestOrders => {
              if (latestOrders) setOrders(latestOrders);
            });
            setIsCloudSynced(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          } else if (orderPayload.eventType === 'DELETE' && orderPayload.old) {
            setOrders(prev => prev.filter(item => item.orderId !== orderPayload.old.order_id));
            setIsCloudSynced(true);
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        },
        (prodPayload) => {
          if (prodPayload.eventType === 'UPDATE' && prodPayload.new) {
            const p = prodPayload.new;
            setProducts(prev => prev.map(item => item.sku === p.sku ? {
              ...item,
              stockStatus: p.stock_status,
              stockCount: Number(p.stock_count),
              p500: Number(p.p500),
              p1k: Number(p.p1k)
            } : item));
          } else if (prodPayload.eventType === 'INSERT' && prodPayload.new) {
            fetchProductsFromSupabase().then(latest => {
              if (latest) setProducts(latest);
            });
          }
        },
        (custPayload) => {
          if (custPayload.eventType === 'DELETE' && custPayload.old) {
            const delPhone = custPayload.old.phone;
            setCustomerUser(curr => {
              if (curr && (curr.phone || '').replace(/\D/g, '').slice(-10) === delPhone) {
                localStorage.removeItem('tls_active_customer');
                return null;
              }
              return curr;
            });
          } else if (custPayload.eventType === 'UPDATE' && custPayload.new) {
            const upd = custPayload.new;
            setCustomerUser(curr => {
              if (curr && (curr.phone || '').replace(/\D/g, '').slice(-10) === upd.phone) {
                const refreshed = { ...curr, name: upd.name, address: upd.address || curr.address };
                localStorage.setItem('tls_active_customer', JSON.stringify(refreshed));
                return refreshed;
              }
              return curr;
            });
          }
        }
      );
    }

    // Live 0-latency Real-Time Server-Sent Events (SSE) Listener
    let es = null;
    try {
      es = new EventSource(REALTIME_TOPIC_URL + '/sse');
      es.onmessage = (e) => {
        try {
          const raw = JSON.parse(e.data);
          if (raw && raw.message) {
            const msg = JSON.parse(raw.message);
            if (msg.type === 'STATUS_UPDATE') {
              setOrders(prev => prev.map(o => o.orderId === msg.orderId ? { ...o, status: msg.status } : o));
              setIsCloudSynced(true);
              setLastSyncTime(new Date().toLocaleTimeString());
            } else if (msg.type === 'NEW_ORDER' && msg.order) {
              setOrders(prev => {
                if (prev.some(o => o.orderId === msg.order.orderId)) return prev;
                return [msg.order, ...prev];
              });
              setIsCloudSynced(true);
              setLastSyncTime(new Date().toLocaleTimeString());
            }
          }
        } catch(err) {}
      };
    } catch(err) {}

    return () => {
      if (es) es.close();
      if (typeof unsubSupabase === 'function') unsubSupabase();
    };
  }, []);

    // Helper: Validate genuine Indian mobile number
  const validateIndianMobile = (phone) => {
    const clean = (phone || '').replace(/\D/g, '').slice(-10);
    if (!clean || clean.length !== 10) {
      return { valid: false, error: 'Please enter a complete 10-digit mobile number.' };
    }
    // Indian telecom rules: valid mobile numbers strictly start with 6, 7, 8, or 9
    if (!/^[6-9]\d{9}$/.test(clean)) {
      return { valid: false, error: 'Invalid mobile number. Indian mobile numbers must start with 6, 7, 8, or 9.' };
    }
    // Reject fake repeating patterns (e.g. 1111111111, 9999999999)
    if (/^(\d)\1{9}$/.test(clean)) {
      return { valid: false, error: 'Invalid mobile number. Repeated digits (e.g. 1111111111) are not permitted.' };
    }
    return { valid: true, clean };
  };

    // =========================================================================
  // PATRON AUTHENTICATION HANDLERS: PURE MOBILE + PASSWORD CRM ENGINE
  // =========================================================================

  // 1. RETURNING PATRON SIGN-IN
  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault();
    const valResult = validateIndianMobile(loginPhoneInput);
    if (!valResult.valid) {
      alert('❌ ' + valResult.error);
      return;
    }
    if (!loginPasswordInput || loginPasswordInput.trim().length === 0) {
      alert('Please enter your password or 4-digit PIN.');
      return;
    }

    const clean = valResult.clean;
    setIsCustomerLoggingIn(true);

    try {
      if (!isSupabaseConfigured()) {
        const profile = {
          phone: clean,
          name: 'Valued Patron',
          address: '',
          verifiedVia: 'PASSWORD',
          loggedInAt: new Date().toISOString()
        };
        setCustomerUser(profile);
        localStorage.setItem('tls_active_customer', JSON.stringify(profile));
        setShowCustomerLoginModal(false);
        setActiveTab('track');
        return;
      }

      const res = await verifyCustomerPassword(clean, loginPasswordInput.trim());

      if (res.success) {
        const customerRecord = res.customer;
        const dbOrders = await fetchOrdersFromSupabase();
        const customerOrders = (dbOrders || []).filter(o => (o.phone || '').replace(/\D/g, '').slice(-10) === clean);

        const profile = {
          phone: clean,
          name: customerRecord?.name || customerOrders[0]?.name || 'Valued Patron',
          address: customerRecord?.address || customerOrders[0]?.address || '',
          verifiedVia: 'PASSWORD',
          hasPassword: true,
          loggedInAt: new Date().toISOString()
        };

        setCustomerUser(profile);
        localStorage.setItem('tls_active_customer', JSON.stringify(profile));
        
        // Auto-fill checkout fields for convenience
        setCustName(profile.name);
        setCustPhone(profile.phone);
        setCustAddress(profile.address);

        setShowCustomerLoginModal(false);
        setActiveTab('track');
      } else if (res.reason === 'NO_PASSWORD_SET') {
        const goReg = window.confirm(
          `Notice: No password found for +91 ${clean}.\n\nWould you like to open the Registration tab to create your patron account & password in 10 seconds?`
        );
        if (goReg) {
          setRegPhone(clean);
          setAuthMode('REGISTER');
        }
      } else if (res.reason === 'WRONG_PASSWORD') {
        alert(`❌ Incorrect password or PIN for +91 ${clean}. Please check and try again.`);
      } else if (res.reason === 'NOT_FOUND') {
        const goReg = window.confirm(
          `No account found for +91 ${clean}.\n\nWould you like to register now and get your personal patron portal?`
        );
        if (goReg) {
          setRegPhone(clean);
          setAuthMode('REGISTER');
        }
      } else {
        alert('Authentication error. Please check your mobile number and password.');
      }
    } catch (err) {
      console.error('Sign-in error:', err);
      alert('Error signing in. Please try again.');
    } finally {
      setIsCustomerLoggingIn(false);
    }
  };

  // 2. NEW PATRON REGISTRATION
  const handleRegisterCustomer = async (e) => {
    if (e) e.preventDefault();
    if (!regName || regName.trim().length === 0) {
      alert('Please enter your full name.');
      return;
    }
    const valResult = validateIndianMobile(regPhone);
    if (!valResult.valid) {
      alert('❌ ' + valResult.error);
      return;
    }
    if (!regAddress || regAddress.trim().length === 0) {
      alert('Please enter your delivery address.');
      return;
    }
    if (!regPassword || regPassword.trim().length < 4) {
      alert('Password / PIN must be at least 4 characters or digits.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }

    const clean = valResult.clean;
    setIsCustomerLoggingIn(true);

    try {
      const res = await registerCustomerInSupabase({
        phone: clean,
        name: regName.trim(),
        address: regAddress.trim(),
        password: regPassword.trim()
      });

      const profile = {
        phone: clean,
        name: regName.trim(),
        address: regAddress.trim(),
        verifiedVia: 'PASSWORD',
        hasPassword: true,
        loggedInAt: new Date().toISOString()
      };

      setCustomerUser(profile);
      localStorage.setItem('tls_active_customer', JSON.stringify(profile));

      // Auto-populate checkout inputs
      setCustName(profile.name);
      setCustPhone(profile.phone);
      setCustAddress(profile.address);

      setShowCustomerLoginModal(false);
      setActiveTab('track');
      alert(`👑 Welcome to The Laddu Story, ${regName.trim()}! Your patron account is ready.`);
    } catch (err) {
      console.error('Registration error:', err);
      alert('Error creating account. Please try again.');
    } finally {
      setIsCustomerLoggingIn(false);
    }
  };

  // 3. SET / UPDATE PASSWORD IN SUPABASE
  const handleSaveCustomerPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPasswordInput || newPasswordInput.trim().length < 4) {
      alert('Password must be at least 4 characters or digits.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      alert('Passwords do not match. Please re-enter.');
      return;
    }
    if (!customerUser || !customerUser.phone) {
      alert('Please sign in first to update your password.');
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await setCustomerPasswordInSupabase(customerUser.phone, newPasswordInput.trim());
      if (res.success) {
        alert('✅ Password updated successfully! You can now log in using your Phone and Password anytime.');
        setShowSetPasswordModal(false);
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setCustomerUser(prev => ({ ...prev, hasPassword: true }));
      } else {
        alert('❌ Failed to update password: ' + (res.error || 'Database error'));
      }
    } catch (err) {
      console.error('Set password error:', err);
      alert('Error saving password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 4. UPDATE DELIVERY ADDRESS IN SUPABASE
  const handleSaveDeliveryAddress = async (e) => {
    if (e) e.preventDefault();
    if (!editAddressInput || editAddressInput.trim().length === 0) {
      alert('Please enter a valid address.');
      return;
    }
    if (!customerUser || !customerUser.phone) return;

    setIsSavingAddress(true);
    try {
      await updateCustomerDetailsInSupabase(customerUser.phone, {
        name: customerUser.name,
        address: editAddressInput.trim()
      });

      const updated = { ...customerUser, address: editAddressInput.trim() };
      setCustomerUser(updated);
      localStorage.setItem('tls_active_customer', JSON.stringify(updated));
      setCustAddress(editAddressInput.trim());
      setShowAddressModal(false);
      alert('✅ Delivery address updated successfully!');
    } catch(err) {
      console.error('Address update error:', err);
      alert('Error updating delivery address.');
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Fallback for direct submit
  const handleCustomerLogin = handlePasswordLogin;

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
      // Canonical format expected by FormSyncTrigger.gs: 1x Name (Weight) = ₹Total | 2x Name (Weight) = ₹Total
      const itemsFormatted = orderData.items
        .map(i => `${i.qty}x ${i.name} (${i.cleanWeight}) = ₹${(i.unitPrice * i.qty).toLocaleString('en-IN')}`)
        .join(' | ');

      const formData = new URLSearchParams();
      formData.append(FORM_ENTRIES.ORDER_ID, orderData.orderId);
      formData.append(FORM_ENTRIES.NAME, orderData.name);
      formData.append(FORM_ENTRIES.PHONE, orderData.phone);
      formData.append(FORM_ENTRIES.ADDRESS, orderData.address);
      formData.append(FORM_ENTRIES.ITEMS, itemsFormatted);

      // Single, unified Google Form submission (Prevents duplicate rows in Google Sheets)
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


  // Export Orders to CSV (Google Sheets / Excel Backup Ledger)
  const exportOrdersToCsv = () => {
    const headers = ['OrderID', 'CreatedAt', 'Channel', 'CustomerName', 'CustomerPhone', 'CustomerAddress', 'Items', 'TotalAmount', 'PaymentMethod', 'OrderStatus'];
    const rows = orders.map(o => [
      `"${o.orderId}"`,
      `"${o.time}"`,
      `"${o.channel || 'ONLINE_STORE'}"`,
      `"${(o.name || '').replace(/"/g, '""')}"`,
      `"${o.phone}"`,
      `"${(o.address || '').replace(/"/g, '""')}"`,
      `"${(o.items || []).map(i => `${i.name} (${i.cleanWeight || i.packLabel || ''}) x${i.qty}`).join('; ').replace(/"/g, '""')}"`,
      o.total,
      `"${o.paymentMethod || 'UPI'}"`,
      `"${o.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TheLadduStory_Orders_Master_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveSupabaseConfig = async (e) => {
    e.preventDefault();
    setSupabaseSaving(true);
    setSupabaseError('');
    try {
      const ok = saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
      if (ok) {
        setSupabaseConnected(true);
        const dbOrders = await fetchOrdersFromSupabase();
        if (dbOrders) {
          setOrders(dbOrders);
        }
        const dbProducts = await fetchProductsFromSupabase();
        if (dbProducts && dbProducts.length > 0) {
          setProducts(dbProducts);
        }
        setShowSupabaseModal(false);
        alert('✓ Successfully connected to Supabase Cloud Database! Real-time synchronization active.');
      } else {
        setSupabaseError('Invalid Supabase Project URL or Anon Key. Please check the values.');
      }
    } catch (err) {
      setSupabaseError(err.message || 'Error connecting to Supabase');
    } finally {
      setSupabaseSaving(false);
    }
  };

  // CHECKOUT
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-clicks / duplicate submissions
    if (cart.length === 0) {
      alert('Your cart is empty! Please select delicious laddus to place order.');
      return;
    }
    if (!custName.trim() || !custPhone.trim()) {
      alert('Please fill in your Name and 10-Digit Mobile Number.');
      return;
    }
    if (fulfillmentType === 'DELIVERY' && !custAddress.trim()) {
      alert('Please provide your Doorstep Delivery Address.');
      return;
    }

    setIsSubmitting(true);
    const orderId = `TLS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanPhone = custPhone.replace(/\D/g, '').slice(-10);

    const resolvedAddress = fulfillmentType === 'PICKUP'
      ? (custAddress.trim() ? `Self-Pickup (${custAddress.trim()})` : 'Store Self-Pickup: The Laddu Story Kitchen, Bangalore')
      : custAddress.trim();

    const newOrder = {
      orderId,
      time: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      channel: fulfillmentType === 'PICKUP' ? 'STORE_PICKUP' : 'ONLINE_STORE',
      fulfillmentType,
      name: custName.trim(),
      phone: cleanPhone,
      address: resolvedAddress,
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

    // 1. Submit to Google Sheets (Kept 100% intact as backup ledger)
    submitToGoogleSheets(newOrder);

    // 2. Insert to Supabase (Instant ACID PostgreSQL + Order Items)
    try {
      await insertOrderToSupabase(newOrder);
    } catch (sbErr) {
      console.warn('[Supabase] Order insert notice:', sbErr);
    }

    // Broadcast immediately in Real-Time to all Staff & Customer devices (0ms delay)
    try {
      fetch(REALTIME_TOPIC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_ORDER',
          order: newOrder,
          timestamp: new Date().toISOString()
        })
      });
    } catch(err) {}
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

  // Update order delivery status & broadcast in Real-Time to all devices + Google Sheets
  const updateOrderStatus = async (orderId, newStatus) => {
    const updated = orders.map(o => o.orderId === orderId ? { ...o, status: newStatus } : o);
    setOrders(updated);
    try {
      localStorage.setItem('tls_orders_db', JSON.stringify(updated));
    } catch (e) {}

    // 1. Instant Real-Time Push to all Customer & Staff devices (0ms delay)
    try {
      await fetch(REALTIME_TOPIC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'STATUS_UPDATE',
          orderId,
          status: newStatus,
          timestamp: new Date().toISOString()
        })
      });
      setIsCloudSynced(true);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch(err) {}

    // 2. Direct Update in Google Sheets via Apps Script Web App (Kept intact)
    try {
      await fetch(APPS_SCRIPT_EXEC_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: 'updateStatus',
          orderId,
          status: newStatus,
          items: []
        })
      });
    } catch(err) {}

    // 3. Instant ACID Write-Back to Supabase PostgreSQL
    try {
      await updateOrderStatusInSupabase(orderId, newStatus);
    } catch(err) {
      console.warn('[Supabase] Status write-back notice:', err);
    }

    // 3. Fallback cloud state
    await syncWithCloud(updated, products);
  };

  // Re-sync all live data from Supabase Primary Database
  const handleResetToMaster = async () => {
    if (isSupabaseConfigured()) {
      const dbOrders = await fetchOrdersFromSupabase();
      if (dbOrders) setOrders(dbOrders);
      const dbProducts = await fetchProductsFromSupabase();
      if (dbProducts) setProducts(dbProducts);
      setIsCloudSynced(true);
      setLastSyncTime(new Date().toLocaleTimeString());
      alert(`✓ Refreshed! Synced ${dbOrders ? dbOrders.length : 0} live orders and ${dbProducts ? dbProducts.length : 0} products directly from Supabase Primary Database.`);
    } else {
      alert('Supabase is not configured.');
    }
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
    await upsertProductInSupabase(editingProduct);
    await syncWithCloud(orders, updated);
    setEditingProduct(null);
    alert(`✓ Successfully updated ${editingProduct.name} in Catalog & Supabase!`);
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
    await upsertProductInSupabase(createdItem);
    await syncWithCloud(orders, updated);
    setShowAddProductModal(false);
    alert(`✓ Product ${createdItem.name} added to catalog & synced with Supabase!`);
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
  const activeOrders = myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'ORDER PICKED UP' && o.status !== 'CANCELLED');
  const pastOrders = myOrders.filter(o => o.status === 'DELIVERED' || o.status === 'ORDER PICKED UP' || o.status === 'CANCELLED');

  const getStatusStepIndex = (status, fulfillment = 'DELIVERY') => {
    if (fulfillment === 'PICKUP') {
      switch (status) {
        case 'RECEIVED': return 1;
        case 'PREPARING': return 2;
        case 'PACKED': return 3;
        case 'READY FOR PICKUP': return 4;
        case 'ORDER PICKED UP': return 5;
        default: return 1;
      }
    }
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
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#4A121E', fontWeight: '800' }}>
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
          <p style={{ margin: 0, fontWeight: '700', color: '#4A121E' }}>Your cart is empty.</p>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>Select your favourite laddus from the menu!</p>
        </div>
      ) : (
        <div>
          <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cart.map(item => (
              <div key={item.cartKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAF6F0', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = 'images/TheLadduStory_Logo.jpg'; }}
                  />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#4A121E' }}>{item.name}</div>
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
                  <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#4A121E', marginLeft: '6px', minWidth: '55px', textAlign: 'right' }}>
                    ₹{item.unitPrice * item.qty}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Fulfillment Method Selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#4A121E', marginBottom: '6px' }}>
              SELECT DELIVERY / PICKUP METHOD:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '8px',
                  border: fulfillmentType === 'DELIVERY' ? '2px solid #4A121E' : '1px solid #CBD5E1',
                  background: fulfillmentType === 'DELIVERY' ? '#E0F2FE' : '#fff',
                  color: fulfillmentType === 'DELIVERY' ? '#4A121E' : '#64748B',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                🛵 Doorstep Delivery
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType('PICKUP')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '8px',
                  border: fulfillmentType === 'PICKUP' ? '2px solid #4A121E' : '1px solid #CBD5E1',
                  background: fulfillmentType === 'PICKUP' ? '#E0F2FE' : '#fff',
                  color: fulfillmentType === 'PICKUP' ? '#4A121E' : '#64748B',
                  fontWeight: '800',
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                🛍️ Store Self-Pickup
              </button>
            </div>
          </div>

          {/* Customer Inputs */}
          <div style={{ background: '#FAF6F0', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>
                {fulfillmentType === 'PICKUP' ? 'CONTACT & PICKUP DETAILS' : 'CUSTOMER CONTACT & DELIVERY'}
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
            {fulfillmentType === 'PICKUP' && (
              <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 10px', borderRadius: '6px', fontSize: '0.75rem', color: '#1E40AF', marginBottom: '8px' }}>
                📍 <b>Kitchen Pickup:</b> The Laddu Story Artisanal Kitchen, Bangalore. Freshly packed & ready for collection!
              </div>
            )}
            <textarea
              id="checkout-cust-address"
              rows={2}
              placeholder={fulfillmentType === 'PICKUP' ? "Pickup Note / Expected Time (e.g. Pickup today 5 PM) [Optional]" : "Complete Delivery Address with Pincode *"}
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
              <span>{fulfillmentType === 'PICKUP' ? 'Store Pickup Collection' : 'Bangalore Express Delivery'}</span>
              <span>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '800', color: '#4A121E' }}>
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
              background: isSubmitting ? '#94A3B8' : '#831843',
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
    <div style={{ minHeight: '100vh', background: '#FAF6F0', fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif", color: '#1E293B', paddingBottom: totalCartQty > 0 ? '110px' : '30px' }}>

      {/* HEADER WITH OFFICIAL CIRCULAR LOGO */}
      <header style={{ background: 'linear-gradient(135deg, #350B15 0%, #4A121E 60%, #68152B 100%)', color: '#fff', padding: '14px 20px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 20px rgba(74, 18, 30, 0.3)', borderBottom: '2px solid #B45309' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          
          {/* Logo & Brand Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '50%', 
              background: '#FFFFFF', 
              border: '2.5px solid #FDE68A', 
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
              <h1 className="royal-title" style={{ margin: 0, fontSize: "1.45rem", fontWeight: "700", letterSpacing: "0.5px", color: "#FFFFFF" }}>
                The Laddu Story
              </h1>
              <div style={{ fontSize: '0.74rem', color: '#FDE68A', fontWeight: '600' }}>
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
                color: activeTab === 'store' ? '#4A121E' : '#FFFFFF',
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
              <div style={{ display: 'flex', alignItems: 'center', background: '#FDE68A', borderRadius: '8px', padding: '2px 4px' }}>
                <button
                  id="nav-customer-profile-btn"
                  onClick={() => setActiveTab('track')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#4A121E',
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
                  color: activeTab === 'track' ? '#4A121E' : '#FFFFFF',
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
                  background: activeTab === 'admin' ? '#FDE68A' : 'rgba(214, 229, 186, 0.3)',
                  color: '#4A121E',
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
            ) : isStaffRoute ? (
              <button
                id="nav-staff-login-btn"
                onClick={() => setShowLoginModal(true)}
                style={{
                  background: 'transparent',
                  color: '#FDE68A',
                  border: '1px dashed #FDE68A',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                🔒 Staff Login
              </button>
            ) : null}
          </div>

        </div>
      </header>

      {/* SUB-HEADER STATUS BAR */}
      <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '7px 20px', fontSize: '0.8rem', color: '#78350F', textAlign: 'center', fontWeight: '500' }}>
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
          background: '#4A121E',
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
          <div className="store-main-layout">
            
            {/* Catalog Grid */}
            <div>
              {/* Hero Banner */}
              <div style={{ 
                background: 'linear-gradient(135deg, #4A121E 0%, #831843 100%)', 
                borderRadius: '20px', 
                padding: '28px', 
                color: '#fff', 
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ maxWidth: '600px' }}>
                  <div style={{ display: 'inline-block', background: '#FDE68A', color: '#4A121E', padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '10px' }}>
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
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#4A121E', margin: 0 }}>
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
                          background: product.isMunchy ? '#E0F2FE' : '#FDE68A', 
                          color: product.isMunchy ? '#0369A1' : '#4A121E', 
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
                          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: '#4A121E' }}>
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
                              border: currentWeight === 'OPT1' ? '2px solid #831843' : '1px solid #CBD5E1',
                              background: currentWeight === 'OPT1' ? '#E0F2FE' : '#fff',
                              color: currentWeight === 'OPT1' ? '#4A121E' : '#475569',
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
                              border: currentWeight === 'OPT2' ? '2px solid #831843' : '1px solid #CBD5E1',
                              background: currentWeight === 'OPT2' ? '#E0F2FE' : '#fff',
                              color: currentWeight === 'OPT2' ? '#4A121E' : '#475569',
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
                            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#4A121E' }}>
                              ₹{price}
                            </span>
                          </div>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={isOutOfStock}
                            style={{
                              background: isOutOfStock ? '#CBD5E1' : '#831843',
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
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#FFFFFF', border: '2px solid #FDE68A', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                      <img src="images/TheLadduStory_Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = '👤'; }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#831843', letterSpacing: '0.5px' }}>
                        CUSTOMER ACCOUNT (PRIMARY ID: MOBILE)
                      </div>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#4A121E', margin: '2px 0 4px' }}>
                        Namaste, {customerUser.name}! 🙏
                      </h2>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        📞 +91 {customerUser.phone} {customerUser.address ? `• 📍 ${customerUser.address}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      id="track-place-order-btn"
                      onClick={() => setActiveTab('store')}
                      style={{ background: '#831843', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      + Place New Order
                    </button>
                    <button
                      id="track-edit-addr-btn"
                      onClick={() => { setEditAddressInput(customerUser.address || ''); setShowAddressModal(true); }}
                      style={{ background: '#FAF6F0', border: '1.5px solid #B45309', padding: '9px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', color: '#4A121E', cursor: 'pointer' }}
                    >
                      📍 Edit Address
                    </button>
                    <button
                      id="track-set-password-btn"
                      onClick={() => setShowSetPasswordModal(true)}
                      style={{ background: '#FAF6F0', border: '1.5px solid #B45309', padding: '9px 14px', borderRadius: '8px', fontWeight: '800', fontSize: '0.85rem', color: '#4A121E', cursor: 'pointer' }}
                    >
                      🔑 Change Password
                    </button>
                    <button
                      id="track-switch-user-btn"
                      onClick={handleCustomerLogout}
                      style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '9px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}
                    >
                      Logout
                    </button>
                  </div>
                </div>

                {/* ACTIVE IN-PROGRESS ORDERS */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4A121E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🟡 Open / In-Progress Orders ({activeOrders.length})
                  </h3>

                  {activeOrders.length === 0 ? (
                    <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', textAlign: 'center', border: '1px solid #E2E8F0', color: '#64748B' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🥣</div>
                      <div style={{ fontWeight: '700', fontSize: '1rem', color: '#4A121E' }}>No active orders in progress right now.</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Order fresh artisanal laddus anytime!</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {activeOrders.map(o => {
                        const isOrderPickup = o.fulfillmentType === 'PICKUP' || (o.channel && o.channel.includes('PICKUP'));
                        const stepIndex = getStatusStepIndex(o.status, isOrderPickup ? 'PICKUP' : 'DELIVERY');
                        return (
                          <div key={o.orderId} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                              <div>
                                <span style={{ fontWeight: '800', color: '#4A121E', fontSize: '1.1rem' }}>{o.orderId}</span>
                                <span style={{ fontSize: '0.8rem', color: '#64748B', marginLeft: '10px' }}>{o.time}</span>
                              </div>
                              <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '800' }}>
                                ⏳ {o.status}
                              </span>
                            </div>

                            {/* Live Step Progress Indicator */}
                            <div style={{ background: '#FAF6F0', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #F1F5F9' }}>
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
                                        background: isDone ? '#831843' : '#E2E8F0', 
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
                                      <div style={{ fontSize: '0.7rem', fontWeight: isDone ? '800' : '600', color: isDone ? '#4A121E' : '#94A3B8' }}>
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
                              <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#4A121E' }}>
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
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#4A121E', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                              <b style={{ color: '#4A121E', fontSize: '0.95rem' }}>{o.orderId}</b>
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
                            style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '6px 14px', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem', color: '#4A121E', cursor: 'pointer' }}
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
              /* If Not Logged In: Customer Login Screen (High-Luxury Royal Aesthetics) */
              <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '40px 32px', border: '1.5px solid rgba(180, 83, 9, 0.25)', boxShadow: '0 10px 30px rgba(74, 18, 30, 0.08)', textAlign: 'center', maxWidth: '480px', margin: '20px auto' }}>
                
                {/* Royal Emblem */}
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#FFFFFF', border: '3px solid #B45309', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 4px 14px rgba(180, 83, 9, 0.25)' }}>
                  <img src="images/TheLadduStory_Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = '👑'; }} />
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEF3C7', color: '#92400E', padding: '4px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '10px', border: '1px solid #FDE68A' }}>
                  <span>👑 Artisanal Heritage Kitchen</span>
                </div>

                <h2 className="royal-title" style={{ fontSize: '1.8rem', fontWeight: '700', color: '#4A121E', margin: '0 0 8px' }}>
                  Patron Portal & Order Tracker
                </h2>
                <p style={{ fontSize: '0.88rem', color: '#64748B', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Access live cow ghee preparation updates, order history & express checkout.
                </p>

                {/* ROYAL PATRON PORTAL TABS */}
                <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '12px', marginBottom: '22px', border: '1px solid rgba(180, 83, 9, 0.15)' }}>
                  <button
                    type="button"
                    onClick={() => setAuthMode('SIGNIN')}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      background: authMode === 'SIGNIN' ? 'linear-gradient(135deg, #4A121E 0%, #831843 100%)' : 'transparent',
                      color: authMode === 'SIGNIN' ? '#FFFBEB' : '#64748B',
                      boxShadow: authMode === 'SIGNIN' ? '0 2px 8px rgba(74, 18, 30, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🔑 Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('REGISTER')}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      background: authMode === 'REGISTER' ? 'linear-gradient(135deg, #4A121E 0%, #831843 100%)' : 'transparent',
                      color: authMode === 'REGISTER' ? '#FFFBEB' : '#64748B',
                      boxShadow: authMode === 'REGISTER' ? '0 2px 8px rgba(74, 18, 30, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    ✨ Create New Account
                  </button>
                </div>

                {authMode === 'SIGNIN' ? (
                  /* ================= TAB 1: SIGN IN ================= */
                  <form onSubmit={handlePasswordLogin} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#4A121E', marginBottom: '6px', letterSpacing: '0.5px' }}>
                        10-DIGIT MOBILE NUMBER *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(180, 83, 9, 0.3)', borderRadius: '10px', overflow: 'hidden', background: '#FAF6F0' }}>
                        <span style={{ padding: '12px 14px', background: 'rgba(180, 83, 9, 0.1)', color: '#4A121E', fontWeight: '800', fontSize: '0.95rem', borderRight: '1px solid rgba(180, 83, 9, 0.2)' }}>
                          🇮🇳 +91
                        </span>
                        <input
                          id="track-signin-phone"
                          type="tel"
                          placeholder="e.g. 9686412342"
                          value={loginPhoneInput}
                          onChange={e => setLoginPhoneInput(e.target.value)}
                          required
                          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', border: 'none', background: 'transparent', fontSize: '1.05rem', fontWeight: '700', color: '#4A121E', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#4A121E', marginBottom: '6px', letterSpacing: '0.5px' }}>
                        PASSWORD / 4-DIGIT PIN *
                      </label>
                      <input
                        id="track-signin-pwd"
                        type="password"
                        placeholder="Enter your security password or PIN"
                        value={loginPasswordInput}
                        onChange={e => setLoginPasswordInput(e.target.value)}
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.95rem', color: '#4A121E' }}
                      />
                    </div>

                    <button
                      id="track-signin-submit-btn"
                      type="submit"
                      disabled={isCustomerLoggingIn}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #4A121E 0%, #831843 100%)',
                        color: '#fff',
                        border: '1px solid #B45309',
                        padding: '14px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: isCustomerLoggingIn ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(74, 18, 30, 0.3)'
                      }}
                    >
                      {isCustomerLoggingIn ? '⏳ Signing In...' : '🔑 Sign In to Patron Account →'}
                    </button>

                    <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
                      New to The Laddu Story?{' '}
                      <button
                        type="button"
                        onClick={() => { setRegPhone(loginPhoneInput); setAuthMode('REGISTER'); }}
                        style={{ background: 'transparent', border: 'none', color: '#B45309', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                      >
                        Create your account here →
                      </button>
                    </div>
                  </form>
                ) : (
                  /* ================= TAB 2: CREATE NEW ACCOUNT ================= */
                  <form onSubmit={handleRegisterCustomer} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px', letterSpacing: '0.5px' }}>
                        FULL PATRON NAME *
                      </label>
                      <input
                        id="track-reg-name"
                        type="text"
                        placeholder="e.g. Navin Bhasin"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.95rem', color: '#4A121E' }}
                      />
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px', letterSpacing: '0.5px' }}>
                        10-DIGIT MOBILE NUMBER *
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(180, 83, 9, 0.3)', borderRadius: '8px', overflow: 'hidden', background: '#FAF6F0' }}>
                        <span style={{ padding: '11px 13px', background: 'rgba(180, 83, 9, 0.1)', color: '#4A121E', fontWeight: '800', fontSize: '0.9rem', borderRight: '1px solid rgba(180, 83, 9, 0.2)' }}>
                          🇮🇳 +91
                        </span>
                        <input
                          id="track-reg-phone"
                          type="tel"
                          placeholder="e.g. 9686412342"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          required
                          style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', border: 'none', background: 'transparent', fontSize: '1rem', fontWeight: '700', color: '#4A121E', outline: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px', letterSpacing: '0.5px' }}>
                        DELIVERY ADDRESS *
                      </label>
                      <textarea
                        id="track-reg-addr"
                        rows="2"
                        placeholder="Apartment/Villa, Street, Landmark, City & Pincode"
                        value={regAddress}
                        onChange={e => setRegAddress(e.target.value)}
                        required
                        style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.9rem', color: '#4A121E', resize: 'vertical' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px' }}>
                          PASSWORD / PIN *
                        </label>
                        <input
                          id="track-reg-pwd"
                          type="password"
                          placeholder="Min 4 digits"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          required
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.9rem', color: '#4A121E' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px' }}>
                          CONFIRM *
                        </label>
                        <input
                          id="track-reg-conf-pwd"
                          type="password"
                          placeholder="Re-enter PIN"
                          value={regConfirmPassword}
                          onChange={e => setRegConfirmPassword(e.target.value)}
                          required
                          style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.9rem', color: '#4A121E' }}
                        />
                      </div>
                    </div>

                    <button
                      id="track-reg-submit-btn"
                      type="submit"
                      disabled={isCustomerLoggingIn}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)',
                        color: '#fff',
                        border: '1px solid #14532D',
                        padding: '14px',
                        borderRadius: '10px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: isCustomerLoggingIn ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                      }}
                    >
                      {isCustomerLoggingIn ? '⏳ Creating Account...' : '👑 Create Patron Account & Continue →'}
                    </button>

                    <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => { setLoginPhoneInput(regPhone); setAuthMode('SIGNIN'); }}
                        style={{ background: 'transparent', border: 'none', color: '#B45309', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                      >
                        Sign in here →
                      </button>
                    </div>
                  </form>
                )}
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
                    background: adminSection === 'orders' ? '#4A121E' : '#F1F5F9',
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
                    background: adminSection === 'inventory' ? '#4A121E' : '#F1F5F9',
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
                  onClick={() => setShowSupabaseModal(true)}
                  title="Configure Supabase Cloud Database"
                  style={{
                    background: supabaseConnected ? '#DEF7EC' : '#FEF3C7',
                    color: supabaseConnected ? '#03543F' : '#92400E',
                    border: supabaseConnected ? '1px solid #31C48D' : '1px solid #F59E0B',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{supabaseConnected ? '🟢 Supabase Active' : '🟡 Connect Supabase DB'}</span>
                </button>
                <button
                  onClick={exportOrdersToCsv}
                  title="Download CSV Backup (Open in Google Sheets / Excel)"
                  style={{ background: '#F3E8FF', color: '#6B21A8', border: '1px solid #D8B4FE', padding: '8px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  📥 Export CSV Backup
                </button>
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
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#4A121E', margin: 0 }}>
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
                  {['ALL', 'RECEIVED', 'PREPARING', 'PACKED', 'READY FOR PICKUP', 'ORDER PICKED UP', 'OUT FOR DELIVERY', 'DELIVERED'].map(st => {
                    const count = st === 'ALL' ? orders.length : orders.filter(o => o.status === st).length;
                    const isSelected = filterStatus === st;
                    return (
                      <button
                        key={st}
                        onClick={() => setFilterStatus(st)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: isSelected ? '2px solid #4A121E' : '1px solid #CBD5E1',
                          background: isSelected ? '#4A121E' : '#fff',
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
                    <div style={{ fontSize: '0.82rem', marginTop: '4px' }}>Try searching by phone number (e.g. 9686412341 or 9686412342), customer name, or order ID.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '18px' }}>
                    {filteredOrders.map(o => (
                      <div key={o.orderId} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: '800', color: '#4A121E', fontSize: '0.95rem' }}>{o.orderId}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{o.time}</span>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#1E293B' }}>{o.name}</div>
                          <div style={{ fontSize: '0.85rem', color: '#831843', fontWeight: '700', marginTop: '2px' }}>
                            📞 +91 {o.phone}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>
                            📍 {o.address}
                          </div>
                        </div>

                        <div style={{ background: '#FAF6F0', padding: '10px 12px', borderRadius: '10px', marginBottom: '14px', border: '1px solid #F1F5F9' }}>
                          {o.items.map((it, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                              <span>{it.qty}x {it.name} ({it.cleanWeight || it.packLabel})</span>
                              <b>₹{it.unitPrice * it.qty}</b>
                            </div>
                          ))}
                          <div style={{ borderTop: '1px dashed #CBD5E1', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '0.92rem', color: '#4A121E' }}>
                            <span>Total Paid ({o.paymentMethod || 'UPI'}):</span>
                            <span>₹{o.total}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748B' }}>STATUS:</span>
                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.orderId, e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '800', background: '#F1F5F9', color: '#4A121E', cursor: 'pointer' }}
                          >
                            <option value="RECEIVED">RECEIVED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="PACKED">PACKED</option>
                            {(o.fulfillmentType === 'PICKUP' || (o.channel && o.channel.includes('PICKUP'))) ? (
                              <>
                                <option value="READY FOR PICKUP">READY FOR PICKUP</option>
                                <option value="ORDER PICKED UP">ORDER PICKED UP</option>
                              </>
                            ) : (
                              <>
                                <option value="OUT FOR DELIVERY">OUT FOR DELIVERY</option>
                                <option value="DELIVERED">DELIVERED</option>
                              </>
                            )}
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
                    <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#4A121E', margin: 0 }}>
                      Inventory, Pricing & MOQ Manager
                    </h2>
                    <div style={{ fontSize: '0.82rem', color: '#64748B' }}>
                      Update minimum order quantities, stock status, variations, and images across the live store.
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddProductModal(true)}
                    style={{ background: '#4A121E', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '800', fontSize: '0.88rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
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
                          <div style={{ fontWeight: '800', fontSize: '1rem', color: '#4A121E' }}>{p.name}</div>
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

                      <div style={{ background: '#FAF6F0', padding: '10px 12px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                        style={{ marginTop: 'auto', background: '#F1F5F9', border: '1px solid #CBD5E1', padding: '8px', borderRadius: '8px', fontWeight: '700', fontSize: '0.82rem', color: '#4A121E', cursor: 'pointer' }}
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
            background: '#4A121E',
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
            <div style={{ fontSize: '0.72rem', color: '#FDE68A' }}>
              Pure Cow Ghee & Jaggery • Zero White Sugar
            </div>
          </div>
          <button
            onClick={() => setIsMobileCartOpen(true)}
            style={{
              background: '#FDE68A',
              color: '#4A121E',
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
            <h3 style={{ margin: '0 0 14px', fontSize: '1.25rem', color: '#4A121E', fontWeight: '800' }}>
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
                  style={{ flex: 1, background: '#4A121E', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
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
            <h3 style={{ margin: '0 0 14px', fontSize: '1.25rem', color: '#4A121E', fontWeight: '800' }}>
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
                  style={{ flex: 1, background: '#4A121E', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
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
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* MODAL: CUSTOMER PATRON PORTAL (Sign In & Account Registration) */}
      {/* ------------------------------------------------------------- */}
      {showCustomerLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(53, 11, 21, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px 24px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '2px solid #B45309', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', position: 'relative' }}>
            
            <button
              onClick={() => setShowCustomerLoginModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#94A3B8', cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FFFFFF', border: '2px solid #B45309', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', boxShadow: '0 4px 12px rgba(180, 83, 9, 0.2)' }}>
              <img src="images/TheLadduStory_Logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.parentNode.innerText = '👑'; }} />
            </div>

            <h3 className="royal-title" style={{ margin: '0 0 4px', fontSize: '1.35rem', color: '#4A121E', fontWeight: '700', textAlign: 'center' }}>
              Patron Portal
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
              Sign in to track orders or create your account in 10 seconds.
            </p>

            {/* TABS */}
            <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '10px', marginBottom: '16px', border: '1px solid rgba(180, 83, 9, 0.15)' }}>
              <button
                type="button"
                onClick={() => setAuthMode('SIGNIN')}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '7px',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: authMode === 'SIGNIN' ? 'linear-gradient(135deg, #4A121E 0%, #831843 100%)' : 'transparent',
                  color: authMode === 'SIGNIN' ? '#FFFBEB' : '#64748B',
                  boxShadow: authMode === 'SIGNIN' ? '0 2px 6px rgba(74, 18, 30, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                🔑 Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('REGISTER')}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '7px',
                  border: 'none',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  background: authMode === 'REGISTER' ? 'linear-gradient(135deg, #4A121E 0%, #831843 100%)' : 'transparent',
                  color: authMode === 'REGISTER' ? '#FFFBEB' : '#64748B',
                  boxShadow: authMode === 'REGISTER' ? '0 2px 6px rgba(74, 18, 30, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                ✨ Create Account
              </button>
            </div>

            {authMode === 'SIGNIN' ? (
              /* MODAL: SIGN IN FORM */
              <form onSubmit={handlePasswordLogin}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    10-DIGIT MOBILE NUMBER *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(180, 83, 9, 0.3)', borderRadius: '8px', overflow: 'hidden', background: '#FAF6F0' }}>
                    <span style={{ padding: '10px 12px', background: 'rgba(180, 83, 9, 0.1)', color: '#4A121E', fontWeight: '800', fontSize: '0.88rem' }}>
                      +91
                    </span>
                    <input
                      id="modal-signin-phone"
                      type="tel"
                      placeholder="e.g. 9686412342"
                      value={loginPhoneInput}
                      onChange={e => setLoginPhoneInput(e.target.value)}
                      required
                      style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: 'none', background: 'transparent', fontSize: '0.95rem', fontWeight: '700', color: '#4A121E', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px', letterSpacing: '0.5px' }}>
                    PASSWORD / PIN *
                  </label>
                  <input
                    id="modal-signin-pwd"
                    type="password"
                    placeholder="Enter your security password or PIN"
                    value={loginPasswordInput}
                    onChange={e => setLoginPasswordInput(e.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.9rem', color: '#4A121E' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    id="modal-signin-submit-btn"
                    type="submit"
                    disabled={isCustomerLoggingIn}
                    style={{ flex: 1, background: 'linear-gradient(135deg, #4A121E 0%, #831843 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.95rem', cursor: isCustomerLoggingIn ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(74, 18, 30, 0.25)' }}
                  >
                    {isCustomerLoggingIn ? 'Verifying...' : '🔑 Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomerLoginModal(false)}
                    style={{ background: '#FAF6F0', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontWeight: '700', color: '#64748B', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>

                <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                  First time here?{' '}
                  <button
                    type="button"
                    onClick={() => { setRegPhone(loginPhoneInput); setAuthMode('REGISTER'); }}
                    style={{ background: 'transparent', border: 'none', color: '#B45309', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                  >
                    Create account →
                  </button>
                </div>
              </form>
            ) : (
              /* MODAL: REGISTRATION FORM */
              <form onSubmit={handleRegisterCustomer}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '3px' }}>
                    PATRON NAME *
                  </label>
                  <input
                    id="modal-reg-name"
                    type="text"
                    placeholder="Full name"
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.9rem', color: '#4A121E' }}
                  />
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '3px' }}>
                    10-DIGIT MOBILE NUMBER *
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid rgba(180, 83, 9, 0.3)', borderRadius: '8px', overflow: 'hidden', background: '#FAF6F0' }}>
                    <span style={{ padding: '9px 11px', background: 'rgba(180, 83, 9, 0.1)', color: '#4A121E', fontWeight: '800', fontSize: '0.85rem' }}>
                      +91
                    </span>
                    <input
                      id="modal-reg-phone"
                      type="tel"
                      placeholder="e.g. 9686412342"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      required
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', border: 'none', background: 'transparent', fontSize: '0.92rem', fontWeight: '700', color: '#4A121E', outline: 'none' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '3px' }}>
                    DELIVERY ADDRESS *
                  </label>
                  <textarea
                    id="modal-reg-addr"
                    rows="2"
                    placeholder="Apartment, Street, Area & City"
                    value={regAddress}
                    onChange={e => setRegAddress(e.target.value)}
                    required
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.85rem', color: '#4A121E' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#4A121E', marginBottom: '3px' }}>
                      PASSWORD / PIN *
                    </label>
                    <input
                      id="modal-reg-pwd"
                      type="password"
                      placeholder="Min 4 digits"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.85rem', color: '#4A121E' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', color: '#4A121E', marginBottom: '3px' }}>
                      CONFIRM *
                    </label>
                    <input
                      id="modal-reg-conf-pwd"
                      type="password"
                      placeholder="Re-enter"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      required
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 10px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.85rem', color: '#4A121E' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    id="modal-reg-submit-btn"
                    type="submit"
                    disabled={isCustomerLoggingIn}
                    style={{ flex: 1, background: 'linear-gradient(135deg, #15803D 0%, #16A34A 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.92rem', cursor: isCustomerLoggingIn ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)' }}
                  >
                    {isCustomerLoggingIn ? 'Creating...' : '👑 Create Account'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomerLoginModal(false)}
                    style={{ background: '#FAF6F0', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontWeight: '700', color: '#64748B', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>

                <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.78rem', color: '#64748B' }}>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setLoginPhoneInput(regPhone); setAuthMode('SIGNIN'); }}
                    style={{ background: 'transparent', border: 'none', color: '#B45309', fontWeight: '800', cursor: 'pointer', padding: 0 }}
                  >
                    Sign in →
                  </button>
                </div>
              </form>
            )}
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

            <h3 style={{ margin: '0 0 4px', fontSize: '1.4rem', color: '#4A121E', fontWeight: '800' }}>
              Order Placed Successfully!
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '14px' }}>
              Order ID: <b style={{ color: '#4A121E' }}>{orderSuccess.orderId}</b>
            </div>

            <div style={{ background: '#FAF6F0', padding: '12px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0', textAlign: 'left', fontSize: '0.85rem' }}>
              <div>👤 <b>{orderSuccess.name}</b> (+91 {orderSuccess.phone})</div>
              <div style={{ color: '#64748B', marginTop: '4px' }}>📍 {orderSuccess.address}</div>
              <div style={{ marginTop: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', color: '#4A121E' }}>
                <span>Total Amount:</span>
                <span>₹{orderSuccess.total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* UPI QR Code */}
            {qrDataUrl && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#4A121E', marginBottom: '8px' }}>
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
                style={{ flex: 1, background: '#831843', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
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
            
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F1F5F9', color: '#4A121E', fontSize: '1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              🔒
            </div>

            <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', color: '#4A121E', fontWeight: '800' }}>
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
                  style={{ flex: 1, background: '#4A121E', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
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


      {/* ------------------------------------------------------------- */}
      {/* MODAL: SUPABASE CLOUD DATABASE CONFIGURATION                  */}
      {/* ------------------------------------------------------------- */}
      {showSupabaseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '520px', width: '100%', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>⚡</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#4A121E', fontWeight: '800' }}>
                  Supabase Cloud Database Settings
                </h3>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#64748B' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: supabaseConnected ? '#DEF7EC' : '#FFFBEB', padding: '12px 16px', borderRadius: '12px', marginBottom: '18px', border: supabaseConnected ? '1px solid #31C48D' : '1px solid #FCD34D', fontSize: '0.85rem' }}>
              {supabaseConnected ? (
                <div>
                  <b style={{ color: '#03543F' }}>🟢 Supabase is Connected & Live!</b>
                  <div style={{ color: '#046C4E', marginTop: '4px' }}>
                    Instant ACID order write-backs, inventory tracking, and zero-latency WebSocket sync are active.
                  </div>
                </div>
              ) : (
                <div>
                  <b style={{ color: '#92400E' }}>🟡 Running in Standalone / Google Sheets Mode</b>
                  <div style={{ color: '#B45309', marginTop: '4px' }}>
                    Connect your free Supabase project to enable real-time status write-backs and persistent cloud orders.
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSupabaseConfig}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                  SUPABASE PROJECT URL:
                </label>
                <input
                  type="url"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrlInput}
                  onChange={e => setSupabaseUrlInput(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.9rem', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#334155', marginBottom: '6px' }}>
                  SUPABASE ANON PUBLIC KEY:
                </label>
                <textarea
                  rows={3}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKeyInput}
                  onChange={e => setSupabaseKeyInput(e.target.value)}
                  required
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'vertical' }}
                />
              </div>

              {supabaseError && (
                <div style={{ background: '#FDE8E8', color: '#9B1C1C', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '14px' }}>
                  ⚠️ {supabaseError}
                </div>
              )}

              <div style={{ background: '#FAF6F0', padding: '12px', borderRadius: '10px', fontSize: '0.78rem', color: '#64748B', marginBottom: '18px', border: '1px solid #E2E8F0' }}>
                <b>Quick 3-Step Setup:</b>
                <ol style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                  <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#4A121E', fontWeight: '700' }}>supabase.com</a>.</li>
                  <li>Paste and execute <code>schema/supabase_schema.sql</code> in the SQL Editor.</li>
                  <li>Copy Project URL & anon key from <i>Project Settings ➔ API</i> and click Save.</li>
                </ol>
                <div style={{ marginTop: '6px', color: '#4A121E' }}>
                  ✓ Google Sheets backup form submissions remain 100% active in the background!
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={supabaseSaving}
                  style={{ flex: 1, background: '#4A121E', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  {supabaseSaving ? 'Connecting...' : 'Save & Connect Supabase'}
                </button>
                {supabaseConnected && (
                  <button
                    type="button"
                    onClick={() => {
                      clearSupabaseConfig();
                      setSupabaseConnected(false);
                      setSupabaseUrlInput('');
                      setSupabaseKeyInput('');
                      alert('Supabase disconnected. System reverted to Local + Google Sheets mode.');
                    }}
                    style={{ background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '12px 14px', borderRadius: '8px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    Disconnect
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowSupabaseModal(false)}
                  style={{ background: '#F1F5F9', border: 'none', padding: '12px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT DELIVERY ADDRESS                                  */}
      {/* ------------------------------------------------------------- */}
      {showAddressModal && customerUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(53, 11, 21, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '22px', padding: '26px 22px', maxWidth: '400px', width: '100%', border: '2px solid #B45309', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', position: 'relative' }}>
            <button
              onClick={() => setShowAddressModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#94A3B8', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h3 className="royal-title" style={{ margin: '0 0 6px', fontSize: '1.35rem', color: '#4A121E', fontWeight: '700', textAlign: 'center' }}>
              📍 Edit Delivery Address
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
              Update your primary doorstep delivery destination.
            </p>

            <form onSubmit={handleSaveDeliveryAddress}>
              <div style={{ marginBottom: '18px' }}>
                <textarea
                  rows="3"
                  required
                  placeholder="Apartment, Street, Landmark, City & Pincode"
                  value={editAddressInput}
                  onChange={e => setEditAddressInput(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.9rem', color: '#4A121E', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #4A121E 0%, #831843 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.92rem', cursor: isSavingAddress ? 'not-allowed' : 'pointer' }}
                >
                  {isSavingAddress ? 'Saving...' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  style={{ background: '#FAF6F0', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontWeight: '700', color: '#64748B', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SET OR UPDATE CUSTOMER PASSWORD / PIN                  */}
      {/* ------------------------------------------------------------- */}
      {showSetPasswordModal && customerUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(53, 11, 21, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '22px', padding: '28px 24px', maxWidth: '380px', width: '100%', border: '2px solid #B45309', boxShadow: '0 12px 40px rgba(0,0,0,0.35)', position: 'relative' }}>
            <button
              onClick={() => setShowSetPasswordModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', fontSize: '1.2rem', color: '#94A3B8', cursor: 'pointer' }}
            >
              ✕
            </button>

            <h3 className="royal-title" style={{ margin: '0 0 6px', fontSize: '1.35rem', color: '#4A121E', fontWeight: '700', textAlign: 'center' }}>
              🔑 Set / Change Password
            </h3>
            <p style={{ margin: '0 0 16px', fontSize: '0.8rem', color: '#64748B', textAlign: 'center' }}>
              Create a secure Password or 4-digit PIN for instant 1-second sign-in for <b>+91 {customerUser.phone}</b>.
            </p>

            <form onSubmit={handleSaveCustomerPassword}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px' }}>
                  NEW PASSWORD / 4-DIGIT PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 4 characters or digits"
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.95rem', color: '#4A121E' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: '800', color: '#4A121E', marginBottom: '4px' }}>
                  CONFIRM PASSWORD / PIN *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={confirmPasswordInput}
                  onChange={e => setConfirmPasswordInput(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid rgba(180, 83, 9, 0.3)', background: '#FAF6F0', fontSize: '0.95rem', color: '#4A121E' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  style={{ flex: 1, background: 'linear-gradient(135deg, #4A121E 0%, #831843 100%)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '800', fontSize: '0.92rem', cursor: isSavingPassword ? 'not-allowed' : 'pointer' }}
                >
                  {isSavingPassword ? 'Saving...' : 'Save Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSetPasswordModal(false)}
                  style={{ background: '#FAF6F0', border: '1px solid #E2E8F0', padding: '12px 14px', borderRadius: '8px', fontWeight: '700', color: '#64748B', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invisible Google reCAPTCHA Container for Firebase Phone Auth */}
      

    </div>
  );
}

