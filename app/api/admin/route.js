import { NextResponse } from "next/server";
import {
  readStore,
  writeStore,
  isValidTweetId,
  normalizeItem,
} from "../../../lib/store";
import { getSessionAuthed } from "../../../lib/auth";
import { normalizeDescription, normalizeTags, DESIGN_TAGS } from "../../../lib/tags";

export const dynamic = "force-dynamic";

async function requireAuth() {
  return getSessionAuthed();
}

export async function GET() {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await readStore();
  const tagCounts = {};
  for (const t of store.approved) {
    for (const tag of t.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  return NextResponse.json({
    pending: store.pending,
    approved: store.approved,
    stats: {
      pending: store.pending.length,
      approved: store.approved.length,
      rejected: store.rejected.length,
      tags: tagCounts,
    },
    taxonomy: DESIGN_TAGS,
  });
}

export async function POST(request) {
  if (!(await requireAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const id = String(body?.id || "");
  const action = body?.action;
  const allowed = ["approve", "reject", "remove", "update"];
  if (!isValidTweetId(id) || !allowed.includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tags = normalizeTags(body?.tags);
  const description = normalizeDescription(body?.description);
  const store = await readStore();
  const now = new Date().toISOString();

  if (action === "approve") {
    const fromPending = store.pending.find((t) => t.id === id);
    if (!fromPending) {
      return NextResponse.json(
        { error: "Submission not found in inbox" },
        { status: 404 }
      );
    }
    store.pending = store.pending.filter((t) => t.id !== id);
    if (!store.approved.some((t) => t.id === id)) {
      store.approved.unshift(
        normalizeItem({
          ...fromPending,
          tags,
          description,
          approvedAt: now,
          updatedAt: now,
        })
      );
    }
  } else if (action === "reject") {
    store.pending = store.pending.filter((t) => t.id !== id);
    if (!store.rejected.some((t) => t.id === id)) {
      store.rejected.push(normalizeItem({ id, rejectedAt: now }));
    }
  } else if (action === "remove") {
    store.approved = store.approved.filter((t) => t.id !== id);
  } else if (action === "update") {
    const idx = store.approved.findIndex((t) => t.id === id);
    if (idx === -1) {
      return NextResponse.json(
        { error: "Item not found on the board" },
        { status: 404 }
      );
    }
    store.approved[idx] = normalizeItem({
      ...store.approved[idx],
      tags,
      description,
      updatedAt: now,
    });
  }

  try {
    await writeStore(store);
  } catch {
    return NextResponse.json(
      { error: "Couldn't save changes. Try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
