"""Build lib/mmmCatalog.json from Manage My Market report exports.

What it reads (download while signed in to AIM's Manage My Market account,
Reports, and save into mmm-exports/, which git ignores):
  - Organization > Approved Products (all markets): Approved_Products.csv
  - Vendor > Vendor Products by Market, one per current market, saved as
    products-<marketID>.csv (for example products-7776.csv for Sunday Marin)

What it writes, per MMM vendor ID, only for vendors in the public feed (who
agreed to share their information): their AIM category, whether they are
Certified Organic or Certified Naturally Grown, and each approved product with
its category, organic flag and months available. No contacts, notes or
addresses leave this script.

Vendors are matched to the feed by business name, since the exports carry
names, not IDs. Names that don't match are listed so they can be checked.

Run: python3 -I scripts/build-mmm-catalog.py
"""

import csv
import glob
import json
import re
import sys
import urllib.request
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXPORTS = ROOT / "mmm-exports"
OUT = ROOT / "lib" / "mmmCatalog.json"
FEED = "https://managemymarket.com/api/VendorList?orgID=913"

MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]

# MMM vendor types, including the bilingual names on 2027 applications, to the
# directory's category IDs (lib/intake.ts).
TYPES = {
    "certified producers / farmers": "certified",
    "certified producer/ agricultor certificado": "certified",
    "rancher / livestock producer": "livestock",
    "dairy / cheese": "dairy",
    "fisher / seafood": "seafood",
    "food purveyor / tff / onsite consumption / food truck": "tff",
    "temporary food facility/ instalaciones alimentarias temporales": "tff",
    "prepacked/ preenvesados": "prepacked",
    "commercial": "commercial",
    "commercial/ comerciales": "commercial",
    "non-profit": "nonprofit",
    "entertainer": "entertainer",
    "entertainer/ animadores": "entertainer",
    "artisan (arts and crafts)": "artisan",
    "artisan/ artesanos": "artisan",
}

# Product categories that don't describe something a shopper buys.
SKIP_PRODUCT_CATEGORIES = {"Miscellaneous", ""}


def norm(s: str) -> str:
    return re.sub(r"\s+", " ", s.strip().lower())


def read_feed():
    req = urllib.request.Request(FEED, headers={
        "Referer": "https://www.agriculturalinstitute.org/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    })
    text = urllib.request.urlopen(req, timeout=30).read().decode("utf-8")
    match = re.search(r"var mmmVendors = (\[[\s\S]*?\]);", text)
    if not match:
        sys.exit("Could not read the MMM feed")
    return [v for v in json.loads(match.group(1)) if v.get("permission") is True]


def main():
    feed = read_feed()
    by_name = {norm(v["company"]): v["vendorID"] for v in feed}

    # Category: from the newest season the vendor applied for.
    types = defaultdict(dict)  # vendorID -> year -> set of categories
    unknown_types = set()
    for row in csv.DictReader(open(EXPORTS / "Approved_Products.csv", encoding="utf-8-sig")):
        vid = by_name.get(norm(row["Vendor"]))
        year = row["Market"][-4:]
        if not vid or not year.isdigit():
            continue
        cat = TYPES.get(norm(row["VendorType"]))
        if cat:
            types[vid].setdefault(year, set()).add(cat)
        elif row["VendorType"].strip():
            unknown_types.add(row["VendorType"])

    catalog = defaultdict(lambda: {"organic": False, "cng": False, "products": {}})
    unmatched = set()
    files = sorted(glob.glob(str(EXPORTS / "products-*.csv")))
    if not files:
        sys.exit("No products-<marketID>.csv files in mmm-exports/")
    for f in files:
        for row in csv.DictReader(open(f, encoding="utf-8-sig")):
            vid = by_name.get(norm(row["Vendor"]))
            if not vid:
                unmatched.add(row["Vendor"])
                continue
            entry = catalog[vid]
            entry["organic"] |= row["CertifiedOrganic"] == "Yes"
            entry["cng"] |= row["CertifiedNaturallyGrown"] == "Yes"
            if row["ProductApproved"] != "Yes" or row["ProductCategory"] in SKIP_PRODUCT_CATEGORIES:
                continue
            name = row["Product"].strip()
            months = {i for i, m in enumerate(MONTHS) if row[m] == "Yes"}
            p = entry["products"].setdefault(name, {"category": row["ProductCategory"], "organic": False, "months": set()})
            p["organic"] |= row["ProductOrganic"] == "True"
            p["months"] |= months

    out = {}
    for v in feed:
        vid = v["vendorID"]
        years = types.get(vid, {})
        cats = sorted(years[max(years)]) if years else []
        entry = catalog.get(vid)
        if not cats and not entry:
            continue
        out[str(vid)] = {
            "categories": cats,
            "organic": bool(entry and entry["organic"]),
            "naturallyGrown": bool(entry and entry["cng"]),
            "products": sorted(
                ([name, p["category"], p["organic"], sorted(p["months"])] for name, p in (entry["products"] if entry else {}).items()),
                key=lambda x: x[0].lower(),
            ),
        }

    OUT.write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False) + "\n")
    print(f"Wrote {len(out)} of {len(feed)} public vendors to {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
    missing = [v["company"] for v in feed if str(v["vendorID"]) not in out]
    if missing:
        print("No MMM product or type data for:", ", ".join(sorted(missing)))
    if unknown_types:
        print("Vendor types not mapped to a category:", ", ".join(sorted(unknown_types)))
    print(f"{len(unmatched)} names in the exports are not in the public feed (not sharing, or not this season)")


if __name__ == "__main__":
    main()
