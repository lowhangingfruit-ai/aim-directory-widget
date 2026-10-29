"use client";

import { useCallback, useEffect, useState } from "react";
import { Profile } from "@/lib/showcase";
import { ProfileSheet } from "./shared";
import DirectionJournal from "./DirectionJournal";
import DirectionYearbook from "./DirectionYearbook";
import DirectionChapters from "./DirectionChapters";
import DirectionMarket from "./DirectionMarket";

interface Props {
  current: Profile[];
  alumni: Profile[];
  allMarkets: Record<number, string>;
}

const DIRECTIONS = [
  { id: "a", name: "Field Journal" },
  { id: "b", name: "Class Portraits" },
  { id: "c", name: "Program Chapters" },
  { id: "d", name: "Market Day" },
] as const;
type DirID = (typeof DIRECTIONS)[number]["id"];

export interface DirectionProps {
  current: Profile[];
  alumni: Profile[];
  allMarkets: Record<number, string>;
  onOpen: (p: Profile) => void;
}

export default function DirectionsClient({ current, alumni, allMarkets }: Props) {
  const [dir, setDir] = useState<DirID>("a");
  const [open, setOpen] = useState<Profile | null>(null);

  // #a–#d in the URL, so a link can open one direction directly.
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.replace("#", "").toLowerCase();
      if (DIRECTIONS.some((d) => d.id === h)) setDir(h as DirID);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const choose = (id: DirID) => {
    setDir(id);
    history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0 });
  };

  const close = useCallback(() => setOpen(null), []);
  const props: DirectionProps = { current, alumni, allMarkets, onOpen: setOpen };

  return (
    <div className="dx-root">
      {dir === "a" && <DirectionJournal {...props} />}
      {dir === "b" && <DirectionYearbook {...props} />}
      {dir === "c" && <DirectionChapters {...props} />}
      {dir === "d" && <DirectionMarket {...props} />}

      {/* Review bar for switching directions; not part of any direction */}
      <nav className="dx-switcher" aria-label="Layout directions">
        <span className="dx-switcher-label">Directions</span>
        <div className="dx-switcher-buttons">
          {DIRECTIONS.map((d) => (
            <button key={d.id} aria-pressed={dir === d.id} onClick={() => choose(d.id)}>
              <b>{d.id.toUpperCase()}</b><span>{d.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {open && <ProfileSheet profile={open} allMarkets={allMarkets} onClose={close} />}
    </div>
  );
}
