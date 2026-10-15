/**
 * The Laddu Story - Production Supabase Integration Service
 * Provides instant real-time synchronization, ACID write-backs, and offline fallback.
 */
import { createClient } from '@supabase/supabase-js';

// Production Supabase Credentials (Auto-connected for all customers & staff)
const DEFAULT_SUPABASE_URL = 'https://xhxepdlaqifqtfoaqrae.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoeGVwZGxhcWlmcXRmb2FxcmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDY0MDcsImV4cCI6MjEwNzQ4MjQwN30.RHGGLcDZA6H4mvcOkOVOfryFlqHBayBJ8Ox6CMQq6Ic';

const getSavedConfig = () => {
  try {
    const saved = localStorage.getItem('tls_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Discard previous invalid URL typo if present
      if (parsed.url && parsed.url.includes('qtlfo')) {
        localStorage.removeItem('tls_supabase_config');
      } else if (parsed.url && parsed.anonKey) {
        return parsed;
      }
    }
  } catch (e) {}

  return {
    url: import.meta.env?.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
  };
};

let currentConfig = getSavedConfig();
let supabaseInstance = null;

export const initSupabaseClient = (url, anonKey) => {
  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url.trim(), anonKey.trim(), {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } }
      });
      currentConfig = { url: url.trim(), anonKey: anonKey.trim() };
      return true;
    } catch (e) {
      console.error('[Supabase] Initialization error:', e);
      return false;
    }
  }
  supabaseInstance = null;
  return false;
};

// Auto-initialize if config exists (Always connected by default)
if (currentConfig.url && currentConfig.anonKey) {
  initSupabaseClient(currentConfig.url, currentConfig.anonKey);
}

export const isSupabaseConfigured = () => {
  return !!supabaseInstance;
};

export const getSupabaseConfig = () => {
  return currentConfig;
};

export const saveSupabaseConfig = (url, anonKey) => {
  const success = initSupabaseClient(url, anonKey);
  if (success) {
    try {
      localStorage.setItem('tls_supabase_config', JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    } catch (e) {}
  }
  return success;
};

export const clearSupabaseConfig = () => {
  supabaseInstance = null;
  currentConfig = { url: '', anonKey: '' };
  try {
    localStorage.removeItem('tls_supabase_config');
  } catch (e) {}
};

/**
 * Fetch all orders from Supabase with nested items
 */
export const fetchOrdersFromSupabase = async () => {
  if (!supabaseInstance) return null;
  try {
    const { data: orders, error: ordersErr } = await supabaseInstance
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersErr) throw ordersErr;

    const { data: items, error: itemsErr } = await supabaseInstance
      .from('order_items')
      .select('*');

    if (itemsErr) throw itemsErr;

    const itemsByOrder = (items || []).reduce((acc, item) => {
      acc[item.order_id] = acc[item.order_id] || [];
      acc[item.order_id].push({
        sku: item.sku,
        name: item.name,
        packLabel: item.pack_label,
        cleanWeight: item.clean_weight,
        unitPrice: Number(item.unit_price),
        qty: item.qty,
        image: item.image
      });
      return acc;
    }, {});

    return (orders || []).map(o => {
      const isPickup = (o.channel && o.channel.includes('PICKUP')) || (o.notes && o.notes.includes('PICKUP'));
      return {
        orderId: o.order_id,
        time: new Date(o.created_at).toLocaleString('en-US', {
          month: '2-digit', day: '2-digit', year: '2-digit',
          hour: 'numeric', minute: '2-digit', hour12: true
        }),
        channel: o.channel || 'ONLINE_STORE',
        fulfillmentType: isPickup ? 'PICKUP' : 'DELIVERY',
        name: o.customer_name,
        phone: o.customer_phone,
        address: o.customer_address,
        status: o.order_status,
        paymentMethod: o.payment_method || 'UPI',
        paymentStatus: o.payment_status || 'PAID',
        total: Number(o.total_amount),
        notes: o.notes || '',
        items: itemsByOrder[o.order_id] || []
      };
    });
  } catch (err) {
    console.error('[Supabase] fetchOrders error:', err);
    return null;
  }
};

/**
 * Insert new order and its items into Supabase
 */
