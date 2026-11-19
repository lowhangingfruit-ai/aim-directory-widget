import { Asap, Lexend } from "next/font/google";

// AIM style guide (Shayla Sosa, 2026-11-19): headers in Lexend SemiBold,
// body in Asap. Loaded here, not in the root layout, so the Market
// Participant Directory keeps its current fonts.
const lexend = Lexend({ subsets: ["latin"], weight: ["600"], variable: "--font-lexend", display: "swap" });
const asap = Asap({ subsets: ["latin"], weight: ["400", "700"], style: ["normal", "italic"], variable: "--font-asap", display: "swap" });

// Put on the showcase's outermost element together with "aim-sg".
export const showcaseFontVars = `${lexend.variable} ${asap.variable}`;
