"use client";

import { useEffect } from "react";
import { Profile, ProgramID, PROGRAMS, TECHNICAL_ASSISTANCE } from "@/lib/showcase";

// Shared pieces for the showcase layout directions. Content (program order,
// copy, colors, profiles, photos) is the same approved content as /showcase.

export const INK = "#17261b";
export const AIM_GREEN = "#0d8240";
export const AIM_BRIGHT = "#4db547";
export const SQUARE_CREAM = "#f1efe5";

export const ALL_PROGRAMS_COPY =
  "AIM operates three programs geared toward producers within their first five years of operation. These programs provide financial, technical, and marketing support to foster sustainable growth, expand market opportunities, and strengthen local food systems. Additional programming is available to businesses at any stage.";

export const PAGE_TITLE = "Farm & Food Business Resources";
export const PAGE_INTRO =
  "AIM’s Farm & Food Business Resources support food and agricultural business growth to strengthen California’s regional food system.";
export const CLOSING =
  "Farmers markets are both a sales outlet and an opportunity for expansion and success. Our programs help our market participants thrive.";

export const STATS = [
  { value: "22", label: "participants in the 2026 cohorts" },
  { value: "31", label: "first-generation farmers supported" },
  { value: "65%", label: "of Fund recipients still sell at AIM markets" },
  { value: "$180K+", label: "in waived fees and business stipends" },
];
export const STATS_NOTE = "Figures from AIM, September 2026.";

// Shayla's order for the programs (2026-10-28).
export const PROGRAM_ORDER: ProgramID[] = ["maf", "farmer", "foodmaker"];
export type Tab = ProgramID | "all";

export interface NavItem {
  key: Tab | "ta";
  label: string;
  color: string;
  text: string;
  href?: string;
}

// The five program squares, in order.
export const NAV: NavItem[] = [
  { key: "all", label: "All Farm & Food Programs", color: SQUARE_CREAM, text: INK },
  ...PROGRAM_ORDER.map((id) => ({
    key: id, label: PROGRAMS[id].name, color: PROGRAMS[id].color, text: PROGRAMS[id].squareText,
  })),
  {
    key: "ta", label: TECHNICAL_ASSISTANCE.name, color: TECHNICAL_ASSISTANCE.color,
    text: TECHNICAL_ASSISTANCE.squareText, href: TECHNICAL_ASSISTANCE.url,
  },
];

const LOGO_BASE = "https://images.squarespace-cdn.com/content/v1/5fd7b5e8b59b81291926f482";
export const MARKET_LOGOS: Record<number, string> = {
  7776: `${LOGO_BASE}/10074cb7-fd6e-4c7c-8629-4fb8a71fa9ea/marin.logo_on_yellow.jpg`,
  7781: `${LOGO_BASE}/1607976531072-1VE3CAJJSAIRAFFE65Z7/newark.logo_on_peach.jpg`,
  7782: `${LOGO_BASE}/4b2c106f-4eda-4004-b832-a213b950eccd/clement.logo_on_yellow.jpg`,
  7783: `${LOGO_BASE}/1607976598459-TZZWCTC8QDCHJ7AS6L7T/stonestown.logo_on_green.jpg`,
  7784: `${LOGO_BASE}/9f0695f7-5bbf-497a-afec-e04e45870cda/hayward.logo_on_pink.jpg`,
  7785: `${LOGO_BASE}/1607976402789-E45K4WYYS5OCMOE24XG4/grandlake.logo_on_green.jpg`,
  7786: `${LOGO_BASE}/10074cb7-fd6e-4c7c-8629-4fb8a71fa9ea/marin.logo_on_yellow.jpg`,
  7803: `${LOGO_BASE}/040d3d2e-68cb-4196-be5e-b06e6090b108/pointreyes.logo_on_blue.jpg`,
  8211: `${LOGO_BASE}/1607976583988-S19RDA6H1M7KI7F2WBGB/sanrafael.logo_on_blue.jpg`,
};

export const FULL_MARKETS: Record<number, string> = {
  7776: "Sunday Marin Farmers Market",
  7781: "Newark Farmers Market",
  7782: "Clement St. Farmers Market",
  7783: "Stonestown Farmers Market",
  7784: "Hayward Farmers Market",
  7785: "Grand Lake Farmers Market",
  7786: "Thursday Marin Farmers Market",
  7803: "Point Reyes Farmers Market",
  8211: "Downtown San Rafael Farmers Market",
};

