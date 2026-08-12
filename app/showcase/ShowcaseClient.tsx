"use client";

import { useState, useEffect, useMemo } from "react";
import { Profile, Program, ProgramID, PROGRAMS } from "@/lib/showcase";

interface Props {
  profiles: Profile[];
  allMarkets: Record<number, string>;
}

const MARKET_COLORS: Record<number, string> = {
  7776: "#E0368A",
  7781: "#4A3C96",
  7782: "#C83828",
  7783: "#E8956A",
  7784: "#5A8C38",
  7785: "#C8A820",
  7786: "#E0368A",
  7803: "#C83860",
  8211: "#4A9CB8",
};

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

const PROGRAM_ORDER: ProgramID[] = ["maf", "farmer", "foodmaker"];

const STATS = [
  { value: "21", label: "participants across the 2026 cohorts" },
  { value: "31", label: "first-generation farmers supported since 2022" },
  { value: "72%", label: "of Fund recipients still sell at AIM markets" },
  { value: "$130K+", label: "in waived fees and business stipends" },
];

function initials(business: string): string {
  return business
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// Feed descriptions like "will write later" or "Flower farm." read as broken;
// below this length the intake-form placeholder tells a better story.
function usableStory(desc: string | undefined): string | null {
  const clean = desc?.trim();
  return clean && clean.length >= 30 ? clean : null;
}

function trimStory(desc: string, max = 150): string {
  const clean = desc.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
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

function useCols() {
  const [width, setWidth] = useState(1024);
  useEffect(() => {
    const update = () => setWidth(window.innerWidth);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return { cols: width < 640 ? 1 : width < 980 ? 2 : 3, narrow: width < 640 };
}

// ── Small pieces ───────────────────────────────────────────────────────────────

function ProgramTag({ program, size = "sm" }: { program: Program; size?: "sm" | "md" }) {
  return (
    <span style={{
      display: "inline-block",
      padding: size === "sm" ? "3px 8px" : "5px 12px",
      backgroundColor: program.color,
      color: "#fff",
      fontFamily: "var(--font-heading)",
      fontWeight: 700,
      fontSize: size === "sm" ? 10 : 11,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      lineHeight: 1.4,
    }}>
      {program.shortName}
    </span>
  );
}

function SocialLinks({ profile, color }: { profile: Profile; color: string }) {
  const v = profile.vendor;
  if (!v) return null;
  const links: { label: string; href: string; icon: React.ReactNode }[] = [];
  if (v.website?.trim() && v.website.trim() !== " ") {
    links.push({
      label: "Website",
      href: v.website.startsWith("http") ? v.website : `https://${v.website.trim()}`,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    });
  }
  if (v.instagram_profile?.trim() && v.instagram_profile.trim() !== " ") {
    links.push({
      label: "Instagram",
      href: v.instagram_profile,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
    });
  }
  if (v.facebook_profile?.trim() && v.facebook_profile.trim() !== " ") {
    links.push({
      label: "Facebook",
      href: v.facebook_profile,
      icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
    });
  }
  if (!links.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{ fontSize: 13, color, textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}>
          {l.icon}{l.label}
        </a>
      ))}
    </div>
  );
}

// ── Profile card ───────────────────────────────────────────────────────────────

function ProfileCard({ profile, allMarkets, onOpen }: {
  profile: Profile;
  allMarkets: Record<number, string>;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const program = PROGRAMS[profile.program];
  const photo = profile.vendor?.photo?.trim();
  const story = usableStory(profile.vendor?.description);
  const markets = knownMarkets(profile, allMarkets);

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#fff",
        border: "1px solid #dddcd3",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "0 10px 28px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.05)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
      }}
    >
      {/* Photo / placeholder */}
      <div style={{ position: "relative", aspectRatio: "4 / 3", overflow: "hidden", backgroundColor: program.tint }}>
        {photo ? (
          <img src={photo} alt={profile.business}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 6,
          }}>
            <span style={{
              fontFamily: "var(--font-heading)", fontWeight: 700,
              fontSize: 54, color: program.color, opacity: 0.5, lineHeight: 1,
            }}>
              {initials(profile.business)}
            </span>
            <span style={{ fontSize: 11, color: program.color, opacity: 0.65 }}>
              Photo coming soon
            </span>
          </div>
        )}
        <div style={{ position: "absolute", top: 10, left: 10 }}>
          <ProgramTag program={program} />
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div>
          <h3 style={{
            fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18,
            color: "#111", lineHeight: 1.25, marginBottom: 3,
          }}>
            {profile.business}
          </h3>
          <span style={{ fontSize: 13, color: "#777" }}>{profile.person}</span>
        </div>

        {story ? (
          <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.6, flex: 1 }}>
            {trimStory(story)}
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: "#a5a294", lineHeight: 1.6, fontStyle: "italic", flex: 1 }}>
            Story coming soon — collected through the participant intake form.
          </p>
        )}

        {markets.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {markets.map((m) => (
              <span key={m.marketID} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 11, color: "#555", border: "1px solid #e3e2d8",
                backgroundColor: "#faf9f2", padding: "3px 8px", whiteSpace: "nowrap",
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  backgroundColor: MARKET_COLORS[m.marketID] ?? "#0d8240", flexShrink: 0,
                }} />
                {allMarkets[m.marketID]}
              </span>
            ))}
          </div>
        )}

        <SocialLinks profile={profile} color={program.color} />
      </div>
    </div>
  );
}

