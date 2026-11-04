"use client";

import { useState } from "react";
import Image from "next/image";
import type { Vendor } from "@/lib/types";
import type { CategoryMap } from "@/lib/categories";
import type { Catalog } from "@/lib/catalog";
import { CATEGORY_LABELS, categoryColors } from "@/lib/categories";
import type { PaymentMap } from "@/lib/payments";
import { BENEFIT_IDS, PAYMENT_SHORT } from "@/lib/payments";
import { MARKET_LIST, readable } from "@/lib/markets";
import { displayName, formatCity } from "./vendorUtils";

// MMM uploads are mostly logos in every shape, so the whole image is shown.
// Some uploads are PDFs; those, and any image that fails, get a name tile.
// The vendor's name is always in a heading next to the tile, so the logo
// itself is decorative to a screen reader.
const IMAGE_FILE = /\.(jpe?g|png|gif|webp)$/i;

// Without an MMM upload, a picture from the vendor's own website stands in
// (lib/websitePhotos.ts): a photo fills the tile, a logo is shown whole on a
// light tile (dark for a light logo). It isn't the vendor's own pick for the
// directory, so its alt text says what it is and where it came from.
export function sitePhotoAlt(vendor: Vendor): string {
  const name = displayName(vendor.company);
  return vendor.sitePhoto?.source === "logo" ? `${name} logo` : `Image from ${name}'s website`;
}

export function Tile({ vendor, categories, sizes, eager = false }: {
  vendor: Vendor;
  categories?: CategoryMap[number];
  sizes: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [siteFailed, setSiteFailed] = useState(false);
  const src = vendor.photo?.trim();
  const name = displayName(vendor.company);
  const site = vendor.sitePhoto;

  if (src && IMAGE_FILE.test(src) && !failed) {
    return (
      <div className="tile">
        <Image src={src} alt="" fill sizes={sizes} loading={eager ? "eager" : "lazy"}
          onError={() => setFailed(true)} style={{ objectFit: "contain", padding: "12%" }} />
      </div>
    );
  }

  if (site && !siteFailed) {
    const contain = site.fit === "contain";
    return (
      <div className={`tile from-site${contain ? " logo" : ""}${site.background === "dark" ? " dark" : ""}`}>
        <Image src={site.url} alt={sitePhotoAlt(vendor)} fill sizes={sizes} loading={eager ? "eager" : "lazy"}
          onError={() => setSiteFailed(true)}
          style={contain ? { objectFit: "contain", padding: "12%" } : { objectFit: "cover" }} />
      </div>
    );
  }

  const first = categories?.categories[0];
  const colors = first ? categoryColors(first) : { background: "#ecebdf", art: "#55544b" };
  const size = name.length > 18 ? "clamp(16px, 2.1vw, 28px)" : "clamp(18px, 2.8vw, 38px)";
  return (
    <div className="tile sign" aria-hidden="true"
      style={{ background: colors.background, color: readable(colors.art, colors.background, 3), fontSize: size }}>
      {name}
    </div>
  );
}

// Small logos of the vendor's other markets, so a shopper can see where else to find them.
function MarketMarks({ vendor, skip }: { vendor: Vendor; skip?: number }) {
  const ids = new Set(vendor.markets.map((m) => m.marketID));
  const seen = new Set<string>();
  const marks = MARKET_LIST.filter((m) => ids.has(m.id) && m.id !== skip && !seen.has(m.logo) && seen.add(m.logo));
  if (!marks.length) return null;
  const label = marks.map((m) => m.name).join(", ");
  return (
    <div className="marks" title={label}>
      <span className="sr-only">Also at {label}</span>
      {marks.slice(0, 5).map((m) => <img key={m.id} src={m.logo} alt="" />)}
      {marks.length > 5 && <span aria-hidden="true">+{marks.length - 5}</span>}
    </div>
  );
}

export default function ParticipantGrid({ vendors, categories, catalog, payments, marketID, onOpen }: {
  vendors: Vendor[];
  categories: CategoryMap;
  catalog: Catalog;
  payments: PaymentMap;
  marketID?: number;
  onOpen: (id: number) => void;
}) {
  if (!vendors.length) {
    return <div className="grid"><p className="empty">No market participants match.</p></div>;
  }
  // Each card is a plain article with its name as a heading, so the names
  // show up in a screen reader's list of headings. The button inside the
  // heading stretches over the whole card (see .card h3 button in the CSS).
  return (
    <div className="grid">
      <h2 className="sr-only">Market participants</h2>
      {vendors.map((v) => {
        const cats = categories[v.vendorID];
        const first = cats?.categories[0];
        const benefits = (payments[v.vendorID] ?? []).filter((p) => BENEFIT_IDS.includes(p));
        const organic = catalog[v.vendorID]?.organic;
        return (
          <article key={v.vendorID} className="card">
            <Tile vendor={v} categories={cats} sizes="(max-width: 760px) 50vw, (max-width: 1100px) 33vw, 300px" />
            {first && (
              <div className="cat" style={{ color: readable(categoryColors(first).art, "#f6f5ea", 4.5) }}>
                {cats!.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
              </div>
            )}
            <h3><button type="button" onClick={() => onOpen(v.vendorID)}>{displayName(v.company)}</button></h3>
            <div className="meta">{formatCity(v.city, v.state).replace(/, CA$/, "")}</div>
            <MarketMarks vendor={v} skip={marketID} />
            {(benefits.length > 0 || organic) && (
              <div className="badges">
                {organic && <span className="organic">Certified organic</span>}
                {benefits.map((p) => <span key={p}>{PAYMENT_SHORT[p]}</span>)}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
