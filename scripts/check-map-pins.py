#!/usr/bin/env python3
"""Flag map pins that land in the water or far from where they should be.

The directory map places each vendor at its city's point in
lib/placeCoords.json (Census Gazetteer "internal points"). An internal point
is inside the place's legal boundary, and for a few places that boundary
reaches out to sea: San Francisco's includes the Farallon Islands, so its
point is 25 miles offshore. This script checks every pin against the Census
state outline (land only, 1:500k) and reports:

  1. table entries whose point is not on land inside their own state
     (also any listed in lib/placeCoordsFixes.json that still fail),
  2. live feed vendors whose pin would fail the same test,
  3. live feed vendors whose city isn't in the table (the browser geocodes
     those with Mapbox; listed so they can be added or checked by hand).

Usage:
    pip install pyshp shapely
    python3 scripts/check-map-pins.py            # uses the live MMM feed
    MMM_FEED_FILE=tests/e2e/.feed.txt python3 scripts/check-map-pins.py

Exits 1 when any pin fails, so it can run in CI.
"""

import io
import json
import os
import re
import sys
import urllib.request
import zipfile
from pathlib import Path

import shapefile  # pyshp
from shapely.geometry import Point, shape
from shapely.ops import unary_union
from shapely.prepared import prep

ROOT = Path(__file__).resolve().parent.parent
TABLE = json.loads((ROOT / "lib" / "placeCoords.json").read_text())
FIXES = json.loads((ROOT / "lib" / "placeCoordsFixes.json").read_text())
STATES_URL = "https://www2.census.gov/geo/tiger/GENZ2023/shp/cb_2023_us_state_500k.zip"
CACHE = Path(os.environ.get("TMPDIR", "/tmp")) / "cb_2023_us_state_500k.zip"
FEED = "https://managemymarket.com/api/VendorList?orgID=913"

# Same rules as lib/placeCoords.ts, with its aliases read from that file.
_TS = (ROOT / "lib" / "placeCoords.ts").read_text()
ALIASES = dict(re.findall(r'^\s+"?([^":\n]+?)"?: "([^"]+)",$', _TS[_TS.find("ALIASES"):_TS.find("};", _TS.find("ALIASES"))], re.M))


def city_key(city: str, state: str) -> str:
    name = re.sub(r"\s+", " ", city.lower()).strip()
    name = re.sub(r",?\s+(ca|calif\.?|california)$", "", name).strip()
    name = ALIASES.get(name, name)
    st = state.strip() if re.fullmatch(r"[A-Z]{2}", state.strip()) else "CA"
    return f"{name}|{st}"


def lookup(key: str):
    return FIXES.get(key) or TABLE.get(key)


def load_states():
    if not CACHE.exists():
        CACHE.write_bytes(urllib.request.urlopen(STATES_URL, timeout=60).read())
    z = zipfile.ZipFile(CACHE)
    base = "cb_2023_us_state_500k"
    r = shapefile.Reader(
        shp=io.BytesIO(z.read(f"{base}.shp")), shx=io.BytesIO(z.read(f"{base}.shx")), dbf=io.BytesIO(z.read(f"{base}.dbf"))
    )
    fields = [f[0] for f in r.fields[1:]]
    out = {}
    for rec, shp in zip(r.records(), r.shapes()):
        st = dict(zip(fields, rec))["STUSPS"]
        # ~300 m of slack for points right on the shoreline.
        out[st] = prep(unary_union([shape(shp.__geo_interface__)]).buffer(0.003))
    return out


def load_feed():
    path = os.environ.get("MMM_FEED_FILE")
    if path:
        text = Path(path).read_text()
    else:
        req = urllib.request.Request(FEED, headers={"Referer": "https://www.agriculturalinstitute.org/", "User-Agent": "Mozilla/5.0"})
        text = urllib.request.urlopen(req, timeout=60).read().decode("utf-8")
    m = re.search(r"var mmmVendors = (\[[\s\S]*?\]);", text)
    return [v for v in json.loads(m.group(1)) if v.get("permission") is True] if m else []


def main() -> int:
    states = load_states()
    bad = 0

    def on_land(key, at):
        st = key.split("|")[1]
        return st in states and states[st].contains(Point(at[1], at[0]))

    print("1. Table entries off land or outside their state")
    for key in sorted(set(TABLE) | set(FIXES)):
        raw, at = TABLE.get(key), lookup(key)
        if raw and not on_land(key, raw):
            ok = on_land(key, at)
            print(f"   {key}: {raw} -> {'fixed at ' + str(at) if key in FIXES and ok else 'NOT FIXED'}")
            bad += 0 if ok else 1
        elif not on_land(key, at):
            bad += 1
            print(f"   {key}: fix {at} is itself off land")

    print("2. Feed vendors with a pin off land")
    vendors = load_feed()
    missing = []
    for v in vendors:
        city, st = (v.get("city") or "").strip(), (v.get("state") or "").strip()
        if not city:
            continue
        key = city_key(city, st)
        at = lookup(key)
        if at is None:
            missing.append(f"{v['company']} ({city}, {st})")
        elif not on_land(key, at):
            bad += 1
            print(f"   {v['company']}: {city}, {st} -> {at}")

    print(f"3. Feed vendors whose city isn't in the table (geocoded in the browser): {len(missing)}")
    for m in missing:
        print(f"   {m}")
    print(f"Checked {len(TABLE)} places and {len(vendors)} vendors; {bad} problem pin(s).")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
