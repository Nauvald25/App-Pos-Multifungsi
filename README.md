# Kasir POS Lengkap

Aplikasi kasir (Point of Sale) full-stack berbasis **vinext (Next.js di Cloudflare Workers)** + **Cloudflare D1** (SQLite), dengan antarmuka `public/pos.html` yang mandiri dan bisa dipakai semua jenis usaha: toko ritel, kafe/restoran, fashion, jasa, grosir, dll.

## Cara Pakai Cepat

### Opsi A — Tanpa server (paling mudah, langsung jalan)
Buka file `public/pos.html` di browser apa pun. Semua data tersimpan di `localStorage` perangkat (produk, transaksi, laporan). Tidak perlu install apa-apa. Fitur lengkap: kasir/keranjang, diskon & pajak, multi-metode bayar (Tunai/QRIS/Kartu), cetak struk, manajemen produk & stok, riwayat transaksi, laporan + grafik, ekspor CSV/backup JSON, tema terang/gelap.

### Opsi B — Full-stack dengan database D1
```bash
npm install          # atau: npm run install:ci
npm run build        # build -> dist/server/wrangler.json
# Terapkan migrasi D1 lokal:
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_init.sql
npm run dev          # http://localhost:5173 -> redirect ke /pos.html
```

## Struktur
- `app/page.tsx` — redirect ke `/pos.html`
- `public/pos.html` — antarmuka POS mandiri (single-file, offline-capable)
- `app/api/products` — GET/POST/DELETE produk (D1)
- `app/api/sales` — POST transaksi (validasi, batch insert ke `sales` + `sale_items`)
- `app/api/reports` — GET laporan harian/mingguan/bulanan
- `db/schema.ts` + `drizzle/0000_init.sql` — skema D1 (products, sales, sale_items)
- `db/raw.ts` — helper akses binding `DB`

---

# vinext-starter

A clean full-stack starter running on [vinext](https://github.com/cloudflare/vinext), with optional Cloudflare D1 and Drizzle support.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More




## hasil aplikasi
<img width="1919" height="837" alt="image" src="https://github.com/user-attachments/assets/96ce0d6d-4f40-4b12-9e30-7ba1025ea6d7" />
## fitur 
Berdasarkan tampilan aplikasi POS (Point of Sale) pada gambar, berikut adalah panduan cara menggunakan fitur-fitur utamanya:

1. Kasir (Menu Utama Transaksi)
Klik menu Kasir di sidebar kiri.

Pilih atau cari produk yang ingin dibeli pelanggan.

Masukkan jumlah (qty) barang, pilih metode pembayaran (Tunai/QRIS/dll.), lalu selesaikan transaksi untuk mencetak/menyimpan struk.

2. Kelola Produk (Tambah & Edit Barang)
Klik menu Produk di sidebar kiri.

Di menu ini Anda bisa:

Menambah produk baru (Nama, Harga Beli, Harga Jual, Stok).

Mengedit atau menghapus data barang yang sudah ada.

Memantau sisa stok barang secara real-time.

3. Riwayat Transaksi
Klik menu Riwayat Transaksi untuk melihat daftar penjualan yang telah selesai dilakukan.

Digunakan untuk mengecek detail transaksi lalu, mencetak ulang struk, atau melakukan pembatalan/retur jika diperlukan.

4. Laporan
Klik menu Laporan untuk melihat analisis detail penjualan bulanan/harian, laporan laba rugi, serta melakukan ekspor data (seperti ekspor ke file CSV/Excel).

<img width="1919" height="806" alt="image" src="https://github.com/user-attachments/assets/ad195c1b-04cb-41e9-b232-72a95701b44f" />
## fitur 
Cari atau Pilih Produk

Gunakan kolom pencarian "Cari produk atau ketik kode..." di bagian atas, atau filter berdasarkan kategori (Semua, Minuman, Makanan, Snack, Kebutuhan).

Klik pada kartu produk yang ingin dibeli (misalnya: Air Mineral 600ml, Rokok SPM, dll.) untuk memasukkannya ke dalam keranjang.

Atur Keranjang Belanja

Produk yang diklik akan muncul di panel Keranjang sebelah kanan.

Anda bisa menambah/mengurangi jumlah (qty) produk di keranjang, atau menekan tombol Kosongkan untuk menghapus semua barang dari keranjang jika terjadi pembatalan.

Selesaikan Transaksi

Setelah semua produk masuk ke keranjang, klik tombol Bayar atau Selesaikan Transaksi yang muncul di bagian bawah panel keranjang.

Masukkan nominal uang yang diterima dari pembeli, lalu cetak atau simpan struk pembayaran.

<img width="1919" height="789" alt="image" src="https://github.com/user-attachments/assets/702e522a-f857-45c4-a644-e0a4be288bb7" />
## fitur
Menambah Produk Baru

Klik tombol + Tambah Produk di pojok kanan atas.

Masukkan informasi barang seperti nama produk, kode produk (SKU), kategori (Minuman, Makanan, dll.), harga jual, harga beli, dan jumlah stok awal.

Mencari Produk

Gunakan kolom pencarian "Cari produk..." untuk menemukan barang tertentu secara cepat berdasarkan nama atau kodenya (misal: Kopi Hitam, KM-01).

Mengedit Data Produk

Klik tombol hijau Edit pada baris produk yang ingin diubah.

Anda bisa memperbarui harga jual, menambah/mengurangi jumlah stok, atau mengubah status produk.

Menghapus Produk

Klik tombol merah Hapus jika produk tersebut sudah tidak dijual lagi atau ingin dihapus dari daftar sistem.

<img width="1919" height="746" alt="image" src="https://github.com/user-attachments/assets/eeb4fe7a-322e-4bf0-a465-e8d02807cbf7" />

## fitur 
Melihat Detail Transaksi

Klik tombol hijau Detail pada kolom Aksi di baris transaksi yang ingin dilihat.

Rincian mengenai produk apa saja yang dibeli, jumlah item, metode pembayaran (Tunai/QRIS), serta cetak ulang struk akan ditampilkan.

Filter Berdasarkan Tanggal

Gunakan pemilih tanggal (mm/dd/yyyy) di pojok kanan atas tabel untuk menyaring riwayat penjualan berdasarkan tanggal tertentu yang Anda inginkan.

Mengekspor Data ke CSV

Klik tombol CSV di sebelah filter tanggal untuk mengunduh seluruh catatan riwayat transaksi ke dalam file spreadsheet (.csv) untuk kebutuhan rekapitulasi atau pembukuan.

<img width="1911" height="829" alt="image" src="https://github.com/user-attachments/assets/34296e25-16e8-4ef9-a6b5-7f68b0a113f0" />

## fitur 

Melihat Detail Transaksi

Klik tombol hijau Detail pada kolom Aksi di baris transaksi yang ingin dilihat.

Rincian mengenai produk apa saja yang dibeli, jumlah item, metode pembayaran (Tunai/QRIS), serta cetak ulang struk akan ditampilkan.

Filter Berdasarkan Tanggal

Gunakan pemilih tanggal (mm/dd/yyyy) di pojok kanan atas tabel untuk menyaring riwayat penjualan berdasarkan tanggal tertentu yang Anda inginkan.

Mengekspor Data ke CSV

Klik tombol CSV di sebelah filter tanggal untuk mengunduh seluruh catatan riwayat transaksi ke dalam file spreadsheet (.csv) untuk kebutuhan rekapitulasi atau pembukuan.





- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)
