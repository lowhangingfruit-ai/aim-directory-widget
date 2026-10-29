"use client";

import { useState } from "react";
import { Profile, PROGRAMS, TECHNICAL_ASSISTANCE } from "@/lib/showcase";
import type { DirectionProps } from "./DirectionsClient";
import {
  ALL_PROGRAMS_COPY, CLOSING, NAV, PAGE_INTRO, PAGE_TITLE, STATS, STATS_NOTE, Tab,
  Portrait, ProgramLabel, cohortSort, profileKey, storyOf,
} from "./shared";

// Direction A: Field Journal. An editorial, magazine-style read: a table of
// contents for the five programs, big feature spreads with pull quotes drawn
// word for word from each participant's AIM bio, then everyone else in a
// loose photo column layout.

// Program colors deepened for small text on paper.
const LABEL_INK = { maf: "#5a8424", farmer: "#3b783b", foodmaker: "#3d8a2c" } as const;

interface Feature { match: string; quote: string; by?: string }

const FEATURES: Feature[] = [
  { match: "shao shan", quote: "Farming is a lifestyle that encompasses every minute of your day and brings immensely personal highs and lows." },
  { match: "monarca", quote: "If you want to work in agriculture, you have to stay committed, work hard, and believe in your goals." },
  { match: "chiki", quote: "The highest quality and most authentic Mexican food in San Rafael, served with passion." },
  { match: "dulce organic", quote: "Raised by farmers, Antonia has been working since she was a young girl and has now grown to own her own 23-acre farm." },
  { match: "josephine's southern", quote: "I loved the part where I did not have to pay the money back — a grant and not a loan.", by: "Tatiana Thomas" },
  { match: "coaster cookies", quote: "Bringing people back to the simple satisfaction of a really good cookie." },
  { match: "vasquez organic", quote: "Emiliano learned to farm as a child in Oaxaca, Mexico by his father and mother who would farm food to feed their family." },
  { match: "ayoquezco", quote: "He hopes that every child has the opportunity to eat healthy organic food." },
  { match: "tavus", quote: "It is their mission to preserve the ancient flavors of Persia and its traditions." },
];

