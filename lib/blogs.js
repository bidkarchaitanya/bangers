import { DESIGN_TAGS, normalizeTags } from "./tags";

export function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function normalizeBlog(item = {}) {
  const title = typeof item.title === "string" ? item.title.trim().slice(0, 120) : "";
  const slug =
    (typeof item.slug === "string" && slugify(item.slug)) ||
    slugify(title) ||
    `post-${String(item.id || "").slice(0, 8)}`;
  const status = item.status === "published" ? "published" : "draft";
  const excerpt =
    typeof item.excerpt === "string"
      ? item.excerpt.trim().replace(/\s+/g, " ").slice(0, 240)
      : "";
  const body = typeof item.body === "string" ? item.body.trim().slice(0, 20000) : "";
  const rawCover =
    typeof item.coverUrl === "string" ? item.coverUrl.trim().slice(0, 500) : "";
  const coverUrl =
    /^https?:\/\//i.test(rawCover) || /^\/blog\/[a-z0-9._-]+\.(jpe?g|png|webp|gif)$/i.test(rawCover)
      ? rawCover
      : null;
  const author =
    typeof item.author === "string" && item.author.trim()
      ? item.author.trim().slice(0, 60)
      : "Bangers Editorial";

  return {
    id: String(item.id || ""),
    title: title || "Untitled post",
    slug,
    excerpt: excerpt || null,
    body: body || "",
    coverUrl,
    author,
    tags: normalizeTags(item.tags).filter((t) =>
      DESIGN_TAGS.includes(t)
    ),
    status,
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
    publishedAt: status === "published" ? item.publishedAt || item.updatedAt || null : null,
  };
}

export function upsertDemoBlogs(blogs = [], now = new Date().toISOString()) {
  const next = [...(blogs || [])];
  let added = 0;
  let updated = 0;

  for (const demo of DEMO_BLOGS) {
    const idx = next.findIndex((b) => b.id === demo.id || b.slug === demo.slug);
    const wasPublished = idx >= 0 && next[idx].status === "published";
    const status =
      wasPublished || demo.status === "published" ? "published" : "draft";
    const item = normalizeBlog({
      ...demo,
      id: idx >= 0 ? next[idx].id : demo.id,
      createdAt: idx >= 0 ? next[idx].createdAt || now : now,
      updatedAt: now,
      status,
      publishedAt: status === "published"
        ? (idx >= 0 && next[idx].publishedAt) || now
        : null,
    });
    if (idx >= 0) {
      next[idx] = item;
      updated += 1;
    } else {
      next.unshift(item);
      added += 1;
    }
  }

  return { blogs: next, added, updated };
}

