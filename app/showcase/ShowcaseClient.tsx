"use client";

import { useState, useEffect } from "react";
import { Profile, ProgramID, PROGRAMS, TECHNICAL_ASSISTANCE } from "@/lib/showcase";

interface Props {
  profiles: Profile[];
  alumni: Profile[];
  allMarkets: Record<number, string>;
  // ?embed=1: the version for AIM's Squarespace code block
  // (docs/squarespace-showcase-embed.html).
  embedded?: boolean;
}

const AIM_GREEN = "#0d8240";
const AIM_BRIGHT = "#4db547";
const CREAM = "#f6f5ea";

const LOGO_BASE = "https://images.squarespace-cdn.com/content/v1/5fd7b5e8b59b81291926f482";
const MARKET_LOGOS: Record<number, string> = {
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

// Shayla's order for the program squares (2026-10-28).
const PROGRAM_ORDER: ProgramID[] = ["maf", "farmer", "foodmaker"];
type Tab = ProgramID | "all";

// Program-square design from Shayla's reference (screenshot 1.19.36).
const INK = "#17261b";
const SQUARE_CREAM = "#f1efe5";
const SQUARE_FONT = "'Archivo', var(--font-heading)";

// Shown under the squares when "All Farm & Food Programs" is selected.
const ALL_PROGRAMS_COPY =
  "AIM operates three programs geared toward producers within their first five years of operation. These programs provide financial, technical, and marketing support to foster sustainable growth, expand market opportunities, and strengthen local food systems. Additional programming is available to businesses at any stage.";

// Hero strip: close-up, daylight, in-the-field portraits from AIM's photo
// set, chosen for a matching look (Shayla, 2026-10-28).
const HERO_PHOTOS = [
  "/participants/shao-shan-farm.jpg",
  "/participants/induchucuiti-organic-farm-maf.jpg",
  "/participants/salazar-organic-farm.jpg",
  "/participants/coyo-organics.jpg",
  "/participants/narcis-organic-farm.jpg",
  "/participants/vasquez-organic-farm.jpg",
];

// Full market names, per Shayla: "Hayward" alone wasn't clearly a market.
const FULL_MARKETS: Record<number, string> = {
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

const STATS = [
  { value: "22", label: "participants in the 2026 cohorts" },
  { value: "31", label: "first-generation farmers supported" },
  { value: "65%", label: "of Fund recipients still sell at AIM markets" },
  { value: "$180K+", label: "in waived fees and business stipends" },
];

function initials(business: string): string {
  return business
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Feed descriptions like "will write later" read as broken; below this
// length the intake-form placeholder tells a better story.
function usableStory(desc: string | undefined): string | null {
  const clean = desc?.trim();
  return clean && clean.length >= 30 ? clean : null;
}

function knownMarkets(profile: Profile, allMarkets: Record<number, string>) {
  if (!profile.vendor) return [];
  const seen = new Set<number>();
  return profile.vendor.markets.filter((m) => {
    if (!allMarkets[m.marketID] || seen.has(m.marketID)) return false;
    seen.add(m.marketID);
    return true;
  });
}

function bestPhoto(profile: Profile): string | null {
  return profile.photo ?? profile.aimPhoto ?? profile.vendor?.photo?.trim() ?? null;
}

// Cohort labels are years across all three programs.
function cohortLabel(cohort: string): string {
  return /^\d{4}$/.test(cohort) ? `Class of ${cohort}` : cohort;
}

function cohortSortKey(cohort: string): number {
  const n = cohort.match(/\d+/);
  return n ? parseInt(n[0], 10) : 0;
}

// Vendor-uploaded feed images are often wordmarks or logos. When one is far
// from square, contain-fit it on the program tint instead of cropping it.
// Curated AIM portraits (detect=false) always crop to fill.
function SmartImg({ src, alt, tint, detect, forceContain, style }: {
  src: string; alt: string; tint: string; detect: boolean; forceContain?: boolean; style?: React.CSSProperties;
}) {
  const [contain, setContain] = useState(!!forceContain);
  return (
    <img src={src} alt={alt}
      onLoad={(e) => {
        if (!detect || forceContain) return;
        const img = e.currentTarget;
        if (!img.naturalWidth || !img.naturalHeight) return;
        const r = img.naturalWidth / img.naturalHeight;
        if (r > 1.35 || r < 0.72) setContain(true);
      }}
      style={{
        width: "100%", height: "100%", display: "block",
        objectFit: contain ? "contain" : "cover",
        backgroundColor: contain ? tint : undefined,
        padding: contain ? "10%" : 0,
        boxSizing: "border-box",
        ...style,
      }} />
  );
}

function useNarrow() {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return { narrow: width < 640, mid: width < 980 };
}

// Split-flap-style stat: digits roll up to the target when the stat scrolls
// into view. Parses values like "$130K+" and "72%" so only digits animate.
function RollingStat({ value }: { value: string }) {
  const m = value.match(/^([^0-9]*)(\d+)(.*)$/);
  const target = m ? parseInt(m[2], 10) : 0;
  const [shown, setShown] = useState(0);
  const [el, setEl] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!el || !m) return;
    let raf = 0;
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const dur = 2600;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        setShown(Math.round(target * eased));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el, target]);

  if (!m) return <>{value}</>;
  return (
    <span ref={setEl} style={{ fontVariantNumeric: "tabular-nums" }}>
      {m[1]}{shown}{m[3]}
    </span>
  );
}

