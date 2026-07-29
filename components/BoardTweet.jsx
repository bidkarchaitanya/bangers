import { getTweet } from "react-tweet/api";

function mediaFromTweet(tweet) {
  if (!tweet) return null;
  return (
    tweet.photos?.[0]?.url ||
    tweet.video?.poster ||
    tweet.mediaDetails?.[0]?.media_url_https ||
    null
  );
}

function authorFromTweet(tweet) {
  return tweet?.user?.screen_name || null;
}

// Media-first board card: image dominates, author is the only copy.
export default async function BoardTweet({ id, mediaUrl, author }) {
  let tweet = null;
  try {
    tweet = await getTweet(id);
  } catch {
    // fall through to stored media
  }

  const src = mediaUrl || mediaFromTweet(tweet);
  const handle = author || authorFromTweet(tweet);
  const href = `https://x.com/${handle || "i"}/status/${id}`;

  if (!src) {
    return (
      <a className="board-card board-card--empty" href={href} target="_blank" rel="noopener noreferrer">
        <span className="microlabel">{handle ? `@${handle}` : "View on X"}</span>
      </a>
    );
  }

  return (
    <a className="board-card" href={href} target="_blank" rel="noopener noreferrer">
      <img
        className="board-card__media"
        src={src}
        alt={handle ? `Visual from @${handle}` : "Board visual"}
        loading="lazy"
      />
      <span className="board-card__bar">
        <span className="board-card__author">{handle ? `@${handle}` : "View on X"}</span>
        <span className="dot" aria-hidden="true" />
      </span>
    </a>
  );
}
