"use client";

import { Crop, seasonGroups, seasonPicks } from "@/lib/season";
import { Art } from "./art";
import { NewTab } from "./a11y";

const AIM_CALENDAR = "https://www.agriculturalinstitute.org/crop-calendar";

function monthName(month: number): string {
  return new Date(2026, month, 1).toLocaleDateString("en-US", { month: "long" });
}

// One line above the results. A crop searches for it; the button opens the full guide.
export function SeasonStrip({ month, onPick, onOpen }: { month: number; onPick: (crop: Crop) => void; onOpen: () => void }) {
  return (
    <div className="season-strip">
      <span className="season-art"><Art name="season" /></span>
      <b>In season in {monthName(month)}</b>
      <div className="crops">
        {seasonPicks(month).map((c) => (
          <button key={c.name} type="button" className="crop" onClick={() => onPick(c)}>{c.name}</button>
        ))}
      </div>
      <button type="button" className="see" onClick={onOpen}>See what&rsquo;s in season</button>
    </div>
  );
}

// A plain list of what's in season this month, A to Z. (AIM asked for a
// simple list in place of the month-by-month bars and the groups.)
export function SeasonGuide({ month, onPick, onClose }: { month: number; onPick: (crop: Crop) => void; onClose: () => void }) {
  const crops = seasonGroups(month).flatMap((g) => g.crops).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="season-box" role="dialog" aria-modal="true" aria-label="What's in season">
      <button type="button" className="x" onClick={onClose} aria-label="Close" autoFocus>&times;</button>
      <section className="season">
        <div>
          <h2>In season in {monthName(month)}</h2>
          <p className="lede">Tap a crop to find the farms bringing it this month.</p>
          <span className="season-art"><Art name="season" /></span>
        </div>
        <ul className="crop-list">
          {crops.map((c) => (
            <li key={c.name}>
              <button type="button" className="crop" onClick={() => onPick(c)}>{c.name}</button>
            </li>
          ))}
        </ul>
        <div className="foot">
          <span>From AIM&rsquo;s Northern California harvest calendar. Dates vary with the weather.</span>
          <a href={AIM_CALENDAR} target="_blank" rel="noopener noreferrer">See the full calendar<NewTab /></a>
        </div>
      </section>
    </div>
  );
}
