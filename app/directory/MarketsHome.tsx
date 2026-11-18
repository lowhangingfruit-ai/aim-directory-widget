"use client";

import type { Vendor } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/categories";
import { MARKETS_BY_DAY, MARKET_DAYS, WEEKDAYS, directionsUrl, fullName } from "@/lib/markets";
import type { Filters } from "./Toolbar";
import { shortDate, vendorDates } from "./vendorUtils";
import { NewTab } from "./a11y";

interface Props {
  vendors: Vendor[];
  today: string;
  toolbar: React.ReactNode;
  beforeResults: React.ReactNode;
  aside: React.ReactNode; // the market map, to the right of the list
  filtering: boolean;
  filtered: Vendor[];
  filters: Filters;
  onClear: () => void;
  onOpenMarket: (id: number) => void;
  renderGrid: (list: Vendor[]) => React.ReactNode;
  renderMap: (list: Vendor[]) => React.ReactNode;
}

// The section title for one day's markets: "Saturday markets".
const dayTitle = (d: number) => `${WEEKDAYS[d]} market${MARKETS_BY_DAY.filter((m) => m.weekday === d).length === 1 ? "" : "s"}`;

export default function MarketsHome({ vendors, today, toolbar, beforeResults, aside, filtering, filtered, filters, onClear, onOpenMarket, renderGrid, renderMap }: Props) {
  // Everything after the number in the results line, e.g. " market participants in dairy farms".
  const rest = [
    ` market participant${filtered.length === 1 ? "" : "s"}`,
    filters.day !== null ? ` at ${WEEKDAYS[filters.day]} markets` : "",
    filters.category ? ` in ${CATEGORY_LABELS[filters.category]}` : "",
    filters.organic ? " that are certified organic" : "",
    filters.crop ? ` with ${filters.crop.name.toLowerCase()} this month` : "",
    filters.q ? ` matching \u201c${filters.q}\u201d` : "",
  ].join("");
  // A market day on its own lists that day's markets; with anything else it
  // narrows the participants to those at a market that day.
  const days = filters.day === null ? MARKET_DAYS : [filters.day];

  return (
    <>
      <div className="wrap">
        <header className="head">
          <h1 tabIndex={-1}>Market Participant Directory</h1>
        </header>
      </div>

      {toolbar}

      <div className="wrap home-cols">
        <div className="home-main">
          <div className="intro">
            <p>
              Meet the farmers, food producers, and local artisans who make AIM&rsquo;s Certified Farmers Markets so unique.
              From fresh-picked seasonal produce to locally crafted foods and specialty goods, our markets connect you with
              the people behind the products and the ones growing your food.
            </p>
            <p>
              Search every market by market day, or by keyword or product. Vendor offerings and attendance vary by
              location and season, so there&rsquo;s always something new to discover.
            </p>
          </div>
          {beforeResults}

          <div id="aimdir-results" tabIndex={-1}>
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
              days.map((d) => (
                <section key={d} className="region">
                  <h2>{dayTitle(d)}</h2>
                  <div className="mgrid">
                    {MARKETS_BY_DAY.filter((m) => m.weekday === d).map((m) => {
                      const next = vendors.flatMap((v) => vendorDates(v, m.id)).filter((x) => x >= today).sort()[0];
                      return (
                        <article key={m.id} className={`mcard${m.seasonal && !next ? " off" : ""}`} style={{ "--mtone": m.background } as React.CSSProperties}>
                          {/* The button in the heading covers the card, except the address link. */}
                          <div className="txt">
                            <h3><button type="button" className="open" onClick={() => onOpenMarket(m.id)}>{fullName(m)}</button></h3>
                            <div className="when">{m.day}, {m.hours}</div>
                          </div>
                          <a className="addr" href={directionsUrl(m)} target="_blank" rel="noopener noreferrer">{m.address}, {m.city}<NewTab /></a>
                          <div className="next">
                            {next
                              ? <b>{next === today ? "Open today" : `Next: ${shortDate(next)}`}</b>
                              : <span className="tbd">{m.seasonal ? "Back next season" : "Dates to be announced"}</span>}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
        {filters.view !== "map" && aside}
      </div>
    </>
  );
}
