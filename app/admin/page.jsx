"use client";

import { useEffect, useMemo, useState } from "react";
import { DESIGN_TAGS } from "../../lib/tags";

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

function TagPicker({ selected, onChange, disabled }) {
  function toggle(tag) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < 6) {
      onChange([...selected, tag]);
    }
  }

  return (
    <div className="cms-tags" role="group" aria-label="Design tags">
      {DESIGN_TAGS.map((tag) => {
        const on = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={`cms-tag ${on ? "cms-tag--on" : ""}`}
            aria-pressed={on}
            disabled={disabled}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}

function CmsCard({
  item,
  mode,
  busy,
  onApprove,
  onReject,
  onUpdate,
  onRemove,
}) {
  const [tags, setTags] = useState(item.tags || []);
  const [description, setDescription] = useState(item.description || "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTags(item.tags || []);
    setDescription(item.description || "");
    setDirty(false);
  }, [item.id, item.tags, item.description]);

  const media = item.mediaUrl;
  const isBusy = busy === item.id;

  return (
    <article className="cms-card">
      <a
        className="cms-card__media"
        href={`https://x.com/${item.author || "i"}/status/${item.id}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {media ? (
          <img src={media} alt="" loading="lazy" />
        ) : (
          <div className="cms-card__placeholder" aria-hidden="true" />
        )}
      </a>

      <div className="cms-card__body">
        <header className="cms-card__head">
          <div>
            <p className="cms-card__author">
              {item.author ? `@${item.author}` : "Unknown author"}
            </p>
            <p className="cms-card__id">status / {item.id}</p>
          </div>
          <span className="microlabel">
            {mode === "inbox" ? "Inbox" : "Live"}
          </span>
        </header>

        <label className="cms-field">
          <span className="microlabel">Description</span>
          <textarea
            className="cms-textarea"
            rows={3}
            maxLength={280}
            placeholder="Optional curator note — why this is a banger"
            value={description}
            disabled={isBusy}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
          />
          <span className="cms-field__hint">{description.length}/280</span>
        </label>

        <div className="cms-field">
          <span className="microlabel">Design tags</span>
          <TagPicker
            selected={tags}
            disabled={isBusy}
            onChange={(next) => {
              setTags(next);
              setDirty(true);
            }}
          />
        </div>

        <div className="cms-card__actions">
          {mode === "inbox" ? (
            <>
              <button
                className="submit__btn"
                type="button"
                disabled={isBusy || tags.length === 0}
                onClick={() => onApprove(item.id, tags, description)}
              >
                {isBusy ? "Publishing" : "Publish to board"}
              </button>
              <button
                className="btn-ghost"
                type="button"
                disabled={isBusy}
                onClick={() => onReject(item.id)}
              >
                Reject
              </button>
            </>
          ) : (
            <>
              <button
                className="submit__btn"
                type="button"
                disabled={isBusy || !dirty || tags.length === 0}
                onClick={() => onUpdate(item.id, tags, description)}
              >
                {isBusy ? "Saving" : "Save changes"}
              </button>
              <button
                className="btn-ghost"
                type="button"
                disabled={isBusy}
                onClick={() => onRemove(item.id)}
              >
                Remove
              </button>
            </>
          )}
        </div>
        {mode === "inbox" && tags.length === 0 && (
          <p className="microlabel cms-hint">Pick at least one design tag to publish.</p>
        )}
      </div>
    </article>
  );
}

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(null);
  const [tab, setTab] = useState("inbox");
  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [booting, setBooting] = useState(true);

  async function load() {
    const res = await fetch("/api/admin", { credentials: "same-origin" });
    const json = await readJson(res);
    if (res.status === 401) {
      setAuthed(false);
      return false;
    }
    if (!res.ok) throw new Error(json.error || "Failed to load");
    setPending(json.pending || []);
    setApproved(json.approved || []);
    setStats(json.stats || null);
    setAuthed(true);
    return true;
  }

  useEffect(() => {
    load()
      .catch(() => setAuthed(false))
      .finally(() => setBooting(false));
  }, []);

  async function unlock(e) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ key }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Login failed");
      setKey("");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "same-origin",
    });
    setAuthed(false);
    setPending([]);
    setApproved([]);
    setStats(null);
  }

  async function mutate(payload) {
    setBusy(payload.id);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Failed");
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  const library = useMemo(() => {
    const q = query.trim().toLowerCase();
    return approved.filter((item) => {
      const tagOk =
        filterTag === "All" || (item.tags || []).includes(filterTag);
      if (!tagOk) return false;
      if (!q) return true;
      return (
        (item.author || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        item.id.includes(q)
      );
    });
  }, [approved, query, filterTag]);

  if (booting) {
    return (
      <>
        <nav className="nav">
          <div className="container nav__inner">
            <a href="/" className="wordmark">
              Bangers<span className="dot" aria-hidden="true" />
            </a>
            <span className="microlabel">CMS / Loading</span>
          </div>
        </nav>
        <main className="cms">
          <div className="container">
            <p className="microlabel">Checking session…</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <nav className="nav">
        <div className="container nav__inner">
          <a href="/" className="wordmark">
            Bangers<span className="dot" aria-hidden="true" />
          </a>
          <div className="nav__links">
            <span className="microlabel">CMS / Content desk</span>
            {authed && (
              <>
                <a className="nav__link" href="/" target="_blank" rel="noreferrer">
                  View site
                </a>
                <button className="nav__link cms-linkbtn" type="button" onClick={logout}>
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="cms">
        <div className="container">
          {!authed ? (
            <section className="cms-login">
              <div className="cms-login__copy">
                <span className="microlabel">
                  <span className="dot dot--blink" aria-hidden="true" />
                  Secure content management
                </span>
                <h1 className="cms-login__title">
                  The Desk<span className="period">.</span>
                </h1>
                <p className="cms-login__sub">
                  Review submissions, tag by design type, add curator notes, and
                  publish to the live board — built for client demos of a modern
                  CMS workflow.
                </p>
              </div>
              <form className="cms-login__form" onSubmit={unlock}>
                <label className="cms-field">
                  <span className="microlabel">Passcode</span>
                  <input
                    className="cms-input"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter admin passcode"
                    aria-label="Admin passcode"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    required
                  />
                </label>
                <button className="submit__btn" type="submit">
                  Enter CMS
                </button>
                {error && (
                  <p className="microlabel submit__status--error">ERR / {error}</p>
                )}
              </form>
            </section>
          ) : (
            <>
              <header className="cms-hero">
                <div>
                  <span className="microlabel">Bangers CMS</span>
                  <h1 className="cms-hero__title">
                    Content desk<span className="period">.</span>
                  </h1>
                  <p className="cms-hero__sub">
                    Curate visual tweets, classify by design discipline, and ship
                    to production with notes your clients can understand.
                  </p>
                </div>
                <div className="cms-stats">
                  <div className="cms-stat">
                    <strong>{String(stats?.pending ?? pending.length).padStart(2, "0")}</strong>
                    <span className="microlabel">Inbox</span>
                  </div>
                  <div className="cms-stat">
                    <strong>{String(stats?.approved ?? approved.length).padStart(2, "0")}</strong>
                    <span className="microlabel">Live</span>
                  </div>
                  <div className="cms-stat">
                    <strong>
                      {String(Object.keys(stats?.tags || {}).length).padStart(2, "0")}
                    </strong>
                    <span className="microlabel">Tags used</span>
                  </div>
                </div>
              </header>

              <div className="cms-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "inbox"}
                  className={`cms-tab ${tab === "inbox" ? "cms-tab--on" : ""}`}
                  onClick={() => setTab("inbox")}
                >
                  Inbox
                  <span>{pending.length}</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "library"}
                  className={`cms-tab ${tab === "library" ? "cms-tab--on" : ""}`}
                  onClick={() => setTab("library")}
                >
                  Library
                  <span>{approved.length}</span>
                </button>
              </div>

              {error && (
                <p className="microlabel submit__status--error" style={{ marginBottom: 18 }}>
                  ERR / {error}
                </p>
              )}

              {tab === "inbox" && (
                <section className="cms-section">
                  {pending.length === 0 ? (
                    <div className="cms-empty">
                      <p className="microlabel">Queue clear</p>
                      <p>Nothing waiting for review. New public submissions land here.</p>
                    </div>
                  ) : (
                    <div className="cms-list">
                      {pending.map((item) => (
                        <CmsCard
                          key={item.id}
                          item={item}
                          mode="inbox"
                          busy={busy}
                          onApprove={(id, tags, description) =>
                            mutate({ action: "approve", id, tags, description })
                          }
                          onReject={(id) => mutate({ action: "reject", id })}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {tab === "library" && (
                <section className="cms-section">
                  <div className="cms-toolbar">
                    <input
                      className="cms-input cms-input--search"
                      type="search"
                      placeholder="Search author, tag, note, or ID"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="cms-filter">
                      {["All", ...DESIGN_TAGS].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`cms-tag ${filterTag === tag ? "cms-tag--on" : ""}`}
                          onClick={() => setFilterTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {library.length === 0 ? (
                    <div className="cms-empty">
                      <p className="microlabel">No matches</p>
                      <p>Try another tag or clear the search.</p>
                    </div>
                  ) : (
                    <div className="cms-list">
                      {library.map((item) => (
                        <CmsCard
                          key={item.id}
                          item={item}
                          mode="library"
                          busy={busy}
                          onUpdate={(id, tags, description) =>
                            mutate({ action: "update", id, tags, description })
                          }
                          onRemove={(id) => mutate({ action: "remove", id })}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </>
  );
}