export function initials(business: string): string {
  return business
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function bestPhoto(profile: Profile): string | null {
  const feed = profile.vendor?.photo?.trim();
  // The feed sometimes holds a PDF instead of an image.
  const usableFeed = feed && !/\.pdf$/i.test(feed) ? feed : null;
  return profile.photo ?? profile.aimPhoto ?? usableFeed ?? null;
}

export function storyOf(profile: Profile): string | null {
  const desc = profile.vendor?.description?.trim();
  return profile.details.story ?? profile.story ?? (desc && desc.length >= 30 ? desc : null);
}

export function knownMarketIDs(profile: Profile, allMarkets: Record<number, string>): number[] {
  if (!profile.vendor) return [];
  return [...new Set(profile.vendor.markets.map((m) => m.marketID))].filter((id) => allMarkets[id]);
}

export function marketName(id: number, allMarkets: Record<number, string>) {
  return FULL_MARKETS[id] ?? allMarkets[id];
}

export function cohortSort(a: string, b: string) {
  return parseInt(b, 10) - parseInt(a, 10);
}

export function profileKey(p: Profile) {
  return `${p.program}:${p.business}:${p.cohort}`;
}

// A participant photo, shown whole: no crop and no frame, so the person and
// what they're holding stay in view (Meg, 2026-10-29). With no photo, a
// lettermark on the program tint at the same 4:5 shape.
export function Portrait({ profile, className }: { profile: Profile; className?: string }) {
  const photo = bestPhoto(profile);
  const program = PROGRAMS[profile.program];
  if (!photo) {
    return (
      <div className={`dx-lettermark ${className ?? ""}`} style={{ backgroundColor: program.tint, color: program.color }}>
        <span>{initials(profile.business)}</span>
      </div>
    );
  }
  return (
    <img src={photo} alt={profile.person ? `${profile.person}, ${profile.business}` : profile.business}
      className={`dx-photo ${className ?? ""}`} loading="lazy" />
  );
}

export function SocialLinks({ profile }: { profile: Profile }) {
  const v = profile.vendor;
  const d = profile.details;
  const pick = (a?: string, b?: string) => (a?.trim() || (b && b.trim() !== " " ? b.trim() : "")) || "";
  const links: { label: string; href: string }[] = [];
  const website = pick(d.website, v?.website);
  if (website) links.push({ label: "Website", href: website.startsWith("http") ? website : `https://${website}` });
  const instagram = pick(d.instagram, v?.instagram_profile);
  if (instagram) links.push({ label: "Instagram", href: instagram });
  const facebook = pick(d.facebook, v?.facebook_profile);
  if (facebook) links.push({ label: "Facebook", href: facebook });
  if (!links.length) return null;
  return (
    <div className="dx-social">
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
      ))}
    </div>
  );
}

// Profile sheet shared by every direction: whole photo beside the story.
export function ProfileSheet({ profile, allMarkets, onClose }: {
  profile: Profile; allMarkets: Record<number, string>; onClose: () => void;
}) {
  const program = PROGRAMS[profile.program];
  const story = storyOf(profile);
  const sells = profile.details.sells;
  const markets = knownMarketIDs(profile, allMarkets);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="dx-sheet-scrim" onClick={onClose}>
      <div className="dx-sheet" role="dialog" aria-modal="true" aria-label={profile.business} onClick={(e) => e.stopPropagation()}>
        <button className="dx-sheet-close" onClick={onClose} aria-label="Close">×</button>
        <div className="dx-sheet-photo">
          <Portrait profile={profile} />
        </div>
        <div className="dx-sheet-body">
          <div className="dx-sheet-tags">
            <span className="dx-tag" style={{ backgroundColor: program.color, color: program.textOnColor }}>
              {program.shortName} {profile.cohort}
            </span>
            {profile.alsoTags?.map((t) => <span key={t} className="dx-tag dx-tag-outline">{t}</span>)}
          </div>
          <h2 className="dx-sheet-title">{profile.business}</h2>
          {profile.person && <div className="dx-sheet-person">{profile.person}</div>}
          {story
            ? <p className="dx-sheet-story">{story}</p>
            : <p className="dx-sheet-story dx-muted"><em>Their full profile is coming soon.</em></p>}
          {sells && (
            <div>
              <div className="dx-sheet-h">What they sell</div>
              <p className="dx-sheet-small">{sells}</p>
            </div>
          )}
          {markets.length > 0 && (
            <div>
              <div className="dx-sheet-h">Meet them at AIM&rsquo;s farmers markets</div>
              <div className="dx-sheet-markets">
                {markets.map((id) => (
                  <div key={id} className="dx-sheet-market">
                    {MARKET_LOGOS[id]
                      ? <img src={MARKET_LOGOS[id]} alt="" />
                      : <div style={{ width: 54, height: 54, background: program.color }} />}
                    <span>{marketName(id, allMarkets)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <SocialLinks profile={profile} />
        </div>
      </div>
    </div>
  );
}

// Program label in Cocogoose Narrow, the face from the program squares.
export function ProgramLabel({ children, className, style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return <span className={`dx-cocogoose ${className ?? ""}`} style={style}>{children}</span>;
}
