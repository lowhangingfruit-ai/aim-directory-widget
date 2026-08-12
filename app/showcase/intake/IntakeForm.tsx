"use client";

import { useState } from "react";
import { ProgramID, PROGRAMS } from "@/lib/showcase";

interface Props {
  allMarkets: Record<number, string>;
}

const AIM_GREEN = "#0d8240";
const AIM_BRIGHT = "#4db547";
const CREAM = "#f6f5ea";
const BORDER = "#c9c7b8";

const PROGRAM_ORDER: ProgramID[] = ["maf", "farmer", "foodmaker"];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-heading)",
  fontWeight: 500,
  fontSize: 17,
  color: "#000",
  marginBottom: 4,
};

const helperStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#6f6d5f",
  lineHeight: 1.5,
  margin: "0 0 8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 12px",
  fontFamily: "var(--font-body)",
  fontSize: 15,
  color: "#000",
  backgroundColor: "#fff",
  border: `1px solid ${BORDER}`,
  borderRadius: 0,
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
      <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: "#000" }}>
        <MockupBar />
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "72px 20px", textAlign: "center" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 300, margin: "0 auto 20px",
            backgroundColor: AIM_BRIGHT, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
          }}>
            ✓
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 34, color: AIM_GREEN, marginBottom: 14 }}>
            Thank you{person ? `, ${person.trim().split(" ")[0]}` : ""}!
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.7, margin: "0 0 22px" }}>
            AIM staff will review your submission, and your profile will appear on the
            participant showcase once it&rsquo;s approved.
          </p>
          <p style={{ fontSize: 13, color: "#8a8878", margin: "0 0 30px" }}>
            This is a design mockup — nothing was actually sent.
          </p>
          <a href="/showcase" style={{
            display: "inline-block", padding: "11px 28px", borderRadius: 300,
            backgroundColor: AIM_GREEN, color: "#fff", textDecoration: "none",
            fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14.5,
          }}>
            Back to the showcase
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "var(--font-body)", color: "#000" }}>
      <MockupBar />

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "52px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: 38, lineHeight: 1.15, color: AIM_GREEN, marginBottom: 14 }}>
            Tell Us About Your Business
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.65, margin: "0 auto", maxWidth: 520 }}>
            You&rsquo;re part of an AIM Farm &amp; Food Business program — congratulations!
            This form builds your profile on the participant showcase. It takes about
            five minutes, and AIM reviews everything before it publishes.
          </p>
          <a href="/showcase" style={{ display: "inline-block", marginTop: 12, fontSize: 14, color: AIM_GREEN, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
            See the showcase
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
                    padding: "8px 18px", borderRadius: 300, cursor: "pointer",
                    fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13.5,
                    border: `1.5px solid ${active ? p.color : BORDER}`,
                    backgroundColor: active ? p.color : "#fff",
                    color: active ? p.textOnColor : "#333",
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
            <div style={{ fontSize: 12, color: story.length > 0 && story.length < 80 ? "#b3641f" : "#8a8878", marginTop: 4 }}>
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
                    padding: "7px 16px", borderRadius: 300, cursor: "pointer",
                    fontFamily: "var(--font-body)", fontSize: 13.5,
                    border: `1.5px solid ${active ? AIM_GREEN : BORDER}`,
                    backgroundColor: active ? AIM_GREEN : "#fff",
                    color: active ? "#fff" : "#333",
                    fontWeight: active ? 600 : 400,
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
              backgroundColor: CREAM, border: `1px solid ${BORDER}`,
              padding: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
            }}>
              {photoPreview && (
                <img src={photoPreview} alt="Your photo preview"
                  style={{ width: 72, height: 72, objectFit: "cover", display: "block" }} />
              )}
              <label style={{
                display: "inline-block", padding: "9px 22px", borderRadius: 300, cursor: "pointer",
                backgroundColor: AIM_GREEN, color: "#fff",
                fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13.5,
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
              <span style={{ fontSize: 13, color: "#6f6d5f" }}>{photoName ?? "No photo chosen yet"}</span>
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
              backgroundColor: CREAM, border: `1px solid ${BORDER}`, padding: "16px 18px",
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <input id="consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: AIM_GREEN, flexShrink: 0 }} />
              <label htmlFor="consent" style={{ fontSize: 13.5, lineHeight: 1.6, color: "#333", cursor: "pointer" }}>
                I give AIM permission to share my name, photo, story, and business details
                on its website and in program marketing. I can update or remove my profile
                at any time by contacting AIM.
              </label>
            </div>
          </Field>

          {error && (
            <p style={{ margin: "0 0 16px", fontSize: 14, color: "#b3372a", fontWeight: 600 }}>{error}</p>
          )}

          <button type="submit" style={{
            padding: "13px 34px", borderRadius: 300, cursor: "pointer",
            backgroundColor: AIM_GREEN, color: "#fff", border: "none",
            fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 15.5, letterSpacing: "0.02em",
          }}>
            Submit my profile
          </button>
          <p style={{ margin: "14px 0 0", fontSize: 12.5, color: "#8a8878" }}>
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
      backgroundColor: AIM_BRIGHT, color: "#000",
      padding: "9px 16px", fontSize: 14, textAlign: "center", lineHeight: 1.4,
    }}>
      Design mockup for AIM review — submissions on this page don&rsquo;t go anywhere yet
    </div>
  );
}
