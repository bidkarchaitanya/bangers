import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { readStore, writeStore } from "../../../../lib/store";
import { getSessionAuthed } from "../../../../lib/auth";
import { normalizeBlog, slugify, upsertDemoBlogs } from "../../../../lib/blogs";
import { normalizeTags } from "../../../../lib/tags";

export const dynamic = "force-dynamic";

function uniqueSlug(desired, blogs, exceptId = null) {
  let base = slugify(desired) || "post";
  let slug = base;
  let i = 2;
  while (blogs.some((b) => b.slug === slug && b.id !== exceptId)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export async function GET() {
  if (!(await getSessionAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const store = await readStore();
  return NextResponse.json({
    blogs: store.blogs || [],
  });
}

export async function POST(request) {
  if (!(await getSessionAuthed())) {
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
  const blogs = store.blogs || [];
  const now = new Date().toISOString();

  if (action === "seed-demo") {
    const result = upsertDemoBlogs(blogs, now);
    store.blogs = result.blogs;
    try {
      await writeStore(store);
    } catch {
      return NextResponse.json(
        { error: "Couldn't save demo blogs" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      added: result.added,
      updated: result.updated,
    });
  }

  if (action === "create") {
    const id = randomUUID();
    const title = String(body?.title || "Untitled post").trim() || "Untitled post";
    const slug = uniqueSlug(body?.slug || title, blogs);
    const item = normalizeBlog({
      id,
      title,
      slug,
      excerpt: body?.excerpt,
      body: body?.body,
      coverUrl: body?.coverUrl,
      author: body?.author,
      tags: normalizeTags(body?.tags),
      status: body?.publish ? "published" : "draft",
      createdAt: now,
      updatedAt: now,
      publishedAt: body?.publish ? now : null,
    });
    blogs.unshift(item);
    store.blogs = blogs;
    try {
      await writeStore(store);
    } catch {
      return NextResponse.json({ error: "Couldn't create post" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, blog: item });
  }

  if (action === "update") {
    const id = String(body?.id || "");
    const idx = blogs.findIndex((b) => b.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const current = blogs[idx];
    const title =
      typeof body?.title === "string" ? body.title : current.title;
    const slug = uniqueSlug(body?.slug || title, blogs, id);
    const nextStatus =
      body?.status === "published" || body?.status === "draft"
        ? body.status
        : current.status;
    blogs[idx] = normalizeBlog({
      ...current,
      title,
      slug,
      excerpt: body?.excerpt ?? current.excerpt,
      body: body?.body ?? current.body,
      coverUrl: body?.coverUrl ?? current.coverUrl,
      author: body?.author ?? current.author,
      tags: body?.tags != null ? normalizeTags(body.tags) : current.tags,
      status: nextStatus,
      createdAt: current.createdAt || now,
      updatedAt: now,
      publishedAt:
        nextStatus === "published"
          ? current.publishedAt || now
          : null,
    });
    store.blogs = blogs;
    try {
      await writeStore(store);
    } catch {
      return NextResponse.json({ error: "Couldn't save post" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, blog: blogs[idx] });
  }

  if (action === "remove") {
    const id = String(body?.id || "");
    store.blogs = blogs.filter((b) => b.id !== id);
    try {
      await writeStore(store);
    } catch {
      return NextResponse.json({ error: "Couldn't delete post" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
