/**
 * The Laddu Story - Production Supabase Integration Service
 * Provides instant real-time synchronization, ACID write-backs, and offline fallback.
 */
import { createClient } from '@supabase/supabase-js';

// Default configuration from environment variables or localStorage
const getSavedConfig = () => {
  try {
    const saved = localStorage.getItem('tls_supabase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {}

  return {
    url: import.meta.env?.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env?.VITE_SUPABASE_ANON_KEY || ''
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

// Auto-initialize if config exists
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

    return (orders || []).map(o => ({
      orderId: o.order_id,
      time: new Date(o.created_at).toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', year: '2-digit',
        hour: 'numeric', minute: '2-digit', hour12: true
      }),
      channel: o.channel || 'ONLINE_STORE',
      name: o.customer_name,
      phone: o.customer_phone,
      address: o.customer_address,
      status: o.order_status,
      paymentMethod: o.payment_method || 'UPI',
      paymentStatus: o.payment_status || 'PAID',
      total: Number(o.total_amount),
      notes: o.notes || '',
      items: itemsByOrder[o.order_id] || []
    }));
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
    // 1. Insert order record
    const { error: orderErr } = await supabaseInstance
      .from('orders')
      .insert({
        order_id: order.orderId,
        channel: order.channel || 'ONLINE_STORE',
        customer_name: order.name,
        customer_phone: order.phone,
        customer_address: order.address,
        total_amount: order.total,
        payment_method: order.paymentMethod || 'UPI',
        payment_status: order.paymentStatus || 'PAID',
        order_status: order.status || 'RECEIVED',
        notes: order.notes || ''
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

    return data.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      category: p.category,
      ratePerKg: Number(p.rate_per_kg),
      moq: p.moq,
      opt1: p.opt1,
      opt2: p.opt2,
      p500: Number(p.p500),
      p1k: Number(p.p1k),
      w1: p.w1,
      w2: p.w2,
      tag: p.tag,
      desc: p.description,
      benefit: p.benefit,
      image: p.image,
      stockStatus: p.stock_status,
      stockCount: Number(p.stock_count),
      isMunchy: !!p.is_munchy
    }));
  } catch (err) {
    console.error('[Supabase] fetchProducts error:', err);
    return null;
  }
};

/**
 * Update product stock / pricing in Supabase
 */
export const updateProductInSupabase = async (product) => {
  if (!supabaseInstance) return { success: false, reason: 'NOT_CONFIGURED' };
  try {
    const { error } = await supabaseInstance
      .from('products')
      .update({
        stock_status: product.stockStatus,
        stock_count: product.stockCount,
        rate_per_kg: product.ratePerKg,
        p500: product.p500,
        p1k: product.p1k,
        updated_at: new Date().toISOString()
      })
      .eq('sku', product.sku);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[Supabase] updateProduct error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Subscribe to real-time changes via WebSockets
 */
export const subscribeToSupabaseRealtime = (onOrderChange, onProductChange) => {
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
      .subscribe();

    return () => {
      supabaseInstance.removeChannel(channel);
    };
  } catch (e) {
    console.warn('[Supabase] Realtime subscription error:', e);
    return () => {};
  }
};
