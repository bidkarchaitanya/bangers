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
    <div className="wf-tags" role="group" aria-label="Blog tags">
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

function BlogInspector({ item, busy, onClose, onSave, onRemove }) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState([]);
  const [status, setStatus] = useState("draft");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title || "");
    setSlug(item.slug || "");
    setExcerpt(item.excerpt || "");
    setBody(item.body || "");
    setCoverUrl(item.coverUrl || "");
    setAuthor(item.author || "Bangers Editorial");
    setTags(item.tags || []);
    setStatus(item.status || "draft");
    setDirty(false);
  }, [item]);

  if (!item) {
    return (
      <aside className="wf-inspector wf-inspector--empty">
        <p className="wf-muted">Select a post to edit fields</p>
      </aside>
    );
  }

  const isBusy = busy === item.id;

  return (
    <aside className="wf-inspector">
      <header className="wf-inspector__head">
        <div>
          <p className="wf-kicker">Blog post</p>
          <h2 className="wf-inspector__title">{title || "Untitled"}</h2>
        </div>
        <button type="button" className="wf-iconbtn" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="wf-inspector__preview">
        {coverUrl ? (
          <img src={coverUrl} alt="" />
        ) : (
          <div className="wf-thumb wf-thumb--lg" />
        )}
      </div>

      <div className="wf-fields">
        <label className="wf-field">
          <span>Title</span>
          <input
            className="wf-input"
            value={title}
            disabled={isBusy}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <label className="wf-field">
          <span>Slug</span>
          <input
            className="wf-input"
            value={slug}
            disabled={isBusy}
            onChange={(e) => {
              setSlug(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <label className="wf-field">
          <span>Status</span>
          <select
            className="wf-input"
            value={status}
            disabled={isBusy}
            onChange={(e) => {
              setStatus(e.target.value);
              setDirty(true);
            }}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <label className="wf-field">
          <span>Author</span>
          <input
            className="wf-input"
            value={author}
            disabled={isBusy}
            onChange={(e) => {
              setAuthor(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <label className="wf-field">
          <span>Cover image URL</span>
          <input
            className="wf-input"
            value={coverUrl}
            placeholder="https://…"
            disabled={isBusy}
            onChange={(e) => {
              setCoverUrl(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <label className="wf-field">
          <span>Excerpt</span>
          <textarea
            className="wf-textarea"
            rows={3}
            maxLength={240}
            value={excerpt}
            disabled={isBusy}
            onChange={(e) => {
              setExcerpt(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <label className="wf-field">
          <span>Body</span>
          <textarea
            className="wf-textarea wf-textarea--body"
            rows={10}
            value={body}
            disabled={isBusy}
            onChange={(e) => {
              setBody(e.target.value);
              setDirty(true);
            }}
          />
        </label>
        <div className="wf-field">
          <span>Tags</span>
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
        <button
          type="button"
          className="wf-btn wf-btn--primary"
          disabled={isBusy || !dirty || !title.trim()}
          onClick={() =>
            onSave({
              id: item.id,
              title,
              slug,
              excerpt,
              body,
              coverUrl,
              author,
              tags,
              status,
            })
          }
        >
          {isBusy ? "Saving…" : "Save"}
        </button>
        {item.slug && status === "published" && (
          <a className="wf-btn" href={`/blogs/${item.slug}`} target="_blank" rel="noreferrer">
            Open post
          </a>
        )}
        <button
          type="button"
          className="wf-btn wf-btn--danger"
          disabled={isBusy}
          onClick={() => onRemove(item.id)}
        >
          Delete
        </button>
      </footer>
    </aside>
  );
}

function NewBlogModal({ open, onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setExcerpt("");
      setError(null);
      setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  async function create(publish) {
    if (!title.trim()) {
      setError("Add a title first.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "create",
          title,
          excerpt,
          publish,
          body: "",
          tags: [],
        }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Couldn't create post");
      onCreated(json.blog);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="wf-modal" role="dialog" aria-modal="true" aria-label="New blog post">
      <button type="button" className="wf-modal__backdrop" aria-label="Close" onClick={onClose} />
      <div className="wf-modal__panel">
        <header className="wf-modal__head">
          <div>
            <p className="wf-kicker">Collection · Blog posts</p>
            <h2>New post</h2>
          </div>
          <button type="button" className="wf-iconbtn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <label className="wf-field">
          <span>Title</span>
          <input
            className="wf-input"
            autoFocus
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="wf-field">
          <span>Excerpt</span>
          <textarea
            className="wf-textarea"
            rows={3}
            placeholder="Short summary for cards and SEO"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>

        {error && <p className="wf-error">{error}</p>}

        <footer className="wf-modal__foot">
          <button type="button" className="wf-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            type="button"
            className="wf-btn"
            disabled={saving}
            onClick={() => create(false)}
          >
            {saving ? "Creating…" : "Create draft"}
          </button>
          <button
            type="button"
            className="wf-btn wf-btn--primary"
            disabled={saving}
            onClick={() => create(true)}
          >
            {saving ? "Publishing…" : "Create & publish"}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default function BlogsDesk({ blogs, busyId, onBusy, onReload, onError }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (blogs || []).filter((item) => {
      if (filter === "Published" && item.status !== "published") return false;
      if (filter === "Drafts" && item.status !== "draft") return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.excerpt || "").toLowerCase().includes(q) ||
        (item.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [blogs, query, filter]);

  const selected = useMemo(
    () => (blogs || []).find((b) => b.id === selectedId) || null,
    [blogs, selectedId]
  );

  async function save(payload) {
    onBusy(payload.id);
    onError(null);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "update", ...payload }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Save failed");
      await onReload();
    } catch (err) {
      onError(err.message);
    } finally {
      onBusy(null);
    }
  }

  async function remove(id) {
    onBusy(id);
    onError(null);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "remove", id }),
      });
      const json = await readJson(res);
      if (!res.ok) throw new Error(json.error || "Delete failed");
      setSelectedId(null);
      await onReload();
    } catch (err) {
      onError(err.message);
    } finally {
      onBusy(null);
    }
  }

  return (
    <div className="wf-blogs" style={{ display: "contents" }}>
      <section className="wf-main">
        <header className="wf-topbar">
          <div>
            <p className="wf-kicker">Collection</p>
            <h1>Blog posts</h1>
          </div>
          <div className="wf-topbar__actions">
            <div className="wf-topbar__meta">
              <span>{rows.length} items</span>
              <span>
                {(blogs || []).filter((b) => b.status === "published").length} published
              </span>
            </div>
            <button
              type="button"
              className="wf-btn wf-btn--primary"
              onClick={() => {
                setSelectedId(null);
                setAdding(true);
              }}
            >
              + New post
            </button>
          </div>
        </header>

        <div className="wf-toolbar">
          <input
            className="wf-input wf-input--search"
            type="search"
            placeholder="Search posts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="wf-filter">
            {["All", "Published", "Drafts"].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`wf-chip ${filter === tag ? "wf-chip--on" : ""}`}
                onClick={() => setFilter(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th style={{ width: 56 }} />
                <th>Name</th>
                <th>Status</th>
                <th>Slug</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="wf-table__empty">
                    No blog posts yet — create one or load demo content
                  </td>
                </tr>
              ) : (
                rows.map((item) => (
                  <tr
                    key={item.id}
                    className={selectedId === item.id ? "wf-row--on" : undefined}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <td>
                      {item.coverUrl ? (
                        <img className="wf-thumb" src={item.coverUrl} alt="" />
                      ) : (
                        <div className="wf-thumb" />
                      )}
                    </td>
                    <td>
                      <strong>{item.title}</strong>
                      <span>{item.excerpt || "No excerpt"}</span>
                    </td>
                    <td>
                      <span
                        className={`wf-status ${
                          item.status === "published"
                            ? "wf-status--live"
                            : "wf-status--draft"
                        }`}
                      >
                        {item.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="wf-muted">{item.slug}</td>
                    <td className="wf-muted">
                      {formatWhen(item.updatedAt || item.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <BlogInspector
        item={selected}
        busy={busyId}
        onClose={() => setSelectedId(null)}
        onSave={save}
        onRemove={remove}
      />

      <NewBlogModal
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={(blog) => {
          onReload().then(() => setSelectedId(blog.id));
        }}
      />
    </div>
  );
}
