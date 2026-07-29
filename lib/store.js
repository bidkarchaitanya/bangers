import { promises as fs } from "fs";
import path from "path";

const KEY = "bangers:board";
const EMPTY = { pending: [], approved: [], rejected: [] };

// Local / long-running processes write under ./data.
// On Vercel the app filesystem is read-only, so use /tmp + in-memory,
// and Upstash Redis when configured (durable across cold starts).
const FILE = process.env.VERCEL
  ? path.join("/tmp", "bangers-board.json")
  : path.join(process.cwd(), "data", "board.json");

function memoryGet() {
  return globalThis.__bangersStore || null;
}

function memorySet(store) {
  globalThis.__bangersStore = store;
}

function hasRedis() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

async function redisGet() {
  if (!hasRedis()) return null;
  try {
    const res = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(KEY)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.result) return null;
    const parsed =
      typeof json.result === "string" ? JSON.parse(json.result) : json.result;
    return { ...EMPTY, ...parsed };
  } catch {
    return null;
  }
}

async function redisSet(store) {
  if (!hasRedis()) return false;
  try {
    const res = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["SET", KEY, JSON.stringify(store)]),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function fileGet() {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

async function fileSet(store) {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(store, null, 2));
    return true;
  } catch {
    return false;
  }
}

export async function readStore() {
  const fromMemory = memoryGet();
  if (fromMemory) return structuredClone(fromMemory);

  const fromRedis = await redisGet();
  if (fromRedis) {
    memorySet(fromRedis);
    return structuredClone(fromRedis);
  }

  const fromFile = await fileGet();
  if (fromFile) {
    memorySet(fromFile);
    return structuredClone(fromFile);
  }

  return { ...EMPTY };
}

export async function writeStore(store) {
  const next = {
    pending: store.pending || [],
    approved: store.approved || [],
    rejected: store.rejected || [],
  };
  memorySet(next);
  const redisOk = await redisSet(next);
  const fileOk = await fileSet(next);
  if (!redisOk && !fileOk && !memoryGet()) {
    throw new Error("Could not save board data");
  }
}

export function isValidTweetId(id) {
  return typeof id === "string" && /^\d{1,25}$/.test(id);
}

export function checkKey(key) {
  const expected = process.env.ADMIN_KEY;
  if (!expected) return false;
  return key === expected;
}
