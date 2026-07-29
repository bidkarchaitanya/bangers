import { promises as fs } from "fs";
import path from "path";

const REDIS_KEY = "bangers:board";
const GIST_FILENAME = "board.json";
const EMPTY = { pending: [], approved: [], rejected: [] };

// Local: ./data/board.json
// Vercel: prefer Upstash Redis, then a GitHub Gist, then /tmp (ephemeral).
const FILE = process.env.VERCEL
  ? path.join("/tmp", "bangers-board.json")
  : path.join(process.cwd(), "data", "board.json");

function memoryGet() {
  return globalThis.__bangersStore || null;
}

function memorySet(store) {
  globalThis.__bangersStore = store;
}

function normalize(store) {
  return {
    pending: store?.pending || [],
    approved: store?.approved || [],
    rejected: store?.rejected || [],
  };
}

function hasRedis() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

function hasGist() {
  return Boolean(process.env.BOARD_GIST_ID && process.env.GITHUB_TOKEN);
}

async function redisGet() {
  if (!hasRedis()) return null;
  try {
    const res = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/get/${encodeURIComponent(REDIS_KEY)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.result == null) return null;
    const parsed =
      typeof json.result === "string" ? JSON.parse(json.result) : json.result;
    return normalize(parsed);
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
      body: JSON.stringify(["SET", REDIS_KEY, JSON.stringify(store)]),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function gistMeta() {
  const res = await fetch(
    `https://api.github.com/gists/${process.env.BOARD_GIST_ID}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "bangers-board",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) return null;
  return res.json();
}

async function gistGet() {
  if (!hasGist()) return null;
  try {
    const gist = await gistMeta();
    const rawUrl = gist?.files?.[GIST_FILENAME]?.raw_url;
    const content = gist?.files?.[GIST_FILENAME]?.content;
    if (content) return normalize(JSON.parse(content));
    if (!rawUrl) return null;
    const raw = await fetch(rawUrl, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        "User-Agent": "bangers-board",
      },
      cache: "no-store",
    });
    if (!raw.ok) return null;
    return normalize(JSON.parse(await raw.text()));
  } catch {
    return null;
  }
}

async function gistSet(store) {
  if (!hasGist()) return false;
  try {
    const res = await fetch(
      `https://api.github.com/gists/${process.env.BOARD_GIST_ID}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "bangers-board",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: {
              content: JSON.stringify(store, null, 2),
            },
          },
        }),
        cache: "no-store",
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function fileGet() {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return normalize(JSON.parse(raw));
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
  // Shared backends first — never trust process memory across serverless instances.
  const fromRedis = await redisGet();
  if (fromRedis) {
    memorySet(fromRedis);
    return structuredClone(fromRedis);
  }

  const fromGist = await gistGet();
  if (fromGist) {
    memorySet(fromGist);
    return structuredClone(fromGist);
  }

  const fromFile = await fileGet();
  if (fromFile) {
    memorySet(fromFile);
    return structuredClone(fromFile);
  }

  const fromMemory = memoryGet();
  if (fromMemory) return structuredClone(fromMemory);

  return { ...EMPTY };
}

export async function writeStore(store) {
  const next = normalize(store);
  memorySet(next);

  const redisOk = await redisSet(next);
  const gistOk = await gistSet(next);
  const fileOk = await fileSet(next);

  // On Vercel, /tmp is per-instance — require a shared backend.
  if (process.env.VERCEL && !redisOk && !gistOk) {
    throw new Error("Could not save board data to durable storage");
  }
  if (!process.env.VERCEL && !redisOk && !gistOk && !fileOk) {
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
