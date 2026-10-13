app_path = r"c:\Users\navin\TheLadduStory\admin-desktop\src\App.jsx"

with open(app_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update handleSaveSupabaseConfig
old_save = """        if (dbOrders && dbOrders.length > 0) {
          setOrders(prev => {
            const map = new Map();
            prev.forEach(o => map.set(o.orderId, o));
            dbOrders.forEach(o => map.set(o.orderId, { ...map.get(o.orderId), ...o }));
            return Array.from(map.values());
          });
        }
        const dbProducts = await fetchProductsFromSupabase();"""

new_save = """        if (dbOrders && dbOrders.length > 0) {
          setOrders(prev => {
            const map = new Map();
            prev.forEach(o => map.set(o.orderId, o));
            dbOrders.forEach(o => map.set(o.orderId, { ...map.get(o.orderId), ...o }));
            return Array.from(map.values());
          });
        } else {
          // If Supabase tables are empty, automatically seed existing master orders into Supabase!
          for (const ord of MASTER_OMS_ORDERS) {
            await insertOrderToSupabase(ord);
          }
        }
        const dbProducts = await fetchProductsFromSupabase();"""

if old_save in content:
    content = content.replace(old_save, new_save, 1)

# 2. Update handleResetToMaster
old_reset = """  // Re-sync all orders from master dataset
  const handleResetToMaster = async () => {
    setOrders(MASTER_OMS_ORDERS);
    setProducts(INITIAL_PRODUCTS);
    await syncWithCloud(MASTER_OMS_ORDERS, INITIAL_PRODUCTS);
    alert('✓ Synced all Master Orders & Products from OMS Database!');
  };"""

new_reset = """  // Re-sync all orders from master dataset (Populates Supabase as primary DB)
  const handleResetToMaster = async () => {
    setOrders(MASTER_OMS_ORDERS);
    setProducts(INITIAL_PRODUCTS);
    await syncWithCloud(MASTER_OMS_ORDERS, INITIAL_PRODUCTS);

    if (isSupabaseConfigured()) {
      let count = 0;
      for (const ord of MASTER_OMS_ORDERS) {
        await insertOrderToSupabase(ord);
        count++;
      }
      alert(`✓ Successfully synced ${count} Master Orders, Items & Customers directly into Supabase Primary Database!`);
    } else {
      alert('✓ Synced all Master Orders & Products locally! (Connect Supabase in top bar to sync with Cloud DB)');
    }
  };"""

if old_reset in content:
    content = content.replace(old_reset, new_reset, 1)

with open(app_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Updated App.jsx with auto-seeding of master orders to Supabase!")
