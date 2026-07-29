"use client";

import { useState } from "react";

export default function SubmitDemo() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [shotKey, setShotKey] = useState(0);

  async function inspect(e) {
    e.preventDefault();
    const url = value.trim();
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/inspect?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setData(json);
      setShotKey((k) => k + 1);
    } catch (err) {
      setError(err.message || "Could not reach that site. Check the URL.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="submit" id="submit">
      <form className="submit__bar" onSubmit={inspect}>
        <span className="submit__prefix">https://</span>
        <input
          className="submit__input"
          type="text"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="paste-any-site.com"
          aria-label="Website URL"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button className="submit__btn" type="submit" disabled={loading}>
          {loading ? "Pulling" : "Pull it in"}
        </button>
      </form>

      <div
        className={`submit__status microlabel ${
          error ? "submit__status--error" : ""
        }`}
        role="status"
      >
        {loading && (
          <>
            <span className="dot dot--blink" aria-hidden="true" />
            Reading metadata / capturing screenshot
          </>
        )}
        {error && <>ERR / {error}</>}
      </div>

      {data && (
        <article className="preview" aria-label={`Preview of ${data.host}`}>
          <header className="preview__head">
            <div className="preview__head-left">
              <img
                className="preview__favicon"
                src={data.favicon}
                alt=""
                width={18}
                height={18}
              />
              <span className="preview__url">{data.url}</span>
            </div>
            <span className="preview__stamp">
              <span className="dot" aria-hidden="true" />
              Certified Banger
            </span>
          </header>

          <div className="preview__shot">
            <img
              key={shotKey}
              src={`${data.screenshot}&r=${shotKey}`}
              alt={`Screenshot of ${data.host}`}
              loading="lazy"
            />
          </div>

          <div className="preview__meta">
            <div className="preview__field">
              <span className="microlabel">Title</span>
              <p>{data.title}</p>
            </div>
            <div className="preview__field">
              <span className="microlabel">Host</span>
              <p>{data.host}</p>
            </div>
            <div className="preview__field">
              <span className="microlabel">Description</span>
              <p className={data.description ? "" : "muted"}>
                {data.description || "No description provided."}
              </p>
            </div>
            <div className="preview__field">
              <span className="microlabel">Theme color</span>
              <p className={data.themeColor ? "" : "muted"}>
                {data.themeColor || "—"}
              </p>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
