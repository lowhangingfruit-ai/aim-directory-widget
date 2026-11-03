"use client";

import type { Vendor } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/categories";
import { MARKET_LIST, REGIONS, directionsUrl } from "@/lib/markets";
import type { Filters } from "./Toolbar";
import { shortDate, vendorDates } from "./vendorUtils";

interface Props {
  vendors: Vendor[];
  today: string;
  toolbar: React.ReactNode;
  beforeResults: React.ReactNode;
  filtering: boolean;
  filtered: Vendor[];
  filters: Filters;
  onClear: () => void;
  onOpenMarket: (id: number) => void;
  renderGrid: (list: Vendor[]) => React.ReactNode;
  renderMap: (list: Vendor[]) => React.ReactNode;
}

export default function MarketsHome({ vendors, today, toolbar, beforeResults, filtering, filtered, filters, onClear, onOpenMarket, renderGrid, renderMap }: Props) {
  return (
    <>
      <div className="wrap">
        <header className="head">
          <h1>Market Participant Directory</h1>
          <p>
            Meet the farmers, food producers, and local artisans who make AIM&rsquo;s Certified Farmers Markets so unique.
            From fresh-picked seasonal produce to locally crafted foods and specialty goods, our markets connect you with
            the people behind the products and the ones growing your food.
          </p>
          <p>
            Explore the market directory to discover vendors by market, market day, vendor type, or product. Vendor
            offerings and attendance vary by location and season, so there&rsquo;s always something new to discover.
          </p>
          <details className="about">
            <summary>About this directory and the information it shows</summary>
            <div>
              <p><strong>What it shows.</strong>{" "}Business name, description, city, website and social links, and market
                dates, all from each vendor&rsquo;s Manage My Market profile. It never shows email addresses, phone
                numbers, or street addresses.</p>
              <p><strong>Who is included.</strong>{" "}Only market participants who have agreed in Manage My Market to let AIM
                share their information publicly. Market participants can change that answer, or update their details, in
                their Manage My Market profile at any time.</p>
            </div>
          </details>
        </header>
      </div>

      {toolbar}
      {beforeResults}

      <div className="wrap" id="aimdir-results">
        {filters.view === "map" ? (
          <div className="mapbox">{renderMap(filtering ? filtered : vendors)}</div>
        ) : filtering ? (
          <>
            <div className="count">
              <span>
                <b>{filtered.length}</b> market participant{filtered.length === 1 ? "" : "s"}
                {filters.category && ` in ${CATEGORY_LABELS[filters.category].toLowerCase()}`}
                {filters.q && <> matching &ldquo;{filters.q}&rdquo;</>}
              </span>
              <button type="button" onClick={onClear}>Show all markets</button>
            </div>
            {renderGrid(filtered)}
          </>
        ) : (
          REGIONS.map((r) => (
            <section key={r.id} className="region">
              <h2>{r.title}</h2>
              <p>{r.note}</p>
              <div className="mgrid">
                {MARKET_LIST.filter((m) => m.region === r.id).map((m) => {
                  const count = vendors.filter((v) => v.markets.some((x) => x.marketID === m.id)).length;
                  const next = vendors.flatMap((v) => vendorDates(v, m.id)).filter((d) => d >= today).sort()[0];
                  return (
                    <article key={m.id} className={`mcard${m.seasonal && !next ? " off" : ""}`}>
                      <button type="button" className="open" onClick={() => onOpenMarket(m.id)}>
                        <div className="logo" style={{ background: m.background }}>
                          <img src={m.logo} alt={`${m.name} Farmers Market logo`} />
                        </div>
                        <div className="txt">
                          <h3>{m.name}</h3>
                          <div className="when">{m.day}, {m.hours}</div>
                        </div>
                      </button>
                      <a className="addr" href={directionsUrl(m)} target="_blank" rel="noopener noreferrer">{m.address}, {m.city}</a>
                      <div className="next">
                        {next
                          ? <b>{next === today ? "Open today" : `Next: ${shortDate(next)}`}</b>
                          : <span className="tbd">{m.seasonal ? "Back next season" : "Dates to be announced"}</span>}
                        <span style={{ color: "var(--muted)" }}>{count} vendors</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
