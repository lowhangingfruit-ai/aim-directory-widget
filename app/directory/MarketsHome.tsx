"use client";

import type { Vendor } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/categories";
import { MARKET_LIST, REGIONS, directionsUrl } from "@/lib/markets";
import type { Filters } from "./Toolbar";
import { shortDate, vendorDates } from "./vendorUtils";
import { NewTab } from "./a11y";

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
  // Everything after the number in the results line, e.g. " market participants in dairy".
  const rest = [
    ` market participant${filtered.length === 1 ? "" : "s"}`,
    filters.category ? ` in ${CATEGORY_LABELS[filters.category].toLowerCase()}` : "",
    filters.organic ? " that are certified organic" : "",
    filters.crop ? ` with ${filters.crop.name.toLowerCase()} this month` : "",
    filters.q ? ` matching \u201c${filters.q}\u201d` : "",
  ].join("");
  return (
    <>
      <div className="wrap">
        <header className="head">
          <h1 tabIndex={-1}>Market Participant Directory</h1>
          <p>
            Meet the farmers, food producers, and local artisans who make AIM&rsquo;s Certified Farmers Markets so unique.
            From fresh-picked seasonal produce to locally crafted foods and specialty goods, our markets connect you with
            the people behind the products and the ones growing your food.
          </p>
          <p>
            Explore the market directory to discover vendors by market, market day, vendor type, or product. Vendor
            offerings and attendance vary by location and season, so there&rsquo;s always something new to discover.
          </p>
        </header>
      </div>

      {toolbar}
      {beforeResults}

      <div className="wrap" id="aimdir-results" tabIndex={-1}>
        {/* Always in the page, so screen readers announce each new count as filters change. */}
        <p className="sr-only" role="status" aria-atomic="true">{filtering ? `${filtered.length}${rest}` : ""}</p>
        {filters.view === "map" ? (
          <div className="mapbox">{renderMap(filtering ? filtered : vendors)}</div>
        ) : filtering ? (
          <>
            <div className="count">
              <span id="aimdir-count" tabIndex={-1}><b>{filtered.length}</b>{rest}</span>
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
                      {/* The logo is decorative here: the name is the heading. The
                          button in the heading covers the card, except the address link. */}
                      <div className="logo" style={{ background: m.background }}>
                        <img src={m.logo} alt="" />
                      </div>
                      <div className="txt">
                        <h3><button type="button" className="open" onClick={() => onOpenMarket(m.id)}>{m.name}</button></h3>
                        <div className="when">{m.day}, {m.hours}</div>
                      </div>
                      <a className="addr" href={directionsUrl(m)} target="_blank" rel="noopener noreferrer">{m.address}, {m.city}<NewTab /></a>
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
