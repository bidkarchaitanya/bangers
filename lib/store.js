import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "board.json");

const EMPTY = { pending: [], approved: [], rejected: [] };

export async function readStore() {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY };
  }
}

export async function writeStore(store) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(store, null, 2));
}

export function isValidTweetId(id) {
  return typeof id === "string" && /^\d{1,25}$/.test(id);
}

export function checkKey(key) {
  const expected = process.env.ADMIN_KEY || "bangers-admin";
  return key === expected;
}
