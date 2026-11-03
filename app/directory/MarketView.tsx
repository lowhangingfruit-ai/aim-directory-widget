"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Vendor } from "@/lib/types";
import type { Market } from "@/lib/markets";
import { directionsUrl } from "@/lib/markets";
import { dateFromIso, longDate, vendorDates } from "./vendorUtils";

interface Props {
  market: Market;
  vendors: Vendor[]; // every vendor, A to Z
  today: string;
  history: Record<string, number[]>; // past dates at this market
  backHref?: string; // set when the page is embedded on its own on AIM's site
  onBack: () => void;
  toolbar: React.ReactNode;
  beforeResults: React.ReactNode;
  filter: (list: Vendor[]) => Vendor[];
  view: "list" | "map";
  renderGrid: (list: Vendor[]) => React.ReactNode;
  renderMap: (list: Vendor[]) => React.ReactNode;
}

const PAST_DAYS = 31;

function daysBefore(iso: string, n: number): string {
  const d = dateFromIso(iso);
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function MarketView({ market, vendors, today, history, backHref, onBack, toolbar, beforeResults, filter, view, renderGrid, renderMap }: Props) {
  // Upcoming dates come from Manage My Market; past ones from what the
  // directory saved as each market day went by.
  const { past, upcoming } = useMemo(() => {
    const since = daysBefore(today, PAST_DAYS);
    const past = Object.keys(history).filter((d) => d >= since && d < today).sort();
    const upcoming = [...new Set(vendors.flatMap((v) => vendorDates(v, market.id)))].filter((d) => d >= today).sort().slice(0, 6);
    return { past, upcoming };
  }, [vendors, history, market.id, today]);

  // DirectoryApp keys this view by market, so each market starts on its next date.
  const [day, setDay] = useState(upcoming[0] ?? past[past.length - 1] ?? "");

  const atMarket = useMemo(() => {
    if (!day) return [];
    if (day < today) {
      // Matched against today's list, so anyone who has since withdrawn
      // sharing permission drops out of past dates too.
      const ids = new Set(history[day] ?? []);
      return vendors.filter((v) => ids.has(v.vendorID));
    }
    return vendors.filter((v) => vendorDates(v, market.id).includes(day));
  }, [day, today, history, vendors, market.id]);
  const shown = filter(atMarket);

  // Keep the chosen date in view in the scrolling row.
  const rowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = rowRef.current;
    const on = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && on) row.scrollLeft = on.offsetLeft - row.offsetLeft - 8;
  }, [market.id]);

  const tile = (iso: string, label: string, isPast: boolean) => {
    const d = dateFromIso(iso);
    return (
      <button key={iso} type="button" className={`day${isPast ? " past" : ""}`} aria-pressed={day === iso} onClick={() => setDay(iso)}
        aria-label={`${isPast ? "Past market, " : ""}${longDate(iso)}`}>
        <small>{label}</small>
        <b>{d.getDate()}</b>
        <span>{d.toLocaleDateString("en-US", { month: "short" })}</span>
      </button>
    );
  };

  return (
    <>
      <div className="band" style={{ background: market.background }}>
        <div className="wrap">
          {backHref
            ? <a className="back" href={backHref} target="_top">&larr; All Farmers Markets</a>
            : <button type="button" className="back" onClick={onBack}>&larr; All Farmers Markets</button>}
          <div className="mhead">
            <div>
              <div className="eyebrow">AIM farmers market</div>
              <h1>{market.name}</h1>
              <dl>
                <dt>When</dt><dd>{market.day}, {market.hours}{market.seasonal ? "" : ", rain or shine"}</dd>
                <dt>Where</dt>
                <dd><a href={directionsUrl(market)} target="_blank" rel="noopener noreferrer">{market.address}, {market.city}</a></dd>
              </dl>
              <a className="mlink" href={market.aimPage} target="_blank" rel="noopener noreferrer">Parking, market map, and details &#8599;</a>
            </div>
            <img className="biglogo" src={market.logo} alt={`${market.name} Farmers Market logo`} />
          </div>
          {(past.length > 0 || upcoming.length > 0) && (
            <div className="days" ref={rowRef}>
              {past.map((iso) => tile(iso, "Past", true))}
              {past.length > 0 && upcoming.length > 0 && <span className="sep" aria-hidden="true" />}
              {upcoming.map((iso, i) => tile(iso, iso === today ? "Today" : i === 0 ? "Next" : dateFromIso(iso).toLocaleDateString("en-US", { weekday: "short" }), false))}
            </div>
          )}
        </div>
      </div>

      {toolbar}
      {beforeResults}

      <div className="wrap" id="aimdir-results">
        {view === "map" ? (
          <div className="mapbox">{renderMap(shown)}</div>
        ) : day ? (
          <>
            <div className="count">
              <span>
                <b>{shown.length}</b> market participant{shown.length === 1 ? "" : "s"} {day < today ? "were at" : "at"} {market.name} on {longDate(day)}
              </span>
              <span>A to Z</span>
            </div>
            {renderGrid(shown)}
          </>
        ) : (
          <p className="empty">{market.seasonal ? `${market.name} is back next season.` : "Market dates will be posted soon."}</p>
        )}
      </div>
    </>
  );
}
