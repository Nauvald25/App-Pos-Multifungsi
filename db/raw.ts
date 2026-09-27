// Akses binding D1 (Cloudflare) — baik di edge runtime (produksi)
// maupun saat preview lokal (Vinext / Miniflare / Wrangler).
// Dipakai oleh route handler di app/api/* dengan .prepare() / .batch().

type D1 = import("@cloudflare/workers-types").D1Database;

type Ctx = { env?: Record<string, unknown>; cloudflare?: { env?: Record<string, unknown> } };

function tryGet(name: string): D1 | undefined {
  // 1. Next.js App Router request context (async-local-storage) — Vinext/Next-on-Pages
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("next/async-local-storage") as {
      getRequestContext?: () => Ctx | undefined;
    };
    const ctx = mod.getRequestContext?.();
    const db = (ctx?.env ?? ctx?.cloudflare?.env)?.[name] as D1 | undefined;
    if (db) return db;
  } catch {
    /* lanjut fallback */
  }

  // 2. Global yang disuntikkan Vinext/Wrangler saat dev
  const g = globalThis as unknown as {
    __D1_DB?: D1;
    env?: Record<string, D1>;
    process?: { env?: Record<string, D1> };
  };
  return g.__D1_DB ?? g.env?.[name] ?? g.process?.env?.[name];
}

export function database(bindingName = "DB"): D1 {
  const db = tryGet(bindingName);
  if (!db) {
    throw new Error(
      `Binding D1 '${bindingName}' tidak tersedia. Jalankan via \`npm run dev\` (Vinext) atau \`npm start\` (Wrangler), dan pastikan migrasi D1 sudah diterapkan (drizzle/0000_init.sql).`
    );
  }
  return db;
}
