"use client";

import type { Vendor } from "@/lib/types";
import type { CategoryMap } from "@/lib/categories";
import { CATEGORY_LABELS, PRODUCT_LABELS, categoryColors } from "@/lib/categories";
import type { PaymentID } from "@/lib/intake";
import type { CatalogEntry } from "@/lib/catalog";
import { BENEFIT_IDS, PAYMENT_LABELS } from "@/lib/payments";
import { MARKET_BY_ID, MARKET_LIST, directionsUrl, milesBetween, readable } from "@/lib/markets";
import { Tile } from "./ParticipantGrid";
import { NewTab, OutArrow } from "./a11y";
import { cleanUrl, displayName, formatCity, longDate, nextDate, shortDate, vendorDates } from "./vendorUtils";

interface Props {
  vendor: Vendor;
  today: string;
  marketID?: number; // the market page it was opened from, if any
  categories?: CategoryMap[number];
  items?: CatalogEntry; // products and organic status from Manage My Market
  month: number; // this month, 0 = January
  payments?: PaymentID[];
  otherPayment?: string;
  origin?: string;
  at?: [number, number]; // where the vendor is based, for distances
  onClose: () => void;
}

export default function ProfileModal({ vendor, today, marketID, categories, items, month, payments, otherPayment, origin, at, onClose }: Props) {
  const name = displayName(vendor.company);
  const city = formatCity(vendor.city, vendor.state);
  const basedIn = origin?.trim() || formatCity(vendor.city ?? "", "");
  const first = categories?.categories[0];
  const colors = first ? categoryColors(first) : { background: "#f6f5ea", art: "#0d8240" };
  const next = nextDate(vendor, today, marketID) ?? nextDate(vendor, today);
  const paragraphs = (vendor.description ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const links = [
    { label: "Website", url: cleanUrl(vendor.website) },
    { label: "Instagram", url: cleanUrl(vendor.instagram_profile) },
    { label: "Facebook", url: cleanUrl(vendor.facebook_profile) },
  ].filter((l) => l.url);
  const ids = new Set(vendor.markets.map((m) => m.marketID));
  const markets = MARKET_LIST.filter((m) => ids.has(m.id)).sort((a, b) => (a.id === marketID ? -1 : b.id === marketID ? 1 : 0));

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="aimdir-profile-name"
      style={{ "--mtint": colors.background, "--mink": readable(colors.art, "#ffffff", 4.5) } as React.CSSProperties}>
      <div className="left">
        <div className="tilebox">
          <Tile vendor={vendor} categories={categories} sizes="(max-width: 760px) 120px, 364px" eager />
          {vendor.sitePhoto && (
            <p className="site-credit">{vendor.sitePhoto.source === "logo" ? "Logo" : "Image"} from their website</p>
          )}
        </div>
        <div className="nextbox">
          {next ? (
            <>
              <small>Next at {MARKET_BY_ID[next.marketID].name}</small>
              <b>{longDate(next.iso)}</b>
              <span>{MARKET_BY_ID[next.marketID].hours}</span>
            </>
          ) : (
            <>
              <small>Next at market</small>
              <b style={{ color: "#6b6a60" }}>Dates to be announced</b>
            </>
          )}
        </div>
      </div>

      <div className="right">
        <div className="top">
          <div>
            {categories && categories.categories.length > 0 && (
              <div className="eyebrow">
                {categories.categories.map((c) => CATEGORY_LABELS[c]).join(" · ")}
                {categories.products.length > 0 && ` · ${categories.products.map((p) => PRODUCT_LABELS[p]).join(", ")}`}
              </div>
            )}
            <h2 id="aimdir-profile-name">{name}</h2>
            {city && <div className="city">{city}</div>}
            {origin && origin.toLowerCase() !== (vendor.city ?? "").trim().toLowerCase() && (
              <div className="city">Grown or made in {origin}</div>
            )}
            {(items?.organic || items?.naturallyGrown) && (
              <div className="certs">
                {items.organic && <span>Certified organic</span>}
                {items.naturallyGrown && <span>Certified Naturally Grown</span>}
              </div>
            )}
          </div>
          <button type="button" className="x" onClick={onClose} aria-label="Close" autoFocus>&times;</button>
        </div>

        {links.length > 0 && (
          <div className="links">
            {links.map((l) => <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer">{l.label}<NewTab /></a>)}
          </div>
        )}

        {((payments && payments.length > 0) || otherPayment) && (
          <div>
            <div className="label">Ways to pay</div>
            <div className="pay">
              {(payments ?? []).map((p) => <span key={p} className={BENEFIT_IDS.includes(p) ? "benefit" : ""}>{PAYMENT_LABELS[p]}</span>)}
              {otherPayment && <span>{otherPayment}</span>}
            </div>
          </div>
        )}

        {paragraphs.length > 0 && (
          <div className="desc">{paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div>
        )}

        {items && items.products.length > 0 && (
          <div>
            <div className="label">What they sell</div>
            <div className="goods">
              {Object.entries(Object.groupBy(items.products, (p) => p.category)).map(([category, products]) => (
                <div key={category}>
                  <small>{category}</small>
                  <div className="chips">
                    {products!.map((p) => {
                      const now = !p.months.length || p.months.includes(month);
                      return (
                        <span key={p.name} className={now ? "now" : ""} title={now ? "Available this month" : undefined}>
                          {p.name}{p.organic ? " · organic" : ""}
                          {now && <span className="sr-only">, available this month</span>}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="goods-note">Highlighted items are available this month.</p>
          </div>
        )}

        {markets.length > 0 && (
          <div>
            <div className="label">Where to find them</div>
            <div className="sched">
              {markets.map((m) => {
                const dates = vendorDates(vendor, m.id).filter((d) => d >= today).slice(0, 5);
                const miles = at ? Math.round(milesBetween(at, [m.lat, m.lng])) : null;
                return (
                  <div key={m.id} className="mrow">
                    <img src={m.logo} alt="" />
                    <div>
                      <b><a href={m.aimPage} target="_blank" rel="noopener noreferrer">{m.name}<OutArrow /><NewTab /></a></b>
                      <div className="where">
                        {m.day}, {m.hours} · <a href={directionsUrl(m)} target="_blank" rel="noopener noreferrer">{m.address}, {m.city}<NewTab /></a>
                        {miles !== null && basedIn && ` · about ${miles < 1 ? "1" : miles} mile${miles === 1 ? "" : "s"} from ${basedIn}`}
                      </div>
                      <div className="chips">
                        {dates.length
                          ? dates.map((d) => <span key={d}>{shortDate(d)}</span>)
                          : <span className="soft">{m.seasonal ? "Back next season" : "Dates to be announced"}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
