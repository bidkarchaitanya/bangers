import { NextResponse } from "next/server";
import { isValidTweetId } from "../../../lib/store";
import { checkTweetImage } from "../../../lib/tweets";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id") || "";
  if (!isValidTweetId(id)) {
    return NextResponse.json({ error: "Invalid tweet ID" }, { status: 400 });
  }

  const result = await checkTweetImage(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({
    hasImage: result.hasImage,
    photoCount: result.photoCount,
    author: result.author,
  });
}
