"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Vendor } from "@/lib/types";
import { MARKET_BY_ID, MARKET_LIST, Market, milesBetween, textOn } from "@/lib/markets";
import { displayName } from "./directory/vendorUtils";

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const DEFAULT_VIEW = { center: [-121.5, 37.7] as [number, number], zoom: 6 };

// Vendor dots and foodshed lines when no category is picked: AIM green.
const DOT = "rgba(13,130,64,.75)";
const LINE = "#0d8240";

// Base map colors, all taken from the directory page: land is the page's cream,
// parks and buildings its line color, water the San Rafael Summer logo's
// background (the Seafood pill), labels its muted text.
const CREAM = "#f6f5ea";
const LINE_TONE = "#e6e4d6";
const WATER = "#c2e8ef";
const BORDER = "#c8c6b8";
const LABEL = "#6b6a60";

function paintBaseMap(map: mapboxgl.Map) {
  const set = (id: string, prop: string, value: string) => {
    if (map.getLayer(id)) map.setPaintProperty(id, prop as never, value as never);
  };
  for (const layer of map.getStyle()?.layers ?? []) {
    const id = layer.id;
    if (id === "land") set(id, "background-color", CREAM);
    else if (id === "land-structure-polygon") set(id, "fill-color", CREAM);
    else if (id === "land-structure-line") set(id, "line-color", CREAM);
    else if (id === "landuse" || id === "national-park" || id === "building") set(id, "fill-color", LINE_TONE);
    else if (id === "water") set(id, "fill-color", WATER);
    else if (id === "waterway") set(id, "line-color", WATER);
    else if (id.startsWith("admin-")) set(id, "line-color", id.endsWith("-bg") ? LINE_TONE : BORDER);
    else if (layer.type === "symbol") {
      set(id, "text-color", LABEL);
      set(id, "text-halo-color", CREAM);
    }
  }
}

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
  accent?: string | null; // the picked category's color; dots and lines take it
  onOpenVendor?: (vendorID: number) => void;
}

interface PlaceGroup {
  label: string;
  lat: number;
  lng: number;
  vendors: { id: number; name: string }[];
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
    g.vendors.push({ id: v.vendorID, name: displayName(v.company) });
    groups.set(key, g);
  }
  for (const g of groups.values()) g.vendors.sort((a, b) => a.name.localeCompare(b.name));
  return [...groups.values()];
}

// One dot per place, drawn as an HTML marker rather than on the canvas so a
// keyboard can reach it: Tab moves between dots, Enter or Space opens the
// list. The dot is radius 4 + 1.5 per vendor, 5 to 14px, inside a target at
// least 24px across so it's easier to tap. Its color comes from --dot.
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
  const names = group.vendors.slice(0, 8).map((v) => v.name).join(", ");
  const more = n > 8 ? `, and ${n - 8} more` : "";
  return `${group.label || "Vendors"}: ${n} vendor${n > 1 ? "s" : ""}. ${names}${more}`;
}

// Popup built from DOM nodes, so vendor names from MMM are never parsed as HTML.
// Each name is a button that opens that vendor's profile.
function popupContent(group: PlaceGroup, open: (id: number) => void): HTMLElement {
  const root = document.createElement("div");
  root.className = "dot-popup";
  const title = document.createElement("div");
  title.className = "dot-popup-title";
  title.textContent = group.label;
  const count = document.createElement("div");
  count.className = "dot-popup-count";
  count.textContent = `${group.vendors.length} vendor${group.vendors.length > 1 ? "s" : ""}`;
  const list = document.createElement("ul");
  list.className = "dot-popup-list";
  list.setAttribute("aria-label", `Vendors based in ${group.label || "this place"}`);
  for (const v of group.vendors) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = v.name;
    button.addEventListener("click", () => open(v.id));
    item.append(button);
    list.append(item);
  }
  root.append(title, count, list);
  return root;
}

// On the all-markets map, logos shrink as the map zooms out, then push apart wherever two
// would overlap, so all eight stay readable at the regional view. Each logo
// keeps its true position and moves only by a pixel offset.
function logoSize(zoom: number): number {
  return zoom < 7 ? 30 : zoom < 9 ? 36 : 44;
}

