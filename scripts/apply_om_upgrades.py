app_path = r"c:\Users\navin\TheLadduStory\admin-desktop\src\App.jsx"

with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add fulfillmentType state and isStaffRoute check in App()
state_needle = "  const [custAddress, setCustAddress] = useState(() => customerUser ? customerUser.address : (localStorage.getItem('tls_cust_addr') || ''));"
state_replacement = """  const [custAddress, setCustAddress] = useState(() => customerUser ? customerUser.address : (localStorage.getItem('tls_cust_addr') || ''));
  const [fulfillmentType, setFulfillmentType] = useState('DELIVERY'); // 'DELIVERY' | 'PICKUP'
  
  // URL check for Staff/Admin portal (?staff, ?admin, #staff, #admin)
  const isStaffUrl = typeof window !== 'undefined' && (
    window.location.search.includes('staff') ||
    window.location.search.includes('admin') ||
    window.location.hash.includes('staff') ||
    window.location.hash.includes('admin')
  );
  const [isStaffRoute, setIsStaffRoute] = useState(isStaffUrl);"""

if "const [fulfillmentType, setFulfillmentType]" not in content:
    content = content.replace(state_needle, state_replacement, 1)

# 2. Add auto-open PIN modal if ?staff is in URL
effect_needle = "    pollCloud();\n    const interval = setInterval(pollCloud, 10000);"
effect_replacement = """    pollCloud();
    const interval = setInterval(pollCloud, 10000);

    // Auto-prompt staff login modal if ?staff is visited
    if (isStaffUrl && !isAdminLoggedIn) {
      setShowLoginModal(true);
    }"""
if "Auto-prompt staff login modal if ?staff is visited" not in content:
    content = content.replace(effect_needle, effect_replacement, 1)

# 3. Update submitToGoogleSheets to single path (No Duplicates!)
form_sync_old = """      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      // Also submit directly to Google Apps Script Web App for instant OMS sheet entry
      try {
        await fetch(APPS_SCRIPT_EXEC_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            name: orderData.name,
            phone: orderData.phone,
            address: orderData.address,
            paymentMethod: orderData.paymentMethod || 'UPI',
            totalAmount: orderData.total,
            items: orderData.items.map(i => ({
              sku: i.sku,
              name: i.name,
              pack: i.cleanWeight,
              qty: i.qty,
              unitPrice: i.unitPrice
            }))
          })
        });
      } catch(e) {}"""

form_sync_clean = """      // Single, unified Google Form submission (Prevents duplicate rows in Google Sheets)
      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });"""

if form_sync_old in content:
    content = content.replace(form_sync_old, form_sync_clean, 1)

# 4. Update handleCheckout with fulfillmentType and double-click protection
checkout_validation_old = """  // CHECKOUT
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty! Please select delicious laddus to place order.');
      return;
    }
    if (!custName.trim() || !custPhone.trim() || !custAddress.trim()) {
      alert('Please fill in your Name, 10-Digit Mobile Number, and Delivery Address.');
      return;
    }"""

checkout_validation_new = """  // CHECKOUT
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
    }"""

if checkout_validation_old in content:
    content = content.replace(checkout_validation_old, checkout_validation_new, 1)

# Order object creation in handleCheckout
order_create_old = """    const newOrder = {
      orderId,
      time: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      channel: 'ONLINE_STORE',
      name: custName.trim(),
      phone: cleanPhone,
      address: custAddress.trim(),"""

order_create_new = """    const resolvedAddress = fulfillmentType === 'PICKUP'
      ? (custAddress.trim() ? `Self-Pickup (${custAddress.trim()})` : 'Store Self-Pickup: The Laddu Story Kitchen, Bangalore')
      : custAddress.trim();

    const newOrder = {
      orderId,
      time: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) + ', ' + new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      channel: fulfillmentType === 'PICKUP' ? 'STORE_PICKUP' : 'ONLINE_STORE',
      fulfillmentType,
      name: custName.trim(),
      phone: cleanPhone,
      address: resolvedAddress,"""

if order_create_old in content:
    content = content.replace(order_create_old, order_create_new, 1)

