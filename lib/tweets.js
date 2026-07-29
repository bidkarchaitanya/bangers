import { getTweet } from "react-tweet/api";

// Fetches tweet data and reports whether it contains visual media
// (photos, videos, or GIFs).
export async function checkTweetImage(id) {
  let tweet;
  try {
    tweet = await getTweet(id);
  } catch (err) {
    const msg = String(err?.message || err || "");
    if (/does not exist|deleted|not found/i.test(msg)) {
      return { ok: false, error: "Tweet not found. Is it public?" };
    }
    return { ok: false, error: "Couldn't verify that tweet. Try again." };
  }
  if (!tweet) {
    return { ok: false, error: "Tweet not found. Is it public?" };
  }

  const photos =
    tweet.photos?.length ??
    tweet.mediaDetails?.filter((m) => m.type === "photo").length ??
    0;

  const videos =
    (tweet.video ? 1 : 0) ||
    (tweet.mediaDetails?.filter(
      (m) => m.type === "video" || m.type === "animated_gif"
    ).length ??
      0);

  // A representative still image for the media: first photo, or the
  // video/GIF poster frame. Used as a guaranteed fallback on the board.
  const mediaUrl =
    tweet.photos?.[0]?.url ||
    tweet.video?.poster ||
    tweet.mediaDetails?.[0]?.media_url_https ||
    null;

  return {
    ok: true,
    hasImage: photos > 0 || videos > 0,
    photoCount: photos,
    videoCount: videos,
    mediaUrl,
    author: tweet.user?.screen_name || null,
  };
}
