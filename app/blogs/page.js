import Link from "next/link";
import { readStore } from "../../lib/store";
import { DEMO_BLOGS } from "../../lib/blogs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bangers — Blog",
  description: "Notes on craft, product, and design curation from the Bangers desk.",
};

function publishedFrom(blogs) {
  return (blogs || [])
    .filter((b) => b.status === "published")
    .sort((a, b) =>
      String(b.publishedAt || b.updatedAt || "").localeCompare(
        String(a.publishedAt || a.updatedAt || "")
      )
    );
}

export default async function BlogsPage() {
  const store = await readStore();
  const fromStore = publishedFrom(store.blogs);
  const posts = fromStore.length > 0 ? fromStore : publishedFrom(DEMO_BLOGS);

  return (
    <>
      <nav className="nav">
        <div className="container nav__inner">
          <a href="/" className="wordmark">
            Bangers<span className="dot" aria-hidden="true" />
          </a>
          <div className="nav__links">
            <a className="nav__link" href="/#board">
              Board
            </a>
            <a className="nav__link" href="/blogs">
              Blog
            </a>
            <a className="nav__link" href="/#about">
              About
            </a>
            <a className="nav__cta" href="/#submit">
              Submit a tweet
            </a>
          </div>
        </div>
      </nav>

      <header className="hero hero--compact">
        <div className="container">
          <div className="hero__eyebrow">
            <span className="dot dot--blink" aria-hidden="true" />
            <span className="microlabel">Journal / From the desk</span>
          </div>
          <h1 className="hero__title" style={{ fontSize: "clamp(40px, 7vw, 80px)" }}>
            The Blog<span className="period">.</span>
          </h1>
          <p className="hero__sub">
            Short essays on craft, motion, type, and how a modern CMS helps design
            teams publish with intention.
          </p>
        </div>
      </header>

      <section className="blog-index">
        <div className="container">
          {posts.length === 0 ? (
            <p className="hero__sub">No posts published yet.</p>
          ) : (
            <div className="blog-grid">
              {posts.map((post) => (
                <article className="blog-card" key={post.id}>
                  <Link href={`/blogs/${post.slug}`} className="blog-card__media">
                    {post.coverUrl ? (
                      <img src={post.coverUrl} alt="" loading="lazy" />
                    ) : (
                      <div className="blog-card__placeholder" />
                    )}
                  </Link>
                  <div className="blog-card__body">
                    <div className="blog-card__meta">
                      <span className="microlabel">{post.author}</span>
                      {post.tags?.[0] && <span className="tag">{post.tags[0]}</span>}
                    </div>
                    <h2>
                      <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
                    </h2>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <Link className="blog-card__more" href={`/blogs/${post.slug}`}>
                      Read post
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__mark">
            Bangers<span style={{ color: "var(--red)" }}>.</span>
          </span>
          <a className="nav__link" href="/admin">
            CMS
          </a>
          <span className="microlabel">© 2026 / Editorial</span>
        </div>
      </footer>
    </>
  );
}
