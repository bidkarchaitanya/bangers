import { NextResponse } from "next/server";
import {
  readStore,
  writeStore,
  isValidTweetId,
  checkKey,
} from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!checkKey(key)) {
    return NextResponse.json({ error: "Wrong passcode" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({
    pending: store.pending,
    approved: store.approved,
  });
}

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

  const id = String(body?.id || "");
  const action = body?.action;
  if (!isValidTweetId(id) || !["approve", "reject", "remove"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const store = await readStore();
  const fromPending = store.pending.find((t) => t.id === id);
  store.pending = store.pending.filter((t) => t.id !== id);

  if (action === "approve") {
    if (!store.approved.some((t) => t.id === id)) {
      store.approved.push({
        id,
        mediaUrl: fromPending?.mediaUrl || null,
        author: fromPending?.author || null,
        submittedAt: fromPending?.submittedAt || new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      });
    }
  } else if (action === "reject") {
    store.rejected.push({ id, rejectedAt: new Date().toISOString() });
  } else if (action === "remove") {
    store.approved = store.approved.filter((t) => t.id !== id);
  }

  await writeStore(store);
  return NextResponse.json({ ok: true });
}
