"use client";

import { useEffect, useState } from "react";
import { PROGRAMS, ProgramID, TECHNICAL_ASSISTANCE } from "@/lib/showcase";
import type { DirectionProps } from "./DirectionsClient";
import {
  ALL_PROGRAMS_COPY, CLOSING, NAV, PAGE_INTRO, PAGE_TITLE, PROGRAM_ORDER, STATS, STATS_NOTE,
  Portrait, ProgramLabel, cohortSort, profileKey,
} from "./shared";

// Direction C: Program Chapters. The program squares grow into the page
// itself: each program is a full-width chapter in its own color, with its
// current cohort and its alumni, read top to bottom in Shayla's order.

const HERO = [
  "/participants/shao-shan-farm.jpg",
  "/participants/monarca-berry-farm.jpg",
  "/participants/chikis-tacos.jpg",
  "/participants/josephines-southern-cuisine.jpg",
  "/participants/vasquez-organic-farm.jpg",
];

function Chapter({ id, index, oat, current, alumni, onOpen }: {
  id: ProgramID; index: number; oat: boolean;
  current: DirectionProps["current"]; alumni: DirectionProps["alumni"]; onOpen: DirectionProps["onOpen"];
}) {
  const pr = PROGRAMS[id];
  const cohort = current.filter((p) => p.program === id);
  const alums = alumni.filter((p) => p.program === id).sort((a, b) => cohortSort(a.cohort, b.cohort));
  const [showAll, setShowAll] = useState(false);
  const visibleAlums = showAll ? alums : alums.slice(0, 8);

  return (
    <section id={`ch-${id}`} className={`dxc-chapter ${oat ? "is-oat" : ""}`}
      style={{ "--program": pr.color } as React.CSSProperties}>
      <div className="dx-wrap dxc-chapter-inner">
        <div className="dxc-chapter-intro">
          <div className="dxc-chapter-num">Chapter {String(index).padStart(2, "0")}</div>
          <ProgramLabel className="dxc-chapter-title">{pr.name}</ProgramLabel>
          <p className="dxc-chapter-blurb">{pr.blurb}</p>
          <div className="dxc-chapter-apply">
            <span>Applications</span>
            {pr.applyWindow ?? "next window announced soon"}
          </div>
          <div className="dxc-chapter-links">
            <a href={pr.url} target="_blank" rel="noopener noreferrer">About the program</a>
            {pr.applyUrl && <a href={pr.applyUrl} target="_blank" rel="noopener noreferrer">Apply to the Fund</a>}
          </div>
        </div>

        <div className="dxc-chapter-people">
          {cohort.length > 0 && (
            <>
              <div className="dxc-sub">The 2026 cohort <span>{cohort.length}</span></div>
              <div className="dxc-cohort">
                {cohort.map((p) => (
                  <button key={profileKey(p)} className="dxc-person" onClick={() => onOpen(p)}>
                    <Portrait profile={p} />
                    <span className="dxc-person-name">{p.business}</span>
                    {p.person && <span className="dxc-person-sub">{p.person}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
          {alums.length > 0 && (
            <>
              <div className="dxc-sub dxc-sub-alumni">Program alumni <span>{alums.length}</span></div>
              <div className="dxc-alumni">
                {visibleAlums.map((p) => (
                  <button key={profileKey(p)} className="dxc-alum" onClick={() => onOpen(p)}>
                    <Portrait profile={p} />
                    <span className="dxc-alum-name">{p.business}</span>
                    <span className="dxc-alum-year">Class of {p.cohort}</span>
                  </button>
                ))}
              </div>
              {alums.length > 8 && (
                <button className="dxc-more" onClick={() => setShowAll(!showAll)}>
                  {showAll ? "Show fewer" : `See all ${alums.length} alumni`}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default function DirectionChapters({ current, alumni, onOpen }: DirectionProps) {
  const [active, setActive] = useState<string>("all");
  const everyone = [...current, ...alumni];

  useEffect(() => {
    const ids = ["all", ...PROGRAM_ORDER, "ta"];
    const els = ids.map((id) => document.getElementById(`ch-${id}`)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis[0]) setActive(vis[0].target.id.replace("ch-", ""));
    }, { rootMargin: "-20% 0px -60% 0px" });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const go = (id: string) => document.getElementById(`ch-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="dxc">
      <header className="dxc-hero">
        <div className="dx-wrap">
          <span className="dxc-hero-eyebrow">Agricultural Institute of Marin</span>
          <h1>{PAGE_TITLE}</h1>
          <p>{PAGE_INTRO}</p>
        </div>
      </header>

      <nav className="dxc-index" aria-label="Programs">
        <div className="dx-wrap dxc-index-inner">
          {NAV.map((n, i) => {
            const key = n.key === "all" ? "all" : n.key;
            return (
              <button key={n.key} className={`dxc-index-item ${active === key ? "is-active" : ""}`}
                aria-current={active === key ? "true" : undefined}
                style={{ "--program": n.color } as React.CSSProperties} onClick={() => go(key)}>
                <span className="dxc-index-dot" aria-hidden="true" />
                <span className="dxc-index-num">{String(i + 1).padStart(2, "0")}</span>
                <ProgramLabel>{n.label}</ProgramLabel>
              </button>
            );
          })}
        </div>
      </nav>

      <section id="ch-all" className="dxc-chapter dxc-all is-oat">
        <div className="dx-wrap">
          <div className="dxc-chapter-num">Chapter 01</div>
          <ProgramLabel className="dxc-chapter-title">All Farm &amp; Food Programs</ProgramLabel>
          <p className="dxc-all-copy">{ALL_PROGRAMS_COPY}</p>
          <div className="dxc-hero-photos">
            {HERO.map((src) => {
              const p = everyone.find((x) => x.photo === src);
              return p ? (
                <button key={src} onClick={() => onOpen(p)} aria-label={`Read ${p.business}'s story`}>
                  <Portrait profile={p} />
                </button>
              ) : null;
            })}
          </div>
          <div className="dxc-stats">
            {STATS.map((s) => (
              <div key={s.value}><b>{s.value}</b><span>{s.label}</span></div>
            ))}
          </div>
          <div className="dxc-stats-note">{STATS_NOTE}</div>
        </div>
      </section>

      {PROGRAM_ORDER.map((id, i) => (
        <Chapter key={id} id={id} index={i + 2} oat={i % 2 === 1} current={current} alumni={alumni} onOpen={onOpen} />
      ))}

      <section id="ch-ta" className="dxc-chapter dxc-ta">
        <div className="dx-wrap dxc-ta-inner">
          <div>
            <div className="dxc-chapter-num">Chapter 05</div>
            <ProgramLabel className="dxc-chapter-title">{TECHNICAL_ASSISTANCE.name}</ProgramLabel>
          </div>
          <div>
            <p className="dxc-chapter-blurb">{TECHNICAL_ASSISTANCE.blurb}</p>
            <a className="dxc-ta-link" href={TECHNICAL_ASSISTANCE.url} target="_blank" rel="noopener noreferrer">
              Visit Technical Assistance and Education ↗
            </a>
          </div>
        </div>
      </section>

      <footer className="dxc-footer">
        <span className="sg-stripes" aria-hidden="true" />
        <div className="dxc-closing dx-wrap"><p>{CLOSING}</p></div>
      </footer>
    </div>
  );
}