// ── AIM-style pieces ───────────────────────────────────────────────────────────

function PillButton({ label, active, color, textOnColor, onClick }: {
  label: string; active: boolean; color: string; textOnColor: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick} style={{
      flexShrink: 0,
      padding: "8px 20px",
      borderRadius: 300,
      fontFamily: "var(--font-heading)",
      fontWeight: 600,
      fontSize: 14,
      letterSpacing: "0.02em",
      cursor: "pointer",
      border: `1.5px solid ${active ? color : "#c9c7b8"}`,
      backgroundColor: active ? color : "#fff",
      color: active ? textOnColor : "#333",
      whiteSpace: "nowrap",
      transition: "all 0.12s ease",
    }}>
      {label}
    </button>
  );
}

function SocialLinks({ profile, centered }: { profile: Profile; centered?: boolean }) {
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
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px", justifyContent: centered ? "center" : "flex-start" }}>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 14, color: AIM_GREEN, textDecoration: "underline", textUnderlineOffset: 3, fontWeight: 500 }}>
          {l.label}
        </a>
      ))}
    </div>
  );
}

// Large program square: title bottom-left in heavy uppercase, as in Shayla's
// reference. The selected square gets a dark frame. With `href` it is a link
// out (Technical Assistance), not a filter.
function ProgramSquare({ label, active, color, text, narrow, mid, wide, onClick, href }: {
  label: string; active: boolean; color: string; text: string;
  narrow: boolean; mid: boolean; wide?: boolean;
  onClick?: () => void; href?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const style: React.CSSProperties = {
    position: "relative",
    display: "flex", alignItems: "flex-end",
    gridColumn: wide ? "1 / -1" : undefined,
    aspectRatio: wide ? undefined : "3 / 2",
    minHeight: wide ? 84 : undefined,
    padding: narrow ? "12px 12px 12px" : mid ? "14px 14px" : "18px 20px",
    backgroundColor: color,
    color: text,
    border: `${narrow ? 3 : 4}px solid ${active ? INK : "transparent"}`,
    boxSizing: "border-box",
    cursor: "pointer",
    textAlign: "left",
    textDecoration: "none",
    fontFamily: SQUARE_FONT,
    fontWeight: 800,
    fontStretch: "125%",
    textTransform: "uppercase",
    fontSize: narrow ? 13.5 : mid ? 13 : 17,
    lineHeight: 1.08,
    letterSpacing: "0.01em",
    transform: hovered && !active ? "translateY(-2px)" : "none",
    boxShadow: hovered ? "0 8px 18px rgba(23,38,27,0.18)" : "none",
    transition: "transform 0.12s ease, box-shadow 0.12s ease",
    overflowWrap: "break-word",
    hyphens: "manual",
  };
  const hover = { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) };
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={style} {...hover}
        aria-label={`${label} (opens AIM's program page)`}>
        <span aria-hidden="true" style={{ position: "absolute", top: narrow ? 8 : 12, right: narrow ? 10 : 14, fontSize: narrow ? 14 : 18, fontWeight: 700, lineHeight: 1 }}>↗</span>
        <span>{label}</span>
      </a>
    );
  }
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick} style={style} {...hover}>
      <span>{label}</span>
    </button>
  );
}

