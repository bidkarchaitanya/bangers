"use client";

import { useState } from "react";
import { Tweet } from "react-tweet";

function parseTweetId(input) {
  const raw = input.trim();
  if (/^\d{1,25}$/.test(raw)) return raw;
  const m = raw.match(/(?:twitter\.com|x\.com)\/[^/]+\/status(?:es)?\/(\d+)/i);
  return m ? m[1] : null;
}

async function readJson(res) {
  const text = await res.text();
  if (!text) {
    throw new Error(
      res.ok
        ? "Empty response from server"
        : `Server error (${res.status}). Try again.`
    );
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Server error (${res.status}). Try again.`);
  }
}

export default function TweetSubmit() {
  const [value, setValue] = useState("");
  const [id, setId] = useState(null);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);
  const [submitState, setSubmitState] = useState(null); // null | "sending" | "pending" | "already-submitted"

  async function pull(e) {
    e.preventDefault();
    const parsed = parseTweetId(value);
    if (!parsed) {
      setError("Paste a tweet link like https://x.com/user/status/123…");
      setId(null);
      return;
    }
    setError(null);
    setSubmitState(null);
    setId(null);
    setChecking(true);
    try {
      const res = await fetch(`/api/tweet-check?id=${parsed}`);
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Couldn't verify that tweet");
      if (!json.hasImage) {
        throw new Error(
          "Only tweets with images or videos can go on the board. Pick one with a visual."
        );
      }
      setId(parsed);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  }

  async function submitToBoard() {
    setSubmitState("sending");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setSubmitState(json.status);
    } catch (err) {
      setError(err.message);
      setSubmitState(null);
    }
  }

  return (
    <div className="submit" id="submit">
      <form className="submit__bar" onSubmit={pull}>
        <input
          className="submit__input"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://x.com/user/status/1234567890"
          aria-label="Tweet URL or ID"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="submit__btn" type="submit" disabled={checking}>
          {checking ? "Checking" : "Pull it in"}
        </button>
      </form>

      <div
        className={`submit__status microlabel ${
          error ? "submit__status--error" : ""
        }`}
        role="status"
      >
        {checking && (
          <>
            <span className="dot dot--blink" aria-hidden="true" />
            Checking for visual media
          </>
        )}
        {error && <>ERR / {error}</>}
      </div>

      {id && (
        <div className="preview preview--tweet" data-theme="light">
          <header className="preview__head">
            <span className="preview__url">x.com / status / {id}</span>
            <span className="preview__stamp">
              <span className="dot" aria-hidden="true" />
              Certified Banger
            </span>
          </header>
          <div className="tweet-wrap tweet-wrap--single">
            <Tweet id={id} />
          </div>
          <div className="submit__actions">
            {submitState === "pending" ? (
              <span className="microlabel">
                Submitted — on the board once approved
              </span>
            ) : submitState === "already-submitted" ? (
              <span className="microlabel">Already submitted</span>
            ) : (
              <>
                <button
                  className="submit__btn"
                  type="button"
                  disabled={submitState === "sending"}
                  onClick={submitToBoard}
                >
                  {submitState === "sending"
                    ? "Submitting"
                    : "Submit to the board"}
                </button>
                <span className="microlabel">Goes live once approved</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
