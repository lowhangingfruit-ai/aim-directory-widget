#!/usr/bin/env python3
"""Build lib/placeCoords.json from the US Census Gazetteer places file.

The directory map places vendors by city. Looking each city up with Mapbox on
every visit was slow and spent geocoding quota, so coordinates now come from
this table, which ships with the site. The Census Gazetteer is public domain.

Usage:
    python3 scripts/build-place-coords.py <2024_Gaz_place_national.txt> [extra_states...]

Writes every California place, plus places in any extra states given (for the
few out-of-state vendors). Keys are "name|ST" in lower case, with the Census
type suffix ("city", "town", "CDP") removed. Download the file from
https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_place_national.zip
"""

import csv
import json
import re
import sys
from pathlib import Path

SUFFIX = re.compile(r"\s+(city and borough|city|town|village|borough|municipality|CDP|comunidad|zona urbana)$", re.I)
OUT = Path(__file__).resolve().parent.parent / "lib" / "placeCoords.json"


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    states = {"CA", *[s.upper() for s in sys.argv[2:]]}
    places: dict[str, tuple[float, float, bool]] = {}
    with open(sys.argv[1], newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f, delimiter="\t")
        reader.fieldnames = [h.strip() for h in reader.fieldnames or []]
        for row in reader:
            st = row["USPS"].strip()
            if st not in states:
                continue
            name = SUFFIX.sub("", row["NAME"].strip()).lower()
            key = f"{name}|{st}"
            incorporated = row["FUNCSTAT"].strip() == "A"
            lat, lng = float(row["INTPTLAT"]), float(row["INTPTLONG"].strip())
            # A city and a CDP can share a name; the incorporated place wins.
            if key in places and places[key][2] and not incorporated:
                continue
            places[key] = (round(lat, 4), round(lng, 4), incorporated)

    table = {k: [v[0], v[1]] for k, v in sorted(places.items())}
    OUT.write_text(json.dumps(table, separators=(",", ":")) + "\n")
    print(f"wrote {len(table)} places for {', '.join(sorted(states))} to {OUT}")


if __name__ == "__main__":
    main()
