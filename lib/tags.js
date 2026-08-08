// Curated design-type taxonomy for the CMS demo.
export const DESIGN_TAGS = [
  "UI",
  "Typography",
  "Motion",
  "3D",
  "Branding",
  "Interaction",
  "Illustration",
  "Product",
  "Web",
  "Craft",
];

const TAG_SET = new Set(DESIGN_TAGS.map((t) => t.toLowerCase()));

export function normalizeTags(input) {
  if (!Array.isArray(input)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const cleaned = raw.trim();
    if (!cleaned) continue;
    const canonical = DESIGN_TAGS.find(
      (t) => t.toLowerCase() === cleaned.toLowerCase()
    );
    if (!canonical) continue;
    const key = canonical.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(canonical);
  }
  return out.slice(0, 6);
}

export function normalizeDescription(input) {
  if (typeof input !== "string") return null;
  const trimmed = input.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  return trimmed.slice(0, 280);
}

export function isKnownTag(tag) {
  return typeof tag === "string" && TAG_SET.has(tag.toLowerCase());
}
