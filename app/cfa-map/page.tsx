import type { Metadata } from "next";
import CfaMapClient from "./CfaMapClient";

export const metadata: Metadata = {
  title: "Center for Food and Agriculture site map",
  description:
    "Interactive site plan for AIM's Center for Food and Agriculture at the Marin Civic Center campus.",
};

export default function Page() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <CfaMapClient />
      <p style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "0 24px 40px",
        fontSize: 12,
        color: "#8a8a82",
      }}>
        Working prototype for AIM review. Plan art from AIM&apos;s CFA site map, August 2026.
      </p>
    </div>
  );
}
