import { NextResponse } from "next/server";
import {
  readStore,
  writeStore,
  isValidTweetId,
  normalizeItem,
} from "../../../lib/store";
import { getSessionAuthed } from "../../../lib/auth";
import {
  normalizeDescription,
  normalizeTags,
  DESIGN_TAGS,
} from "../../../lib/tags";
import { DEMO_APPROVED, DEMO_PENDING } from "../../../lib/demo-content";
import { checkTweetImage } from "../../../lib/tweets";

export const dynamic = "force-dynamic";

async function requireAuth() {
  return getSessionAuthed();
}

async function hydrateDemoItem(item, { approved = false } = {}) {
  const check = await checkTweetImage(item.id);
  const now = new Date().toISOString();
  return normalizeItem({
    id: item.id,
    author: check.ok ? check.author || item.author : item.author,
    mediaUrl: check.ok ? check.mediaUrl : null,
    tags: item.tags,
    description: item.description,
    submittedAt: now,
    approvedAt: approved ? now : null,
    updatedAt: approved ? now : null,
  });
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

  const action = body?.action;
  const store = await readStore();
  const now = new Date().toISOString();

  if (action === "seed-demo") {
    const known = new Set([
      ...store.pending.map((t) => t.id),
      ...store.approved.map((t) => t.id),
      ...store.rejected.map((t) => t.id),
    ]);

    let addedApproved = 0;
    let addedPending = 0;
    let updated = 0;

    for (const demo of DEMO_APPROVED) {
      const existingIdx = store.approved.findIndex((t) => t.id === demo.id);
      const hydrated = await hydrateDemoItem(demo, { approved: true });
      if (!hydrated.mediaUrl) continue;

      if (existingIdx >= 0) {
        store.approved[existingIdx] = normalizeItem({
          ...store.approved[existingIdx],
          ...hydrated,
          tags: normalizeTags(demo.tags),
          description: normalizeDescription(demo.description),
          updatedAt: now,
        });
        updated += 1;
      } else if (!known.has(demo.id)) {
        store.approved.unshift(hydrated);
        known.add(demo.id);
        addedApproved += 1;
      }
      // remove from pending if it was sitting there
      store.pending = store.pending.filter((t) => t.id !== demo.id);
    }

    for (const demo of DEMO_PENDING) {
      if (known.has(demo.id)) continue;
      const hydrated = await hydrateDemoItem(demo, { approved: false });
      if (!hydrated.mediaUrl) continue;
      store.pending.unshift(hydrated);
      known.add(demo.id);
      addedPending += 1;
    }

    try {
      await writeStore(store);
    } catch {
      return NextResponse.json(
        { error: "Couldn't save demo data. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      addedApproved,
      addedPending,
      updated,
    });
  }

  if (action === "create") {
    const id = String(body?.id || "");
    if (!isValidTweetId(id)) {
      return NextResponse.json({ error: "Invalid tweet ID" }, { status: 400 });
    }

    const tags = normalizeTags(body?.tags);
    const description = normalizeDescription(body?.description);
    const publish = Boolean(body?.publish);

    if (publish && tags.length === 0) {
      return NextResponse.json(
        { error: "Pick at least one design tag to publish" },
        { status: 400 }
      );
    }

    if (store.approved.some((t) => t.id === id)) {
      return NextResponse.json(
        { error: "Already published on the board" },
        { status: 409 }
      );
    }
    if (store.pending.some((t) => t.id === id)) {
      return NextResponse.json(
        { error: "Already in Drafts" },
        { status: 409 }
      );
    }

    const check = await checkTweetImage(id);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: 404 });
    }
    if (!check.hasImage) {
      return NextResponse.json(
        { error: "Only tweets with images or videos can be added" },
        { status: 422 }
      );
    }

    store.rejected = store.rejected.filter((t) => t.id !== id);

    const item = normalizeItem({
      id,
      mediaUrl: check.mediaUrl || null,
      author: check.author || null,
      tags,
      description,
      submittedAt: now,
      approvedAt: publish ? now : null,
      updatedAt: now,
    });

    if (publish) store.approved.unshift(item);
    else store.pending.unshift(item);

    try {
      await writeStore(store);
    } catch {
      return NextResponse.json(
        { error: "Couldn't save item. Try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      id,
      status: publish ? "published" : "draft",
    });
  }

  const id = String(body?.id || "");
  const allowed = ["approve", "reject", "remove", "update"];
  if (!isValidTweetId(id) || !allowed.includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const tags = normalizeTags(body?.tags);
  const description = normalizeDescription(body?.description);

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
