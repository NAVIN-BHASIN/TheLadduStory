-- Local SQLite Offline-First Schema for The Laddu Story Admin Terminal

CREATE TABLE IF NOT EXISTS local_orders (
    order_id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    channel TEXT NOT NULL,
    customer_name TEXT,
    customer_phone TEXT,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_amount REAL NOT NULL,
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    order_status TEXT NOT NULL,
    notes TEXT,
    synced_to_cloud INTEGER DEFAULT 0 -- 0: Pending sync, 1: Synced to Google Sheets
);

CREATE TABLE IF NOT EXISTS local_inventory (
    sku TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit_price REAL NOT NULL,
    initial_stock INTEGER NOT NULL,
    current_stock INTEGER NOT NULL,
    min_threshold INTEGER NOT NULL,
    reorder_status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_queue (
    queue_id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,
    action TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    retry_count INTEGER DEFAULT 0
);
