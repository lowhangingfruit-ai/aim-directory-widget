"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Vendor } from "@/lib/types";
import type { CategoryID } from "@/lib/intake";
import { CATEGORY_LABELS, CategoryMap } from "@/lib/categories";
import type { PaymentMap } from "@/lib/payments";
import type { AttendanceHistory } from "@/lib/attendance";
import type { Catalog } from "@/lib/catalog";
import type { Crop } from "@/lib/season";
import { DIRECTORY_TITLE, MARKET_BY_ID, marketTitle } from "@/lib/markets";
import Toolbar, { EMPTY_FILTERS, Filters } from "./Toolbar";
import ParticipantGrid from "./ParticipantGrid";
import ProfileModal from "./ProfileModal";
import { SeasonGuide, SeasonStrip } from "./Season";
import { EbtBanner, EbtSection, FollowAim } from "./Benefits";
import { Overlay, scrollBehavior, scrollToTop, useEmbedFrame } from "./embed";
import MarketsHome from "./MarketsHome";
import MarketView from "./MarketView";
import { displayName, matchesSearch } from "./vendorUtils";
import "./directory.css";

const VendorMap = dynamic(() => import("../VendorMap"), { ssr: false });


interface Props {
  vendors: Vendor[];
  initialMarket?: number;
  today: string;
  history: AttendanceHistory;
  payments: PaymentMap;
  categories: CategoryMap;
  catalog: Catalog;
  origins: Record<number, string>;
  otherPayments: Record<number, string>;
  coords: Record<number, [number, number]>;
  embedded: boolean;
}

const AIM_DIRECTORY_PAGE = "https://www.agriculturalinstitute.org/market-participant-directory";

