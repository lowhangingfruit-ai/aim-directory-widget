"use client";

import { useState } from "react";
import { MARKETS_BY_DAY, WEEKDAYS, fullName } from "@/lib/markets";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const PIN = "0b6b3a"; // AIM green, a shade darker so the white numbers read

// A still map of every market, numbered in the order the list reads, so it
// loads fast beside the list. Clicking it opens the full map (DirectoryApp).
function staticMapUrl(width: number, height: number): string {
  const pins = MARKETS_BY_DAY.map((m, i) => `pin-l-${i + 1}+${PIN}(${m.lng},${m.lat})`).join(",");
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${pins}/auto/${width}x${height}@2x?padding=36&attribution=false&logo=false&access_token=${TOKEN}`;
}

export function MasterMapCard({ onOpen }: { onOpen: () => void }) {
  const [failed, setFailed] = useState(!TOKEN);
  return (
    <aside className="master-map" aria-labelledby="aimdir-map-title">
      <h2 id="aimdir-map-title">Market map</h2>
      <button type="button" className="map-open" onClick={onOpen} aria-label="Enlarge the market map">
        {failed ? (
          <span className="map-fallback" aria-hidden="true">Map</span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- a Mapbox static image, not a local asset
          <img src={staticMapUrl(320, 420)} alt="" width={320} height={420} loading="lazy" onError={() => setFailed(true)} />
        )}
        <span className="enlarge"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>Enlarge map</span>
      </button>
      <ol className="map-key">
        {MARKETS_BY_DAY.map((m) => (
          <li key={m.id}><span>{fullName(m)}</span> <small>{WEEKDAYS[m.weekday].slice(0, 3)}</small></li>
        ))}
      </ol>
    </aside>
  );
}

export function MasterMapDialog({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="map-dialog" role="dialog" aria-modal="true" aria-labelledby="aimdir-bigmap-title">
      <div className="map-dialog-head">
        <h2 id="aimdir-bigmap-title">Every market, and where its participants are based</h2>
        <button type="button" className="x" onClick={onClose} aria-label="Close" autoFocus>&times;</button>
      </div>
      <div className="mapbox">{children}</div>
    </div>
  );
}
