"use client";

import { useState } from "react";
import { ProgramID, PROGRAMS } from "@/lib/showcase";

interface Props {
  allMarkets: Record<number, string>;
}

// AIM style guide tokens (Shayla, 2026-11-19), defined on .aim-sg in
// ../style-guide.css, which wraps this page.
const AIM_GREEN = "var(--sg-green-700)";
const CREAM = "var(--sg-oat-100)";
const BORDER = "var(--sg-line)";
const INK = "var(--sg-ink)";
const MUTED = "var(--sg-ink-muted)";
const BARK = "var(--sg-bark-600)";

const PROGRAM_ORDER: ProgramID[] = ["maf", "farmer", "foodmaker"];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-heading)",
  fontWeight: 600,
  fontSize: 20,
  color: INK,
  marginBottom: 4,
};

const helperStyle: React.CSSProperties = {
  fontSize: 16,
  color: MUTED,
  lineHeight: 1.5,
  margin: "0 0 8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  padding: "11px 16px",
  fontFamily: "var(--font-body)",
  fontSize: 18,
  color: INK,
  backgroundColor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 16,
  outline: "none",
  boxSizing: "border-box",
};

function Field({ children }: { children: React.ReactNode }) {
  return <div style={{ marginBottom: 26 }}>{children}</div>;
}