export default function DirectoryApp(props: Props) {
  const { vendors, today, history, payments, categories, catalog, origins, otherPayments, coords, embedded } = props;
  const [market, setMarket] = useState(props.initialMarket ?? 0);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [openID, setOpenID] = useState<number | null>(null);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const frame = useEmbedFrame(embedded);
  const month = Number(today.slice(5, 7)) - 1;

  // The market lives in the URL (?marketID=), so a market page can be linked,
  // embedded on its own, and left with the browser's back button.
  // After a market change, focus goes to the new page's heading, so keyboard
  // and screen reader users start from the top of what changed.
  const moved = useRef(false);
  const goTo = useCallback((id: number) => {
    moved.current = true;
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("marketID", String(id));
    else url.searchParams.delete("marketID");
    window.history.pushState(null, "", url);
    setMarket(id);
    setFilters((f) => ({ ...EMPTY_FILTERS, view: f.view }));
    scrollToTop(embedded);
  }, [embedded]);

  useEffect(() => {
    const onPop = () => {
      moved.current = true;
      setMarket(Number(new URL(window.location.href).searchParams.get("marketID")) || 0);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const m = market ? MARKET_BY_ID[market] : undefined;
    document.title = m ? marketTitle(m.name) : DIRECTORY_TITLE;
    if (!moved.current) return;
    moved.current = false;
    document.querySelector<HTMLElement>(".aimdir h1")?.focus({ preventScroll: true });
  }, [market]);

  // Picking a crop moves focus to the results line, once it has rendered.
  const [focusResults, setFocusResults] = useState(0);
  useEffect(() => {
    if (!focusResults) return;
    const target = document.getElementById("aimdir-count") ?? document.getElementById("aimdir-results");
    target?.focus({ preventScroll: true });
    document.getElementById("aimdir-results")?.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  }, [focusResults]);

  // Fetch the map code in the background so the Map view opens quickly.
  useEffect(() => {
    const load = () => { void import("../VendorMap"); };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = globalThis.setTimeout(load, 2000);
    return () => globalThis.clearTimeout(t);
  }, []);

  const sorted = useMemo(
    () => [...vendors].sort((a, b) => displayName(a.company).localeCompare(displayName(b.company))),
    [vendors]
  );
  const categoriesShown = useMemo(
    () => [...new Set(Object.values(categories).flatMap((c) => c.categories))] as CategoryID[],
    [categories]
  );
  const showPayments = Object.keys(payments).length > 0;
  const showOrganic = useMemo(() => Object.values(catalog).some((c) => c.organic), [catalog]);

  const applyFilters = useCallback((list: Vendor[]) => list.filter((v) => {
    const cats = categories[v.vendorID];
    if (filters.category && !cats?.categories.includes(filters.category)) return false;
    if (filters.products.size && !(cats?.products ?? []).some((p) => filters.products.has(p))) return false;
    if (filters.payments.size && !(payments[v.vendorID] ?? []).some((p) => filters.payments.has(p))) return false;
    const items = catalog[v.vendorID];
    if (filters.organic && !items?.organic) return false;
    // A crop from the in-season guide: the vendor lists it, available this month.
    if (filters.crop) {
      const term = filters.crop.term;
      const has = items
        ? items.products.some((p) => p.name.toLowerCase().includes(term) && (!p.months.length || p.months.includes(month)))
        : (v.description ?? "").toLowerCase().includes(term);
      if (!has) return false;
    }
    const text = [...(cats?.categories ?? []).map((c) => CATEGORY_LABELS[c]), ...(items?.products ?? []).map((p) => p.name)].join(" ");
    return matchesSearch(v, filters.q, text);
  }), [filters, categories, payments, catalog, month]);

  const pickCrop = (crop: Crop) => {
    setSeasonOpen(false);
    setFilters((f) => ({ ...f, crop: { term: crop.term, name: crop.name }, view: "list" }));
    setFocusResults((n) => n + 1);
  };
  const closeProfile = useCallback(() => setOpenID(null), []);
  const closeSeason = useCallback(() => setSeasonOpen(false), []);
  const jumpToEbt = () => {
    document.getElementById("aimdir-ebt-title")?.focus({ preventScroll: true });
    document.getElementById("aimdir-ebt")?.scrollIntoView({ behavior: scrollBehavior() });
  };

  const open = openID === null ? null : vendors.find((v) => v.vendorID === openID) ?? null;
  const filtering = !!(filters.q || filters.category || filters.payments.size || filters.organic || filters.crop);
  const current = market ? MARKET_BY_ID[market] : undefined;

  const toolbar = (
    <Toolbar
      filters={filters}
      onChange={setFilters}
      placeholder={current ? "Producer name or product" : "Name, market day, or product"}
      categoriesShown={categoriesShown}
      showPayments={showPayments}
      showOrganic={showOrganic}
    />
  );
  const beforeResults = (
    <div className="wrap">
      <div className="pre">
        <SeasonStrip month={month} onPick={pickCrop} onOpen={() => setSeasonOpen(true)} />
        <EbtBanner onJump={jumpToEbt} />
      </div>
    </div>
  );

  return (
    <main className={`aimdir${embedded ? " embedded" : ""}`}>
      {current ? (
        <MarketView
          key={current.id}
          market={current}
          vendors={sorted}
          today={today}
          history={history[current.id] ?? {}}
          backHref={props.initialMarket && embedded ? AIM_DIRECTORY_PAGE : undefined}
          onBack={() => goTo(0)}
          toolbar={toolbar}
          beforeResults={beforeResults}
          filter={applyFilters}
          view={filters.view}
          renderGrid={(list) => (
            <ParticipantGrid vendors={list} categories={categories} catalog={catalog} payments={payments} marketID={current.id} onOpen={setOpenID} />
          )}
          renderMap={(list) => <VendorMap vendors={list} origins={origins} coords={coords} selectedMarket={current.id} />}
        />
      ) : (
        <MarketsHome
          vendors={sorted}
          today={today}
          toolbar={toolbar}
          beforeResults={beforeResults}
          filtering={filtering}
          filtered={applyFilters(sorted)}
          filters={filters}
          onClear={() => setFilters((f) => ({ ...EMPTY_FILTERS, view: f.view }))}
          onOpenMarket={goTo}
          renderGrid={(list) => (
            <ParticipantGrid vendors={list} categories={categories} catalog={catalog} payments={payments} onOpen={setOpenID} />
          )}
          renderMap={(list) => <VendorMap vendors={list} origins={origins} coords={coords} selectedMarket={null} />}
        />
      )}

      <div className="wrap">
        <FollowAim />
        <EbtSection id="aimdir-ebt" />
        {/* The notice AIM chose instead of asking participants for consent again. */}
        {!current && (
          <details className="about">
            <summary>About this directory and the information it shows</summary>
            <div>
              <p><strong>What it shows.</strong>{" "}Business name, description, city, website and social links, and market
                dates, all from each vendor&rsquo;s Manage My Market profile. It never shows email addresses, phone
                numbers, or street addresses.</p>
              <p><strong>Who is included.</strong>{" "}Only market participants who have agreed in Manage My Market to let AIM
                share their information publicly. Market participants can change that answer, or update their details, in
                their Manage My Market profile at any time.</p>
            </div>
          </details>
        )}
      </div>

      {open && (
        <Overlay embedded={embedded} frame={frame} onClose={closeProfile}>
          <ProfileModal
            vendor={open}
            today={today}
            marketID={current?.id}
            categories={categories[open.vendorID]}
            items={catalog[open.vendorID]}
            month={month}
            payments={payments[open.vendorID]}
            otherPayment={otherPayments[open.vendorID]}
            origin={origins[open.vendorID]}
            at={coords[open.vendorID]}
            onClose={closeProfile}
          />
        </Overlay>
      )}
      {seasonOpen && (
        <Overlay embedded={embedded} frame={frame} onClose={closeSeason}>
          <SeasonGuide month={month} onPick={pickCrop} onClose={closeSeason} />
        </Overlay>
      )}
    </main>
  );
}
