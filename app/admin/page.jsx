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

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function TagPicker({ selected, onChange, disabled }) {
  function toggle(tag) {
    if (selected.includes(tag)) onChange(selected.filter((t) => t !== tag));
    else if (selected.length < 6) onChange([...selected, tag]);
  }

  return (
    <div className="wf-tags" role="group" aria-label="Design tags">
      {DESIGN_TAGS.map((tag) => {
        const on = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            className={`wf-chip ${on ? "wf-chip--on" : ""}`}
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

function Inspector({
  item,
  mode,
  busy,
  onClose,
  onApprove,
  onReject,
  onUpdate,
  onRemove,
}) {
  const [tags, setTags] = useState(item?.tags || []);
  const [description, setDescription] = useState(item?.description || "");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setTags(item?.tags || []);
    setDescription(item?.description || "");
    setDirty(false);
  }, [item?.id, item?.tags, item?.description]);

  if (!item) {
    return (
      <aside className="wf-inspector wf-inspector--empty">
        <p className="wf-muted">Select an item to edit fields</p>
      </aside>
    );
  }

  const isBusy = busy === item.id;
  const title = item.author ? `@${item.author}` : "Untitled item";

  return (
    <aside className="wf-inspector">
      <header className="wf-inspector__head">
        <div>
          <p className="wf-kicker">Item</p>
          <h2 className="wf-inspector__title">{title}</h2>
        </div>
        <button type="button" className="wf-iconbtn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="wf-inspector__preview">
        {item.mediaUrl ? (
          <img src={item.mediaUrl} alt="" />
        ) : (
          <div className="wf-thumb wf-thumb--lg" />
        )}
      </div>

      <div className="wf-fields">
        <label className="wf-field">
          <span>Name</span>
          <input className="wf-input" value={title} readOnly />
        </label>

        <label className="wf-field">
          <span>Slug</span>
          <input className="wf-input" value={item.id} readOnly />
        </label>

        <label className="wf-field">
          <span>Status</span>
          <div className={`wf-status ${mode === "inbox" ? "wf-status--draft" : "wf-status--live"}`}>
            {mode === "inbox" ? "Draft" : "Published"}
          </div>
        </label>

        <label className="wf-field">
          <span>Description</span>
          <textarea
            className="wf-textarea"
            rows={4}
            maxLength={280}
            placeholder="Add a short curator note…"
            value={description}
            disabled={isBusy}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
          />
          <em>{description.length}/280</em>
        </label>

        <div className="wf-field">
          <span>Design tags</span>
          <TagPicker
            selected={tags}
            disabled={isBusy}
            onChange={(next) => {
              setTags(next);
              setDirty(true);
            }}
          />
        </div>
      </div>

      <footer className="wf-inspector__foot">
        {mode === "inbox" ? (
          <>
            <button
              type="button"
              className="wf-btn wf-btn--primary"
              disabled={isBusy || tags.length === 0}
              onClick={() => onApprove(item.id, tags, description)}
            >
              {isBusy ? "Publishing…" : "Publish"}
            </button>
            <button
              type="button"
              className="wf-btn"
              disabled={isBusy}
              onClick={() => onReject(item.id)}
            >
              Reject
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="wf-btn wf-btn--primary"
              disabled={isBusy || !dirty || tags.length === 0}
              onClick={() => onUpdate(item.id, tags, description)}
            >
              {isBusy ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="wf-btn wf-btn--danger"
              disabled={isBusy}
              onClick={() => onRemove(item.id)}
            >
              Delete
            </button>
          </>
        )}
        <a
          className="wf-btn"
          href={`https://x.com/${item.author || "i"}/status/${item.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open on X
        </a>
      </footer>
    </aside>
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
  const [collection, setCollection] = useState("published");
  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [booting, setBooting] = useState(true);
  const [seeding, setSeeding] = useState(false);

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
    setSelectedId(null);
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
      if (payload.action === "reject" || payload.action === "remove") {
        setSelectedId(null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
    }
  }

  async function loadDemoData() {
    setSeeding(true);
    setError(null);
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "seed-demo" }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Couldn't load demo data");
      await load();
      setCollection(json.addedPending > 0 ? "drafts" : "published");
    } catch (err) {
      setError(err.message);
    } finally {
      setSeeding(false);
    }
  }

  const rows = useMemo(() => {
    const source = collection === "drafts" ? pending : approved;
    const q = query.trim().toLowerCase();
    return source.filter((item) => {
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
  }, [collection, pending, approved, query, filterTag]);

  const selected = useMemo(() => {
    const source = collection === "drafts" ? pending : approved;
    return source.find((t) => t.id === selectedId) || null;
  }, [collection, pending, approved, selectedId]);

  useEffect(() => {
    if (selectedId && !rows.some((r) => r.id === selectedId)) {
      setSelectedId(null);
    }
  }, [rows, selectedId]);

  if (booting) {
    return (
      <div className="wf-shell wf-shell--boot">
        <p className="wf-muted">Loading CMS…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="wf-shell wf-shell--login">
        <form className="wf-login" onSubmit={unlock}>
          <div className="wf-login__brand">
            <span className="wf-logo">B</span>
            <div>
              <p className="wf-kicker">Bangers</p>
              <h1>CMS</h1>
            </div>
          </div>
          <p className="wf-login__copy">
            Collections, fields, and publishing — structured like Webflow &amp;
            Framer for client demos.
          </p>
          <label className="wf-field">
            <span>Passcode</span>
            <input
              className="wf-input"
              type="password"
              autoComplete="current-password"
              placeholder="Enter passcode"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              required
            />
          </label>
          <button className="wf-btn wf-btn--primary wf-btn--block" type="submit">
            Continue
          </button>
          {error && <p className="wf-error">{error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="wf-shell">
      <aside className="wf-sidebar">
        <div className="wf-sidebar__brand">
          <span className="wf-logo">B</span>
          <div>
            <strong>Bangers</strong>
            <span>CMS</span>
          </div>
        </div>

        <p className="wf-sidebar__label">Collections</p>
        <nav className="wf-nav">
          <button
            type="button"
            className={`wf-nav__item ${collection === "published" ? "wf-nav__item--on" : ""}`}
            onClick={() => {
              setCollection("published");
              setSelectedId(null);
              setFilterTag("All");
            }}
          >
            <span>Board</span>
            <em>{approved.length}</em>
          </button>
          <button
            type="button"
            className={`wf-nav__item ${collection === "drafts" ? "wf-nav__item--on" : ""}`}
            onClick={() => {
              setCollection("drafts");
              setSelectedId(null);
              setFilterTag("All");
            }}
          >
            <span>Drafts</span>
            <em>{pending.length}</em>
          </button>
        </nav>

        <p className="wf-sidebar__label">Fields</p>
        <div className="wf-sidebar__fields">
          <span>Name</span>
          <span>Slug</span>
          <span>Status</span>
          <span>Description</span>
          <span>Design tags</span>
          <span>Media</span>
        </div>

        <div className="wf-sidebar__foot">
          <button
            type="button"
            className="wf-btn wf-btn--ghost wf-btn--block"
            disabled={seeding}
            onClick={loadDemoData}
          >
            {seeding ? "Seeding…" : "Load demo content"}
          </button>
          <a className="wf-btn wf-btn--ghost wf-btn--block" href="/" target="_blank" rel="noreferrer">
            Open site
          </a>
          <button type="button" className="wf-btn wf-btn--ghost wf-btn--block" onClick={logout}>
            Sign out
          </button>
        </div>
      </aside>

      <section className="wf-main">
        <header className="wf-topbar">
          <div>
            <p className="wf-kicker">Collection</p>
            <h1>{collection === "drafts" ? "Drafts" : "Board"}</h1>
          </div>
          <div className="wf-topbar__meta">
            <span>{rows.length} items</span>
            <span>
              {Object.keys(stats?.tags || {}).length} tags in use
            </span>
          </div>
        </header>

        <div className="wf-toolbar">
          <input
            className="wf-input wf-input--search"
            type="search"
            placeholder="Search items…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="wf-filter">
            {["All", ...DESIGN_TAGS].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`wf-chip ${filterTag === tag ? "wf-chip--on" : ""}`}
                onClick={() => setFilterTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="wf-error">{error}</p>}

        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th style={{ width: 56 }} />
                <th>Name</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="wf-table__empty">
                    No items in this collection
                  </td>
                </tr>
              ) : (
                rows.map((item) => {
                  const active = selectedId === item.id;
                  return (
                    <tr
                      key={item.id}
                      className={active ? "wf-row--on" : undefined}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <td>
                        {item.mediaUrl ? (
                          <img className="wf-thumb" src={item.mediaUrl} alt="" />
                        ) : (
                          <div className="wf-thumb" />
                        )}
                      </td>
                      <td>
                        <strong>
                          {item.author ? `@${item.author}` : "Untitled"}
                        </strong>
                        <span>{item.description || item.id}</span>
                      </td>
                      <td>
                        <span
                          className={`wf-status ${
                            collection === "drafts"
                              ? "wf-status--draft"
                              : "wf-status--live"
                          }`}
                        >
                          {collection === "drafts" ? "Draft" : "Published"}
                        </span>
                      </td>
                      <td>
                        <div className="wf-tagline">
                          {(item.tags || []).length
                            ? item.tags.map((t) => (
                                <span key={t} className="wf-chip wf-chip--soft">
                                  {t}
                                </span>
                              ))
                            : "—"}
                        </div>
                      </td>
                      <td className="wf-muted">
                        {formatWhen(
                          item.updatedAt || item.approvedAt || item.submittedAt
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Inspector
        item={selected}
        mode={collection === "drafts" ? "inbox" : "library"}
        busy={busy}
        onClose={() => setSelectedId(null)}
        onApprove={(id, tags, description) =>
          mutate({ action: "approve", id, tags, description })
        }
        onReject={(id) => mutate({ action: "reject", id })}
        onUpdate={(id, tags, description) =>
          mutate({ action: "update", id, tags, description })
        }
        onRemove={(id) => mutate({ action: "remove", id })}
      />
    </div>
  );
}
