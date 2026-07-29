import { getTweet } from "react-tweet/api";
import { EmbeddedTweet, TweetNotFound } from "react-tweet";

// Renders a board tweet with its media guaranteed:
// 1. Fetches the live tweet and renders it in full (photos/videos inline).
// 2. If the live fetch fails but we captured the media at submission time,
//    shows the stored media image linking to the tweet.
// 3. Only if neither exists, shows the not-found card.
export default async function BoardTweet({ id, mediaUrl, author }) {
  let tweet = null;
  try {
    tweet = await getTweet(id);
  } catch {
    // fall through to stored media
  }

  if (tweet) {
    return <EmbeddedTweet tweet={tweet} />;
  }

  if (mediaUrl) {
    return (
      <a
        className="media-fallback"
        href={`https://x.com/${author || "i"}/status/${id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={mediaUrl} alt={`Tweet media${author ? ` by @${author}` : ""}`} loading="lazy" />
        <span className="media-fallback__bar">
          <span className="microlabel">
            {author ? `@${author}` : "View on X"} / {id}
          </span>
          <span className="dot" aria-hidden="true" />
        </span>
      </a>
    );
  }

  return <TweetNotFound />;
}
