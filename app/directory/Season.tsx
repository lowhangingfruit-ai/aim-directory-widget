"use client";

import { seasonGroups, seasonPicks } from "@/lib/season";
import { Art } from "./art";

const AIM_CALENDAR = "https://www.agriculturalinstitute.org/crop-calendar";

function monthName(month: number): string {
  return new Date(2026, month, 1).toLocaleDateString("en-US", { month: "long" });
}

// One line above the results. A crop searches for it; the button opens the full guide.
export function SeasonStrip({ month, onPick, onOpen }: { month: number; onPick: (term: string) => void; onOpen: () => void }) {
  return (
    <div className="season-strip">
      <span className="season-art"><Art name="season" /></span>
      <b>In season in {monthName(month)}</b>
      <div className="crops">
        {seasonPicks(month).map((c) => (
          <button key={c.name} type="button" className="crop" onClick={() => onPick(c.term)}>{c.name}</button>
        ))}
      </div>
      <button type="button" className="see" onClick={onOpen}>See what&rsquo;s in season</button>
    </div>
  );
}

export function SeasonGuide({ month, onPick, onClose }: { month: number; onPick: (term: string) => void; onClose: () => void }) {
  return (
    <div className="season-box" role="dialog" aria-modal="true" aria-label="What's in season">
      <button type="button" className="x" onClick={onClose} aria-label="Close" autoFocus>&times;</button>
      <section className="season">
        <div>
          <h2>In season in {monthName(month)}</h2>
          <p className="lede">Tap a crop to find participants who grow it.</p>
          <span className="season-art"><Art name="season" /></span>
        </div>
        <div className="groups">
          {seasonGroups(month).map((g) => (
            <div key={g.title}>
              <small>{g.title}</small>
              <div className="crops">
                {g.crops.map((c) => (
                  <button key={c.name} type="button" className="crop" onClick={() => onPick(c.term)}>
                    <span className="bars" aria-hidden="true">
                      {Array.from({ length: 12 }, (_, k) => (
                        <i key={k} className={k === month ? "now" : c.months.includes(k) ? "on" : ""} />
                      ))}
                    </span>
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="foot">
          <span>From AIM&rsquo;s Northern California harvest calendar. Dates vary with the weather.</span>
          <a href={AIM_CALENDAR} target="_blank" rel="noopener noreferrer">See the full calendar</a>
        </div>
      </section>
    </div>
  );
}
