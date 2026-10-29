"use client";

import { useState } from "react";
import { Profile, PROGRAMS } from "@/lib/showcase";
import type { DirectionProps } from "./DirectionsClient";
import {
  ALL_PROGRAMS_COPY, CLOSING, NAV, PAGE_INTRO, PAGE_TITLE, PROGRAM_ORDER, STATS, STATS_NOTE, Tab,
  Portrait, ProgramLabel, cohortSort, profileKey,
} from "./shared";

// Direction B: Class Portraits. A yearbook: every participant, class by
// class, newest first, each class split by program. Built for browsing the
// whole roster at a glance.

export default function DirectionYearbook({ current, alumni, onOpen }: DirectionProps) {
  const [tab, setTab] = useState<Tab>("all");
  const everyone = [...current, ...alumni].filter((p) => tab === "all" || p.program === tab);
  const years = [...new Set(everyone.map((p) => p.cohort))].sort(cohortSort);
  const program = tab === "all" ? null : PROGRAMS[tab];

  return (
    <div className="dxb">
      <header className="dxb-head">
        <div className="dx-wrap dxb-head-inner">
          <div>
            <ProgramLabel className="dxb-eyebrow">Agricultural Institute of Marin · Class Portraits</ProgramLabel>
            <h1>{PAGE_TITLE}</h1>
            <p>{PAGE_INTRO}</p>
          </div>
          <dl className="dxb-stats">
            {STATS.map((s) => (
              <div key={s.value}><dt>{s.value}</dt><dd>{s.label}</dd></div>
            ))}
            <div className="dxb-stats-note">{STATS_NOTE}</div>
          </dl>
        </div>
      </header>

      <div className="dxb-bar">
        <div className="dx-wrap dxb-bar-inner">
          <div className="dxb-programs" role="tablist" aria-label="Programs">
            {NAV.map((n) => n.href ? (
              <a key={n.key} href={n.href} target="_blank" rel="noopener noreferrer" className="dxb-chip"
                style={{ backgroundColor: n.color, color: n.text }}>
                <ProgramLabel>{n.label} ↗</ProgramLabel>
              </a>
            ) : (
              <button key={n.key} role="tab" aria-selected={tab === n.key} className={`dxb-chip ${tab === n.key ? "is-active" : ""}`}
                style={{ backgroundColor: n.color, color: n.text }} onClick={() => setTab(n.key as Tab)}>
                <ProgramLabel>{n.label}</ProgramLabel>
              </button>
            ))}
          </div>
          <div className="dxb-years" aria-label="Jump to a class">
            {years.map((y) => <a key={y} href={`#class-${y}`} onClick={(e) => {
              e.preventDefault();
              document.getElementById(`class-${y}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}>{y}</a>)}
          </div>
        </div>
      </div>

      <section className="dxb-foreword dx-wrap">
        {program ? (
          <>
            <p>{program.blurb}</p>
            <div className="dxb-foreword-links">
              <span><b>Applications:</b> {program.applyWindow ?? "next window announced soon"}</span>
              <a href={program.url} target="_blank" rel="noopener noreferrer">About the program</a>
              {program.applyUrl && <a href={program.applyUrl} target="_blank" rel="noopener noreferrer">Apply to the Fund</a>}
            </div>
          </>
        ) : <p>{ALL_PROGRAMS_COPY}</p>}
      </section>

      {years.map((y) => {
        const inYear = everyone.filter((p) => p.cohort === y);
        return (
          <section key={y} id={`class-${y}`} className="dxb-class">
            <div className="dx-wrap">
              <div className="dxb-class-head">
                <ProgramLabel className="dxb-class-of">Class of</ProgramLabel>
                <span className="dxb-class-year">{y}</span>
                <span className="dxb-class-count">
                  {inYear.length} {inYear.length === 1 ? "business" : "businesses"}
                  {y === "2026" ? " · current cohort" : ""}
                </span>
              </div>
              {PROGRAM_ORDER.map((id) => {
                const group = inYear.filter((p) => p.program === id);
                if (!group.length) return null;
                const pr = PROGRAMS[id];
                return (
                  <div key={id} className="dxb-group">
                    <div className="dxb-group-head">
                      <span className="dxb-group-swatch" style={{ backgroundColor: pr.color }} />
                      <ProgramLabel>{pr.name}</ProgramLabel>
                      <span className="dxb-group-count">{group.length}</span>
                    </div>
                    <div className="dxb-grid">
                      {group.map((p: Profile) => (
                        <button key={profileKey(p)} className="dxb-portrait" onClick={() => onOpen(p)}>
                          <Portrait profile={p} />
                          <span className="dxb-portrait-name">{p.business}</span>
                          {p.person && <span className="dxb-portrait-person">{p.person}</span>}
                          {p.alsoTags?.map((t) => <span key={t} className="dxb-portrait-also">Also {t}</span>)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <footer className="dxb-closing dx-wrap"><p>{CLOSING}</p></footer>
    </div>
  );
}
