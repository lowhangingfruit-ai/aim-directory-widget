"use client";

import { useCallback, useState } from "react";
import { Profile } from "@/lib/showcase";
import { ProfileSheet } from "./shared";
import DirectionChapters from "./DirectionChapters";

// AIM went with direction C, Program Chapters (Meg, 2026-11-19), so this page
// now shows only that layout, with no review switcher. The other directions
// (DirectionJournal = A, DirectionYearbook = B, DirectionMarket = D) stay in
// this folder, unused, in case any piece of them is wanted later. Old links
// with #a–#d (Shayla has #c) still land here and simply show this page.

interface Props {
  current: Profile[];
  alumni: Profile[];
  allMarkets: Record<number, string>;
}

export interface DirectionProps {
  current: Profile[];
  alumni: Profile[];
  allMarkets: Record<number, string>;
  onOpen: (p: Profile) => void;
}

export default function DirectionsClient({ current, alumni, allMarkets }: Props) {
  const [open, setOpen] = useState<Profile | null>(null);
  const close = useCallback(() => setOpen(null), []);

  return (
    <div className="dx-root">
      <DirectionChapters current={current} alumni={alumni} allMarkets={allMarkets} onOpen={setOpen} />
      {open && <ProfileSheet profile={open} allMarkets={allMarkets} onClose={close} />}
    </div>
  );
}
