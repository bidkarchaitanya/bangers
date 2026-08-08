import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "bangers_cms";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

function secret() {
  return process.env.ADMIN_KEY || "";
}

export function signSession() {
  const sec = secret();
  if (!sec) return null;
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `v1.${exp}`;
  const sig = createHmac("sha256", sec).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token || typeof token !== "string") return false;
  const sec = secret();
  if (!sec) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [v, expStr, sig] = parts;
  if (v !== "v1") return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `${v}.${expStr}`;
  const expected = createHmac("sha256", sec).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function sessionCookieOptions(maxAge = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL),
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export async function getSessionAuthed() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

export function checkKey(key) {
  const expected = process.env.ADMIN_KEY;
  if (!expected || typeof key !== "string") return false;
  try {
    const a = Buffer.from(key);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
