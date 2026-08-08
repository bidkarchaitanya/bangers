"use client";

import { useMemo, useState } from "react";
import { DESIGN_TAGS } from "../lib/tags";

function BoardCard({ item }) {
  const href = `https://x.com/${item.author || "i"}/status/${item.id}`;
  const src = item.mediaUrl;
  const handle = item.author;

  if (!src) {
    return (
      <a
        className="board-card board-card--empty"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
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
        <span className="board-card__meta">
          <span className="board-card__author">
            {handle ? `@${handle}` : "View on X"}
          </span>
          {item.description ? (
            <span className="board-card__desc">{item.description}</span>
          ) : null}
          {item.tags?.length ? (
            <span className="board-card__tags">
              {item.tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </span>
        <span className="dot" aria-hidden="true" />
      </span>
    </a>
  );
}

export default function BoardGallery({ items }) {
  const [filter, setFilter] = useState("All");

  const visible = useMemo(() => {
    if (filter === "All") return items;
    return items.filter((item) => (item.tags || []).includes(filter));
  }, [items, filter]);

  const usedTags = useMemo(() => {
    const set = new Set();
    for (const item of items) {
      for (const tag of item.tags || []) set.add(tag);
    }
    return DESIGN_TAGS.filter((t) => set.has(t));
  }, [items]);

  return (
    <>
      <div className="section-head">
        <h2>The Board</h2>
        <span className="microlabel">
          Index / {String(visible.length).padStart(3, "0")}
        </span>
      </div>

      {usedTags.length > 0 && (
        <div className="board-filters" role="toolbar" aria-label="Filter by design type">
          <button
            type="button"
            className={`cms-tag ${filter === "All" ? "cms-tag--on" : ""}`}
            onClick={() => setFilter("All")}
          >
            All
          </button>
          {usedTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`cms-tag ${filter === tag ? "cms-tag--on" : ""}`}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="hero__sub" style={{ marginTop: 8 }}>
          No bangers in this tag yet.
        </p>
      ) : (
        <div className="board" data-theme="light">
          {visible.map((t) => (
            <div className="tweet-wrap" key={t.id}>
              <BoardCard item={t} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
