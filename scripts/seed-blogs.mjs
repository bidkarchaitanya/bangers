/**
 * Seeds CMS demo blogs into durable store on a target host.
 * Usage: node scripts/seed-blogs.mjs [baseUrl]
 * Reads ADMIN_KEY from process env or .env.local (never prints it).
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadLocalEnv() {
  const file = resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadLocalEnv();

const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const key = process.env.ADMIN_KEY;

if (!key) {
  console.error("ADMIN_KEY missing — set it or add to .env.local");
  process.exit(1);
}

function cookieFrom(res) {
  const raw = res.headers.getSetCookie?.() || [];
  if (raw.length) return raw.map((c) => c.split(";")[0]).join("; ");
  const single = res.headers.get("set-cookie");
  return single ? single.split(",")[0].split(";")[0] : "";
}

const login = await fetch(`${base}/api/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key }),
});

if (!login.ok) {
  console.error(`Login failed (${login.status})`);
  process.exit(1);
}

const cookie = cookieFrom(login);
if (!cookie) {
  console.error("No session cookie returned");
  process.exit(1);
}

const seed = await fetch(`${base}/api/admin/blogs`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Cookie: cookie,
  },
  body: JSON.stringify({ action: "seed-demo" }),
});

const json = await seed.json().catch(() => ({}));
if (!seed.ok) {
  console.error(`Seed failed (${seed.status}): ${json.error || "unknown"}`);
  process.exit(1);
}

console.log(
  `Seeded blogs on ${base}: added=${json.added ?? 0} updated=${json.updated ?? 0}`
);