export default function IntakeForm({ allMarkets }: Props) {
  const [program, setProgram] = useState<ProgramID | null>(null);
  const [person, setPerson] = useState("");
  const [business, setBusiness] = useState("");
  const [story, setStory] = useState("");
  const [products, setProducts] = useState("");
  const [markets, setMarkets] = useState<Set<number>>(new Set());
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleMarket = (id: number) => {
    setMarkets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!program) return setError("Please choose your program.");
    if (!person.trim()) return setError("Please add your name.");
    if (!business.trim()) return setError("Please add your business name.");
    if (!consent) return setError("The sharing permission checkbox is required to publish a profile.");
    setError(null);
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: INK }}>
        <MockupBar />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 300, margin: "0 auto 20px",
            backgroundColor: AIM_GREEN, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
          }}>
            ✓
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--sg-h2)", lineHeight: 1.1, color: INK, marginBottom: 14 }}>
            Thank you{person ? `, ${person.trim().split(" ")[0]}` : ""}!
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.5, margin: "0 0 22px" }}>
            AIM staff will review your submission, and your profile will appear on the
            participant showcase once it&rsquo;s approved.
          </p>
          <p style={{ fontSize: 16, color: MUTED, margin: "0 0 30px" }}>
            This is a design mockup — nothing was actually sent.
          </p>
          <a href="/showcase" style={{
            display: "inline-block", padding: "12px 28px", borderRadius: 999,
            backgroundColor: AIM_GREEN, color: "#fff", textDecoration: "none",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 17,
          }}>
            Back to the showcase
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: INK }}>
      <MockupBar />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "52px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "var(--sg-h1)", lineHeight: 1.05, color: INK, marginBottom: 16 }}>
            Tell Us About Your Business
          </h1>
          <p style={{ fontSize: 21, lineHeight: 1.45, color: MUTED, margin: "0 auto", maxWidth: 680 }}>
            You&rsquo;re part of an AIM Farm &amp; Food Business program — congratulations!
            This form builds your profile on the participant showcase. It takes about
            five minutes, and AIM reviews everything before it publishes.
          </p>
          <a href="/showcase" style={{ display: "inline-block", marginTop: 12, lineHeight: "44px", fontSize: 16, color: BARK, fontWeight: 700, textDecoration: "none" }}>
            See the showcase →
          </a>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Field>
            <label style={labelStyle}>Which program are you part of?</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {PROGRAM_ORDER.map((id) => {
                const p = PROGRAMS[id];
                const active = program === id;
                return (
                  <button key={id} type="button" onClick={() => setProgram(id)} style={{
                    minHeight: 44, padding: "8px 20px", borderRadius: 999, cursor: "pointer",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16,
                    border: `1.5px solid ${active ? AIM_GREEN : BORDER}`,
                    backgroundColor: active ? AIM_GREEN : "#fff",
                    color: active ? "#fff" : INK,
                    transition: "all 0.12s ease",
                  }}>
                    {p.shortName}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="person">Your name</label>
            <input id="person" style={inputStyle} value={person} onChange={(e) => setPerson(e.target.value)} />
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="business">Business name</label>
            <input id="business" style={inputStyle} value={business} onChange={(e) => setBusiness(e.target.value)} />
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="story">Your story</label>
            <p style={helperStyle}>
              Two to four sentences in your own words. What do you make or grow, how did
              you start, and what should market customers know about you?
            </p>
            <textarea id="story" rows={5} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              value={story} onChange={(e) => setStory(e.target.value)} />
            <div style={{ fontSize: 14, color: story.length > 0 && story.length < 80 ? "#b3641f" : MUTED, marginTop: 4 }}>
              {story.length === 0 ? "" : story.length < 80 ? "A little more detail helps your profile shine." : `${story.length} characters — looking good.`}
            </div>
          </Field>

          <Field>
            <label style={labelStyle} htmlFor="products">What do you sell?</label>
            <p style={helperStyle}>A short list, like &ldquo;organic strawberries, blackberries, and jam.&rdquo;</p>
            <input id="products" style={inputStyle} value={products} onChange={(e) => setProducts(e.target.value)} />
          </Field>

          <Field>
            <label style={labelStyle}>Which markets can customers find you at?</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {Object.entries(allMarkets).map(([id, name]) => {
                const active = markets.has(Number(id));
                return (
                  <button key={id} type="button" onClick={() => toggleMarket(Number(id))} style={{
                    minHeight: 44, padding: "8px 18px", borderRadius: 999, cursor: "pointer",
                    fontFamily: "var(--font-body)", fontSize: 16,
                    border: `1.5px solid ${active ? AIM_GREEN : BORDER}`,
                    backgroundColor: active ? AIM_GREEN : "#fff",
                    color: active ? "#fff" : INK,
                    fontWeight: active ? 700 : 400,
                    transition: "all 0.12s ease",
                  }}>
                    {name}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field>
            <label style={labelStyle}>Your photo</label>
            <p style={helperStyle}>A photo of you at your booth works best — it&rsquo;s what customers connect with.</p>
            <div style={{
              backgroundColor: CREAM, border: `1px solid ${BORDER}`, borderRadius: 24,
              padding: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              {photoPreview && (
                <img src={photoPreview} alt="Your photo preview"
                  style={{ width: 72, height: 72, objectFit: "cover", display: "block", borderRadius: 16 }} />
              )}
              <label style={{
                display: "inline-flex", alignItems: "center", minHeight: 44, padding: "8px 22px", borderRadius: 999, cursor: "pointer",
                backgroundColor: AIM_GREEN, color: "#fff",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 16,
              }}>
                {photoName ? "Choose a different photo" : "Choose a photo"}
                <input type="file" accept="image/*" style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPhotoName(f.name);
                      setPhotoPreview(URL.createObjectURL(f));
                    }
                  }} />
              </label>
              <span style={{ fontSize: 16, color: MUTED }}>{photoName ?? "No photo chosen yet"}</span>
            </div>
          </Field>

          <Field>
            <label style={labelStyle}>Links</label>
            <p style={helperStyle}>All optional — add whichever you have.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input style={inputStyle} placeholder="Website" value={website} onChange={(e) => setWebsite(e.target.value)} />
              <input style={inputStyle} placeholder="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
              <input style={inputStyle} placeholder="Facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
            </div>
          </Field>

          <Field>
            <div style={{
              backgroundColor: CREAM, border: `1px solid ${BORDER}`, borderRadius: 24, padding: "18px 20px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: AIM_GREEN, flexShrink: 0 }} />
              <label htmlFor="consent" style={{ fontSize: 16, lineHeight: 1.5, color: INK, cursor: "pointer" }}>
                I give AIM permission to share my name, photo, story, and business details
                on its website and in program marketing. I can update or remove my profile
                at any time by contacting AIM.
              </label>
            </div>
          </Field>

          {error && (
            <p style={{ margin: "0 0 16px", fontSize: 16, color: "#b3372a", fontWeight: 700 }}>{error}</p>
          )}

          <button type="submit" style={{
            padding: "12px 34px", borderRadius: 999, cursor: "pointer",
            backgroundColor: AIM_GREEN, color: "#fff", border: "none",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 17, minHeight: 48,
          }}>
            Submit my profile
          </button>
          <p style={{ margin: "14px 0 0", fontSize: 16, color: MUTED }}>
            AIM staff review every submission before it appears on the showcase.
          </p>
        </form>
      </div>
    </div>
  );
}

function MockupBar() {
  return (
    <div style={{
      backgroundColor: "var(--sg-forest-900)", color: "#fff",
      padding: "9px 16px", fontSize: 14, textAlign: "center", lineHeight: 1.4,
    }}>
      Design mockup for AIM review — submissions on this page don&rsquo;t go anywhere yet
    </div>
  );
}
