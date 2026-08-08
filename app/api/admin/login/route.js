import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkKey,
  sessionCookieOptions,
  signSession,
} from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!checkKey(body?.key)) {
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }

  const token = signSession();
  if (!token) {
    return NextResponse.json(
      { error: "Admin key is not configured on the server" },
      { status: 500 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
