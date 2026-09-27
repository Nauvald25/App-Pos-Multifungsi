// scripts/patch-vinext.mjs
// Memperbaiki vinext yang meng-import `parseSync` dari "vite" (sudah dihapus
// sejak Vite 6). parseSync disediakan oleh paket "es-module-lexer".
// Dijalankan otomatis via `postinstall` setelah `npm install`.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const dist = join(process.cwd(), "node_modules", "vinext", "dist");
if (!existsSync(dist)) {
  console.log("[patch-vinext] node_modules/vinext/dist tidak ditemukan, skip.");
  process.exit(0);
}

let patched = 0;
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!p.endsWith(".js")) continue;
    let src = readFileSync(p, "utf8");
    // Pisahkan `parseSync` dari import "vite" dan arahkan ke "es-module-lexer".
    const out = src.replace(
      /import\s*\{\s*([^}]*?)\s*\}\s*from\s*["']vite["']/g,
      (m, names) => {
        const list = names.split(",").map((n) => n.trim()).filter(Boolean);
        if (!list.includes("parseSync")) return m;
        const others = list.filter((n) => n !== "parseSync");
        const lines = [];
        if (others.length) lines.push(`import { ${others.join(", ")} } from "vite";`);
        lines.push(`import { parseSync } from "es-module-lexer";`);
        return lines.join("\n");
      }
    );
    if (out !== src) { writeFileSync(p, out); patched++; }
  }
}
walk(dist);
console.log(`[patch-vinext] diperbaiki: ${patched} file di vinext/dist.`);