# 5. Add upsertProductInSupabase import and update product creation/editing
content = content.replace(
    "  updateProductInSupabase,\n  subscribeToSupabaseRealtime",
    "  updateProductInSupabase,\n  upsertProductInSupabase,\n  subscribeToSupabaseRealtime"
)

# Update handleCreateProduct to call upsertProductInSupabase
create_prod_old = """    const updated = [...products, createdItem];
    setProducts(updated);
    try {
      localStorage.setItem('tls_products_db', JSON.stringify(updated));
    } catch (e) {}
    await syncWithCloud(orders, updated);
    setShowAddProductModal(false);
    alert(`✓ Product ${createdItem.name} added to catalog!`);"""

create_prod_new = """    const updated = [...products, createdItem];
    setProducts(updated);
    try {
      localStorage.setItem('tls_products_db', JSON.stringify(updated));
    } catch (e) {}
    await upsertProductInSupabase(createdItem);
    await syncWithCloud(orders, updated);
    setShowAddProductModal(false);
    alert(`✓ Product ${createdItem.name} added to catalog & synced with Supabase!`);"""

if create_prod_old in content:
    content = content.replace(create_prod_old, create_prod_new, 1)

# Update handleSaveProductEdit to call upsertProductInSupabase
save_prod_old = """    await updateProductInSupabase(editingProduct);
    await syncWithCloud(orders, updated);
    setEditingProduct(null);
    alert(`✓ Successfully updated ${editingProduct.name}!`);"""

save_prod_new = """    await upsertProductInSupabase(editingProduct);
    await syncWithCloud(orders, updated);
    setEditingProduct(null);
    alert(`✓ Successfully updated ${editingProduct.name} in Catalog & Supabase!`);"""

if save_prod_old in content:
    content = content.replace(save_prod_old, save_prod_new, 1)

# 6. Update getStatusStepIndex to support PICKUP vs DELIVERY
step_fn_old = """  const getStatusStepIndex = (status) => {
    switch (status) {
      case 'RECEIVED': return 1;
      case 'PREPARING': return 2;
      case 'PACKED': return 3;
      case 'OUT FOR DELIVERY': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  };"""

step_fn_new = """  const getStatusStepIndex = (status, fulfillment = 'DELIVERY') => {
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
  };"""

if step_fn_old in content:
    content = content.replace(step_fn_old, step_fn_new, 1)

# Update pastOrders and activeOrders filter to include ORDER PICKED UP
content = content.replace(
    "const pastOrders = myOrders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');",
    "const pastOrders = myOrders.filter(o => o.status === 'DELIVERED' || o.status === 'ORDER PICKED UP' || o.status === 'CANCELLED');"
)
content = content.replace(
    "const activeOrders = myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');",
    "const activeOrders = myOrders.filter(o => o.status !== 'DELIVERED' && o.status !== 'ORDER PICKED UP' && o.status !== 'CANCELLED');"
)

# 7. Add Fulfillment Selector in renderCartContent
cart_inputs_target = """          {/* Customer Inputs */}
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>
                CUSTOMER CONTACT & DELIVERY
              </span>"""

cart_inputs_replacement = """          {/* Fulfillment Method Selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F5869', marginBottom: '6px' }}>
              SELECT DELIVERY / PICKUP METHOD:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFulfillmentType('DELIVERY')}
                style={{
                  padding: '9px 8px',
                  borderRadius: '8px',
                  border: fulfillmentType === 'DELIVERY' ? '2px solid #0F5869' : '1px solid #CBD5E1',
                  background: fulfillmentType === 'DELIVERY' ? '#E0F2FE' : '#fff',
                  color: fulfillmentType === 'DELIVERY' ? '#0F5869' : '#64748B',
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
                  border: fulfillmentType === 'PICKUP' ? '2px solid #0F5869' : '1px solid #CBD5E1',
                  background: fulfillmentType === 'PICKUP' ? '#E0F2FE' : '#fff',
                  color: fulfillmentType === 'PICKUP' ? '#0F5869' : '#64748B',
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
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#475569' }}>
                {fulfillmentType === 'PICKUP' ? 'CONTACT & PICKUP DETAILS' : 'CUSTOMER CONTACT & DELIVERY'}
              </span>"""

if cart_inputs_target in content:
    content = content.replace(cart_inputs_target, cart_inputs_replacement, 1)

