// scripts/sites-env.mjs — mempertahankan HOME/npm cache/proxy/XDG/tmp pemanggil
// sambil men-default state Wrangler & Miniflare ke checkout.
// Dipakai sebagai --import sebelum menjalankan wrangler (mis. migrasi D1 lokal).
import { mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { env } from "node:process";

const root = resolve(process.cwd());
const stateDir = join(root, ".wrangler", "state");
try { statSync(stateDir); } catch { mkdirSync(stateDir, { recursive: true }); }

env.WRANGLER_HOME ??= join(root, ".wrangler");
env.CF_HOME ??= join(root, ".wrangler");
// Biarkan variabel pemanggil (HOME, npm_config_*, HTTP_PROXY, XDG_*, TMPDIR) apa adanya.
console.error("[sites-env] Wrangler state ->", stateDir);
