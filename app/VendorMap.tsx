"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Vendor } from "@/lib/types";
import { MARKET_BY_ID, MARKET_LIST, Market, milesBetween } from "@/lib/markets";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const DEFAULT_VIEW = { center: [-121.5, 37.7] as [number, number], zoom: 6 };

// Most cities arrive with coordinates from the server (Census place table).
// The few it can't match are looked up here, once per browser session.
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
  origins?: Record<number, string>; // intake answer, used instead of the MMM city
  coords?: Record<number, [number, number]>; // from the server, keyed by vendor ID
  selectedMarket: number | null; // null shows every market
}

interface PlaceGroup {
  label: string;
  lat: number;
  lng: number;
  vendors: string[];
}

// One dot per place, sized by how many vendors are based there.
function groupByPlace(
  vendors: Vendor[],
  origins: Record<number, string>,
  coords: Record<number, [number, number]>,
  fallback: Map<number, [number, number]>
): PlaceGroup[] {
  const groups = new Map<string, PlaceGroup>();
  for (const v of vendors) {
    const at = coords[v.vendorID] ?? fallback.get(v.vendorID);
    if (!at) continue;
    const key = `${at[0].toFixed(3)},${at[1].toFixed(3)}`;
    const label = (origins[v.vendorID] ?? v.city ?? "").trim();
    const g = groups.get(key) ?? { label, lat: at[0], lng: at[1], vendors: [] };
    g.vendors.push(v.company);
    groups.set(key, g);
  }
  return [...groups.values()];
}

// One dot per place, drawn as an HTML marker rather than on the canvas so a
// keyboard can reach it: Tab moves between dots, Enter or Space opens the
// list. The dot looks as the canvas dots did (radius 4 + 1.5 per vendor, 5 to
// 14px), inside a target at least 24px across so it's easier to tap.
function placeDot(group: PlaceGroup): HTMLElement {
  const n = group.vendors.length;
  const size = 2 * Math.min(14, Math.max(5, 4 + 1.5 * n)) + 4; // plus the white ring
  const el = document.createElement("div");
  el.className = "vendor-dot";
  el.style.width = el.style.height = `${Math.max(24, size)}px`;
  const dot = document.createElement("span");
  dot.style.width = dot.style.height = `${size}px`;
  if (n > 1) dot.textContent = String(n);
  el.append(dot);
  return el;
}

// What a screen reader hears on a dot: the place, the count and the names.
function dotLabel(group: PlaceGroup): string {
  const n = group.vendors.length;
  const names = group.vendors.slice(0, 8).join(", ");
  const more = n > 8 ? `, and ${n - 8} more` : "";
  return `${group.label || "Vendors"}: ${n} vendor${n > 1 ? "s" : ""}. ${names}${more}`;
}

// Popup built from DOM nodes, so vendor names from MMM are never parsed as HTML.
function popupContent(group: PlaceGroup): HTMLElement {
  const root = document.createElement("div");
  root.style.cssText = "font-family:sans-serif;max-width:200px";
  const title = document.createElement("div");
  title.style.cssText = "font-weight:700;font-size:12px;color:#111;margin-bottom:4px";
  title.textContent = group.label;
  const count = document.createElement("div");
  count.style.cssText = "font-size:11px;color:#555;margin-bottom:6px";
  count.textContent = `${group.vendors.length} vendor${group.vendors.length > 1 ? "s" : ""}`;
  const list = document.createElement("div");
  list.style.cssText = "font-size:11px;color:#333;line-height:1.5;max-height:180px;overflow-y:auto";
  // A long list scrolls, so it takes focus (Mapbox focuses it when the popup
  // opens) and the arrow keys can scroll it.
  if (group.vendors.length > 10) {
    list.tabIndex = 0;
    list.setAttribute("role", "region");
    list.setAttribute("aria-label", `Vendors based in ${group.label || "this place"}`);
  }
  for (const name of group.vendors) {
    const row = document.createElement("span");
    row.style.display = "block";
    row.textContent = name;
    list.appendChild(row);
  }
  root.append(title, count, list);
  return root;
}

