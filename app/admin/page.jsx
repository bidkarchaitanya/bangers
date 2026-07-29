"use client";

import { useState } from "react";
import { Tweet } from "react-tweet";

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

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);

  async function load(k) {
    const res = await fetch(`/api/admin?key=${encodeURIComponent(k)}`);
    const json = await readJson(res);
    if (!res.ok) throw new Error(json.error || "Failed to load");
    setPending(json.pending);
    setApproved(json.approved);
  }

  async function unlock(e) {
    e.preventDefault();
    setError(null);
    try {
      await load(key);
      setAuthed(true);
    } catch (err) {
      setError(err.message);
    }
  }

  async function act(id, action) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, key }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Failed");
      await load(key);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <nav className="nav">
        <div className="container nav__inner">
          <a href="/" className="wordmark">
            Bangers<span className="dot" aria-hidden="true" />
          </a>
          <div className="nav__links">
            <span className="microlabel">Admin / Curation desk</span>
          </div>
        </div>
      </nav>

      <main className="hero hero--compact">
        <div className="container">
          {!authed ? (
            <>
              <h1 className="hero__title" style={{ fontSize: "clamp(36px,6vw,64px)" }}>
                The Desk<span className="period">.</span>
              </h1>
              <p className="hero__sub">Enter the passcode to review submissions.</p>
              <form className="submit__bar submit" style={{ maxWidth: 420 }} onSubmit={unlock}>
                <input
                  className="submit__input"
                  type="password"
                  placeholder="Passcode"
                  aria-label="Admin passcode"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                />
                <button className="submit__btn" type="submit">
                  Unlock
                </button>
              </form>
              {error && (
                <p className="microlabel submit__status--error" style={{ marginTop: 14 }}>
                  ERR / {error}
                </p>
              )}
            </>
          ) : (
            <div data-theme="light">
              <div className="section-head">
                <h2>Pending</h2>
                <span className="microlabel">
                  {String(pending.length).padStart(3, "0")} awaiting review
                </span>
              </div>
              {pending.length === 0 && (
                <p className="hero__sub" style={{ marginTop: 0 }}>
                  Queue clear. Nothing to review.
                </p>
              )}
              <div className="board">
                {pending.map((t) => (
                  <div className="tweet-wrap admin-item" key={t.id}>
                    <Tweet id={t.id} />
                    <div className="admin-actions">
                      <button
                        className="submit__btn"
                        disabled={busy === t.id}
                        onClick={() => act(t.id, "approve")}
                      >
                        Approve
                      </button>
                      <button
                        className="btn-ghost"
                        disabled={busy === t.id}
                        onClick={() => act(t.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="section-head" style={{ marginTop: 56 }}>
                <h2>On the board</h2>
                <span className="microlabel">
                  {String(approved.length).padStart(3, "0")} approved
                </span>
              </div>
              <div className="board">
                {approved.map((t) => (
                  <div className="tweet-wrap admin-item" key={t.id}>
                    <Tweet id={t.id} />
                    <div className="admin-actions">
                      <button
                        className="btn-ghost"
                        disabled={busy === t.id}
                        onClick={() => act(t.id, "remove")}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {error && (
                <p className="microlabel submit__status--error" style={{ marginTop: 14 }}>
                  ERR / {error}
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
