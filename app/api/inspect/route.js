import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function pickMeta(html, names) {
  for (const name of names) {
    const re = new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${name}["']`,
      "i"
    );
    const m = html.match(re);
    if (m) return (m[1] || m[2] || "").trim();
  }
  return null;
}

function decode(str) {
  if (!str) return str;
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let raw = (searchParams.get("url") || "").trim();
  if (!raw) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;

  let target;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (!/\./.test(target.hostname)) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 9000);

  let html = "";
  let finalUrl = target.href;
  try {
    const res = await fetch(target.href, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 BangersBot/1.0",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    finalUrl = res.url || finalUrl;
    html = (await res.text()).slice(0, 500_000);
  } catch {
    // Site unreachable from server — still return screenshot-based preview.
  } finally {
    clearTimeout(timer);
  }

  const host = new URL(finalUrl).hostname.replace(/^www\./, "");

  const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title =
    decode(pickMeta(html, ["og:title", "twitter:title"])) ||
    decode(titleTag ? titleTag[1].trim() : null) ||
    host;

  const description = decode(
    pickMeta(html, ["og:description", "twitter:description", "description"])
  );

  let ogImage = pickMeta(html, ["og:image", "twitter:image"]);
  if (ogImage) {
    try {
      ogImage = new URL(ogImage, finalUrl).href;
    } catch {
      ogImage = null;
    }
  }

  const themeColor = pickMeta(html, ["theme-color"]);
  const siteName = decode(pickMeta(html, ["og:site_name"]));

  return NextResponse.json({
    url: finalUrl,
    host,
    title,
    siteName,
    description,
    themeColor,
    ogImage,
    favicon: `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
    screenshot: `https://s0.wp.com/mshots/v1/${encodeURIComponent(
      finalUrl
    )}?w=1200&h=750`,
    reachable: html.length > 0,
  });
}