function layoutLogos(map: mapboxgl.Map, markers: mapboxgl.Marker[], at: [number, number][]) {
  // A market's own map has one logo, the point of the map: it stays full size.
  const size = markers.length === 1 ? 44 : logoSize(map.getZoom());
  const pts = at.map((p) => map.project(p));
  const off = pts.map(() => ({ x: 0, y: 0 }));
  const min = size + 6;
  for (let pass = 0; pass < 40; pass++) {
    let moved = false;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x + off[j].x - (pts[i].x + off[i].x);
        let dy = pts[j].y + off[j].y - (pts[i].y + off[i].y);
        let d = Math.hypot(dx, dy);
        if (d >= min) continue;
        if (d < 0.5) { const a = (j * 2 * Math.PI) / pts.length; dx = Math.cos(a); dy = Math.sin(a); d = 1; }
        const push = (min - d) / 2;
        off[i].x -= (dx / d) * push; off[i].y -= (dy / d) * push;
        off[j].x += (dx / d) * push; off[j].y += (dy / d) * push;
        moved = true;
      }
    }
    if (!moved) break;
  }
  markers.forEach((m, i) => {
    const el = m.getElement();
    el.style.width = el.style.height = `${size}px`;
    el.style.borderRadius = `${Math.round(size * 0.27)}px`;
    m.setOffset([off[i].x, off[i].y]);
  });
}

