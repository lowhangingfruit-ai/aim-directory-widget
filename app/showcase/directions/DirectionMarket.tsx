"use client";

import { useEffect, useMemo, useState } from "react";
import { Profile, PROGRAMS, TECHNICAL_ASSISTANCE } from "@/lib/showcase";
import type { DirectionProps } from "./DirectionsClient";
import {
  ALL_PROGRAMS_COPY, CLOSING, MARKET_LOGOS, NAV, PAGE_INTRO, PAGE_TITLE, STATS, Tab,
  Portrait, ProgramLabel, cohortSort, knownMarketIDs, marketName, profileKey,
} from "./shared";

// Direction D: Market Day. Starts from where a shopper can actually meet
// program participants: pick an AIM market and see who sells there and when
// they're next there, from Manage My Market's live schedule.

const DAY = ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"];

function parseDate(s: string): Date | null {
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return m ? new Date(+m[3], +m[1] - 1, +m[2]) : null;
}

function datesAt(p: Profile, marketID: number): Date[] {
  const ds = p.vendor?.markets.filter((m) => m.marketID === marketID).flatMap((m) => m.dates) ?? [];
  return ds.map(parseDate).filter((d): d is Date => !!d).sort((a, b) => +a - +b);
}

const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function DirectionMarket({ current, alumni, allMarkets, onOpen }: DirectionProps) {
  const [tab, setTab] = useState<Tab>("all");
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    // Date is only known on the client; set once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(t);
  }, []);

  const everyone = useMemo(() => {
    // One entry per business: alumni who were in two programs appear once.
    const seen = new Set<string>();
    return [...current, ...alumni].filter((p) => {
      const k = `${p.match}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [current, alumni]);
  const inTab = everyone.filter((p) => tab === "all" || p.program === tab);

  const markets = useMemo(() => {
    const ids = Object.keys(allMarkets).map(Number);
    return ids.map((id) => {
      const people = inTab.filter((p) => knownMarketIDs(p, allMarkets).includes(id));
      const allDates = people.flatMap((p) => datesAt(p, id));
      const counts = new Array(7).fill(0);
      allDates.forEach((d) => counts[d.getDay()]++);
      const top = counts.indexOf(Math.max(...counts));
      return { id, people, day: allDates.length ? DAY[top] : null };
    }).filter((m) => m.people.length > 0).sort((a, b) => b.people.length - a.people.length);
  }, [inTab, allMarkets]);

  const [picked, setPicked] = useState<number | null>(null);
  const market = markets.find((m) => m.id === picked) ?? markets[0];

  const upcoming = useMemo(() => {
    if (!today) return [];
    const byDay = new Map<string, { date: Date; id: number; n: number }>();
    for (const m of markets) {
      for (const p of m.people) {
        for (const d of datesAt(p, m.id)) {
          if (d < today) continue;
          const k = `${+d}:${m.id}`;
          const e = byDay.get(k) ?? { date: d, id: m.id, n: 0 };
          e.n++;
          byDay.set(k, e);
        }
      }
    }
    return [...byDay.values()].sort((a, b) => +a.date - +b.date || b.n - a.n).slice(0, 5);
  }, [markets, today]);

  const atMarket = new Set(markets.flatMap((m) => m.people.map(profileKey)));
  const elsewhere = inTab.filter((p) => !atMarket.has(profileKey(p)))
    .sort((a, b) => Number(!!a.alum) - Number(!!b.alum) || cohortSort(a.cohort, b.cohort));
  const program = tab === "all" ? null : PROGRAMS[tab];

  return (
    <div className="dxd">
      <header className="dxd-hero">
        <div className="dx-wrap dxd-hero-inner">
          <div>
            <ProgramLabel className="dxd-eyebrow">Meet them at the market</ProgramLabel>
            <h1>{PAGE_TITLE}</h1>
            <p>{PAGE_INTRO}</p>
            <div className="dxd-hero-stat">
              <b>{STATS[2].value}</b> {STATS[2].label}
            </div>
          </div>
          <aside className="dxd-upcoming" aria-label="Coming up at AIM markets">
            <ProgramLabel className="dxd-upcoming-head">Coming up</ProgramLabel>
            {upcoming.length === 0 && <p className="dxd-upcoming-empty">Market dates are loading…</p>}
            {upcoming.map((u) => (
              <button key={`${+u.date}:${u.id}`} className="dxd-upcoming-row" onClick={() => setPicked(u.id)}>
                <span className="dxd-upcoming-date">{fmt(u.date)}</span>
                <span className="dxd-upcoming-market">{marketName(u.id, allMarkets)}</span>
                <span className="dxd-upcoming-n">{u.n} {u.n === 1 ? "participant" : "participants"}</span>
              </button>
            ))}
          </aside>
        </div>
      </header>

      <nav className="dxd-programs dx-wrap" aria-label="Programs">
        {NAV.map((n) => n.href ? (
          <a key={n.key} href={n.href} target="_blank" rel="noopener noreferrer" className="dxd-program"
            style={{ backgroundColor: n.color, color: n.text }}>
            <ProgramLabel>{n.label}</ProgramLabel><span className="dxd-program-arrow">↗</span>
          </a>
        ) : (
          <button key={n.key} className={`dxd-program ${tab === n.key ? "is-active" : ""}`} aria-pressed={tab === n.key}
            style={{ backgroundColor: n.color, color: n.text }} onClick={() => { setTab(n.key as Tab); setPicked(null); }}>
            <ProgramLabel>{n.label}</ProgramLabel>
          </button>
        ))}
      </nav>

      <section className="dxd-intro dx-wrap">
        {program ? (
          <>
            <p>{program.blurb}</p>
            <div className="dxd-intro-links">
              <span><b>Applications:</b> {program.applyWindow ?? "next window announced soon"}</span>
              <a href={program.url} target="_blank" rel="noopener noreferrer">About the program</a>
              {program.applyUrl && <a href={program.applyUrl} target="_blank" rel="noopener noreferrer">Apply to the Fund</a>}
            </div>
          </>
        ) : <p>{ALL_PROGRAMS_COPY}</p>}
      </section>

      {market && (
        <section className="dxd-board dx-wrap">
          <div className="dxd-markets" role="tablist" aria-label="AIM farmers markets">
            {markets.map((m) => (
              <button key={m.id} role="tab" aria-selected={m.id === market.id}
                className={`dxd-market ${m.id === market.id ? "is-active" : ""}`} onClick={() => setPicked(m.id)}>
                {MARKET_LOGOS[m.id] ? <img src={MARKET_LOGOS[m.id]} alt="" /> : <span className="dxd-market-blank" />}
                <span className="dxd-market-text">
                  <span className="dxd-market-name">{marketName(m.id, allMarkets)}</span>
                  <span className="dxd-market-meta">{m.day ?? "Seasonal"} · {m.people.length}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="dxd-stall">
            <div className="dxd-stall-head">
              <div>
                <ProgramLabel className="dxd-stall-kicker">{market.day ? `Open ${market.day}` : "Seasonal market"}</ProgramLabel>
                <h2>{marketName(market.id, allMarkets)}</h2>
              </div>
              <span>{market.people.length} program {market.people.length === 1 ? "participant" : "participants"} sell here</span>
            </div>
            <div className="dxd-stall-grid">
              {market.people.map((p) => {
                const pr = PROGRAMS[p.program];
                const next = today ? datesAt(p, market.id).find((d) => d >= today) : undefined;
                return (
                  <button key={profileKey(p)} className="dxd-vendor" onClick={() => onOpen(p)}>
                    <Portrait profile={p} />
                    <span className="dxd-vendor-body">
                      <span className="dxd-vendor-tag" style={{ backgroundColor: pr.color, color: pr.textOnColor }}>
                        {pr.shortName} {p.cohort}
                      </span>
                      <span className="dxd-vendor-name">{p.business}</span>
                      {p.details.sells && <span className="dxd-vendor-sells">{p.details.sells}</span>}
                      <span className="dxd-vendor-next">
                        {next ? <>Next here <b>{fmt(next)}</b></> : today ? "Between seasons here" : "\u00a0"}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {elsewhere.length > 0 && (
        <section className="dxd-elsewhere dx-wrap">
          <div className="dxd-elsewhere-head">
            <h2>More program participants</h2>
            <p>Not on an AIM market schedule right now. Many sell at other markets, in shops, or through catering.</p>
          </div>
          <div className="dxd-elsewhere-grid">
            {elsewhere.map((p) => {
              const pr = PROGRAMS[p.program];
              return (
                <button key={profileKey(p)} className="dxd-mini" onClick={() => onOpen(p)}>
                  <Portrait profile={p} />
                  <span className="dxd-mini-name">{p.business}</span>
                  <span className="dxd-mini-meta"><i style={{ backgroundColor: pr.color }} />{pr.shortName} {p.cohort}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {tab === "all" && (
        <section className="dxd-ta dx-wrap">
          <div style={{ backgroundColor: TECHNICAL_ASSISTANCE.color }}>
            <ProgramLabel className="dxd-ta-title" style={{ color: TECHNICAL_ASSISTANCE.squareText }}>{TECHNICAL_ASSISTANCE.name}</ProgramLabel>
            <p>{TECHNICAL_ASSISTANCE.blurb}</p>
            <a href={TECHNICAL_ASSISTANCE.url} target="_blank" rel="noopener noreferrer">About the program ↗</a>
          </div>
        </section>
      )}

      <footer className="dxd-closing dx-wrap"><p>{CLOSING}</p></footer>
    </div>
  );
}
