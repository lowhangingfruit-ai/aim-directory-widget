import { permanentRedirect } from "next/navigation";

// Program Chapters (direction C) now lives at /showcase (Meg, 2026-11-19).
export default function ShowcaseDirectionsPage() {
  permanentRedirect("/showcase");
}