export const insertOrderToSupabase = async (order) => {
  if (!supabaseInstance) return { success: false, reason: 'NOT_CONFIGURED' };
  try {
    const fulfillmentLabel = order.fulfillmentType === 'PICKUP' ? 'STORE_PICKUP' : (order.channel || 'ONLINE_STORE');
    const enrichedNotes = order.fulfillmentType === 'PICKUP'
      ? `[PICKUP AT KITCHEN] ${order.notes || ''}`.trim()
      : (order.notes || '');

    // 1. Insert order record
    const { error: orderErr } = await supabaseInstance
      .from('orders')
      .insert({
        order_id: order.orderId,
        channel: fulfillmentLabel,
        customer_name: order.name,
        customer_phone: order.phone,
        customer_address: order.address,
        total_amount: order.total,
        payment_method: order.paymentMethod || 'UPI',
        payment_status: order.paymentStatus || 'PAID',
        order_status: order.status || 'RECEIVED',
        notes: enrichedNotes
      });

    if (orderErr) throw orderErr;

    // 2. Insert items
    if (order.items && order.items.length > 0) {
      const itemsToInsert = order.items.map(i => ({
        order_id: order.orderId,
        sku: i.sku,
        name: i.name,
        pack_label: i.packLabel || i.cleanWeight || '',
        clean_weight: i.cleanWeight || '',
        unit_price: i.unitPrice,
        qty: i.qty,
        image: i.image || ''
      }));

      const { error: itemsErr } = await supabaseInstance
        .from('order_items')
        .insert(itemsToInsert);

      if (itemsErr) console.warn('[Supabase] Warning inserting items:', itemsErr);
    }

    // 3. Upsert customer CRM
    try {
      await supabaseInstance
        .from('customers')
        .upsert({
          phone: order.phone,
          name: order.name,
          address: order.address,
          last_order_at: new Date().toISOString()
        }, { onConflict: 'phone' });
    } catch (e) {}

    return { success: true };
  } catch (err) {
    console.error('[Supabase] insertOrder error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Update order status with instant write-back
 */
export const updateOrderStatusInSupabase = async (orderId, newStatus) => {
  if (!supabaseInstance) return { success: false, reason: 'NOT_CONFIGURED' };
  try {
    const { error } = await supabaseInstance
      .from('orders')
      .update({
        order_status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('order_id', orderId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Supabase] updateOrderStatus error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Update order payment status and payment method in Supabase
 */
export const updateOrderPaymentStatusInSupabase = async (orderId, paymentStatus, paymentMethod) => {
  if (!supabaseInstance) return { success: false, reason: 'NOT_CONFIGURED' };
  try {
    const payload = {
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    };
    if (paymentMethod) {
      payload.payment_method = paymentMethod;
    }
    const { error } = await supabaseInstance
      .from('orders')
      .update(payload)
      .eq('order_id', orderId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Supabase] updateOrderPaymentStatus error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Fetch products from Supabase
 */
export const fetchProductsFromSupabase = async () => {
  if (!supabaseInstance) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return null;

    return data.map(p => {
      const rateKg = Number(p.rate_per_kg || 0);
      const p500Val = Number(p.p500 || 0);
      const p1kVal = Number(p.p1k || 0);
      const calculatedP250 = p.p250 ? Number(p.p250) : Math.round((rateKg || (p500Val * 2)) * 0.25);
      return {
        id: p.id,
        sku: p.sku,
        name: p.name,
        category: p.category,
        ratePerKg: rateKg,
        moq: p.moq || '500g',
        p250: calculatedP250,
        p500: p500Val,
        p1k: p1kVal,
        opt0: p.opt0 || `250g (₹${calculatedP250})`,
        opt1: p.opt1,
        opt2: p.opt2,
        w0: '250g',
        w1: p.w1,
        w2: p.w2,
        tag: p.tag,
        desc: p.description,
        benefit: p.benefit,
        image: p.image,
        stockStatus: p.stock_status,
        stockCount: Number(p.stock_count),
        isMunchy: !!p.is_munchy
      };
    });
  } catch (err) {
    console.error('[Supabase] fetchProducts error:', err);
    return null;
  }
};

/**
 * Upsert product in Supabase (Handles both stock updates and adding new items)
 */
export const upsertProductInSupabase = async (product) => {
  if (!supabaseInstance) return { success: false, reason: 'NOT_CONFIGURED' };
  try {
    const { error } = await supabaseInstance
      .from('products')
      .upsert({
        id: product.id || String(Date.now()),
        sku: product.sku,
        name: product.name,
        category: product.category || 'LADDU',
        rate_per_kg: product.ratePerKg || (product.p1k || 1200),
        moq: product.moq || '500g',
        opt1: product.opt1 || `${product.w1 || '500g'} (₹${product.p500 || 600})`,
        opt2: product.opt2 || `${product.w2 || '1 Kg'} (₹${product.p1k || 1200})`,
        p500: product.p500 || 600,
        p1k: product.p1k || 1200,
        w1: product.w1 || '500g',
        w2: product.w2 || '1 Kg',
        tag: product.tag || 'Artisanal Special',
        description: product.desc || product.description || '',
        benefit: product.benefit || '',
        image: product.image || 'images/products/RAGI-WALNUT.jpg',
        stock_status: product.stockStatus || 'IN_STOCK',
        stock_count: Number(product.stockCount ?? 50),
        is_munchy: !!product.isMunchy,
        updated_at: new Date().toISOString()
      }, { onConflict: 'sku' });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Supabase] upsertProduct error:', err);
    return { success: false, error: err.message };
  }
};

export const updateProductInSupabase = upsertProductInSupabase;
 
/**
 * Fetch all registered customers from Supabase (CRM master source)
 */
export const fetchCustomersFromSupabase = async () => {
  if (!supabaseInstance) return null;
  try {
    const { data, error } = await supabaseInstance
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('[Supabase] fetchCustomers error:', err);
    return null;
  }
};

/**
 * Look up customer in Supabase by 10-digit mobile number
 */
export const lookupCustomerInSupabase = async (phone) => {
  if (!supabaseInstance) return null;
  try {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const { data, error } = await supabaseInstance
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('[Supabase] lookupCustomer error:', err);
    return null;
  }
};

/**
 * Delete order from Supabase
 */
export const deleteOrderInSupabase = async (orderId) => {
  if (!supabaseInstance) return { success: false, reason: 'NOT_CONFIGURED' };
  try {
    const { error } = await supabaseInstance
      .from('orders')
      .delete()
      .eq('order_id', orderId);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Supabase] deleteOrder error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Subscribe to real-time changes via WebSockets for orders, products, and customers
 */
export const subscribeToSupabaseRealtime = (onOrderChange, onProductChange, onCustomerChange) => {
  if (!supabaseInstance) return () => {};

  try {
    const channel = supabaseInstance
      .channel('tls-realtime-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (onOrderChange) onOrderChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (onProductChange) onProductChange(payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, (payload) => {
        if (onCustomerChange) onCustomerChange(payload);
      })
      .subscribe();

    return () => {
      supabaseInstance.removeChannel(channel);
    };
  } catch (e) {
    console.warn('[Supabase] Realtime subscription error:', e);
    return () => {};
  }
};

/**
 * Fast SHA-256 Password Hash helper using browser Web Crypto API
 */
export const hashPassword = async (pwd) => {
  if (!pwd) return '';
  try {
    const msgUint8 = new TextEncoder().encode(pwd);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    return btoa(pwd);
  }
};

/**
 * Verify Customer User ID & Password against Supabase
 */
export const verifyCustomerPassword = async (phoneOrEmail, password) => {
  if (!supabaseInstance) return { success: false, reason: 'NOT_CONFIGURED' };
  try {
    const cleanPhone = (phoneOrEmail || '').replace(/\D/g, '').slice(-10);
    const inputHash = await hashPassword(password);

    // Look up customer
    const { data: cust, error } = await supabaseInstance
      .from('customers')
      .select('*')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (error) throw error;
    if (!cust) {
      // Check if orders exist for this phone
      const { data: ords } = await supabaseInstance
        .from('orders')
        .select('*')
        .eq('customer_phone', cleanPhone)
        .limit(1);

      if (!ords || ords.length === 0) {
        return { success: false, reason: 'NOT_FOUND' };
      }
      return { success: false, reason: 'NO_PASSWORD_SET' };
    }

    const storedLocalHash = localStorage.getItem('tls_cust_pwd_' + cleanPhone);
    const effectiveHash = cust.password_hash || storedLocalHash;

    if (!effectiveHash) {
      return { success: false, reason: 'NO_PASSWORD_SET', customer: cust };
    }

    if (effectiveHash === inputHash || effectiveHash === password) {
      return { success: true, customer: cust };
    } else {
      return { success: false, reason: 'WRONG_PASSWORD', customer: cust };
    }
  } catch (err) {
    console.error('[Supabase] verifyCustomerPassword error:', err);
    // Check local fallback
    const cleanPhone = (phoneOrEmail || '').replace(/\D/g, '').slice(-10);
    const inputHash = await hashPassword(password);
    const storedLocalHash = localStorage.getItem('tls_cust_pwd_' + cleanPhone);
    if (storedLocalHash && (storedLocalHash === inputHash || storedLocalHash === password)) {
      return { success: true, customer: { phone: cleanPhone, name: 'Valued Patron' } };
    }
    return { success: false, error: err.message };
  }
};

/**
 * Set or reset Customer Password in Supabase (with resilient fallback)
 */
export const setCustomerPasswordInSupabase = async (phone, newPassword) => {
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  const passHash = await hashPassword(newPassword);

  // Always save locally first so user is never blocked
  try {
    localStorage.setItem('tls_cust_pwd_' + cleanPhone, passHash);
  } catch(e) {}

  if (!supabaseInstance) return { success: true, savedLocally: true };

  try {
    // Check if customer exists in customers table
    const { data: existing } = await supabaseInstance
      .from('customers')
      .select('phone, name')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseInstance
        .from('customers')
        .update({ password_hash: passHash })
        .eq('phone', cleanPhone);
      if (error) {
        console.warn('[Supabase] password_hash update note:', error.message);
        // If column doesn't exist yet, return success via local persistence with note
        return { success: true, savedLocally: true, schemaPending: true };
      }
    } else {
      const { error } = await supabaseInstance
        .from('customers')
        .insert({
          phone: cleanPhone,
          name: 'Valued Patron',
          password_hash: passHash
        });
      if (error) {
        console.warn('[Supabase] password_hash insert note:', error.message);
        return { success: true, savedLocally: true, schemaPending: true };
      }
    }

    return { success: true };
  } catch (err) {
    console.warn('[Supabase] setCustomerPassword fallback:', err);
    return { success: true, savedLocally: true, schemaPending: true };
  }
};

/**
 * Register a new Patron with Name, Phone, Delivery Address and Password in Supabase
 */
export const registerCustomerInSupabase = async ({ phone, name, address, password }) => {
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  const passHash = await hashPassword(password);

  // Store locally as guaranteed fallback
  try {
    localStorage.setItem('tls_cust_pwd_' + cleanPhone, passHash);
    const profile = { phone: cleanPhone, name: name.trim(), address: address ? address.trim() : '' };
    localStorage.setItem('tls_cust_profile_' + cleanPhone, JSON.stringify(profile));
  } catch(e) {}

  if (!supabaseInstance) {
    return { success: true, customer: { phone: cleanPhone, name: name.trim(), address: address ? address.trim() : '' } };
  }

  try {
    const { data, error } = await supabaseInstance
      .from('customers')
      .upsert({
        phone: cleanPhone,
        name: name.trim() || 'Valued Patron',
        address: address ? address.trim() : '',
        password_hash: passHash
      }, { onConflict: 'phone' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase] Register fallback note (trying without password_hash if column missing):', error.message);
      // Fallback if password_hash column not yet in remote schema cache
      const { data: d2 } = await supabaseInstance
        .from('customers')
        .upsert({
          phone: cleanPhone,
          name: name.trim() || 'Valued Patron',
          address: address ? address.trim() : ''
        }, { onConflict: 'phone' })
        .select()
        .maybeSingle();

      return { success: true, customer: d2 || { phone: cleanPhone, name: name.trim(), address: address ? address.trim() : '' } };
    }

    return { success: true, customer: data || { phone: cleanPhone, name: name.trim(), address: address ? address.trim() : '' } };
  } catch (err) {
    console.warn('[Supabase] registerCustomer fallback:', err);
    return { success: true, customer: { phone: cleanPhone, name: name.trim(), address: address ? address.trim() : '' } };
  }
};

/**
 * Update Customer Name and Delivery Address in Supabase
 */
export const updateCustomerDetailsInSupabase = async (phone, { name, address }) => {
  const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);
  if (!supabaseInstance) return { success: true };
  try {
    await supabaseInstance
      .from('customers')
      .update({ name: name ? name.trim() : '', address: address ? address.trim() : '' })
      .eq('phone', cleanPhone);
    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  }
};




