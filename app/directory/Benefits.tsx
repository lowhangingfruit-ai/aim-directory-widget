"use client";

import { useEffect } from "react";
import { Art } from "./art";
import { NewTab, OutArrow } from "./a11y";

// Three separate sections, as AIM asked (Annie, Nov 2026): CalFresh with
// Market Match, WIC, and the Senior Farmers Market Nutrition Program. The WIC
// and Senior wording is AIM's, verbatim. The November 30 deadlines are for
// 2026; AIM confirms them each season. There is no list of authorized
// farmers: shoppers look for the purple signs or ask at the Information Booth.
const AIM_ACCESS = "https://www.agriculturalinstitute.org/farm-fresh-nutrition-access";

// A link to the section further down. The click scrolls there and moves
// focus, without adding a #fragment to the address (inside the Squarespace
// iframe the fragment wouldn't scroll AIM's page).
export function EbtBanner({ onJump }: { onJump: () => void }) {
  return (
    <a href="#aimdir-ebt" className="ebt-banner" onClick={(e) => { e.preventDefault(); onJump(); }}>
      <span className="coins"><Art name="coinSilver" /><Art name="coinPurple" /></span>
      <span><b>Using CalFresh EBT, WIC, or senior benefits?</b> Market Match adds up to $15 per day for fruits and vegetables.</span>
      <span className="go">How it works<span aria-hidden="true"> &darr;</span></span>
    </a>
  );
}

export function EbtSection({ id }: { id: string }) {
  return (
    <div className="benefits" id={id}>
      <section className="ebt" aria-labelledby="aimdir-ebt-title">
        <div className="intro">
          <div className="eyebrow">Food access</div>
          <h2 id="aimdir-ebt-title" tabIndex={-1}>CalFresh &amp; Market Match</h2>
          <p>CalFresh shoppers can double their benefits for fruits and vegetables at our farmers markets through Market Match.</p>
          <div className="tokens">
            <div><Art name="coinSilver" /><span><b>Silver CalFresh tokens</b>Any food for human consumption except hot food.</span></div>
            <div><Art name="coinPurple" /><span><b>Purple Market Match tokens</b>Fruits and vegetables only.</span></div>
          </div>
        </div>
        <ol>
          <li><Art name="card" /><span><b>Bring your CalFresh EBT Card</b></span></li>
          <li><Art name="booth" /><span><b>Swipe your card at the Information Booth for silver CalFresh tokens</b></span></li>
          <li><Art name="match" /><span><b>Receive an equal amount in bonus purple Market Match tokens, up to $15 per day</b></span></li>
          <li><Art name="basket" /><span><b>Spend tokens on eligible items</b></span></li>
        </ol>
      </section>

      <section className="program" aria-labelledby="aimdir-wic-title">
        <div className="program-art"><Art name="wicCard" /></div>
        <div>
          <h2 id="aimdir-wic-title">WIC</h2>
          <p>
            <b>Did you know?</b>{" "}You can spend your monthly Fruits &amp; Vegetables benefits at participating farmers
            markets! Use your WIC card directly with farmers who have purple &ldquo;WIC &amp; Senior Benefits
            Welcome&rdquo; signs posted. They will scan the QR code on your card to accept payment. Don&rsquo;t have a QR
            code on your WIC card? Check in with your WIC office for a new card.
          </p>
          <p className="notice">If you received bonus Farmers Market Nutrition Program funds from your WIC office this year, spend them by November 30.</p>
        </div>
      </section>

      <section className="program" aria-labelledby="aimdir-senior-title">
        <div className="program-art"><Art name="seniorCard" /></div>
        <div>
          <h2 id="aimdir-senior-title">Senior Farmers Market Nutrition Program</h2>
          <p>
            California residents age 60 or older, with a monthly income at or below 185% of the federal poverty level are
            eligible for the Senior FMNP. To apply, contact your local Area Agency on Aging.
          </p>
          <p className="notice">
            If you received a Senior Farmers Market card this year, use your card at participating farmers markets by
            November 30! Find farmers who have purple &ldquo;WIC &amp; Senior Benefits Welcome&rdquo; signs posted. They
            will scan the QR code on your card to accept payment.
          </p>
        </div>
      </section>

      <a className="outlink" href={AIM_ACCESS} target="_blank" rel="noopener noreferrer">
        More about food access programs at each market, on AIM&rsquo;s site<OutArrow /><NewTab />
      </a>
    </div>
  );
}

// AIM's own newsletter form: the Flodesk form AIM embeds on its About,
// Community and Events pages, loaded the same way AIM's site loads it.
// Flodesk has no standalone signup page for it. Instagram and Facebook are
// AIM's accounts from its site footer.
const NEWSLETTER_FORM = "657a05eabfecc716e8607d86";

type Flodesk = ((...args: unknown[]) => void) & { q?: unknown[][] };

function useFlodeskForm(formId: string, containerEl: string) {
  useEffect(() => {
    const w = window as unknown as { fd?: Flodesk; FlodeskObject?: string };
    if (!w.fd) {
      w.FlodeskObject = "fd";
      const fd: Flodesk = (...args) => { (fd.q = fd.q ?? []).push(args); };
      w.fd = fd;
      const v = `?v=${Math.floor(Date.now() / 120000) * 60}`;
      const mod = document.createElement("script");
      mod.async = true;
      mod.type = "module";
      mod.src = `https://assets.flodesk.com/universal.mjs${v}`;
      const legacy = document.createElement("script");
      legacy.async = true;
      legacy.noModule = true;
      legacy.src = `https://assets.flodesk.com/universal.js${v}`;
      document.head.append(mod, legacy);
    }
    w.fd!("form", { formId, containerEl });
  }, [formId, containerEl]);
}

// The newsletter sits at the bottom of the page: AIM's Flodesk form, cut to
// first name, email address, and the button in one row. The form's design
// lives in Flodesk, so the heading and the Last name field Flodesk draws are
// hidden here rather than changed there; whatever Flodesk sends on submit is
// unchanged. Flodesk draws decoy fields for spam bots and shows the real ones
// with inline styles, so Last name is found by its visible label text.
function useTrimFlodesk(containerSelector: string) {
  useEffect(() => {
    const root = document.querySelector(containerSelector);
    if (!root) return;
    const trim = () => {
      root.querySelectorAll<HTMLElement>(".fd-form-group").forEach((group) => {
        const label = group.querySelector<HTMLElement>("label");
        if (label && /^last\s*name$/i.test(label.innerText.trim())) group.setAttribute("data-aimdir-hidden", "");
      });
    };
    trim();
    const observer = new MutationObserver(trim);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [containerSelector]);
}

export function FollowAim() {
  useFlodeskForm(NEWSLETTER_FORM, `#fd-form-${NEWSLETTER_FORM}`);
  useTrimFlodesk(`#fd-form-${NEWSLETTER_FORM}`);
  return (
    <section className="follow" aria-labelledby="aimdir-news-title">
      <div>
        <h2 id="aimdir-news-title">Join the newsletter</h2>
        <p>Vendor updates, seasonal offerings, and market news from AIM.</p>
        <div className="btns">
          <a href="https://instagram.com/aginstituteofmarin" target="_blank" rel="noopener noreferrer">Follow on Instagram<NewTab /></a>
          <a className="ghost" href="https://www.facebook.com/AIMFarmersMarkets/" target="_blank" rel="noopener noreferrer">Follow on Facebook<NewTab /></a>
        </div>
      </div>
      <div className="newsletter" id={`fd-form-${NEWSLETTER_FORM}`} />
    </section>
  );
}
