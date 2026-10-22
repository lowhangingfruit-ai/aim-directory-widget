"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
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
  selectedMarket: number | null;
  allMarkets: Record<number, string>;
  marketColor?: string;
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

function toGeoJSON(groups: PlaceGroup[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: groups.map((g, i) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [g.lng, g.lat] },
      properties: { index: i, count: g.vendors.length },
    })),
  };
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
  for (const name of group.vendors) {
    const row = document.createElement("span");
    row.style.display = "block";
    row.textContent = name;
    list.appendChild(row);
  }
  root.append(title, count, list);
  return root;
}

export default function VendorMap({ vendors, origins = {}, coords = {}, selectedMarket, allMarkets, marketColor = "#0d8240" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const marketMarkerRef = useRef<mapboxgl.Marker | null>(null);
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
      map.addSource("vendors", { type: "geojson", data: toGeoJSON([]) });
      map.addLayer({
        id: "vendor-dots",
        type: "circle",
        source: "vendors",
        paint: {
          "circle-radius": ["min", 14, ["max", 5, ["+", 4, ["*", 1.5, ["get", "count"]]]]],
          "circle-color": "rgba(13,130,64,0.75)",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
        },
      });
      map.addLayer({
        id: "vendor-counts",
        type: "symbol",
        source: "vendors",
        filter: [">", ["get", "count"], 1],
        layout: {
          "text-field": ["to-string", ["get", "count"]],
          "text-size": 10,
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-allow-overlap": true,
        },
        paint: { "text-color": "#fff" },
      });

      map.on("click", "vendor-dots", (e) => {
        const feature = e.features?.[0];
        const group = feature ? groupsRef.current[Number(feature.properties?.index)] : undefined;
        if (!feature || !group) return;
        const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates;
        new mapboxgl.Popup({ offset: 12, closeButton: false, maxWidth: "220px" })
          .setLngLat([lng, lat])
          .setDOMContent(popupContent(group))
          .addTo(map);
      });
      map.on("mouseenter", "vendor-dots", () => { map.getCanvas().style.cursor = "pointer"; });
      map.on("mouseleave", "vendor-dots", () => { map.getCanvas().style.cursor = ""; });

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
    (map.getSource("vendors") as mapboxgl.GeoJSONSource | undefined)?.setData(toGeoJSON(groups));
  }, [ready, vendors, origins, coords, fallback]);

  // Move to the selected market and mark it.
  useEffect(() => {
    const map = mapRef.current;
    if (!ready || !map) return;
    marketMarkerRef.current?.remove();
    marketMarkerRef.current = null;
    const at = selectedMarket ? MARKET_COORDS[selectedMarket] : null;
    if (at && selectedMarket) {
      const el = document.createElement("div");
      el.style.cssText = `width:18px;height:18px;border-radius:50%;background:${marketColor};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);`;
      const label = document.createElement("div");
      label.style.cssText = "font-family:sans-serif;font-size:12px;font-weight:700;color:#111";
      label.textContent = allMarkets[selectedMarket] ?? "";
      const sub = document.createElement("div");
      sub.style.cssText = "font-size:11px;color:#666";
      sub.textContent = "Market location";
      const content = document.createElement("div");
      content.append(label, sub);
      marketMarkerRef.current = new mapboxgl.Marker({ element: el })
        .setLngLat([at[1], at[0]])
        .setPopup(new mapboxgl.Popup({ offset: 12, closeButton: false }).setDOMContent(content))
        .addTo(map);
      map.easeTo({ center: [at[1], at[0]], zoom: 7 });
    } else {
      map.easeTo(DEFAULT_VIEW);
    }
  }, [ready, selectedMarket, marketColor, allMarkets]);

  return (
    <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", height: 480, background: "#e8e6da" }}>
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
          {selectedMarket && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: marketColor, border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
              <span>Market location</span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(13,130,64,0.75)", border: "2px solid #fff" }} />
            <span>Where vendors are based · size = # of vendors</span>
          </div>
        </div>
      )}
    </div>
  );
}
