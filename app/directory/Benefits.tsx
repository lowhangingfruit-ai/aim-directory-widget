"use client";

import { useEffect } from "react";
import { Art } from "./art";
import { NewTab, OutArrow } from "./a11y";

// Wording follows AIM's Farm Fresh Nutrition Access page. The WIC deadline and
// the Senior Match note are time-sensitive; AIM confirms them each season.
const AIM_ACCESS = "https://www.agriculturalinstitute.org/farm-fresh-nutrition-access";

// A link to the section further down. The click scrolls there and moves
// focus, without adding a #fragment to the address (inside the Squarespace
// iframe the fragment wouldn't scroll AIM's page).
export function EbtBanner({ onJump }: { onJump: () => void }) {
  return (
    <a href="#aimdir-ebt" className="ebt-banner" onClick={(e) => { e.preventDefault(); onJump(); }}>
      <span className="coins"><Art name="coinSilver" /><Art name="coinPurple" /></span>
      <span><b>Using CalFresh EBT?</b> Market Match doubles your fruit and vegetable dollars, up to $15.</span>
      <span className="go">How it works<span aria-hidden="true"> &darr;</span></span>
    </a>
  );
}

export function EbtSection({ id }: { id: string }) {
  return (
    <section className="ebt" id={id}>
      <div className="intro">
        <div className="eyebrow">Food access</div>
        <h2 id="aimdir-ebt-title" tabIndex={-1}>Shopping with EBT, WIC, and senior benefits</h2>
        <p>CalFresh shoppers can double their benefits for fruits and vegetables at AIM&rsquo;s farmers markets through Market Match.</p>
        <div className="tokens">
          <div><Art name="coinSilver" /><span><b>Silver tokens</b>Any food for human consumption except hot food.</span></div>
          <div><Art name="coinPurple" /><span><b>Purple Market Match tokens</b>Fruits and vegetables only.</span></div>
        </div>
      </div>
      <ol>
        <li><Art name="booth" /><span><b>Go to the Information Booth</b>Every AIM market has one. Bring your EBT card.</span></li>
        <li><Art name="card" /><span><b>Swipe for $1 to $15</b>You get that amount in silver EBT tokens.</span></li>
        <li><Art name="match" /><span><b>Get it matched</b>Market Match adds the same amount, up to $15, in purple tokens.</span></li>
        <li><Art name="basket" /><span><b>Shop the booths</b>Spend tokens with farmers, ranchers, cheesemakers, and bakers.</span></li>
      </ol>
      <div className="programs">
        <div>
          <h3>WIC</h3>
          <p>Use the WIC card with a QR code on the front at farmers with WIC signage. They scan the code and you enter your PIN.</p>
          <p className="notice">Spend this year&rsquo;s farmers market funds on your card by November 30.</p>
        </div>
        <div>
          <h3>Seniors 60 and older</h3>
          <p>The Senior Farmers&rsquo; Market Nutrition Program card buys fresh produce, cut herbs, and raw honey at farmers with program signage.</p>
          <p className="notice">The 2026 WIC and Senior Match bonus has run out of funds for the year.</p>
        </div>
      </div>
      <a className="outlink" href={AIM_ACCESS} target="_blank" rel="noopener noreferrer">
        What EBT can buy, and each market&rsquo;s programs, on AIM&rsquo;s site<OutArrow /><NewTab />
      </a>
    </section>
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

export function FollowAim() {
  useFlodeskForm(NEWSLETTER_FORM, `#fd-form-${NEWSLETTER_FORM}`);
  return (
    <section className="follow">
      <div>
        <h2>Want to know who&rsquo;s coming to market?</h2>
        <p>Follow AIM and subscribe to our newsletter for the latest vendor updates, seasonal offerings, and market news.</p>
        <div className="btns">
          <a href="https://instagram.com/aginstituteofmarin" target="_blank" rel="noopener noreferrer">Follow on Instagram<NewTab /></a>
          <a className="ghost" href="https://www.facebook.com/AIMFarmersMarkets/" target="_blank" rel="noopener noreferrer">Follow on Facebook<NewTab /></a>
        </div>
      </div>
      <div className="newsletter" id={`fd-form-${NEWSLETTER_FORM}`} />
    </section>
  );
}
