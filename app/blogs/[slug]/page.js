import Link from "next/link";
import { notFound } from "next/navigation";
import { readStore } from "../../../lib/store";

export const dynamic = "force-dynamic";

function renderBody(body) {
  const lines = String(body || "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];

  function flushParagraph() {
    const text = paragraph.join(" ").replace(/\s+/g, " ").trim();
    paragraph = [];
    if (text) blocks.push({ type: "p", text });
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line.trim())) {
      flushParagraph();
      blocks.push({ type: "h2", text: line.trim().replace(/^##\s+/, "").trim() });
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    paragraph.push(line.trim());
  }
  flushParagraph();

  return blocks.map((block, i) =>
    block.type === "h2" ? (
      <h2 key={i}>{block.text}</h2>
    ) : (
      <p key={i}>{block.text}</p>
    )
  );
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const store = await readStore();
  const post = (store.blogs || []).find(
    (b) => b.slug === slug && b.status === "published"
  );
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — Bangers`,
    description: post.excerpt || undefined,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const store = await readStore();
  const post = (store.blogs || []).find(
    (b) => b.slug === slug && b.status === "published"
  );
  if (!post) notFound();

  return (
    <>
      <nav className="nav">
        <div className="container nav__inner">
          <a href="/" className="wordmark">
            Bangers<span className="dot" aria-hidden="true" />
          </a>
          <div className="nav__links">
            <a className="nav__link" href="/blogs">
              Blog
            </a>
            <a className="nav__link" href="/#board">
              Board
            </a>
            <a className="nav__cta" href="/admin">
              Open CMS
            </a>
          </div>
        </div>
      </nav>

      <article className="blog-post">
        <div className="container blog-post__inner">
          <Link className="microlabel blog-post__back" href="/blogs">
            ← All posts
          </Link>
          <header className="blog-post__head">
            <div className="blog-post__meta">
              <span className="microlabel">{post.author}</span>
              {(post.tags || []).map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <h1>{post.title}</h1>
            {post.excerpt && <p className="blog-post__excerpt">{post.excerpt}</p>}
          </header>

          {post.coverUrl && (
            <div className="blog-post__cover">
              <img src={post.coverUrl} alt="" />
            </div>
          )}

          <div className="blog-post__body">{renderBody(post.body)}</div>
        </div>
      </article>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__mark">
            Bangers<span style={{ color: "var(--red)" }}>.</span>
          </span>
          <Link className="nav__link" href="/blogs">
            More posts
          </Link>
          <span className="microlabel">Managed in CMS</span>
        </div>
      </footer>
    </>
  );
}
