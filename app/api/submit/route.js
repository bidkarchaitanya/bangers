import { NextResponse } from "next/server";
import { readStore, writeStore, isValidTweetId } from "../../../lib/store";
import { checkTweetImage } from "../../../lib/tweets";

export const dynamic = "force-dynamic";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = String(body?.id || "");
  if (!isValidTweetId(id)) {
    return NextResponse.json({ error: "Invalid tweet ID" }, { status: 400 });
  }

  const check = await checkTweetImage(id);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 404 });
  }
  if (!check.hasImage) {
    return NextResponse.json(
      { error: "Only tweets with images or videos can go on the board" },
      { status: 422 }
    );
  }

  const store = await readStore();
  const everywhere = [...store.pending, ...store.approved, ...store.rejected];
  if (everywhere.some((t) => t.id === id)) {
    return NextResponse.json({ status: "already-submitted" });
  }

  store.pending.push({
    id,
    mediaUrl: check.mediaUrl || null,
    author: check.author || null,
    submittedAt: new Date().toISOString(),
  });
  await writeStore(store);
  return NextResponse.json({ status: "pending" });
}
