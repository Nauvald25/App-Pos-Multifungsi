import { defineConfig } from "vite";
import vinext from "vinext/plugin";
import tailwindcss from "@tailwindcss/vite";

// Konfigurasi Vite untuk Vinext (Next.js di Cloudflare Workers).
// Binding D1 (`DB`) disimulasikan oleh plugin Vinext saat `npm run dev`
// dan disuntikkan oleh Worker runtime di produksi (lihat .openai/hosting.json).
// Akses binding dari route handler via helper `database()` di `db/raw.ts`.

export default defineConfig({
  plugins: [vinext(), tailwindcss()],
  resolve: {
    alias: { "@": new URL("./", import.meta.url).pathname },
  },
  optimizeDeps: { exclude: ["vinext"] },
});
