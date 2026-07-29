import SubmitDemo from "../../components/SubmitDemo";

export const metadata = {
  title: "Bangers — Sites",
  description: "The web's best-designed sites, hand-picked and certified.",
};

const PICKS = [
  {
    name: "Teenage Engineering",
    url: "teenage.engineering",
    tags: ["Hardware", "Iconic"],
  },
  { name: "Linear", url: "linear.app", tags: ["Product", "Systems"] },
  { name: "Stripe", url: "stripe.com", tags: ["Fintech", "Craft"] },
  { name: "Raycast", url: "raycast.com", tags: ["Product", "Dark"] },
  { name: "Vercel", url: "vercel.com", tags: ["Dev", "Mono"] },
  { name: "Figma", url: "figma.com", tags: ["Tools", "Playful"] },
];

function shot(url) {
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(
    `https://${url}`
  )}?w=800&h=550`;
}

export default function SitesPage() {
  return (
    <>
      <nav className="nav">
        <div className="container nav__inner">
          <a href="/" className="wordmark">
            Bangers<span className="dot" aria-hidden="true" />
          </a>
          <div className="nav__links">
            <a className="nav__link" href="/">
              Board
            </a>
            <a className="nav__link" href="#gallery">
              Sites
            </a>
            <a className="nav__cta" href="#submit">
              Submit a site
            </a>
          </div>
        </div>
      </nav>

      <header className="hero hero--compact">
        <div className="container">
          <div className="hero__eyebrow">
            <span className="dot dot--blink" aria-hidden="true" />
            <span className="microlabel">
              The sites — exceptional web design, certified
            </span>
          </div>
          <h1 className="hero__title">
            The Sites<span className="period">.</span>
          </h1>
          <p className="hero__sub">
            <strong>Paste any URL</strong> — we pull in its metadata and a live
            screenshot, right here.
          </p>
          <SubmitDemo />
        </div>
      </header>

      <section className="gallery" id="gallery">
        <div className="container">
          <div className="section-head">
            <h2>The Gallery</h2>
            <span className="microlabel">
              Index / {String(PICKS.length).padStart(3, "0")}
            </span>
          </div>
          <div className="grid">
            {PICKS.map((site, i) => (
              <a
                key={site.url}
                className="card"
                href={`https://${site.url}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="card__shot">
                  <img
                    src={shot(site.url)}
                    alt={`Screenshot of ${site.name}`}
                    loading="lazy"
                  />
                </div>
                <div className="card__body">
                  <div className="card__row">
                    <span className="card__name">{site.name}</span>
                    <span className="card__index">
                      {String(i + 1).padStart(3, "0")}
                    </span>
                  </div>
                  <span className="card__url">{site.url}</span>
                  <div className="card__tags">
                    {site.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer__inner">
          <span className="footer__mark">
            Bangers<span style={{ color: "var(--red)" }}>.</span>
          </span>
          <a
            className="nav__link"
            href="https://twitter.com/kizo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Built by Kizo Design
          </a>
          <span className="microlabel">© 2026 / All picks final</span>
        </div>
      </footer>
    </>
  );
}