function median(values: number[]): number {
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

const idsOf = (list: Vendor[]) => list.map((v) => v.vendorID).join(",");

export default function VendorMap({ vendors: incoming, origins = {}, coords = {}, selectedMarket, accent = null, onOpenVendor }: Props) {
  // The page hands over a new array on every render (opening a profile is
  // one). Keep the old one while it lists the same vendors, so the dots, their
  // open pop-up and the view aren't rebuilt for nothing.
  const [vendors, setVendors] = useState(incoming);
  if (vendors !== incoming && idsOf(vendors) !== idsOf(incoming)) setVendors(incoming);

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const marketMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const marketAtRef = useRef<[number, number][]>([]);
  const dotMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const openRef = useRef(onOpenVendor);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState<Map<number, [number, number]>>(new Map());

  useEffect(() => { openRef.current = onOpenVendor; }, [onOpenVendor]);

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
      // The map sits in a long page: scrolling the page past it shouldn't zoom
      // it, and one finger on a phone should scroll the page. Zoom takes ⌘ or
      // Ctrl plus scroll, panning on a phone two fingers; Mapbox shows the hint.
      cooperativeGestures: true,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }));
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    // "style.load" fires once the style is ready, before every background tile
    // has arrived, so dots can appear sooner than with "load".
    map.once("style.load", () => {
      paintBaseMap(map);
      map.addSource("foodshed", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addLayer({
        id: "foodshed",
        type: "line",
        source: "foodshed",
        layout: { "line-cap": "round" },
        paint: {
          "line-color": LINE,
          "line-opacity": 0.45,
          "line-width": ["interpolate", ["linear"], ["get", "n"], 1, 1.2, 10, 3.5],
        },
      }, map.getLayer("road-label-simple") ? "road-label-simple" : undefined);
      setReady(true);
    });
    map.on("zoom", () => layoutLogos(map, marketMarkersRef.current, marketAtRef.current));

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

  const groups = useMemo(() => groupByPlace(vendors, origins, coords, fallback), [vendors, origins, coords, fallback]);
  const here = selectedMarket ? MARKET_BY_ID[selectedMarket] : undefined;

  // On a market's map: straight-line miles from each vendor's town to the market.
  const foodshed = useMemo(() => {
    if (!here) return null;
    const miles = groups.flatMap((g) => g.vendors.map(() => milesBetween([g.lat, g.lng], [here.lat, here.lng])));
    return miles.length ? { median: Math.round(median(miles)), count: miles.length } : null;
  }, [groups, here]);

  // Redraw dots when the filtered vendor list changes.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    dotMarkersRef.current.forEach((m) => m.remove());
    dotMarkersRef.current = groups.map((g) => {
      const el = placeDot(g);
      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: "240px" })
        .setDOMContent(popupContent(g, (id) => openRef.current?.(id)));
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([g.lng, g.lat])
        .setPopup(popup)
        .addTo(map);
      el.setAttribute("aria-label", dotLabel(g)); // after Mapbox sets its own "Map marker"
      return marker;
    });
  }, [ready, groups]);

  // Foodshed lines: one from each place to the market, on a market's map only.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    const source = map.getSource("foodshed") as mapboxgl.GeoJSONSource | undefined;
    source?.setData({
      type: "FeatureCollection",
      features: here
        ? groups.map((g) => ({
            type: "Feature" as const,
            properties: { n: g.vendors.length },
            geometry: { type: "LineString" as const, coordinates: [[g.lng, g.lat], [here.lng, here.lat]] },
          }))
        : [],
    });
    map.setPaintProperty("foodshed", "line-color", accent ?? LINE);
  }, [ready, groups, here, accent]);

  // Market logos as pins: every market on the all-markets map, one on a
  // market's own map. The view fits the pins and that day's vendors.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    marketMarkersRef.current.forEach((m) => m.remove());
    const seen = new Set<string>();
    const shown: Market[] = here
      ? [here]
      : MARKET_LIST.filter((m) => !seen.has(m.logo) && seen.add(m.logo));
    marketAtRef.current = shown.map((m) => [m.lng, m.lat]);
    marketMarkersRef.current = shown.map((m) => {
      // The two Marin markets share a logo and a site, so the all-markets map shows one pin for both.
      const name = !here && m.name.includes("Marin") ? "Thursday and Sunday Marin" : m.name;
      const el = document.createElement("img");
      el.src = m.logo;
      // Mapbox makes each pin a button named "Map marker"; name it after the market.
      el.alt = `${name} Farmers Market`;
      // z-index: market logos sit above the vendor dots.
      el.style.cssText = "z-index:2;width:44px;height:44px;border-radius:12px;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.35);object-fit:cover;box-sizing:border-box;";
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
    layoutLogos(map, marketMarkersRef.current, marketAtRef.current);

    // A market's map fits that market and the vendors within 200 miles; the
    // few from out of state are still drawn, just not zoomed out for.
    if (!here) { map.easeTo(DEFAULT_VIEW); return; }
    const bounds = new mapboxgl.LngLatBounds([here.lng, here.lat], [here.lng, here.lat]);
    groups
      .filter((g) => milesBetween([here.lat, here.lng], [g.lat, g.lng]) <= 200)
      .forEach((g) => bounds.extend([g.lng, g.lat]));
    map.fitBounds(bounds, { padding: 60, maxZoom: 9, duration: 600 });
  }, [ready, here, groups]);

  const legendLogos = here ? [here.logo] : [...new Set(MARKET_LIST.map((m) => m.logo))].slice(0, 3);
  const style = {
    position: "relative", overflow: "hidden", height: "min(620px, 75vh)", background: CREAM,
    "--dot": accent ?? DOT,
    "--dot-text": accent ? textOn(accent) : "#fff",
  } as React.CSSProperties;

  return (
    <div style={style}>
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

      {ready && foodshed && (
        <div className="map-card map-summary">
          <b>{foodshed.median} miles</b>
          <span>
            Median distance from vendor to market, in a straight line from each vendor&rsquo;s town.{" "}
            {foodshed.count} vendor{foodshed.count === 1 ? "" : "s"} on this map.
          </span>
        </div>
      )}

      {ready && (
        <div className="map-card map-legend">
          <div>
            <span className="legend-logos">
              {legendLogos.map((src) => <img key={src} src={src} alt="" />)}
            </span>
            <span>{here ? "Market location" : "AIM markets"}</span>
          </div>
          <div>
            <span className="legend-dot" />
            <span>Where vendors are based · size = # of vendors</span>
          </div>
        </div>
      )}
    </div>
  );
}