function excerpt(story: string): string {
  const first = story.split(/\n\n/)[0];
  const sentences = first.match(/[^.!?]+[.!?]+["”’]?/g) ?? [first];
  let out = "";
  for (const s of sentences) {
    if (out.length > 180) break;
    out += s;
  }
  return out.trim();
}

export default function DirectionJournal({ current, alumni, onOpen }: DirectionProps) {
  const [tab, setTab] = useState<Tab>("all");
  const everyone = [...current, ...alumni];

  const inTab = (p: Profile) => tab === "all" || p.program === tab;
  const features = FEATURES
    .map((f) => ({ f, p: everyone.find((p) => p.match === f.match && p.photo) }))
    .filter((x): x is { f: Feature; p: Profile } => !!x.p && inTab(x.p))
    .slice(0, tab === "all" ? 5 : 3);
  const featured = new Set(features.map((x) => profileKey(x.p)));
  const rest = everyone
    .filter((p) => inTab(p) && !featured.has(profileKey(p)))
    .sort((a, b) => Number(!!a.alum) - Number(!!b.alum) || cohortSort(a.cohort, b.cohort));

  const program = tab === "all" ? null : PROGRAMS[tab];

  return (
    <div className="dxa">
      <header className="dxa-mast dx-wrap">
        <div className="dxa-kicker">
          <span>Agricultural Institute of Marin</span>
          <span>Participant Stories</span>
        </div>
        <h1>{PAGE_TITLE}</h1>
        <p className="dxa-dek">{PAGE_INTRO}</p>
      </header>

      <nav className="dxa-contents dx-wrap" aria-label="Programs">
        {NAV.map((n, i) => {
          const active = n.key === tab;
          const inner = (
            <>
              <span className="dxa-contents-bar" style={{ backgroundColor: n.key === "all" ? "#c9c5b0" : n.color }} />
              <span className="dxa-contents-num">{String(i + 1).padStart(2, "0")}</span>
              <ProgramLabel className="dxa-contents-label">{n.label}{n.href ? " ↗" : ""}</ProgramLabel>
            </>
          );
          return n.href ? (
            <a key={n.key} href={n.href} target="_blank" rel="noopener noreferrer" className="dxa-contents-item">{inner}</a>
          ) : (
            <button key={n.key} className={`dxa-contents-item ${active ? "is-active" : ""}`} aria-pressed={active}
              onClick={() => setTab(n.key as Tab)}>{inner}</button>
          );
        })}
      </nav>

      <section className="dxa-standfirst dx-wrap">
        {program ? (
          <>
            <p className="dxa-standfirst-text">{program.blurb}</p>
            <div className="dxa-standfirst-meta">
              <span><b>Applications:</b> {program.applyWindow ?? "next window announced soon"}</span>
              <a href={program.url} target="_blank" rel="noopener noreferrer">About the program</a>
              {program.applyUrl && <a href={program.applyUrl} target="_blank" rel="noopener noreferrer">Apply to the Fund</a>}
            </div>
          </>
        ) : (
          <p className="dxa-standfirst-text">{ALL_PROGRAMS_COPY}</p>
        )}
      </section>

      {features.map(({ f, p }, i) => {
        const pr = PROGRAMS[p.program];
        const story = storyOf(p);
        return (
          <article key={profileKey(p)} className={`dxa-feature dx-wrap ${i === 0 ? "is-lead" : ""} ${i % 2 === 1 ? "is-flip" : ""}`}>
            <button className="dxa-feature-photo" onClick={() => onOpen(p)} aria-label={`Read ${p.business}'s story`}>
              <Portrait profile={p} />
            </button>
            <div className="dxa-feature-text">
              <ProgramLabel className="dxa-feature-program" style={{ color: LABEL_INK[pr.id] }}>
                {pr.name} · {p.cohort}
              </ProgramLabel>
              <h2 className="dxa-feature-title">{p.business}</h2>
              {p.person && <div className="dxa-feature-person">{p.person}</div>}
              <blockquote className="dxa-quote" style={{ borderColor: pr.color }}>
                <span aria-hidden="true" className="dxa-quote-mark" style={{ color: pr.color }}>&ldquo;</span>
                {f.quote}
                {f.by && <cite>{f.by}</cite>}
              </blockquote>
              {story && <p className="dxa-feature-excerpt">{excerpt(story)}</p>}
              <button className="dxa-readmore" onClick={() => onOpen(p)}>Read the full story →</button>
            </div>
          </article>
        );
      })}

      {tab === "all" && (
        <section className="dxa-numbers">
          <div className="dx-wrap">
            <ProgramLabel className="dxa-numbers-head">By the numbers</ProgramLabel>
            <div className="dxa-numbers-grid">
              {STATS.map((s) => (
                <div key={s.value}>
                  <div className="dxa-numbers-value">{s.value}</div>
                  <div className="dxa-numbers-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="dxa-numbers-note">{STATS_NOTE}</div>
          </div>
        </section>
      )}

      <section className="dxa-more dx-wrap">
        <div className="dxa-section-head">
          <h2>{program ? `More from the ${program.name}` : "More from the programs"}</h2>
          <span>{rest.length} participants</span>
        </div>
        <div className="dxa-columns">
          {rest.map((p) => {
            const pr = PROGRAMS[p.program];
            return (
              <button key={profileKey(p)} className="dxa-card" onClick={() => onOpen(p)}>
                <Portrait profile={p} />
                <span className="dxa-card-meta">
                  <span className="dxa-card-dot" style={{ backgroundColor: pr.color }} />
                  {pr.shortName} · {p.cohort}{p.alum ? "" : " · Current"}
                </span>
                <span className="dxa-card-title">{p.business}</span>
                {p.person && <span className="dxa-card-person">{p.person}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "all" && (
        <section className="dxa-ta dx-wrap">
          <div className="dxa-ta-inner" style={{ backgroundColor: TECHNICAL_ASSISTANCE.color }}>
            <ProgramLabel className="dxa-ta-label" style={{ color: TECHNICAL_ASSISTANCE.squareText }}>{TECHNICAL_ASSISTANCE.name}</ProgramLabel>
            <p>{TECHNICAL_ASSISTANCE.blurb}</p>
            <a href={TECHNICAL_ASSISTANCE.url} target="_blank" rel="noopener noreferrer">About the program ↗</a>
          </div>
        </section>
      )}

      <footer className="dxa-closing dx-wrap">
        <p>{CLOSING}</p>
      </footer>
    </div>
  );
}
