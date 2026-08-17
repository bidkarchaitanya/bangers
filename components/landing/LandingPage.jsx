import Nav, { LogoMark, ArrowIcon, Diamond } from "./Nav";

const LOGOS = [
  { src: "/userlens/logos/640.png", alt: "Customer" },
  { src: "/userlens/logos/642.png", alt: "Master Inbox" },
  { src: "/userlens/logos/638.png", alt: "Customer" },
  { src: "/userlens/logos/ahaslides.png", alt: "AhaSlides" },
  { src: "/userlens/logos/636.png", alt: "Vainu" },
  { src: "/userlens/logos/637.png", alt: "Luminovo" },
  { src: "/userlens/logos/635.png", alt: "Customer" },
  { src: "/userlens/logos/quartr.png", alt: "Quartr" },
];

const BRIEFS = [
  { title: "New-user onboarding", status: "Live", metric: "+18% activation" },
  { title: "Power-user upsell", status: "Live", metric: "$24k influenced" },
  { title: "Frustration rescue", status: "Live", metric: "31 tickets deflected" },
  { title: "Win back stalled trials", status: "Draft", metric: "awaiting approval" },
];

export default function LandingPage() {
  return (
    <div className="ul" id="top">
      <Nav />

      <header className="ul-hero">
        <img
          className="ul-hero__strip"
          src="/userlens/dot-wave.png"
          alt=""
        />
        <div className="ul-hero__copy">
          <div className="ul-yc">
            <span className="ul-yc__y" aria-hidden="true">
              Y
            </span>
            Backed by Y Combinator
          </div>
          <h1>
            Let agents talk
            <br />
            to your <em>users</em>
          </h1>
          <p className="ul-hero__sub">
            AI agents that talk your users into adopting, buying, and loving
            your product more.
          </p>
          <div className="ul-hero__actions">
            <a className="ul-btn ul-btn--primary" href="#demo">
              Book Demo
              <ArrowIcon />
            </a>
            <a className="ul-btn ul-btn--ghost" href="#demo">
              Watch Loom Video
            </a>
          </div>
        </div>
        <div className="ul-hero__art">
          <img
            src="/userlens/hero-landscape.png"
            alt="Pixel landscape illustration"
          />
        </div>
      </header>

      <section className="ul-logos" aria-label="Customers">
        <div className="ul-marquee">
          <div className="ul-marquee__track">
            {[...LOGOS, ...LOGOS].map((logo, i) => (
              <img key={i} src={logo.src} alt={logo.alt} />
            ))}
          </div>
        </div>
      </section>

      <section className="ul-section ul-problem" id="product">
        <div className="ul-wrap">
          <h2 className="ul-h-instrument ul-center-text">
            <span className="ul-hl ul-hl--wide">
              Drip campaigns can&apos;t read the room.
              <br />
              And you can&apos;t watch every account yourself.
            </span>
          </h2>

          <div className="ul-compare">
            <article className="ul-card">
              <h3>
                <ClockIcon />
                The old way
              </h3>
              <div className="ul-old">
                <div className="ul-old__row">
                  <UserIcon />
                  New signup
                </div>
                <div className="ul-old__steps">
                  <div>
                    <MailMini />
                    Wait 3 days
                  </div>
                  <div>
                    <MailMini />
                    Send email 1
                  </div>
                  <div>
                    <MailMini />
                    Send email 2
                  </div>
                </div>
                <p>Same steps for everyone — blind to what they actually do.</p>
              </div>
              <div className="ul-card__foot">
                <EyeIcon />
                You, refreshing dashboards — hoping to catch it in time.
              </div>
            </article>

            <article className="ul-card">
              <h3>
                <LogoMark size={21} />
                The Userlens way
              </h3>
              <div className="ul-new">
                <div className="ul-msg">
                  <span className="ul-avatar">S</span>
                  <div>
                    <small>rage-clicked import · 3x</small>
                    Hey Sam — looks like imports are fighting you. Want a hand?
                  </div>
                </div>
                <p>Reads behavior, reaches out with nuance — at the right moment.</p>
              </div>
              <div className="ul-flags">
                <div>
                  <WarnIcon />
                  Acme hit repeated errors
                </div>
                <div>
                  <EyeIcon />
                  5 asked for Notion sync
                </div>
                <div>
                  <ChartIcon />
                  3 ready to upsell
                </div>
              </div>
              <p className="ul-card__note">
                <LogoMark size={14} />
                watches for you — and flags only what needs you.
              </p>
            </article>
          </div>

          <p className="ul-note">
            <Diamond />
            You can&apos;t do both. So you brief an agent to do both — for you.
          </p>
        </div>
      </section>

      <section className="ul-section ul-learn">
        <div className="ul-wrap">
          <div className="ul-learn__head">
            <h2>
              Userlens learns your users{" "}
              <span className="ul-hl">the way you would.</span>
            </h2>
            <p>
              Plugs into your analytics &amp; sales conversations to understand
              behavior and pain points.
            </p>
          </div>

          <div className="ul-learn__body">
            <div className="ul-learn__center">
              <LogoMark size={59} />
              <p>
                All signals. One understanding.
                <br />
                Just like you would -- only at scale.
              </p>
            </div>

            <div className="ul-signals">
              <figure>
                <div className="ul-signals__art">
                  <img src="/userlens/signals/analytics.png" alt="" />
                </div>
                <figcaption>Product analytics</figcaption>
              </figure>
              <figure>
                <div className="ul-signals__art">
                  <img src="/userlens/signals/sales.png" alt="" />
                </div>
                <figcaption>Sales conversations</figcaption>
              </figure>
              <figure>
                <div className="ul-signals__art">
                  <img src="/userlens/signals/usage.png" alt="" />
                </div>
                <figcaption>Usage patterns</figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>

      <section className="ul-section">
        <div className="ul-wrap ul-acts">
          <div>
            <h2>
              It reads the moment,
              <br />
              then <span className="ul-hl">acts.</span>
            </h2>
            <p className="ul-sub18">
              Different behavior → different conversation.
            </p>
            <div className="ul-behaviors">
              <div>
                <strong>
                  Frustrated
                  <br />
                  rage-clicking
                </strong>
                <span>→</span>
                <p>Steps in with support.</p>
              </div>
              <div>
                <strong>
                  Shallow
                  <br />
                  frequent
                </strong>
                <span>→</span>
                <p>Educates, or offers a trial.</p>
              </div>
              <div>
                <strong>
                  Heavy
                  <br />
                  power usage
                </strong>
                <span>→</span>
                <p>Proposes upsell, cross-sell, a discount.</p>
              </div>
            </div>
            <p className="ul-note">
              <Diamond />
              Each response is a Brief you write — more on those below.
            </p>
          </div>
          <img className="ul-cube" src="/userlens/cube.png" alt="" />
        </div>
      </section>

      <section className="ul-band" id="pricing">
        <div className="ul-wrap ul-stats">
          <h2>See exactly what it moved.</h2>
          <div className="ul-stats__row">
            <div>
              <b>+26%</b>
              <span>adoption influenced</span>
            </div>
            <div>
              <b>$50,00,000</b>
              <span>upsell convinced</span>
            </div>
            <div>
              <b>20k+</b>
              <span>users re-engaged</span>
            </div>
          </div>
          <p className="ul-note">
            <Diamond />
            Every result traces back to the Brief that drove it.
          </p>
        </div>
      </section>

      <section className="ul-section ul-briefs-intro" id="how-it-works">
        <div className="ul-wrap">
          <div className="ul-intro">
            <span className="ul-kicker">How it works in practice</span>
            <h2>
              It all runs on <span className="ul-hl">Briefs.</span>
            </h2>
            <p>
              A Brief is plain-language instructions for one kind of
              conversation. Write it (or let Userlens draft it), preview it on a
              real account, approve it — then it runs, and can act, not just
              message.
            </p>
          </div>
          <div className="ul-product-slot">Product Image</div>
        </div>
      </section>

      <section className="ul-section ul-library">
        <div className="ul-wrap">
          <h2 className="ul-library__title">
            Build a Library of Briefs,
            <br />
            <span className="ul-hl">measure each one</span>
          </h2>
          <div className="ul-briefs">
            {BRIEFS.map((b) => (
              <article key={b.title}>
                <header>
                  <h4>{b.title}</h4>
                  <span
                    className={
                      b.status === "Live" ? "ul-live" : "ul-draft"
                    }
                  >
                    <i />
                    {b.status}
                  </span>
                </header>
                <p>{b.metric}</p>
              </article>
            ))}
          </div>
          <ol className="ul-steps">
            <li>Draft</li>
            <li>Preview</li>
            <li className="is-accent">Approve</li>
            <li>Live</li>
            <li>Tune</li>
          </ol>
        </div>
      </section>

      <section className="ul-section ul-channels">
        <div className="ul-channels__orbit">
          <img src="/userlens/channels/gmail.png" alt="" className="p1" />
          <img src="/userlens/channels/slack.png" alt="" className="p2" />
          <img src="/userlens/channels/inapp.png" alt="" className="p3" />
          <img src="/userlens/channels/monitor.png" alt="" className="p4" />
          <LogoMark size={96} stacked />
        </div>
        <div className="ul-wrap ul-channels__copy">
          <h2>In the product, over email, on Slack — at the right time.</h2>
          <p className="ul-note">
            <Diamond />
            Each Brief decides where and when it reaches out.
          </p>
        </div>
      </section>

      <section className="ul-section">
        <div className="ul-wrap ul-report-grid">
          <div>
            <span className="ul-kicker">What comes back to you</span>
            <h2>And it reports back.</h2>
            <p className="ul-body15">
              You brief it. It reports back — by exception only, so you
              don&apos;t have to think about your users unless you need to.
            </p>
          </div>
          <aside className="ul-report">
            <header>
              <strong>
                <LogoMark size={25} />
                Your report · this week
              </strong>
              <span className="ul-live">
                <i />
                Live
              </span>
            </header>
            <article>
              <span className="ul-tag ul-tag--problem">Problem</span>
              <p>
                Acme — your 2nd-largest account — hit repeated checkout errors.
                A human&apos;s been looped in on Slack.
              </p>
              <time>
                Just now
                <ArrowIcon dim />
              </time>
            </article>
            <article>
              <span className="ul-tag ul-tag--new">New</span>
              <p>
                5 users asked for a Notion integration this week. It hasn&apos;t
                come up before.
              </p>
              <time>
                32m ago
                <ArrowIcon dim />
              </time>
            </article>
            <article>
              <span className="ul-tag ul-tag--opp">Opportunity</span>
              <p>
                3 power-user accounts are hitting plan limits — ready for an
                upsell (~$1.8k MRR).
              </p>
              <time>
                1h ago
                <ArrowIcon dim />
              </time>
            </article>
            <footer>
              Everything else, it just handled — 214 conversations this week,
              nothing needed you.
              <a href="#demo">
                See all (214)
                <ArrowIcon />
              </a>
            </footer>
          </aside>
        </div>
      </section>

      <section className="ul-band ul-quote" id="customers">
        <div className="ul-wrap ul-quote__inner">
          <div>
            <h2>Why Our Customers Love Userlens</h2>
            <div className="ul-quote__marks" aria-hidden="true">
              ”
            </div>
            <blockquote>
              Userlens talks to your users the way you would — if you had all
              the time in the world.
            </blockquote>
            <cite>Isha Patel, Growth Manager</cite>
          </div>
          <img src="/userlens/testimonial.png" alt="Isha Patel" />
        </div>
      </section>

      <section className="ul-cta" id="demo">
        <div className="ul-wrap">
          <h2>
            Let agents talk to your <em>users</em>
          </h2>
          <p>
            AI agents that talk your users into adopting, buying, and loving
            your product more.
          </p>
          <div className="ul-hero__actions ul-hero__actions--center">
            <a className="ul-btn ul-btn--primary" href="mailto:hello@userlens.ai">
              Write your first Brief
              <ArrowIcon />
            </a>
            <a className="ul-btn ul-btn--ghost" href="mailto:hello@userlens.ai">
              Book a Demo
            </a>
          </div>
        </div>
      </section>

      <footer className="ul-footer">
        <div className="ul-wrap ul-footer__grid">
          <a href="#top" className="ul-logo ul-logo--light">
            <LogoMark size={48} />
            <span>Userlens</span>
          </a>
          <div>
            <h3>Company</h3>
            <a href="#pricing">Pricing</a>
            <a href="#demo">Terns of Service</a>
            <a href="#demo">Privacy Policy</a>
            <a href="#demo">IIms.txt</a>
            <a href="#demo">robots.txt</a>
            <a href="#demo">Cookie Settings</a>
          </div>
          <div>
            <h3>Resources</h3>
            <a href="/blogs">Blogs</a>
            <a href="#demo">Privacy &amp; Security</a>
            <a href="#demo">Userlens SDK docs</a>
          </div>
        </div>
        <p className="ul-copy">© All rights reserved. Userlens 2026</p>
      </footer>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="7.25" stroke="#0B0B0B" strokeWidth="1.4" />
      <path d="M9 5v4.2l3 1.6" stroke="#0B0B0B" strokeWidth="1.4" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" fill="#202020" aria-hidden="true">
      <circle cx="7" cy="4" r="3" />
      <path d="M1 15c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    </svg>
  );
}
function MailMini() {
  return (
    <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden="true">
      <rect x="0.5" y="0.5" width="14" height="11" rx="1" fill="#496CF7" />
      <path d="M1 1.5l6.5 5L14 1.5" stroke="#fff" strokeWidth="1.2" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
      <path d="M1 8.5S4 3 8.5 3s7.5 5.5 7.5 5.5S13 14 8.5 14 1 8.5 1 8.5z" stroke="#0054FE" strokeWidth="1.3" />
      <circle cx="8.5" cy="8.5" r="2.2" fill="#0054FE" />
    </svg>
  );
}
function WarnIcon() {
  return (
    <svg width="20" height="19" viewBox="0 0 20 19" fill="none" aria-hidden="true">
      <path d="M10 1l9 16H1L10 1z" fill="#F8421D" />
      <rect x="9" y="7" width="2" height="6" fill="#fff" />
      <rect x="9" y="14.5" width="2" height="2" fill="#fff" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="21" height="22" viewBox="0 0 21 22" fill="#018E39" aria-hidden="true">
      <rect x="0" y="12" width="5" height="10" />
      <rect x="8" y="7" width="5" height="15" />
      <rect x="16" y="2" width="5" height="20" />
    </svg>
  );
}
