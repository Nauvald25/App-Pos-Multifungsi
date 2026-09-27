-- Migrasi awal D1 untuk Kasir POS.
-- Terapkan di lokal:
--   node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_init.sql
-- (build dulu dengan `npm run build` agar dist/server/wrangler.json dihasilkan)

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  icon TEXT NOT NULL DEFAULT '📦',
  tone TEXT NOT NULL DEFAULT '#e7f0ea',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sales (
  id INTEGER PRIMARY KEY,
  created_at TEXT NOT NULL,
  total INTEGER NOT NULL,
  method TEXT NOT NULL,
  paid INTEGER NOT NULL,
  cashier TEXT DEFAULT 'Kasir',
  status TEXT NOT NULL DEFAULT 'completed'
);
CREATE INDEX IF NOT EXISTS sales_created_at_idx ON sales (created_at);

CREATE TABLE IF NOT EXISTS sale_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id INTEGER,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL
);

-- Data contoh (opsional) — hapus baris di bawah jika tidak diinginkan.
INSERT OR IGNORE INTO products (name, category, price, stock, icon, tone, active) VALUES
  ('Kopi Hitam', 'Minuman', 12000, 50, '☕', '#e0f2fe', 1),
  ('Es Teh Manis', 'Minuman', 5000, 80, '🧋', '#dcfce7', 1),
  ('Nasi Goreng', 'Makanan', 22000, 25, '🍚', '#ffedd5', 1),
  ('Ayam Geprek', 'Makanan', 25000, 20, '🍗', '#fee2e2', 1),
  ('Kentang Goreng', 'Snack', 12000, 40, '🍟', '#fef9c3', 1),
  ('Air Mineral 600ml', 'Kebutuhan', 4000, 100, '💧', '#e0e7ff', 1);