// ── Embed support ──────────────────────────────────────────────────────────────
// Messages between this page and the snippet on AIM's Squarespace page. These
// use their own names so the showcase and the market directory can sit on the
// same Squarespace page without resizing each other.
//   out: { type: "aim-showcase-height", height } so the iframe fits the content
//   out: { type: "aim-showcase-ready" }
//   in:  { type: "aim-showcase-viewport", top, height } the visible slice
interface EmbedFrame { top: number; height: number }

function useEmbedFrame(embedded: boolean): EmbedFrame | null {
  const [frame, setFrame] = useState<EmbedFrame | null>(null);

  useEffect(() => {
    if (!embedded || window.parent === window) return;
    const onMessage = (e: MessageEvent) => {
      if (e.source !== window.parent) return;
      const d = e.data as { type?: string; top?: unknown; height?: unknown } | null;
      if (d?.type !== "aim-showcase-viewport") return;
      if (typeof d.top !== "number" || typeof d.height !== "number" || !isFinite(d.top) || !isFinite(d.height)) return;
      setFrame({ top: Math.max(0, d.top), height: Math.max(360, d.height) });
    };
    window.addEventListener("message", onMessage);

    let last = -1;
    const post = () => {
      const height = document.body.scrollHeight;
      if (height === last) return;
      last = height;
      window.parent.postMessage({ type: "aim-showcase-height", height }, "*");
    };
    post();
    window.parent.postMessage({ type: "aim-showcase-ready" }, "*");
    window.addEventListener("resize", post);
    window.addEventListener("load", post);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(post);
    observer?.observe(document.body);
    const timers = [100, 400, 1200, 3000].map((ms) => window.setTimeout(post, ms));
    return () => {
      window.removeEventListener("message", onMessage);
      window.removeEventListener("resize", post);
      window.removeEventListener("load", post);
      observer?.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [embedded]);

  return frame;
}

// ── Participant tile (photo + centered caption, like AIM's cohort grid) ────────

function ParticipantTile({ profile, allMarkets, onOpen, compact }: {
  profile: Profile;
  allMarkets: Record<number, string>;
  onOpen: () => void;
  compact?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const program = PROGRAMS[profile.program];
  const photo = bestPhoto(profile);
  const markets = knownMarkets(profile, allMarkets);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "pointer", textAlign: "center" }}
    >
      <div style={{
        position: "relative",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        backgroundColor: program.tint,
        marginBottom: compact ? 9 : 12,
      }}>
        {photo ? (
          <SmartImg src={photo} alt={`${profile.person}, ${profile.business}`}
            tint={program.tint} detect={!profile.aimPhoto}
            style={{
              transform: hovered ? "scale(1.04)" : "scale(1)",
              transition: "transform 0.25s ease",
            }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4,
          }}>
            <span style={{
              fontFamily: "var(--font-heading)", fontWeight: 500,
              fontSize: compact ? 30 : 44, color: program.color, opacity: 0.55, lineHeight: 1,
            }}>
              {initials(profile.business)}
            </span>
          </div>
        )}
      </div>
      <div style={{
        fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: compact ? 15.5 : 19,
        color: "#000", lineHeight: 1.3, marginBottom: 2,
      }}>
        {profile.business}
      </div>
      {compact && (
        <div style={{ fontSize: 12.5, color: "#8a8878" }}>{cohortLabel(profile.cohort)}</div>
      )}
      {markets.length > 0 && (
        compact ? (
          <div style={{ fontSize: 12, color: AIM_GREEN, marginTop: 2 }}>Still at the markets</div>
        ) : (
          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11.5, color: "#8a8878", marginBottom: 1 }}>Meet them at:</div>
            <div style={{ fontSize: 13, color: AIM_GREEN, lineHeight: 1.5 }}>
              {markets.map((m) => FULL_MARKETS[m.marketID] ?? allMarkets[m.marketID]).join(" · ")}
            </div>
          </div>
        )
      )}
      {!compact && (
        <span style={{
          fontSize: 13.5, color: AIM_GREEN, fontWeight: 600,
          borderBottom: hovered ? `1.5px solid ${AIM_GREEN}` : "1.5px solid transparent",
          paddingBottom: 1, transition: "border-color 0.12s ease",
        }}>
          Story →
        </span>
      )}
    </div>
  );
}

