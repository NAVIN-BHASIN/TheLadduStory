import os
import re

app_path = r"c:\Users\navin\TheLadduStory\admin-desktop\src\App.jsx"

with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Supabase imports after 'import QRCode from 'qrcode';'
import_stmt = """import QRCode from 'qrcode';
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
  subscribeToSupabaseRealtime
} from './services/supabaseClient';"""

if "from './services/supabaseClient';" not in content:
    content = content.replace("import QRCode from 'qrcode';", import_stmt, 1)

# 2. Add Supabase state inside App()
state_needle = "  const [showLoginModal, setShowLoginModal] = useState(false);"
supabase_state = """  const [showLoginModal, setShowLoginModal] = useState(false);

  // Supabase Real-Time Cloud DB State
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey || '');
  const [supabaseConnected, setSupabaseConnected] = useState(() => isSupabaseConfigured());
  const [supabaseSaving, setSupabaseSaving] = useState(false);
  const [supabaseError, setSupabaseError] = useState('');"""

if "const [showSupabaseModal, setShowSupabaseModal]" not in content:
    content = content.replace(state_needle, supabase_state, 1)

# 3. Add Supabase mount & realtime listener
mount_needle = "    pollCloud();\n    const interval = setInterval(pollCloud, 10000);"
supabase_mount = """    pollCloud();
    const interval = setInterval(pollCloud, 10000);

    // Initial Supabase Data Fetch & Realtime WebSocket Channel
    let unsubSupabase = null;
    if (isSupabaseConfigured()) {
      setSupabaseConnected(true);
      fetchOrdersFromSupabase().then(dbOrders => {
        if (dbOrders && dbOrders.length > 0) {
          setOrders(prev => {
            const map = new Map();
            prev.forEach(o => map.set(o.orderId, o));
            dbOrders.forEach(o => map.set(o.orderId, { ...map.get(o.orderId), ...o }));
            return Array.from(map.values());
          });
          setIsCloudSynced(true);
          setLastSyncTime(new Date().toLocaleTimeString());
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
          }
        }
      );
    }"""

if "Initial Supabase Data Fetch & Realtime WebSocket Channel" not in content:
    content = content.replace(mount_needle, supabase_mount, 1)

# Cleanup of unsubSupabase
cleanup_needle = "      clearInterval(interval);\n      if (es) es.close();"
cleanup_replace = """      clearInterval(interval);
      if (es) es.close();
      if (typeof unsubSupabase === 'function') unsubSupabase();"""
if "if (typeof unsubSupabase === 'function') unsubSupabase();" not in content:
    content = content.replace(cleanup_needle, cleanup_replace, 1)

# 4. Add Export to CSV and Supabase Config handlers
csv_helpers = """
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
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
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
        if (dbOrders && dbOrders.length > 0) {
          setOrders(prev => {
            const map = new Map();
            prev.forEach(o => map.set(o.orderId, o));
            dbOrders.forEach(o => map.set(o.orderId, { ...map.get(o.orderId), ...o }));
            return Array.from(map.values());
          });
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
"""

target_before_checkout = "  // CHECKOUT\n  const handleCheckout = async (e) => {"
if "const exportOrdersToCsv = () => {" not in content:
    content = content.replace(target_before_checkout, csv_helpers + "\n  // CHECKOUT\n  const handleCheckout = async (e) => {", 1)

# 5. Dual-Write to Supabase inside handleCheckout
sheets_submit_target = """    // Submit to Google Sheets
    submitToGoogleSheets(newOrder);"""

supabase_dual_write = """    // 1. Submit to Google Sheets (Kept 100% intact as backup ledger)
    submitToGoogleSheets(newOrder);

    // 2. Insert to Supabase (Instant ACID PostgreSQL + Order Items)
    try {
      await insertOrderToSupabase(newOrder);
    } catch (sbErr) {
      console.warn('[Supabase] Order insert notice:', sbErr);
    }"""

if "Insert to Supabase (Instant ACID PostgreSQL + Order Items)" not in content:
    content = content.replace(sheets_submit_target, supabase_dual_write, 1)

# 6. Status update write-back inside updateOrderStatus
status_update_target = """    // 2. Direct Update in Google Sheets via Apps Script Web App
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
    } catch(err) {}"""

supabase_status_writeback = """    // 2. Direct Update in Google Sheets via Apps Script Web App (Kept intact)
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
    }"""

if "Instant ACID Write-Back to Supabase PostgreSQL" not in content:
    content = content.replace(status_update_target, supabase_status_writeback, 1)

# 7. Inventory update write-back in handleSaveProductEdit
prod_edit_target = """    setProducts(updated);
    try {
      localStorage.setItem('tls_products_db', JSON.stringify(updated));
    } catch (e) {}
    await syncWithCloud(orders, updated);"""

prod_edit_supabase = """    setProducts(updated);
    try {
      localStorage.setItem('tls_products_db', JSON.stringify(updated));
    } catch (e) {}
    await updateProductInSupabase(editingProduct);
    await syncWithCloud(orders, updated);"""

if "await updateProductInSupabase(editingProduct);" not in content:
    content = content.replace(prod_edit_target, prod_edit_supabase, 1)

# 8. Add Admin Sub-Nav Buttons for Supabase & CSV Export
nav_target = """                <button
                  onClick={handleResetToMaster}
                  title="Reload Master Orders & Catalog"
                  style={{ background: '#E0F2FE', color: '#0369A1', border: '1px solid #BAE6FD', padding: '8px 12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  🔄 Sync Master OMS
                </button>"""

nav_supabase = """                <button
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
                </button>"""

if "<span>{supabaseConnected ? '🟢 Supabase Active' : '🟡 Connect Supabase DB'}</span>" not in content:
    content = content.replace(nav_target, nav_supabase, 1)

# 9. Add Supabase Settings Modal before the closing </div> of return
modal_code = """
      {/* ------------------------------------------------------------- */}
      {/* MODAL: SUPABASE CLOUD DATABASE CONFIGURATION                  */}
      {/* ------------------------------------------------------------- */}
      {showSupabaseModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '30px', maxWidth: '520px', width: '100%', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>⚡</span>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F5869', fontWeight: '800' }}>
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

              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', fontSize: '0.78rem', color: '#64748B', marginBottom: '18px', border: '1px solid #E2E8F0' }}>
                <b>Quick 3-Step Setup:</b>
                <ol style={{ margin: '6px 0 0', paddingLeft: '18px' }}>
                  <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: '#0F5869', fontWeight: '700' }}>supabase.com</a>.</li>
                  <li>Paste and execute <code>schema/supabase_schema.sql</code> in the SQL Editor.</li>
                  <li>Copy Project URL & anon key from <i>Project Settings ➔ API</i> and click Save.</li>
                </ol>
                <div style={{ marginTop: '6px', color: '#0F5869' }}>
                  ✓ Google Sheets backup form submissions remain 100% active in the background!
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={supabaseSaving}
                  style={{ flex: 1, background: '#0F5869', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' }}
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
"""

last_div_target = "    </div>\n  );\n}"
if "MODAL: SUPABASE CLOUD DATABASE CONFIGURATION" not in content:
    content = content.replace(last_div_target, modal_code + "\n    </div>\n  );\n}", 1)

with open(app_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Supabase integration completed successfully in App.jsx!")