// ── Detail overlay ─────────────────────────────────────────────────────────────

function ProfileModal({ profile, allMarkets, narrow, onClose }: {
  profile: Profile;
  allMarkets: Record<number, string>;
  narrow: boolean;
  onClose: () => void;
}) {
  const program = PROGRAMS[profile.program];
  const photo = profile.vendor?.photo?.trim();
  const story = usableStory(profile.vendor?.description);
  const markets = knownMarkets(profile, allMarkets);

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
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 100,
      backgroundColor: "rgba(30,28,20,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: narrow ? 12 : 32,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: "#fffef8",
        width: "100%", maxWidth: 780, maxHeight: "90vh", overflowY: "auto",
        display: "flex", flexDirection: narrow ? "column" : "row",
        boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
        borderTop: `4px solid ${program.color}`,
        position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 10, right: 12, zIndex: 2,
          background: "rgba(255,255,255,0.9)", border: "1px solid #ddd",
          width: 30, height: 30, cursor: "pointer", fontSize: 16, lineHeight: 1, color: "#333",
        }}>×</button>

        {/* Photo side */}
        <div style={{
          flex: narrow ? undefined : "0 0 44%",
          backgroundColor: program.tint,
          minHeight: narrow ? 220 : 380,
          position: "relative",
        }}>
          {photo ? (
            <img src={photo} alt={profile.business}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }} />
          ) : (
            <div style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
            }}>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 72, color: program.color, opacity: 0.45, lineHeight: 1 }}>
                {initials(profile.business)}
              </span>
              <span style={{ fontSize: 12, color: program.color, opacity: 0.65 }}>Photo coming soon</span>
            </div>
          )}
        </div>

        {/* Info side */}
        <div style={{ flex: 1, padding: narrow ? "22px 20px 26px" : "30px 32px 34px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <ProgramTag program={program} size="md" />
            <h2 style={{
              fontFamily: "var(--font-heading)", fontWeight: 700,
              fontSize: narrow ? 24 : 28, color: "#111", lineHeight: 1.2, margin: "12px 0 4px",
            }}>
              {profile.business}
            </h2>
            <span style={{ fontSize: 14, color: "#777" }}>{profile.person}</span>
          </div>

          {story ? (
            <p style={{ margin: 0, fontSize: 14, color: "#3d3b33", lineHeight: 1.75 }}>{story}</p>
          ) : (
            <p style={{ margin: 0, fontSize: 14, color: "#a5a294", lineHeight: 1.75, fontStyle: "italic" }}>
              This participant’s story will be added through the intake form — a five-minute
              questionnaire covering their background, what they make or grow, and what market
              customers should know.
            </p>
          )}

          {markets.length > 0 && (
            <div>
              <div style={{
                fontSize: 10, fontFamily: "var(--font-heading)", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.1em", color: "#a3a196", marginBottom: 8,
              }}>
                Find them at
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {markets.map((m) => (
                  <div key={m.marketID} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    {MARKET_LOGOS[m.marketID] ? (
                      <img src={MARKET_LOGOS[m.marketID]} alt={allMarkets[m.marketID]}
                        style={{ width: 52, height: 52, objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: 52, height: 52, background: MARKET_COLORS[m.marketID] ?? "#0d8240" }} />
                    )}
                    <span style={{ fontSize: 10, color: "#666", textAlign: "center", maxWidth: 56, lineHeight: 1.3 }}>
                      {allMarkets[m.marketID]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <SocialLinks profile={profile} color={program.color} />
        </div>
      </div>
    </div>
  );
}

// ── Ghost card (Food Maker cohort, intake pending) ─────────────────────────────

function GhostCard({ program }: { program: Program }) {
  return (
    <div style={{
      border: `1.5px dashed ${program.color}66`,
      backgroundColor: "#fdfcf5",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 10, padding: "42px 24px", minHeight: 300, textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        backgroundColor: program.tint, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 26, color: program.color, lineHeight: 1, fontWeight: 400 }}>+</span>
      </div>
      <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "#57544a" }}>
        2026 cohort member
      </span>
      <p style={{ margin: 0, fontSize: 12.5, color: "#8b887c", lineHeight: 1.6, maxWidth: 220 }}>
        Profiles publish here as each food maker completes the five-minute intake form.
      </p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────

export default function ShowcaseClient({ profiles, allMarkets }: Props) {
  const [filter, setFilter] = useState<ProgramID | null>(null);
  const [openProfile, setOpenProfile] = useState<Profile | null>(null);
  const { cols, narrow } = useCols();
  const px = narrow ? 20 : 40;

  const counts = useMemo(() => {
    const c: Record<ProgramID, number> = { maf: 0, farmer: 0, foodmaker: 5 };
    for (const p of profiles) c[p.program]++;
    return c;
  }, [profiles]);

  const visiblePrograms = PROGRAM_ORDER.filter((id) => !filter || filter === id);

  return (
    <div style={{ minHeight: "100vh", padding: "0 16px 60px", fontFamily: "var(--font-body)" }}>
      <div style={{
        maxWidth: 1080, margin: "0 auto",
        backgroundColor: "#f6f5ea",
        boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 24px rgba(0,0,0,0.08)",
        borderRadius: "0 0 8px 8px",
        overflow: "hidden",
      }}>

        {/* Mockup ribbon */}
        <div style={{
          backgroundColor: "#2e2c24", color: "#e8e6d8",
          padding: "7px 16px", fontSize: 11.5, textAlign: "center", letterSpacing: "0.02em",
        }}>
          Design mockup for review — participant details from AIM’s public program pages and market directory
        </div>

        {/* ── Hero ── */}
        <div style={{ padding: `${narrow ? 36 : 56}px ${px}px ${narrow ? 30 : 42}px`, borderBottom: "1px solid #d8d8d8" }}>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.12em", color: "#0d8240", marginBottom: 14,
          }}>
            Agricultural Institute of Marin · Farm &amp; Food Business Programs
          </div>
          <h1 style={{
            fontFamily: "var(--font-heading)", fontWeight: 600,
            fontSize: narrow ? 34 : 52, lineHeight: 1.08, color: "#111",
            margin: "0 0 18px", maxWidth: 720, letterSpacing: "-0.01em",
          }}>
            The people behind<br />the booths.
          </h1>
          <p style={{ margin: 0, fontSize: narrow ? 14.5 : 16, color: "#494949", maxWidth: 560, lineHeight: 1.65 }}>
            Every season, AIM’s Market Access Fund and Incubator Booth programs bring new
            farmers and food makers to Bay Area markets. Meet the 2026 cohorts — what they
            grow, what they make, and where to find them.
          </p>

          {/* Stats */}
          <div style={{
            display: "grid",
            gridTemplateColumns: narrow ? "1fr 1fr" : "repeat(4, 1fr)",
            gap: 1, marginTop: narrow ? 28 : 40,
            backgroundColor: "#dddcd3", border: "1px solid #dddcd3",
          }}>
            {STATS.map((s) => (
              <div key={s.value} style={{ backgroundColor: "#fffef8", padding: narrow ? "16px 14px" : "20px 20px" }}>
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: narrow ? 26 : 32, color: "#0d8240", lineHeight: 1.1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: "#6b695e", lineHeight: 1.45, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "#a3a196", marginTop: 8 }}>
            Figures from AIM’s program pages, January 2026.
          </div>
        </div>

        {/* ── Filter row ── */}
        <div style={{
          position: "sticky", top: 0, zIndex: 20,
          backgroundColor: "#f6f5ea", borderBottom: "1px solid #dddcd3",
          boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
          padding: `12px ${px}px`, display: "flex", gap: 6, overflowX: "auto",
        }}>
          <button onClick={() => setFilter(null)} style={{
            flexShrink: 0, padding: "6px 14px", fontFamily: "var(--font-body)", fontSize: 13,
            cursor: "pointer", border: `1px solid ${!filter ? "#111" : "#d8d8d8"}`,
            backgroundColor: !filter ? "#111" : "#fff", color: !filter ? "#fff" : "#494949",
            fontWeight: !filter ? 600 : 400, whiteSpace: "nowrap",
          }}>
            All programs
          </button>
          {PROGRAM_ORDER.map((id) => {
            const p = PROGRAMS[id];
            const active = filter === id;
            return (
              <button key={id} onClick={() => setFilter(active ? null : id)} style={{
                flexShrink: 0, padding: "6px 14px", fontFamily: "var(--font-body)", fontSize: 13,
                cursor: "pointer", border: `1px solid ${active ? p.color : `${p.color}55`}`,
                backgroundColor: active ? p.color : "#fff", color: active ? "#fff" : p.color,
                fontWeight: active ? 600 : 500, whiteSpace: "nowrap",
              }}>
                {p.shortName}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: active ? 0.85 : 0.6 }}>{counts[id]}</span>
              </button>
            );
          })}
        </div>

        {/* ── Program sections ── */}
        <div style={{ padding: `8px ${px}px 0` }}>
          {visiblePrograms.map((id) => {
            const program = PROGRAMS[id];
            const sectionProfiles = profiles.filter((p) => p.program === id);
            return (
              <section key={id} style={{ padding: "36px 0 44px", borderBottom: "1px solid #e4e3d8" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginBottom: 6 }}>
                  <h2 style={{
                    fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: narrow ? 24 : 30,
                    color: "#111", lineHeight: 1.2,
                    borderBottom: `3px solid ${program.color}`, paddingBottom: 4,
                  }}>
                    {program.name}
                  </h2>
                  <a href={program.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: 13, color: program.color, textDecoration: "none", fontWeight: 500, whiteSpace: "nowrap",
                  }}>
                    About the program →
                  </a>
                </div>
                <p style={{ margin: "8px 0 26px", fontSize: 14, color: "#6b695e", maxWidth: 620, lineHeight: 1.6 }}>
                  {program.blurb}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: narrow ? 16 : 22 }}>
                  {sectionProfiles.map((p) => (
                    <ProfileCard key={p.business} profile={p} allMarkets={allMarkets} onOpen={() => setOpenProfile(p)} />
                  ))}
                  {id === "foodmaker" &&
                    Array.from({ length: narrow ? 2 : 3 }, (_, i) => <GhostCard key={i} program={program} />)}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Testimonial ── */}
        <div style={{ padding: `${narrow ? 40 : 56}px ${px}px`, borderBottom: "1px solid #e4e3d8", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 44, color: "#0d8240", lineHeight: 0.6, marginBottom: 14 }}>“</div>
          <blockquote style={{
            margin: "0 auto", maxWidth: 560,
            fontFamily: "var(--font-heading)", fontWeight: 500,
            fontSize: narrow ? 19 : 24, lineHeight: 1.45, color: "#2c2a22",
          }}>
            I loved the part where I did not have to pay the money back — a grant and not a loan.
          </blockquote>
          <div style={{ marginTop: 14, fontSize: 13, color: "#8b887c" }}>
            Tatiana Thomas · Josephine’s Southern Cuisine · Market Access Fund, 2023
          </div>
        </div>

        {/* ── Intake concept ── */}
        <div style={{ padding: `${narrow ? 40 : 56}px ${px}px` }}>
          <div style={{
            fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 500,
            textTransform: "uppercase", letterSpacing: "0.12em", color: "#0d8240", marginBottom: 10,
          }}>
            How profiles stay current
          </div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: narrow ? 24 : 30, color: "#111", marginBottom: 24 }}>
            Built to onboard every future cohort
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(3, 1fr)", gap: narrow ? 14 : 22, marginBottom: 28 }}>
            {[
              { n: "1", title: "Participants submit", body: "A five-minute intake form collects each participant’s photo, story, products, markets, and links — in their own words." },
              { n: "2", title: "AIM approves", body: "Staff review each submission before anything publishes. No manual page-building, no copying between systems." },
              { n: "3", title: "The profile goes live", body: "Each maker gets a page they’re proud to share from their booth — and AIM gets a lasting showcase for every cohort." },
            ].map((step) => (
              <div key={step.n} style={{ backgroundColor: "#fffef8", border: "1px solid #dddcd3", padding: "22px 22px 24px" }}>
                <div style={{
                  width: 32, height: 32, backgroundColor: "#0d8240", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, marginBottom: 14,
                }}>
                  {step.n}
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "#111", marginBottom: 6 }}>
                  {step.title}
                </h3>
                <p style={{ margin: 0, fontSize: 13, color: "#6b695e", lineHeight: 1.6 }}>{step.body}</p>
              </div>
            ))}
          </div>
          <span style={{
            display: "inline-block", padding: "10px 22px",
            backgroundColor: "#0d8240", color: "#fff",
            fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600,
          }}>
            Preview the intake form
          </span>
          <span style={{ marginLeft: 12, fontSize: 12, color: "#a3a196" }}>Part of the full build</span>
        </div>

        {/* ── Footer note ── */}
        <div style={{ padding: `18px ${px}px 26px`, borderTop: "1px solid #dddcd3", fontSize: 11.5, color: "#a3a196", lineHeight: 1.6 }}>
          Design mockup prepared by Aioli Consulting for the Agricultural Institute of Marin.
          Participant details come from AIM’s public program pages and the Manage My Market
          directory, and only include vendors who have opted in to information sharing.
        </div>
      </div>

      {openProfile && (
        <ProfileModal
          profile={openProfile}
          allMarkets={allMarkets}
          narrow={narrow}
          onClose={() => setOpenProfile(null)}
        />
      )}
    </div>
  );
}