export const DEMO_BLOGS = [
  {
    id: "blog-craft-of-restraint",
    title: "The craft of restraint",
    slug: "the-craft-of-restraint",
    author: "Bangers Editorial",
    tags: ["Craft", "UI"],
    coverUrl: "/blog/craft.jpg",
    excerpt:
      "Why the strongest product interfaces often feel quieter — and how to edit like a curator.",
    body: `Great product design is rarely about adding more. It’s about deciding what deserves to stay.

When a screen feels expensive, it’s usually because hierarchy is intentional: one primary action, one clear idea, and breathing room that isn’t accidental.

## Edit like a curator
Start with everything the stakeholder asked for. Then remove until the remaining pieces still tell the truth of the product. That leftover set is your interface.

## Restraint shows confidence
Crowded layouts signal uncertainty. Sparse layouts signal authorship. Clients feel that difference even when they can’t name it.

Use white space as a material, not leftover. Pair it with one accent — never five — and let typography carry the mood.`,
    status: "published",
  },
  {
    id: "blog-motion-with-purpose",
    title: "Motion with a job to do",
    slug: "motion-with-a-job-to-do",
    author: "Bangers Editorial",
    tags: ["Motion", "Interaction"],
    coverUrl: "/blog/motion.jpg",
    excerpt:
      "Animation isn’t decoration. It’s orientation — a short sentence about where the user just went.",
    body: `If motion doesn’t change understanding, delete it.

The best product animation answers three questions quickly: what changed, where did it come from, and what can I do next?

## Timing is content
120–200ms for micro interactions. A touch longer for spatial transitions. Anything slower starts feeling like waiting.

## Continuity over spectacle
Shared elements, soft easing, and consistent direction make a product feel coherent. Fireworks make demos; continuity makes software.`,
    status: "published",
  },
  {
    id: "blog-type-as-interface",
    title: "Typography as interface",
    slug: "typography-as-interface",
    author: "Bangers Editorial",
    tags: ["Typography", "Web"],
    coverUrl: "/blog/typography.jpg",
    excerpt:
      "Before components and color tokens, type is doing most of the product storytelling.",
    body: `Users don’t read interfaces — they scan them. Typography is the map.

A strong type system gives you size, weight, and spacing that behave like components: predictable, reusable, and expressive without noise.

## One display, one body
Pick a display face for moments of brand. Keep body text calm and highly readable. Mixing six fonts isn’t personality; it’s friction.

## Measure matters
Line length around 60–75 characters. Line height that breathes. Contrast that survives sunlight. These aren’t aesthetics — they’re accessibility and trust.`,
    status: "published",
  },
  {
    id: "blog-cms-for-design-teams",
    title: "What a design-team CMS should feel like",
    slug: "design-team-cms",
    author: "Bangers Editorial",
    tags: ["Product", "Web"],
    coverUrl: "/blog/cms.jpg",
    excerpt:
      "Collections, fields, drafts, publish — the same mental model as Webflow and Framer, tuned for curation.",
    body: `Design teams don’t want a WordPress admin from 2012. They want a content desk that feels like the tools they already trust.

## Collections over chaos
Every content type is a collection: tweets on the board, blog posts, case studies. Same table. Same inspector. Same publish flow.

## Fields tell the story
Title, slug, cover, excerpt, body, tags. Clear fields make client demos obvious: “Here’s how your team will add a post.”

## Draft → Publish
Nothing goes live until someone decides it should. That single status change is the whole trust model.`,
    status: "draft",
  },
  {
    id: "blog-color-with-intent",
    title: "Color with intent",
    slug: "color-with-intent",
    author: "Bangers Editorial",
    tags: ["Branding", "UI"],
    coverUrl: "/blog/color.jpg",
    excerpt:
      "A palette isn’t a moodboard dump — it’s a decision system for hierarchy, state, and brand memory.",
    body: `Most products don’t fail because they used the wrong hex. They fail because color has no job.

If every accent fights for attention, nothing wins. If neutrals do all the work, the brand disappears.

## Start with roles, not swatches
Primary action. Warning. Success. Quiet surface. Brand spark. Assign roles first, then pick values. The palette becomes a system instead of a shopping list.

## Contrast is a feature
Beautiful and unreadable is still broken. Check light mode, dark mode, and sunlight. Color that only works in Figma doesn’t ship.`,
    status: "draft",
  },
  {
    id: "blog-shipping-the-quiet-version",
    title: "Shipping the quiet version",
    slug: "shipping-the-quiet-version",
    author: "Bangers Editorial",
    tags: ["Product", "Craft"],
    coverUrl: "/blog/product.jpg",
    excerpt:
      "The best launch isn’t the loudest one — it’s the build that still feels intentional after the novelty fades.",
    body: `Launch energy loves novelty. Product quality loves restraint.

The quiet version is the one where flows are short, copy is honest, and every screen has one job. It’s harder to demo in a slide, and easier to live with on a Tuesday.

## Cut for clarity
If a feature needs a paragraph of explanation, it isn’t ready. Redesign the path until the action explains itself.

## Polish the path, not the poster
Hero illustrations impress stakeholders. Empty states, errors, and loading moments impress users. Ship those first.`,
    status: "draft",
  },
  {
    id: "blog-systems-that-scale",
    title: "Design systems that stay out of the way",
    slug: "design-systems-that-stay-out-of-the-way",
    author: "Bangers Editorial",
    tags: ["UI", "Product"],
    coverUrl: "/blog/systems.jpg",
    excerpt:
      "A system earns trust when it speeds decisions up — not when it adds another layer of ceremony.",
    body: `The point of a design system isn’t coverage. It’s confidence.

Teams move faster when components are obvious, tokens are named for intent, and exceptions are rare enough to feel intentional.

## Tokens over folklore
Spacing, type, and color shouldn’t live in someone’s head. Encode the rules once so every screen inherits the same judgment.

## Leave room for craft
A system that forbids taste becomes bureaucracy. Keep escape hatches for the moments that need authorship — then document why.`,
    status: "draft",
  },
];