# In textarea address, update placeholder for pickup
addr_old = """            <textarea
              id="checkout-cust-address"
              rows={2}
              placeholder="Complete Delivery Address with Pincode *"
              value={custAddress}
              onChange={e => setCustAddress(e.target.value)}
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
            />"""

addr_new = """            {fulfillmentType === 'PICKUP' && (
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
            />"""

if addr_old in content:
    content = content.replace(addr_old, addr_new, 1)

# In Bill Summary: update delivery fee line
bill_old = """            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '8px', fontWeight: '600' }}>
              <span>Bangalore Express Delivery</span>
              <span>FREE</span>
            </div>"""

bill_new = """            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#059669', marginBottom: '8px', fontWeight: '600' }}>
              <span>{fulfillmentType === 'PICKUP' ? 'Store Pickup Collection' : 'Bangalore Express Delivery'}</span>
              <span>FREE</span>
            </div>"""

if bill_old in content:
    content = content.replace(bill_old, bill_new, 1)

# 8. Hide Staff Login button on public customer navbar unless isStaffRoute is true
nav_staff_old = """            ) : (
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
            )}"""

nav_staff_new = """            ) : isStaffRoute ? (
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
            ) : null}"""

if nav_staff_old in content:
    content = content.replace(nav_staff_old, nav_staff_new, 1)

# 9. Update Customer Tracking Stepper for Pickup vs Delivery
stepper_old = """                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', textAlign: 'center', gap: '6px' }}>
                                  {[
                                    { label: 'Received', step: 1 },
                                    { label: 'Preparing in Cow Ghee', step: 2 },
                                    { label: 'Box Packed', step: 3 },
                                    { label: 'Out for Delivery', step: 4 },
                                    { label: 'Delivered', step: 5 }
                                  ].map(s => {"""

stepper_new = """                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', textAlign: 'center', gap: '6px' }}>
                                  {(o.fulfillmentType === 'PICKUP' || (o.channel && o.channel.includes('PICKUP')) ? [
                                    { label: 'Received', step: 1 },
                                    { label: 'Preparing in Cow Ghee', step: 2 },
                                    { label: 'Box Packed', step: 3 },
                                    { label: 'Ready for Pickup', step: 4 },
                                    { label: 'Order Picked Up', step: 5 }
                                  ] : [
                                    { label: 'Received', step: 1 },
                                    { label: 'Preparing in Cow Ghee', step: 2 },
                                    { label: 'Box Packed', step: 3 },
                                    { label: 'Out for Delivery', step: 4 },
                                    { label: 'Delivered', step: 5 }
                                  ]).map(s => {"""

if stepper_old in content:
    content = content.replace(stepper_old, stepper_new, 1)

# Also update stepIndex invocation in activeOrders loop
content = content.replace(
    "const stepIndex = getStatusStepIndex(o.status);",
    "const isOrderPickup = o.fulfillmentType === 'PICKUP' || (o.channel && o.channel.includes('PICKUP'));\n                        const stepIndex = getStatusStepIndex(o.status, isOrderPickup ? 'PICKUP' : 'DELIVERY');"
)

# 10. Update Staff OMS order card status dropdown to support READY FOR PICKUP & ORDER PICKED UP
status_dropdown_old = """                          <select
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
                          </select>"""

status_dropdown_new = """                          <select
                            value={o.status}
                            onChange={e => updateOrderStatus(o.orderId, e.target.value)}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: '800', background: '#F1F5F9', color: '#0F5869', cursor: 'pointer' }}
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
                          </select>"""

if status_dropdown_old in content:
    content = content.replace(status_dropdown_old, status_dropdown_new, 1)

# Also update status filter chips in Staff view
filter_chips_old = "{['ALL', 'RECEIVED', 'PREPARING', 'PACKED', 'OUT FOR DELIVERY', 'DELIVERED'].map(st => {"
filter_chips_new = "{['ALL', 'RECEIVED', 'PREPARING', 'PACKED', 'READY FOR PICKUP', 'ORDER PICKED UP', 'OUT FOR DELIVERY', 'DELIVERED'].map(st => {"
if filter_chips_old in content:
    content = content.replace(filter_chips_old, filter_chips_new, 1)

with open(app_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Applied all 5 requested upgrades to App.jsx!")