export default function VendorMap({ vendors, origins = {}, coords = {}, selectedMarket }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const marketMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const dotMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const groupsRef = useRef<PlaceGroup[]>([]);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState<Map<number, [number, number]>>(new Map());

  // Create the map once. Filters update its data instead of rebuilding it.
  useEffect(() => {
    if (!containerRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: DEFAULT_VIEW.center,
      zoom: DEFAULT_VIEW.zoom,
      attributionControl: false,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    // "style.load" fires once the style is ready, before every background tile
    // has arrived, so dots can appear sooner than with "load".
    map.once("style.load", () => {
      setReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Look up only the cities the server couldn't place.
  useEffect(() => {
    let cancelled = false;
    const missing = vendors.filter((v) => !coords[v.vendorID] && !fallback.has(v.vendorID) && (origins[v.vendorID] ?? v.city)?.trim());
    if (!missing.length) return;
    (async () => {
      const found = new Map(fallback);
      for (const v of missing) {
        const hit = await geocodeCity((origins[v.vendorID] ?? v.city).trim(), v.state?.trim() ?? "");
        if (cancelled) return;
        if (hit) found.set(v.vendorID, hit);
      }
      if (found.size !== fallback.size) setFallback(found);
    })();
    return () => { cancelled = true; };
  }, [vendors, coords, origins, fallback]);

  // Redraw dots when the filtered vendor list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const groups = groupByPlace(vendors, origins, coords, fallback);
    groupsRef.current = groups;
    dotMarkersRef.current.forEach((m) => m.remove());
    dotMarkersRef.current = groups.map((g) => {
      const el = placeDot(g);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([g.lng, g.lat])
        .setPopup(new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: "220px" }).setDOMContent(popupContent(g)))
        .addTo(map);
      el.setAttribute("aria-label", dotLabel(g)); // after Mapbox sets its own "Map marker"
      return marker;
    });
  }, [ready, vendors, origins, coords, fallback]);

  // Market logos as pins: every market on the all-markets map, one on a
  // market's own map. The view fits the pins and that day's vendors.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    marketMarkersRef.current.forEach((m) => m.remove());
    const seen = new Set<string>();
    const shown: Market[] = selectedMarket
      ? [MARKET_BY_ID[selectedMarket]].filter(Boolean)
      : MARKET_LIST.filter((m) => !seen.has(m.logo) && seen.add(m.logo));
    marketMarkersRef.current = shown.map((m) => {
      // The two Marin markets share a logo and a site, so the all-markets map shows one pin for both.
      const name = !selectedMarket && m.name.includes("Marin") ? "Thursday and Sunday Marin" : m.name;
      const el = document.createElement("img");
      el.src = m.logo;
      // Mapbox makes each pin a button named "Map marker"; name it after the market.
      el.alt = `${name} Farmers Market`;
      el.style.zIndex = "2"; // market logos sit above the vendor dots
      el.style.cssText = "width:44px;height:44px;border-radius:12px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);object-fit:cover;";
      const label = document.createElement("div");
      label.style.cssText = "font-family:sans-serif;font-size:12px;font-weight:700;color:#111";
      label.textContent = name;
      const sub = document.createElement("div");
      sub.style.cssText = "font-size:11px;color:#666";
      sub.textContent = `${m.address}, ${m.city}`;
      const content = document.createElement("div");
      content.append(label, sub);
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .setPopup(new mapboxgl.Popup({ offset: 24, closeButton: false }).setDOMContent(content))
        .addTo(map);
      el.setAttribute("aria-label", `${name} Farmers Market, ${m.address}, ${m.city}`);
      return marker;
    });

    // A market's map fits that market and the vendors within 200 miles; the
    // few from out of state are still drawn, just not zoomed out for.
    const here = selectedMarket ? MARKET_BY_ID[selectedMarket] : undefined;
    if (!here) { map.easeTo(DEFAULT_VIEW); return; }
    const bounds = new mapboxgl.LngLatBounds([here.lng, here.lat], [here.lng, here.lat]);
    groupsRef.current
      .filter((g) => milesBetween([here.lat, here.lng], [g.lat, g.lng]) <= 200)
      .forEach((g) => bounds.extend([g.lng, g.lat]));
    map.fitBounds(bounds, { padding: 60, maxZoom: 9, duration: 600 });
  }, [ready, selectedMarket, vendors, fallback]);

  return (
    <div style={{ position: "relative", overflow: "hidden", height: "min(620px, 75vh)", background: "#e8e6da" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Loading overlay */}
      {!ready && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          background: "rgba(246,245,234,0.85)",
        }}>
          <div style={{ fontSize: 13, color: "#555", fontFamily: "var(--font-body)" }}>Loading map…</div>
        </div>
      )}

      {/* Legend */}
      {ready && (
        <div style={{
          position: "absolute", bottom: 24, left: 12,
          background: "rgba(255,255,255,0.92)", borderRadius: 6,
          padding: "8px 12px", boxShadow: "0 1px 6px rgba(0,0,0,0.12)",
          fontFamily: "var(--font-body)", fontSize: 11, color: "#555",
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: "#ffec68", border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
            <span>{selectedMarket ? "Market location" : "AIM markets"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(13,130,64,0.75)", border: "2px solid #fff" }} />
            <span>Where vendors are based · size = # of vendors</span>
          </div>
        </div>
      )}
    </div>
  );
}
