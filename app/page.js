import { Suspense } from "react";
import TweetSubmit from "../components/TweetSubmit";
import BoardTweet from "../components/BoardTweet";
import { readStore } from "../lib/store";

export const dynamic = "force-dynamic";

// Hand-picked seeds. Paste tweet IDs here (the number at the end of a tweet URL).
// e.g. https://x.com/jack/status/20 -> "20"
// Approved submissions from /admin are added automatically.
const SEEDS = [
  "20",
  "1628832338187636740",
];

function TweetSkeleton() {
  return <div className="tweet-skeleton" aria-hidden="true" />;
}

export default async function Page() {
  const store = await readStore();
  const BOARD = [
    ...SEEDS.map((id) => ({ id, mediaUrl: null, author: null })),
    ...store.approved.filter((t) => !SEEDS.includes(t.id)),
  ];
  return (
    <>
      <nav className="nav">
        <div className="container nav__inner">
          <a href="/" className="wordmark">
            Bangers<span className="dot" aria-hidden="true" />
          </a>
          <div className="nav__links">
            <a className="nav__link" href="#board">
              Board
            </a>
            <a className="nav__link" href="/sites">
              Sites
            </a>
            <a className="nav__link" href="#about">
              About
            </a>
            <a className="nav__cta" href="#submit">
              Submit a tweet
            </a>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="container">
          <div className="hero__eyebrow">
            <span className="dot dot--blink" aria-hidden="true" />
            <span className="microlabel">
              An inspiration board from design Twitter
            </span>
          </div>
          <h1 className="hero__title">
            Only the bangers<span className="period">.</span>
          </h1>
          <p className="hero__sub">
            The best of design Twitter — the sharpest thinking, interactions,
            and craft posted on X, hand-picked and certified.{" "}
            <strong>Paste a tweet link</strong> to pull it in and see it on the
            board.
          </p>
          <TweetSubmit />
        </div>
      </header>

      <section className="gallery" id="board">
        <div className="container">
          <div className="section-head">
            <h2>The Board</h2>
            <span className="microlabel">
              Index / {String(BOARD.length).padStart(3, "0")}
            </span>
          </div>
          <div className="board" data-theme="light">
            {BOARD.map((t) => (
              <div className="tweet-wrap" key={t.id}>
                <Suspense fallback={<TweetSkeleton />}>
                  <BoardTweet
                    id={t.id}
                    mediaUrl={t.mediaUrl}
                    author={t.author}
                  />
                </Suspense>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="manifesto" id="about">
        <div className="container">
          <div className="manifesto__inner">
            <span className="microlabel">About / The certification</span>
            <p>
              No threads about threads. No engagement bait. If a tweet is here,
              it&apos;s a certified banger —{" "}
              <em>picked by hand, judged on craft alone.</em>
            </p>
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
