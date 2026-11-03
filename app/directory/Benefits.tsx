"use client";

import { Art } from "./art";

// Wording follows AIM's Farm Fresh Nutrition Access page. The WIC deadline and
// the Senior Match note are time-sensitive; AIM confirms them each season.
const AIM_ACCESS = "https://www.agriculturalinstitute.org/farm-fresh-nutrition-access";

export function EbtBanner({ onJump }: { onJump: () => void }) {
  return (
    <button type="button" className="ebt-banner" onClick={onJump}>
      <span className="coins"><Art name="coinSilver" /><Art name="coinPurple" /></span>
      <span><b>Using CalFresh EBT?</b> Market Match doubles your fruit and vegetable dollars, up to $15.</span>
      <span className="go">How it works &darr;</span>
    </button>
  );
}

export function EbtSection({ id }: { id: string }) {
  return (
    <section className="ebt" id={id}>
      <div className="intro">
        <div className="eyebrow">Food access</div>
        <h2>Shopping with EBT, WIC, and senior benefits</h2>
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
        What EBT can buy, and each market&rsquo;s programs, on AIM&rsquo;s site &#8599;
      </a>
    </section>
  );
}

// Instagram and Facebook are AIM's own accounts from its site footer. The
// newsletter button waits for AIM's signup link.
export function FollowAim({ logos }: { logos: string[] }) {
  return (
    <section className="follow">
      <div>
        <h2>Want to know who&rsquo;s coming to market?</h2>
        <p>Follow AIM and subscribe to our newsletter for the latest vendor updates, seasonal offerings, and market news.</p>
        <div className="btns">
          <a href="https://instagram.com/aginstituteofmarin" target="_blank" rel="noopener noreferrer">Follow on Instagram</a>
          <a className="ghost" href="https://www.facebook.com/AIMFarmersMarkets/" target="_blank" rel="noopener noreferrer">Follow on Facebook</a>
        </div>
      </div>
      <div className="logos" aria-hidden="true">
        {logos.map((l) => <img key={l} src={l} alt="" />)}
      </div>
    </section>
  );
}
