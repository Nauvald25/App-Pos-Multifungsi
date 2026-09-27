import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

// Skema D1 (SQLite) untuk Kasir POS.
// Migrasi SQL dihasilkan dengan `npm run db:generate` (drizzle-kit).

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(), // dalam satuan mata uang (integer, tanpa desimal)
  stock: integer("stock").notNull().default(0),
  sku: text("sku"),
  icon: text("icon").notNull().default("📦"),
  tone: text("tone").notNull().default("#e7f0ea"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const sales = sqliteTable(
  "sales",
  {
    id: integer("id").primaryKey(), // diisi client dengan random 64-bit
    createdAt: text("created_at").notNull(),
    total: integer("total").notNull(),
    method: text("method").notNull(), // 'Tunai' | 'Non-tunai' | 'QRIS' | ...
    paid: integer("paid").notNull(),
    cashier: text("cashier").default("Kasir"),
    status: text("status").notNull().default("completed"), // 'completed' | 'void'
  },
  (t) => [index("sales_created_at_idx").on(t.createdAt)]
);

export const saleItems = sqliteTable("sale_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  saleId: integer("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  productId: integer("product_id"),
  name: text("name").notNull(), // snapshot nama saat transaksi
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
});

export type Product = typeof products.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type SaleItem = typeof saleItems.$inferSelect;
