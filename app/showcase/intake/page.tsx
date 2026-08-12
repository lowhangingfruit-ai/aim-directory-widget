import type { Metadata } from "next";
import { MARKETS } from "@/lib/types";
import IntakeForm from "./IntakeForm";

export const metadata: Metadata = {
  title: "Participant Intake — AIM Farm & Food Business Programs",
  description:
    "Build your profile on the AIM participant showcase. Takes about five minutes.",
};

export default function IntakePage() {
  return <IntakeForm allMarkets={MARKETS} />;
}
