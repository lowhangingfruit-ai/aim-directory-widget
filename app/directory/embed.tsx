"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Messages between this page and the snippet on AIM's Squarespace page
// (docs/squarespace-embed.html):
//   out: { type: "aim-directory-height", height } so the iframe fits the content
//   out: { type: "aim-directory-scroll-top" } after switching market, so the parent scrolls to the iframe top
//   in:  { type: "aim-directory-viewport", top, height } the visible slice
export interface EmbedFrame { top: number; height: number }

export function useEmbedFrame(embedded: boolean): EmbedFrame | null {
  const [frame, setFrame] = useState<EmbedFrame | null>(null);

  useEffect(() => {
    if (!embedded || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window.parent) return;
      const d = e.data as { type?: string; top?: unknown; height?: unknown } | null;
      if (d?.type !== "aim-directory-viewport") return;
      if (typeof d.top !== "number" || typeof d.height !== "number" || !isFinite(d.top) || !isFinite(d.height)) return;
      setFrame({ top: Math.max(0, d.top), height: Math.max(320, d.height) });
    };
    window.addEventListener("message", onMessage);

    // Posted on several triggers: ResizeObserver is missing in some webviews,
    // and fonts and images change the height after first paint.
    let last = -1;
    const post = () => {
      const height = document.body.scrollHeight;
      if (height === last) return;
      last = height;
      window.parent.postMessage({ type: "aim-directory-height", height }, "*");
    };
    post();
    window.parent.postMessage({ type: "aim-directory-ready" }, "*");
    window.addEventListener("resize", post);
    window.addEventListener("load", post);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(post);
    observer?.observe(document.body);
    const timers = [100, 400, 1200, 3000].map((ms) => window.setTimeout(post, ms));
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", post);
      window.removeEventListener("load", post);
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [embedded]);

  return frame;
}

export function scrollToTop(embedded: boolean) {
  if (embedded && window.parent !== window) window.parent.postMessage({ type: "aim-directory-scroll-top" }, "*");
  else window.scrollTo(0, 0);
}

// A dimmed layer for the profile and the in-season guide. Esc and a click
// outside close it. Inside the Squarespace iframe the page never scrolls, so
// it's placed over the slice of the iframe the visitor can see.
export function Overlay({ embedded, frame, onClose, children }: {
  embedded: boolean;
  frame: EmbedFrame | null;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (!embedded) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [embedded, onClose]);

  const style: React.CSSProperties | undefined = embedded
    ? { position: "absolute", top: frame?.top ?? 0, height: frame?.height ?? 760, left: 0, right: 0 }
    : undefined;
  return createPortal(
    <div className="aimdir-scrim" style={style} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {children}
    </div>,
    document.body
  );
}
