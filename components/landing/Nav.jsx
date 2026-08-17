"use client";

import { useState } from "react";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="ul-nav">
      <div className="ul-nav__inner">
        <a href="#top" className="ul-logo">
          <LogoMark size={24} />
          <span>Userlens</span>
        </a>

        <div className={`ul-nav__links ${open ? "is-open" : ""}`}>
          <a href="#product" onClick={() => setOpen(false)}>
            Product
          </a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </a>
          <a href="#pricing" onClick={() => setOpen(false)}>
            Pricing
          </a>
          <a href="#customers" onClick={() => setOpen(false)}>
            Customers
          </a>
        </div>

        <a className="ul-btn ul-btn--primary ul-nav__cta" href="#demo">
          Book Demo
          <ArrowIcon />
        </a>

        <button
          className="ul-nav__menu"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}

export function LogoMark({ size = 24, stacked = false }) {
  const Mark = ({ s, opacity = 1 }) => (
    <svg width={s} height={s} viewBox="0 0 25 24" fill="none" aria-hidden="true" style={{ opacity }}>
      <path
        d="M2 4h6v10.5c0 3.2 2.4 5.5 5.5 5.5s5.5-2.3 5.5-5.5V4h4v10.8C23 20.2 18.4 24 12.5 24S2 20.2 2 14.8V4z"
        fill="#3168FF"
      />
      <path d="M9.2 7.2h6.6v7.2c0 1.8-1.4 3.2-3.3 3.2s-3.3-1.4-3.3-3.2V7.2z" fill="#FAFBFF" />
    </svg>
  );

  if (!stacked) {
    return (
      <span className="ul-mark" style={{ width: size, height: size }}>
        <Mark s={size} />
      </span>
    );
  }

  return (
    <span className="ul-mark ul-mark--stack" style={{ width: size, height: size }}>
      <Mark s={size} opacity={0.35} />
      <span style={{ position: "absolute" }}>
        <Mark s={Math.round(size * 0.78)} opacity={0.65} />
      </span>
      <span style={{ position: "absolute" }}>
        <Mark s={Math.round(size * 0.56)} />
      </span>
    </span>
  );
}

export function ArrowIcon({ dim = false }) {
  return (
    <svg className="ul-arrow" width="19" height="17" viewBox="0 0 19 17" fill="none" aria-hidden="true">
      <path d="M0 8.5h16M11 2l6 6.5-6 6.5" stroke={dim ? "#808080" : "currentColor"} strokeWidth="1.6" />
    </svg>
  );
}

export function Diamond() {
  return (
    <svg className="ul-diamond" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="6" y="0" width="8.5" height="8.5" fill="#3168FF" transform="rotate(45 6 0)" />
    </svg>
  );
}
