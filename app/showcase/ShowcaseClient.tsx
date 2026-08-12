"use client";

import { useState, useEffect } from "react";
import { Profile, Program, ProgramID, PROGRAMS, FARMER_GRADUATES } from "@/lib/showcase";

interface Props {
  profiles: Profile[];
  alumni: Profile[];
  allMarkets: Record<number, string>;
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

const PROGRAM_ORDER: ProgramID[] = ["maf", "farmer", "foodmaker"];
type Tab = ProgramID | "all";

const STATS = [
  { value: "21", label: "participants in the 2026 cohorts" },
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
  return profile.aimPhoto ?? profile.vendor?.photo?.trim() ?? null;
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

function ProgramTag({ program }: { program: Program }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 14px",
      borderRadius: 300,
      backgroundColor: program.color,
      color: program.textOnColor,
      fontFamily: "var(--font-heading)",
      fontWeight: 600,
      fontSize: 12,
      letterSpacing: "0.03em",
      lineHeight: 1.5,
    }}>
      {program.shortName}
    </span>
  );
}

function SocialLinks({ profile, centered }: { profile: Profile; centered?: boolean }) {
  const v = profile.vendor;
  if (!v) return null;
  const links: { label: string; href: string }[] = [];
  if (v.website?.trim() && v.website.trim() !== " ") {
    links.push({ label: "Website", href: v.website.startsWith("http") ? v.website : `https://${v.website.trim()}` });
  }
  if (v.instagram_profile?.trim() && v.instagram_profile.trim() !== " ") {
    links.push({ label: "Instagram", href: v.instagram_profile });
  }
  if (v.facebook_profile?.trim() && v.facebook_profile.trim() !== " ") {
    links.push({ label: "Facebook", href: v.facebook_profile });
  }
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
          <img src={photo} alt={`${profile.person}, ${profile.business}`}
            style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
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
      {compact ? (
        <div style={{ fontSize: 12.5, color: "#8a8878" }}>Class of {profile.cohort}</div>
      ) : (
        <div style={{ fontSize: 14, color: "#494949", marginBottom: 4 }}>{profile.person}</div>
      )}
      {markets.length > 0 && (
        <div style={{ fontSize: compact ? 12 : 13, color: AIM_GREEN, marginBottom: compact ? 0 : 6, marginTop: compact ? 2 : 0 }}>
          {compact ? "Still at the markets" : markets.map((m) => allMarkets[m.marketID]).join(" · ")}
        </div>
      )}
      {!compact && (
        <span style={{
          fontSize: 13.5, color: AIM_GREEN, fontWeight: 600,
          borderBottom: hovered ? `1.5px solid ${AIM_GREEN}` : "1.5px solid transparent",
          paddingBottom: 1, transition: "border-color 0.12s ease",
        }}>
          Their story →
        </span>
      )}
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
  const photo = bestPhoto(profile);
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
      backgroundColor: "rgba(20,30,20,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: narrow ? 12 : 32,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        backgroundColor: "#fff",
        width: "100%", maxWidth: 760, maxHeight: "90vh", overflowY: "auto",
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
          minHeight: narrow ? 240 : 380,
          position: "relative",
        }}>
          {photo ? (
            <img src={photo} alt={`${profile.person}, ${profile.business}`}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }} />
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
            <ProgramTag program={program} />
            <h2 style={{
              fontFamily: "var(--font-heading)", fontWeight: 500,
              fontSize: narrow ? 26 : 30, color: "#000", lineHeight: 1.2, margin: "14px 0 2px",
            }}>
              {profile.business}
            </h2>
            <span style={{ fontSize: 15, color: "#494949" }}>
              {profile.person}
              {profile.alum ? ` · Class of ${profile.cohort}` : ""}
            </span>
          </div>

          {story ? (
            <p style={{ margin: 0, fontSize: 14.5, color: "#222", lineHeight: 1.75 }}>{story}</p>
          ) : (
            <p style={{ margin: 0, fontSize: 14.5, color: "#8a8878", lineHeight: 1.75, fontStyle: "italic" }}>
              Their full profile is coming soon.
            </p>
          )}

          {markets.length > 0 && (
            <div>
              <div style={{
                fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 17,
                color: AIM_BRIGHT, marginBottom: 8,
              }}>
                Find them at
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {markets.map((m) => (
                  <div key={m.marketID} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    {MARKET_LOGOS[m.marketID] ? (
                      <img src={MARKET_LOGOS[m.marketID]} alt={allMarkets[m.marketID]}
                        style={{ width: 54, height: 54, objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: 54, height: 54, background: program.color }} />
                    )}
                    <span style={{ fontSize: 11, color: "#494949", textAlign: "center", maxWidth: 60, lineHeight: 1.3 }}>
                      {allMarkets[m.marketID]}
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

export default function ShowcaseClient({ profiles, alumni, allMarkets }: Props) {
  const [tab, setTab] = useState<Tab>("all");
  const [alumYear, setAlumYear] = useState<string | null>(null);
  const [openProfile, setOpenProfile] = useState<Profile | null>(null);
  const { narrow, mid } = useNarrow();
  const cols = narrow ? 2 : mid ? 3 : 4;
  const px = narrow ? 20 : 40;

  const visiblePrograms = PROGRAM_ORDER.filter((id) => tab === "all" || tab === id);

  const sectionInner: React.CSSProperties = { maxWidth: 1060, margin: "0 auto", padding: `0 ${px}px` };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: "#000" }}>

      {/* Announcement-style mockup bar (AIM bright green, black text) */}
      <div style={{
        backgroundColor: AIM_BRIGHT, color: "#000",
        padding: "9px 16px", fontSize: 14, textAlign: "center", lineHeight: 1.4,
      }}>
        Design mockup for AIM review — participant info comes from AIM&rsquo;s public program pages and market directory
      </div>

      {/* ── Title block (white, centered, like AIM program pages) ── */}
      <div style={{ backgroundColor: "#fff", padding: `${narrow ? 44 : 64}px 0 ${narrow ? 30 : 40}px` }}>
        <div style={{ ...sectionInner, textAlign: "center" }}>
          <h1 style={{
            fontFamily: "var(--font-heading)", fontWeight: 500,
            fontSize: narrow ? 34 : 45, lineHeight: 1.15, color: AIM_GREEN,
            margin: "0 0 16px",
          }}>
            Meet the People Behind the Booths
          </h1>
          <p style={{
            margin: "0 auto", fontSize: narrow ? 15 : 16.5, color: "#000",
            maxWidth: 620, lineHeight: 1.65,
          }}>
            Every season, AIM&rsquo;s Market Access Fund and Incubator Booth programs bring new
            farmers and food makers to our markets. Meet the 2026 cohorts — what they grow,
            what they make, and where to find them.
          </p>

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
                  {s.value}
                </div>
                <div style={{ fontSize: 13.5, color: "#000", lineHeight: 1.45, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#8a8878", marginTop: 12 }}>
            Figures from AIM&rsquo;s program pages, January 2026.
          </div>
        </div>
      </div>

      {/* ── Sticky program tabs (pill buttons) ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 20,
        backgroundColor: CREAM, borderTop: "1px solid #e4e2d4", borderBottom: "1px solid #e4e2d4",
        padding: "12px 16px",
      }}>
        <div style={{
          display: "flex", gap: 8, justifyContent: narrow ? "flex-start" : "center",
          overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none",
        }}>
          <PillButton label="All programs" active={tab === "all"} color={AIM_GREEN} textOnColor="#fff" onClick={() => setTab("all")} />
          {PROGRAM_ORDER.map((id) => {
            const p = PROGRAMS[id];
            const count = id === "foodmaker" ? 5 : profiles.filter((x) => x.program === id).length;
            return (
              <PillButton key={id}
                label={`${p.shortName} (${count})`}
                active={tab === id}
                color={p.color}
                textOnColor={p.textOnColor}
                onClick={() => setTab(tab === id ? "all" : id)} />
            );
          })}
        </div>
      </div>

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
              <a href={program.url} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 14, color: AIM_GREEN, fontWeight: 600,
                textDecoration: "underline", textUnderlineOffset: 3,
              }}>
                About the program
              </a>

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

              {/* Alumni archive: outgoing cohorts land here with their year */}
              {id === "maf" && alumni.length > 0 && (() => {
                const years = [...new Set(alumni.map((a) => a.cohort))].sort().reverse();
                const shown = alumYear ? alumni.filter((a) => a.cohort === alumYear) : alumni;
                return (
                  <div style={{ marginTop: narrow ? 44 : 60 }}>
                    <h3 style={{
                      fontFamily: "var(--font-heading)", fontWeight: 500,
                      fontSize: narrow ? 21 : 25, color: AIM_BRIGHT, marginBottom: 6,
                    }}>
                      Program Alumni
                    </h3>
                    <p style={{ margin: "0 auto 18px", fontSize: 14, color: "#333", maxWidth: 560, lineHeight: 1.6 }}>
                      Businesses that got their start through the Market Access Fund.
                      Many still sell at AIM markets today.
                    </p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: narrow ? 22 : 30 }}>
                      <PillButton label="All years" active={!alumYear} color={AIM_GREEN} textOnColor="#fff" onClick={() => setAlumYear(null)} />
                      {years.map((y) => (
                        <PillButton key={y} label={y} active={alumYear === y} color={AIM_GREEN} textOnColor="#fff"
                          onClick={() => setAlumYear(alumYear === y ? null : y)} />
                      ))}
                    </div>
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: `repeat(${narrow ? 3 : mid ? 4 : 6}, 1fr)`,
                      gap: narrow ? "22px 12px" : "28px 20px",
                    }}>
                      {shown.map((p) => (
                        <ParticipantTile key={p.business} profile={p} allMarkets={allMarkets} compact onOpen={() => setOpenProfile(p)} />
                      ))}
                    </div>
                  </div>
                );
              })()}

              {id === "farmer" && (
                <div style={{ marginTop: narrow ? 44 : 60 }}>
                  <h3 style={{
                    fontFamily: "var(--font-heading)", fontWeight: 500,
                    fontSize: narrow ? 21 : 25, color: AIM_BRIGHT, marginBottom: 6,
                  }}>
                    Program Graduates
                  </h3>
                  <p style={{ margin: "0 auto 20px", fontSize: 14, color: "#333", maxWidth: 560, lineHeight: 1.6 }}>
                    {FARMER_GRADUATES.length} farms have launched through the Incubator Booth,
                    many moving on to permanent booths at AIM markets.
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 760, margin: "0 auto" }}>
                    {FARMER_GRADUATES.map((farm) => (
                      <span key={farm} style={{
                        padding: "6px 16px", borderRadius: 300,
                        border: `1.5px solid ${program.color}`,
                        color: "#1d4d1d", backgroundColor: "#fff",
                        fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 13.5,
                        whiteSpace: "nowrap",
                      }}>
                        {farm}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {id === "foodmaker" && (
                <div style={{
                  maxWidth: 560, margin: `${narrow ? 28 : 36}px auto 0`,
                  backgroundColor: "#fff", border: `1.5px solid ${program.color}`,
                  padding: narrow ? "26px 22px" : "34px 38px",
                }}>
                  <div style={{
                    fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 22, color: "#000", marginBottom: 8,
                  }}>
                    Five food makers join the markets this summer
                  </div>
                  <p style={{ margin: "0 0 18px", fontSize: 14, color: "#333", lineHeight: 1.65 }}>
                    Meet the newest cohort here soon.
                  </p>
                  <a href="/showcase/intake" style={{
                    display: "inline-block", padding: "10px 26px", borderRadius: 300,
                    backgroundColor: program.color, color: program.textOnColor,
                    fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, letterSpacing: "0.02em",
                    textDecoration: "none",
                  }}>
                    Participants: add your profile
                  </a>
                </div>
              )}
            </div>
          </section>
        );
      })}

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

      {/* ── How profiles stay current (cream) ── */}
      <div style={{ backgroundColor: CREAM, padding: `${narrow ? 44 : 64}px 0 ${narrow ? 48 : 68}px` }}>
        <div style={{ ...sectionInner, textAlign: "center" }}>
          <h2 style={{
            fontFamily: "var(--font-heading)", fontWeight: 500,
            fontSize: narrow ? 28 : 36, color: "#000", marginBottom: 12,
          }}>
            Are You a Program Participant?
          </h2>
          <p style={{ margin: `0 auto ${narrow ? 26 : 36}px`, fontSize: 15, color: "#333", maxWidth: 520, lineHeight: 1.65 }}>
            Add your business to the showcase. It takes about five minutes.
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: narrow ? "1fr" : "repeat(3, 1fr)",
            gap: narrow ? 22 : 34, maxWidth: 940, margin: "0 auto",
            textAlign: "center",
          }}>
            {[
              { n: "1", title: "Share your story", body: "Tell us about your business in your own words: your photo, your story, what you sell, and where to find you." },
              { n: "2", title: "AIM reviews it", body: "Program staff look over every submission before it publishes." },
              { n: "3", title: "Your profile goes live", body: "Your business joins your cohort here, with a profile you can share right from your booth." },
            ].map((step) => (
              <div key={step.n}>
                <div style={{
                  width: 44, height: 44, borderRadius: 300, margin: "0 auto 14px",
                  backgroundColor: AIM_GREEN, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19,
                }}>
                  {step.n}
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 20, color: "#000", marginBottom: 6 }}>
                  {step.title}
                </h3>
                <p style={{ margin: "0 auto", fontSize: 14, color: "#333", lineHeight: 1.65, maxWidth: 300 }}>{step.body}</p>
              </div>
            ))}
          </div>
          <a href="/showcase/intake" style={{
            display: "inline-block", marginTop: narrow ? 26 : 34,
            padding: "11px 28px", borderRadius: 300,
            backgroundColor: AIM_GREEN, color: "#fff",
            fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14.5, letterSpacing: "0.02em",
            textDecoration: "none",
          }}>
            Add your profile
          </a>
        </div>
      </div>

      {/* ── Footer note ── */}
      <div style={{ backgroundColor: "#fff", borderTop: "1px solid #e4e2d4", padding: "20px 16px 28px" }}>
        <p style={{
          margin: "0 auto", maxWidth: 720, fontSize: 12.5, color: "#8a8878",
          lineHeight: 1.6, textAlign: "center",
        }}>
          Design mockup prepared by Aioli Consulting for the Agricultural Institute of Marin.
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
        />
      )}
    </div>
  );
}
