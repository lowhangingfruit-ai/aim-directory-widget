import type { Metadata } from "next";
import CfaMapClient from "./CfaMapClient";

export const metadata: Metadata = {
  title: "Center for Food and Agriculture site map",
  description:
    "Interactive site plan for AIM's Center for Food and Agriculture at the Marin Civic Center campus.",
};

/**
 * `?embed=1` is the version that goes in the Squarespace code block: no review
 * note, and no min-height, since inside an iframe 100vh is the iframe's own
 * height and the auto-sizing would chase itself. Without the param this is the
 * review link, which keeps both.
 */
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>;
}) {
  const { embed } = await searchParams;
  const embedded = embed === "1";

  return (
    <div style={{ minHeight: embedded ? undefined : "100vh", background: "#fff" }}>
      <CfaMapClient />
      {!embedded && (
        <p style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "0 24px 40px",
          fontSize: 12,
          color: "#8a8a82",
        }}>
          Working prototype for AIM review. Plan art from AIM&apos;s CFA site map, August 2026.
        </p>
      )}
    </div>
  );
}
