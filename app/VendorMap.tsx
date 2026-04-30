"use client";

import { useEffect, useRef, useState } from "react";
import { Vendor } from "@/lib/types";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

// Market lat/lng — fixed locations
const MARKET_COORDS: Record<number, [number, number]> = {
  7776: [37.9948, -122.5185], // Sunday Marin (Civic Center)
  7781: [37.5297, -122.0402], // Newark
  7782: [37.7822, -122.4644], // Clement St.
  7783: [37.7286, -122.4757], // Stonestown
  7784: [37.6688, -122.0808], // Hayward
  7785: [37.8098, -122.2174], // Grand Lake
  7786: [37.9948, -122.5185], // Thursday Marin
  7803: [38.0721, -122.8005], // Point Reyes
  8211: [37.9735, -122.5311], // San Rafael Summer
};

// Module-level cache so geocoding survives re-renders
const geoCache = new Map<string, [number, number] | null>();

async function geocodeCity(city: string, state: string): Promise<[number, number] | null> {
  const key = `${city.trim()},${state.trim()}`;
  if (geoCache.has(key)) return geoCache.get(key)!;
  try {
    const q = encodeURIComponent(`${city.trim()}, ${state.trim()}, United States`);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?types=place,locality&country=us&limit=1&access_token=${TOKEN}`;
    const res = await fetch(url);
    if (!res.ok) { geoCache.set(key, null); return null; }
    const data = await res.json();
    if (!data.features?.length) { geoCache.set(key, null); return null; }
    const [lng, lat] = data.features[0].center;
    const result: [number, number] = [lat, lng];
    geoCache.set(key, result);
    return result;
  } catch {
    geoCache.set(key, null);
    return null;
  }
}

interface Props {
  vendors: Vendor[];
  selectedMarket: number | null;
  allMarkets: Record<number, string>;
  marketColor?: string;
}

export default function VendorMap({ vendors, selectedMarket, allMarkets, marketColor = "#0d8240" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [status, setStatus] = useState<"loading" | "geocoding" | "ready">("loading");
  const [geocoded, setGeocoded] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    const run = async () => {
      // Dynamically import to avoid SSR issues
      const mapboxgl = (await import("mapbox-gl")).default;
      await import("mapbox-gl/dist/mapbox-gl.css");
      if (cancelled) return;

      mapboxgl.accessToken = TOKEN;

      // Determine map center/zoom
      const marketCoords = selectedMarket ? MARKET_COORDS[selectedMarket] : null;
      const center: [number, number] = marketCoords
        ? [marketCoords[1], marketCoords[0]]
        : [-121.5, 37.7];
      const zoom = selectedMarket ? 7 : 6;

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center,
        zoom,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.AttributionControl({ compact: true }));
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
      mapRef.current = map;

      map.on("load", async () => {
        if (cancelled) return;
        setStatus("geocoding");

        // Add market pin
        if (marketCoords) {
          const el = document.createElement("div");
          el.style.cssText = `
            width:18px;height:18px;border-radius:50%;
            background:${marketColor};border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.4);
          `;
          new mapboxgl.Marker({ element: el })
            .setLngLat([marketCoords[1], marketCoords[0]])
            .setPopup(new mapboxgl.Popup({ offset: 12, closeButton: false })
              .setHTML(`<div style="font-family:sans-serif;font-size:12px;font-weight:700;color:#111">${allMarkets[selectedMarket!]}</div><div style="font-size:11px;color:#666">Market location</div>`))
            .addTo(map);
        }

        // Group vendors by city+state
        const cityGroups = new Map<string, { city: string; state: string; vendors: Vendor[] }>();
        for (const v of vendors) {
          const city = v.city?.trim();
          const state = v.state?.trim();
          if (!city) continue;
          const key = `${city}|${state}`;
          if (!cityGroups.has(key)) cityGroups.set(key, { city, state, vendors: [] });
          cityGroups.get(key)!.vendors.push(v);
        }

        const entries = [...cityGroups.values()];
        setTotal(entries.length);

        // Geocode in small batches to stay responsive
        const BATCH = 8;
        for (let i = 0; i < entries.length; i += BATCH) {
          if (cancelled) return;
          const batch = entries.slice(i, i + BATCH);
          await Promise.all(batch.map(async ({ city, state, vendors: cityVendors }) => {
            const coords = await geocodeCity(city, state);
            if (!coords || cancelled) return;
            const [lat, lng] = coords;
            const count = cityVendors.length;

            // Size dot by vendor count
            const size = Math.round(Math.max(10, Math.min(28, 8 + count * 3)));

            const el = document.createElement("div");
            el.style.cssText = `
              width:${size}px;height:${size}px;border-radius:50%;
              background:rgba(13,130,64,0.75);border:2px solid #fff;
              box-shadow:0 1px 4px rgba(0,0,0,0.25);
              cursor:pointer;display:flex;align-items:center;justify-content:center;
              font-size:9px;font-weight:700;color:#fff;font-family:sans-serif;
            `;
            if (count > 1) el.textContent = String(count);

            const popupHtml = `
              <div style="font-family:sans-serif;max-width:180px">
                <div style="font-weight:700;font-size:12px;color:#111;margin-bottom:4px">${city}</div>
                <div style="font-size:11px;color:#555;margin-bottom:6px">${count} vendor${count > 1 ? "s" : ""}</div>
                <div style="font-size:11px;color:#333;line-height:1.5">${cityVendors.map(v => `<span style="display:block">${v.company}</span>`).join("")}</div>
              </div>
            `;

            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat([lng, lat])
              .setPopup(new mapboxgl.Popup({ offset: size / 2 + 4, closeButton: false, maxWidth: "200px" })
                .setHTML(popupHtml))
              .addTo(map);

            markersRef.current.push(marker);
          }));
          setGeocoded(Math.min(i + BATCH, entries.length));
        }

        if (!cancelled) setStatus("ready");
      });
    };

    run();

    return () => {
      cancelled = true;
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [vendors, selectedMarket]);

  return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", height: 480, background: "#e8e6da" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Loading overlay */}
      {status !== "ready" && (
        <div style={{
          position: "absolute", inset: 0, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "rgba(246,245,234,0.85)", backdropFilter: "blur(2px)",
          gap: 8,
        }}>
          <div style={{ fontSize: 13, color: "#555", fontFamily: "var(--font-body)" }}>
            {status === "loading" ? "Loading map…" : `Locating vendors… ${geocoded} / ${total}`}
          </div>
          {status === "geocoding" && total > 0 && (
            <div style={{ width: 160, height: 3, background: "#ddd", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                width: `${Math.round(geocoded / total * 100)}%`,
                height: "100%", background: "#0d8240",
                transition: "width 0.3s ease",
              }} />
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      {status === "ready" && (
        <div style={{
          position: "absolute", bottom: 24, left: 12,
          background: "rgba(255,255,255,0.92)", borderRadius: 6,
          padding: "8px 12px", boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
          fontFamily: "var(--font-body)", fontSize: 11, color: "#555",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          {selectedMarket && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: marketColor, border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              <span>Market location</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(13,130,64,0.75)", border: "2px solid #fff" }} />
            <span>Vendor home city · size = # of vendors</span>
          </div>
        </div>
      )}
    </div>
  );
}