// ── Detail overlay ─────────────────────────────────────────────────────────────

function ProfileModal({ profile, allMarkets, narrow, onClose, embedded, frame }: {
  profile: Profile;
  allMarkets: Record<number, string>;
  narrow: boolean;
  onClose: () => void;
  embedded: boolean;
  frame: EmbedFrame | null;
}) {
  const program = PROGRAMS[profile.program];
  const photo = bestPhoto(profile);
  const story = profile.details.story ?? profile.story ?? usableStory(profile.vendor?.description);
  const sells = profile.details.sells;
  const markets = knownMarkets(profile, allMarkets);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    if (!embedded) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, embedded]);

  return (
    <div onClick={onClose} style={{
      // Embedded, the iframe is as tall as the page, so the overlay sits over
      // the slice the visitor can see (sent by the Squarespace snippet).
      ...(embedded
        ? { position: "absolute", left: 0, right: 0, top: frame?.top ?? 0, height: frame?.height ?? 760 }
        : { position: "fixed", inset: 0 }),
      zIndex: 100,
      backgroundColor: "rgba(20,30,20,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: narrow ? 12 : 32,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: "#fff",
        width: "100%", maxWidth: 760, maxHeight: embedded ? "100%" : "90vh", overflowY: "auto",
        display: "flex", flexDirection: narrow ? "column" : "row",
        boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
        position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 12, right: 14, zIndex: 2,
          background: "#fff", border: "1px solid #ddd", borderRadius: 300,
          width: 32, height: 32, cursor: "pointer", fontSize: 16, lineHeight: 1, color: "#333",
        }}>×</button>

        {/* Photo side */}
        <div style={{
          flex: narrow ? undefined : "0 0 42%",
          backgroundColor: program.tint,
          minHeight: narrow ? 320 : 380,
          position: "relative",
          overflow: "hidden",
        }}>
          {photo ? (
            // Fill the whole photo side with no tint showing (Shayla,
            // 2026-10-28). Only an off-shape logo from the vendor feed,
            // with no AIM portrait, is still fitted inside the frame.
            <SmartImg src={photo} alt={`${profile.person}, ${profile.business}`}
              tint={program.tint} detect={!profile.photo && !profile.aimPhoto}
              style={{ position: "absolute", inset: 0, height: "100%", objectPosition: "center 30%" }} />
          ) : (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
            }}>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 64, color: program.color, opacity: 0.5, lineHeight: 1 }}>
                {initials(profile.business)}
              </span>
            </div>
          )}
        </div>

        {/* Info side */}
        <div style={{ flex: 1, padding: narrow ? "24px 22px 28px" : "32px 34px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span style={{
                display: "inline-block", padding: "4px 14px", borderRadius: 300,
                backgroundColor: program.color, color: program.textOnColor,
                fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12,
                letterSpacing: "0.03em", lineHeight: 1.5,
              }}>
                {program.shortName} {profile.cohort}
              </span>
              {profile.alsoTags?.map((t) => (
                <span key={t} style={{
                  display: "inline-block", padding: "4px 14px", borderRadius: 300,
                  border: `1.5px solid ${AIM_BRIGHT}`, color: "#1d4d1d", backgroundColor: "#fff",
                  fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12,
                  letterSpacing: "0.03em", lineHeight: 1.5,
                }}>
                  {t}
                </span>
              ))}
            </div>
            <h2 style={{
              fontFamily: "var(--font-heading)", fontWeight: 500,
              fontSize: narrow ? 26 : 30, color: "#000", lineHeight: 1.2, margin: "14px 0 2px",
            }}>
              {profile.business}
            </h2>
            <span style={{ fontSize: 15, color: "#494949" }}>
              {profile.person}
            </span>
          </div>

          {story ? (
            <p style={{ margin: 0, fontSize: 14.5, color: "#222", lineHeight: 1.75, whiteSpace: "pre-line" }}>{story}</p>
          ) : (
            <p style={{ margin: 0, fontSize: 14.5, color: "#8a8878", lineHeight: 1.75, fontStyle: "italic" }}>
              Their full profile is coming soon.
            </p>
          )}

          {sells && (
            <div>
              <div style={{
                fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 17,
                color: AIM_BRIGHT, marginBottom: 4,
              }}>
                What they sell
              </div>
              <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: 1.6 }}>{sells}</p>
            </div>
          )}

          {markets.length > 0 && (
            <div>
              <div style={{
                fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 17,
                color: AIM_BRIGHT, marginBottom: 8,
              }}>
                Meet them at AIM&rsquo;s farmers markets
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {markets.map((m) => (
                  <div key={m.marketID} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    {MARKET_LOGOS[m.marketID] ? (
                      <img src={MARKET_LOGOS[m.marketID]} alt={FULL_MARKETS[m.marketID] ?? allMarkets[m.marketID]}
                        style={{ width: 54, height: 54, objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: 54, height: 54, background: program.color }} />
                    )}
                    <span style={{ fontSize: 11, color: "#494949", textAlign: "center", maxWidth: 84, lineHeight: 1.3 }}>
                      {FULL_MARKETS[m.marketID] ?? allMarkets[m.marketID]}
                    </span>
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

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ShowcaseClient({ profiles, alumni, allMarkets, embedded = false }: Props) {
  const [tab, setTab] = useState<Tab>("all");
  // Each program's archive defaults to its most recent class so it opens
  // curated, not dense. Keyed per program; null means "all".
  const [alumYearByProgram, setAlumYearByProgram] = useState<Partial<Record<ProgramID, string | null>>>({});
  const [openProfile, setOpenProfile] = useState<Profile | null>(null);
  const { narrow, mid } = useNarrow();
  const frame = useEmbedFrame(embedded);
  // Shayla asked for slightly larger participant photos: 3-up on desktop
  const cols = narrow ? 2 : 3;
  const px = narrow ? 20 : 40;

  const visiblePrograms = PROGRAM_ORDER.filter((id) => tab === "all" || tab === id);

  const sectionInner: React.CSSProperties = { maxWidth: 1060, margin: "0 auto", padding: `0 ${px}px` };

  return (
    <div style={{ minHeight: embedded ? undefined : "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: "#000", position: "relative" }}>

      {/* Announcement-style mockup bar (AIM bright green, black text); left off the embed */}
      {!embedded && <div style={{
        backgroundColor: AIM_BRIGHT, color: "#000",
        padding: "9px 16px", fontSize: 14, textAlign: "center", lineHeight: 1.4,
      }}>
        Design mockup for AIM review — participant info comes from AIM&rsquo;s public program pages and market directory
      </div>}

      {/* ── Title block (white, centered, like AIM program pages) ── */}
      <div style={{ backgroundColor: "#fff", padding: `${narrow ? 44 : 64}px 0 ${narrow ? 30 : 40}px` }}>
        <div style={{ ...sectionInner, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-heading)", fontWeight: 500,
            fontSize: narrow ? 32 : 45, lineHeight: 1.15, color: AIM_GREEN,
            margin: "0 auto 16px", maxWidth: 760,
          }}>
            Farm &amp; Food Business Resources
          </h1>
          <p style={{
            margin: "0 auto 14px", fontSize: narrow ? 15 : 16.5, color: "#000",
            maxWidth: 640, lineHeight: 1.65,
          }}>
            AIM&rsquo;s Farm &amp; Food Business Resources support food and agricultural
            business growth to strengthen California&rsquo;s regional food system.
          </p>

          {/* Hero photo strip: whole, uncropped participant photos so each
              person and what they're holding stays in view (Meg, 2026-10-29) */}
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "flex-end",
            gap: narrow ? 6 : 10, flexWrap: "nowrap",
            marginTop: narrow ? 30 : 42, padding: "6px 0",
          }}>
            {(() => {
              const everyone = [...profiles, ...alumni];
              const hero = HERO_PHOTOS
                .map((src) => ({ src, profile: everyone.find((p) => p.photo === src) }))
                .slice(0, narrow ? 4 : 6);
              return hero.map(({ src, profile }) => (
                <img key={src} src={src} alt={profile ? `${profile.person}, ${profile.business}` : ""} style={{
                  height: narrow ? "auto" : 210, width: narrow ? "22vw" : "auto",
                  maxWidth: narrow ? "22vw" : 200, minWidth: 0, flexShrink: 1,
                  objectFit: "contain", display: "block", borderRadius: 4,
                }} />
              ));
            })()}
          </div>

          {/* Stats: flat, centered, green Ek Mukta numbers */}
          <div style={{
            display: "grid",
            gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: narrow ? "22px 12px" : 24,
            marginTop: narrow ? 32 : 44,
            maxWidth: 920, marginLeft: "auto", marginRight: "auto",
          }}>
            {STATS.map((s) => (
              <div key={s.value}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: narrow ? 32 : 40, color: AIM_GREEN, lineHeight: 1.1 }}>
                  <RollingStat value={s.value} />
                </div>
                <div style={{ fontSize: 13.5, color: "#000", lineHeight: 1.45, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#8a8878", marginTop: 12 }}>
            Figures from AIM, September 2026.
          </div>
        </div>
      </div>

      {/* ── Program squares (Shayla's design, 2026-10-28) ── */}
      <div id="aim-programs" style={{
        backgroundColor: "#eaece6", borderTop: "1px solid #e1e3db",
        padding: `${narrow ? 20 : 28}px 0`,
      }}>
        <div role="tablist" aria-label="Farm & Food programs" style={{
          maxWidth: 1180, margin: "0 auto", padding: `0 ${narrow ? 16 : 32}px`,
          display: "grid",
          gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(5, 1fr)",
          gap: narrow ? 10 : mid ? 12 : 18,
        }}>
          <ProgramSquare label="All Farm & Food Programs" active={tab === "all"}
            color={SQUARE_CREAM} text={INK} narrow={narrow} mid={mid} wide={narrow}
            onClick={() => setTab("all")} />
          {PROGRAM_ORDER.map((id) => {
            const p = PROGRAMS[id];
            return (
              <ProgramSquare key={id} label={p.name} active={tab === id}
                color={p.color} text={p.squareText} narrow={narrow} mid={mid}
                onClick={() => setTab(tab === id ? "all" : id)} />
            );
          })}
          <ProgramSquare label={TECHNICAL_ASSISTANCE.name} active={false}
            color={TECHNICAL_ASSISTANCE.color} text={TECHNICAL_ASSISTANCE.squareText}
            narrow={narrow} mid={mid} href={TECHNICAL_ASSISTANCE.url} />
        </div>
      </div>

      {/* "All" selected: Shayla's program overview copy */}
      {tab === "all" && (
        <div style={{ backgroundColor: "#fff", padding: `${narrow ? 30 : 44}px 0 ${narrow ? 34 : 48}px` }}>
          <div style={{ ...sectionInner, textAlign: "center" }}>
            <p style={{
              margin: "0 auto", maxWidth: 720,
              fontFamily: "var(--font-heading)", fontWeight: 500,
              fontSize: narrow ? 18 : 21, lineHeight: 1.55, color: "#000",
            }}>
              {ALL_PROGRAMS_COPY}
            </p>
          </div>
        </div>
      )}

      {/* ── Program sections (white / cream alternating) ── */}
      {visiblePrograms.map((id, idx) => {
        const program = PROGRAMS[id];
        const sectionProfiles = profiles.filter((p) => p.program === id);
        const bg = idx % 2 === 0 ? CREAM : "#fff";
        return (
          <section key={id} style={{ backgroundColor: bg, padding: `${narrow ? 40 : 56}px 0 ${narrow ? 48 : 64}px` }}>
            <div style={{ ...sectionInner, textAlign: "center" }}>
              <h2 style={{
                fontFamily: "var(--font-heading)", fontWeight: 500,
                fontSize: narrow ? 28 : 36, color: "#000", lineHeight: 1.2, marginBottom: 10,
              }}>
                {program.name}
              </h2>
              <p style={{ margin: "0 auto 10px", fontSize: 14.5, color: "#333", maxWidth: 600, lineHeight: 1.65 }}>
                {program.blurb}
              </p>
              <div style={{ display: "flex", gap: 22, justifyContent: "center", flexWrap: "wrap" }}>
                <a href={program.url} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 14, color: AIM_GREEN, fontWeight: 600,
                  textDecoration: "underline", textUnderlineOffset: 3,
                }}>
                  About the program
                </a>
                {program.applyUrl && (
                  <a href={program.applyUrl} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 14, color: AIM_GREEN, fontWeight: 600,
                    textDecoration: "underline", textUnderlineOffset: 3,
                  }}>
                    Apply to the Fund
                  </a>
                )}
              </div>

              {/* Application window: placeholder until Jack confirms each timeline */}
              <div style={{
                display: "inline-block", marginTop: 14,
                padding: "5px 16px", borderRadius: 300,
                border: `1.5px solid ${program.color}`, backgroundColor: "#fff",
                fontSize: 13, color: "#333",
              }}>
                <span style={{ fontWeight: 600 }}>Applications:</span>{" "}
                {program.applyWindow ?? "next window announced soon"}
              </div>

              {sectionProfiles.length > 0 && (
                <>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    marginTop: narrow ? 26 : 36,
                  }}>
                    <h3 style={{
                      fontFamily: "var(--font-heading)", fontWeight: 500,
                      fontSize: narrow ? 21 : 25, color: AIM_BRIGHT, lineHeight: 1.2,
                    }}>
                      Meet the 2026 Cohort
                    </h3>
                    <span style={{
                      padding: "3px 12px", borderRadius: 300,
                      backgroundColor: AIM_BRIGHT, color: "#0b3d1e",
                      fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 11.5,
                    }}>
                      Current
                    </span>
                  </div>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: narrow ? "28px 14px" : "36px 26px",
                    marginTop: narrow ? 22 : 28,
                  }}>
                    {sectionProfiles.map((p) => (
                      <ParticipantTile key={p.business} profile={p} allMarkets={allMarkets} onOpen={() => setOpenProfile(p)} />
                    ))}
                  </div>
                </>
              )}

              {/* Alumni archive: outgoing cohorts land here with their class */}
              {(() => {
                const programAlumni = alumni.filter((a) => a.program === id);
                if (programAlumni.length === 0) return null;
                const classes = [...new Set(programAlumni.map((a) => a.cohort))]
                  .sort((a, b) => cohortSortKey(b) - cohortSortKey(a));
                const selected = alumYearByProgram[id] !== undefined
                  ? alumYearByProgram[id]
                  : classes[0];
                const shown = selected ? programAlumni.filter((a) => a.cohort === selected) : programAlumni;
                const withPhoto = shown.filter((p) => bestPhoto(p));
                const withoutPhoto = shown.filter((p) => !bestPhoto(p));
                const intro = id === "maf"
                  ? "Businesses that got their start through the Market Access Fund. Many still sell at AIM markets today."
                  : id === "farmer"
                    ? "Farms that launched through the Incubator Booth, many moving on to permanent booths at AIM markets."
                    : "Food makers who got their start at the Incubator Booth.";
                const setSelected = (v: string | null) =>
                  setAlumYearByProgram((prev) => ({ ...prev, [id]: v }));
                return (
                  <div style={{ marginTop: narrow ? 44 : 60 }}>
                    <h3 style={{
                      fontFamily: "var(--font-heading)", fontWeight: 500,
                      fontSize: narrow ? 21 : 25, color: AIM_BRIGHT, marginBottom: 6,
                    }}>
                      Program Alumni
                    </h3>
                    <p style={{ margin: "0 auto 18px", fontSize: 14, color: "#333", maxWidth: 560, lineHeight: 1.6 }}>
                      {intro}
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: narrow ? 22 : 30 }}>
                      {classes.map((y) => (
                        <PillButton key={y}
                          label={`${y} (${programAlumni.filter((a) => a.cohort === y).length})`}
                          active={selected === y} color={AIM_GREEN} textOnColor="#fff"
                          onClick={() => setSelected(y)} />
                      ))}
                      {classes.length > 1 && (
                        <PillButton label={`All (${programAlumni.length})`} active={!selected} color={AIM_GREEN} textOnColor="#fff" onClick={() => setSelected(null)} />
                      )}
                    </div>
                    {withPhoto.length > 0 && (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${narrow ? 3 : mid ? 4 : 5}, 1fr)`,
                        gap: narrow ? "22px 12px" : "28px 20px",
                        maxWidth: 900, margin: "0 auto",
                      }}>
                        {withPhoto.map((p) => (
                          <ParticipantTile key={p.business} profile={p} allMarkets={allMarkets} compact onOpen={() => setOpenProfile(p)} />
                        ))}
                      </div>
                    )}
                    {withoutPhoto.length > 0 && (
                      <div style={{
                        display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
                        maxWidth: 760, margin: `${withPhoto.length > 0 ? (narrow ? 26 : 34) : 0}px auto 0`,
                      }}>
                        {withoutPhoto.map((p) => (
                          <button key={p.business} onClick={() => setOpenProfile(p)} style={{
                            padding: "6px 16px", borderRadius: 300, cursor: "pointer",
                            border: "1.5px solid #b9b6a4", backgroundColor: "#fff",
                            color: "#333", fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 13.5,
                            whiteSpace: "nowrap",
                          }}>
                            {p.business}
                            {!selected && <span style={{ marginLeft: 6, fontSize: 11.5, color: "#8a8878" }}>{p.cohort}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </section>
        );
      })}

      {/* ── Technical Assistance and Education (no cohort; links to AIM's page) ── */}
      {tab === "all" && (
        <section style={{
          backgroundColor: visiblePrograms.length % 2 === 0 ? CREAM : "#fff",
          padding: `${narrow ? 40 : 56}px 0 ${narrow ? 44 : 60}px`,
        }}>
          <div style={{ ...sectionInner, textAlign: "center" }}>
            <h2 style={{
              fontFamily: "var(--font-heading)", fontWeight: 500,
              fontSize: narrow ? 28 : 36, color: "#000", lineHeight: 1.2, marginBottom: 10,
            }}>
              {TECHNICAL_ASSISTANCE.name}
            </h2>
            <p style={{ margin: "0 auto 10px", fontSize: 14.5, color: "#333", maxWidth: 600, lineHeight: 1.65 }}>
              {TECHNICAL_ASSISTANCE.blurb}
            </p>
            <a href={TECHNICAL_ASSISTANCE.url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 14, color: AIM_GREEN, fontWeight: 600,
              textDecoration: "underline", textUnderlineOffset: 3,
            }}>
              About the program
            </a>
          </div>
        </section>
      )}

      {/* ── Testimonial (white) ── */}
      <div style={{ backgroundColor: "#fff", padding: `${narrow ? 44 : 64}px 0` }}>
        <div style={{ ...sectionInner, textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 52, color: AIM_BRIGHT, lineHeight: 0.5, marginBottom: 18 }}>&ldquo;</div>
          <blockquote style={{
            margin: "0 auto", maxWidth: 620,
            fontFamily: "var(--font-heading)", fontWeight: 500,
            fontSize: narrow ? 20 : 26, lineHeight: 1.4, color: "#000",
          }}>
            I loved the part where I did not have to pay the money back — a grant and not a loan.
          </blockquote>
          <div style={{ marginTop: 14, fontSize: 14, color: "#494949" }}>
            Tatiana Thomas · Josephine&rsquo;s Southern Cuisine · Market Access Fund, 2023
          </div>
        </div>
      </div>

      {/* ── Closing statement (Shayla's copy) ── */}
      <div style={{ backgroundColor: "#fff", padding: `${narrow ? 40 : 56}px 0` }}>
        <div style={{ ...sectionInner, textAlign: "center" }}>
          <p style={{
            margin: "0 auto", maxWidth: 620,
            fontFamily: "var(--font-heading)", fontWeight: 500,
            fontSize: narrow ? 19 : 24, lineHeight: 1.45, color: AIM_GREEN,
          }}>
            Farmers markets are both a sales outlet and an opportunity for expansion
            and success. Our programs help our market participants thrive.
          </p>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e4e2d4", padding: "20px 16px 28px" }}>
        <p style={{
          margin: "0 auto", maxWidth: 720, fontSize: 12.5, color: "#8a8878",
          lineHeight: 1.6, textAlign: "center",
        }}>
          {!embedded && "Design mockup prepared by Aioli Consulting for the Agricultural Institute of Marin. "}
          Participant details come from AIM&rsquo;s public program pages and the Manage My Market
          directory, and only include vendors who have opted in to information sharing.
        </p>
      </div>

      {openProfile && (
        <ProfileModal
          profile={openProfile}
          allMarkets={allMarkets}
          narrow={narrow}
          onClose={() => setOpenProfile(null)}
          embedded={embedded}
          frame={frame}
        />
      )}
    </div>
  );
}
