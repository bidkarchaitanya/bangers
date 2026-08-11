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
  const coverUrl =
    typeof item.coverUrl === "string" && /^https?:\/\//i.test(item.coverUrl.trim())
      ? item.coverUrl.trim().slice(0, 500)
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

export const DEMO_BLOGS = [
  {
    id: "blog-craft-of-restraint",
    title: "The craft of restraint",
    slug: "the-craft-of-restraint",
    author: "Bangers Editorial",
    tags: ["Craft", "UI"],
    coverUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
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
    coverUrl:
      "https://images.unsplash.com/photo-1550745165-9bc8b52fd981?auto=format&fit=crop&w=1600&q=80",
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
    coverUrl:
      "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=1600&q=80",
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
    coverUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
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
];
