"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PHASES, PLAN, type Feature, type Phase } from "@/lib/cfaMap";

const AIM_GREEN = "#0d8240";
const AIM_BRIGHT = "#4db547";
const ORANGE = "#de752c";
const CREAM = "#f6f5ea";

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const PLAN_RATIO = PLAN.height / PLAN.width;

interface View {
  scale: number;
  /** top-left of the plan layer, in viewport pixels */
  tx: number;
  ty: number;
}

/** Keep the plan covering the frame: no empty gutters at any zoom level. */
function clampView(v: View, w: number, h: number): View {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale));
  return {
    scale,
    tx: Math.min(0, Math.max(w * (1 - scale), v.tx)),
    ty: Math.min(0, Math.max(h * (1 - scale), v.ty)),
  };
}

/** Centre a point given as percentages of the plan. */
function viewCentredOn(x: number, y: number, scale: number, w: number, h: number): View {
  return clampView(
    { scale, tx: w / 2 - (x / 100) * w * scale, ty: h / 2 - (y / 100) * h * scale },
    w,
    h,
  );
}

/** A view that frames every marker belonging to one feature. */
function viewFramingFeature(feature: Feature, w: number, h: number): View {
  const xs = feature.points.map((p) => p.x);
  const ys = feature.points.map((p) => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  // a single marker gets a fixed comfortable zoom; a spread-out feature gets
  // whatever zoom fits its extent plus room to see what surrounds it
  const pad = 22;
  const scale =
    feature.points.length === 1
      ? 3
      : Math.min(3.2, Math.max(1.4, 100 / Math.max(spanX + pad, (spanY + pad) / PLAN_RATIO)));
  return viewCentredOn(
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
    scale,
    w,
    h,
  );
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CfaMapClient() {
  const [phaseId, setPhaseId] = useState<Phase["id"]>("one");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [narrow, setNarrow] = useState(false);
  // null means "wherever this phase opens"; any gesture pins it to a real view
  const [pinned, setPinned] = useState<View | null>(null);
  const [dragging, setDragging] = useState(false);

  const phase = useMemo(() => PHASES.find((p) => p.id === phaseId)!, [phaseId]);
  const frameRef = useRef<HTMLDivElement>(null);
  const legendRows = useRef(new Map<string, HTMLButtonElement>());
  const animation = useRef<number | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: boolean; distance: number; scale: number } | null>(null);

  const baseView = useMemo(() => {
    if (!size.w) return { scale: 1, tx: 0, ty: 0 };
    const { x, y, scale } = phase.initialView;
    return viewCentredOn(x, y, narrow ? scale * 1.25 : scale, size.w, size.h);
  }, [phase, narrow, size.w, size.h]);
  // clamped on every render so a window resize cannot leave the plan off-frame
  const view = useMemo(
    () => (size.w ? clampView(pinned ?? baseView, size.w, size.h) : baseView),
    [pinned, baseView, size.w, size.h],
  );

  // gesture handlers update from the latest view without re-subscribing
  const baseRef = useRef(baseView);
  useEffect(() => {
    baseRef.current = baseView;
  }, [baseView]);

  const active = selected ?? hovered;

  useEffect(() => {
    const measure = () => {
      setNarrow(window.innerWidth < 900);
      const el = frameRef.current;
      if (el) setSize({ w: el.clientWidth, h: el.clientHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const animateTo = useCallback((from: View, target: View) => {
    if (animation.current) cancelAnimationFrame(animation.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPinned(target);
      return;
    }
    const start = performance.now();
    const step = (now: number) => {
      const k = easeOut(Math.min(1, (now - start) / 420));
      setPinned({
        scale: from.scale + (target.scale - from.scale) * k,
        tx: from.tx + (target.tx - from.tx) * k,
        ty: from.ty + (target.ty - from.ty) * k,
      });
      if (k < 1) animation.current = requestAnimationFrame(step);
    };
    animation.current = requestAnimationFrame(step);
  }, []);

  const selectFeature = useCallback(
    (feature: Feature | null, source: "legend" | "map") => {
      if (!feature) {
        setSelected(null);
        return;
      }
      setSelected(feature.key);
      if (source === "legend" && size.w) {
        animateTo(view, viewFramingFeature(feature, size.w, size.h));
      }
      if (source === "map") {
        legendRows.current
          .get(feature.key)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    },
    [animateTo, view, size.w, size.h],
  );

  // wheel zoom has to be non-passive to stop the page scrolling underneath
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (animation.current) cancelAnimationFrame(animation.current);
      const box = el.getBoundingClientRect();
      const px = e.clientX - box.left;
      const py = e.clientY - box.top;
      setPinned((current) => {
        const v = current ?? baseRef.current;
        const next = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, v.scale * Math.exp(-e.deltaY * 0.0016)),
        );
        const k = next / v.scale;
        return clampView(
          { scale: next, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k },
          box.width,
          box.height,
        );
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // let a Squarespace code-block embed size its iframe to the content
  useEffect(() => {
    const post = () => {
      if (window.parent === window) return;
      window.parent.postMessage(
        { type: "aim-cfa-map-height", height: document.body.scrollHeight },
        "*",
      );
    };
    post();
    const observer = new ResizeObserver(post);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  const pinchDistance = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (animation.current) cancelAnimationFrame(animation.current);
    if (pointers.current.size === 2) {
      gesture.current = { moved: true, distance: pinchDistance(), scale: view.scale };
    } else {
      gesture.current = { moved: false, distance: 0, scale: view.scale };
      setDragging(true);
    }
    // capture on the frame, never on e.target: capturing a marker or the image
    // leaves later clicks retargeted to it if the matching pointerup is lost
    frameRef.current?.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const previous = pointers.current.get(e.pointerId);
    if (!previous) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const box = frameRef.current?.getBoundingClientRect();
    if (!box) return;

    if (pointers.current.size === 2 && gesture.current) {
      const startDistance = gesture.current.distance;
      const startScale = gesture.current.scale;
      const ratio = pinchDistance() / (startDistance || pinchDistance());
      const [a, b] = [...pointers.current.values()];
      const px = (a.x + b.x) / 2 - box.left;
      const py = (a.y + b.y) / 2 - box.top;
      setPinned((current) => {
        const v = current ?? baseRef.current;
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, startScale * ratio));
        const k = next / v.scale;
        return clampView(
          { scale: next, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k },
          box.width,
          box.height,
        );
      });
      return;
    }

    const dx = e.clientX - previous.x;
    const dy = e.clientY - previous.y;
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
      if (gesture.current) gesture.current.moved = true;
      setPinned((current) => {
        const v = current ?? baseRef.current;
        return clampView({ ...v, tx: v.tx + dx, ty: v.ty + dy }, box.width, box.height);
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (frameRef.current?.hasPointerCapture?.(e.pointerId)) {
      frameRef.current.releasePointerCapture(e.pointerId);
    }
    if (pointers.current.size === 0) {
      setDragging(false);
      // a tap on bare plan clears the selection; a drag must not
      if (gesture.current && !gesture.current.moved) setSelected(null);
      gesture.current = null;
    }
  };

  // a lost capture (window blur, gesture interrupted) must not leave the map
  // thinking a drag is still in progress
  const onLostCapture = () => {
    pointers.current.clear();
    gesture.current = null;
    setDragging(false);
  };

  const zoomBy = useCallback(
    (factor: number) => {
      if (!size.w) return;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, view.scale * factor));
      const k = next / view.scale;
      animateTo(
        view,
        clampView(
          {
            scale: next,
            tx: size.w / 2 - (size.w / 2 - view.tx) * k,
            ty: size.h / 2 - (size.h / 2 - view.ty) * k,
          },
          size.w,
          size.h,
        ),
      );
    },
    [animateTo, view, size.w, size.h],
  );

  const resetView = useCallback(() => {
    setSelected(null);
    setPinned(null);
    if (animation.current) cancelAnimationFrame(animation.current);
  }, []);

  const controlStyle: React.CSSProperties = {
    borderRadius: 300,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "rgba(255,255,255,0.94)",
    cursor: "pointer",
  };
  // the plan's dense corners put six markers inside a thumb's width on a phone,
  // so narrow screens get smaller circles and open a little further in
  const markerSize = narrow ? 25 : 28;
  const selectedFeature = phase.features.find((f) => f.key === selected);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: narrow ? "0 0 32px" : "0 0 48px" }}>
      {/* Phase switch */}
      <div style={{ textAlign: "center", padding: narrow ? "26px 16px 18px" : "40px 24px 24px" }}>
        <p style={{
          margin: "0 0 10px",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: AIM_GREEN,
        }}>
          Center for Food and Agriculture
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 500,
          fontSize: narrow ? 26 : 36,
          lineHeight: 1.15,
          marginBottom: 18,
        }}>
          Explore the Site Plan
        </h1>
        <div style={{ display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {PHASES.map((p) => {
            const on = p.id === phaseId;
            return (
              <button
                key={p.id}
                onClick={() => {
                  setPhaseId(p.id);
                  setSelected(null);
                  setPinned(null);
                }}
                aria-pressed={on}
                style={{
                  padding: "9px 22px",
                  borderRadius: 300,
                  border: `1px solid ${on ? AIM_GREEN : "#c9c9c0"}`,
                  background: on ? AIM_GREEN : "transparent",
                  color: on ? "#fff" : "#000",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  fontSize: 14,
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                }}
              >
                {p.title}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{
        display: "flex",
        flexDirection: narrow ? "column" : "row",
        gap: narrow ? 0 : 22,
        alignItems: "flex-start",
        padding: narrow ? 0 : "0 24px",
      }}>
        {/* Legend. Beside the plan rather than above it, so selecting a row
            never pushes the thing it highlights out of view. */}
        <div style={{
          order: narrow ? 2 : 1,
          width: narrow ? "100%" : 330,
          flexShrink: 0,
          background: CREAM,
          padding: narrow ? "18px 16px 22px" : "20px 18px",
          borderTop: narrow ? "1px solid #e2e1d6" : "none",
        }}>
          <h2 style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: AIM_GREEN,
            marginBottom: 4,
          }}>
            {phase.title}
          </h2>
          <p style={{ fontSize: 13, color: "#494949", margin: "0 0 14px" }}>
            Select a feature to find it on the plan, or choose a marker on the plan.
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {phase.features.map((f) => {
              const on = selected === f.key;
              const warm = hovered === f.key;
              return (
                <li key={f.key}>
                  <button
                    ref={(el) => {
                      if (el) legendRows.current.set(f.key, el);
                      else legendRows.current.delete(f.key);
                    }}
                    onClick={() => selectFeature(on ? null : f, "legend")}
                    onMouseEnter={() => setHovered(f.key)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(f.key)}
                    onBlur={() => setHovered(null)}
                    aria-pressed={on}
                    aria-label={
                      f.points.length > 1
                        ? `${f.key}. ${f.label}, ${f.points.length} locations`
                        : `${f.key}. ${f.label}`
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      textAlign: "left",
                      padding: "7px 8px",
                      border: "none",
                      borderLeft: `3px solid ${on ? ORANGE : "transparent"}`,
                      background: on ? "#fff" : warm ? "rgba(77,181,71,0.10)" : "transparent",
                      cursor: "pointer",
                      font: "inherit",
                      transition: "background 120ms",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        flexShrink: 0,
                        width: 24,
                        height: 24,
                        borderRadius: 300,
                        display: "grid",
                        placeItems: "center",
                        fontFamily: "var(--font-heading)",
                        fontSize: 12,
                        fontWeight: 700,
                        border: `1.5px solid ${on || warm ? AIM_GREEN : "#000"}`,
                        background: on ? AIM_GREEN : "#fff",
                        color: on ? "#fff" : "#000",
                      }}
                    >
                      {f.key}
                    </span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.3, fontWeight: on ? 600 : 400 }}>
                      {f.label}
                      {f.points.length > 1 && (
                        <span style={{ color: "#7a7a72", fontWeight: 400 }}>
                          {" "}({f.points.length} locations)
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* The plan */}
        <div style={{ order: narrow ? 1 : 2, flex: 1, width: "100%", minWidth: 0 }}>
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onLostPointerCapture={onLostCapture}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: narrow ? "4 / 3" : String(PLAN.width / PLAN.height),
              overflow: "hidden",
              background: "#cfd3c6",
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <div style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "0 0",
              transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
              willChange: "transform",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PLAN.src}
                alt="Aerial site plan of the Center for Food and Agriculture at the Marin Civic Center campus"
                draggable={false}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  backgroundImage: `url(${PLAN.placeholder})`,
                  backgroundSize: "cover",
                }}
              />

              {phase.features.map((f) =>
                f.points.map((point, i) => {
                  const on = selected === f.key;
                  const warm = active === f.key;
                  return (
                    <button
                      key={`${f.key}-${i}`}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectFeature(on ? null : f, "map");
                      }}
                      onMouseEnter={() => setHovered(f.key)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(f.key)}
                      onBlur={() => setHovered(null)}
                      aria-pressed={on}
                      aria-label={
                        f.points.length > 1
                          ? `${f.label}, location ${i + 1} of ${f.points.length}`
                          : f.label
                      }
                      // the legend is the keyboard path: markers scroll out of
                      // frame at any zoom, so tabbing them would focus what the
                      // reader cannot see
                      tabIndex={-1}
                      style={{
                        position: "absolute",
                        left: `${point.x}%`,
                        top: `${point.y}%`,
                        width: markerSize,
                        height: markerSize,
                        marginLeft: -markerSize / 2,
                        marginTop: -markerSize / 2,
                        // markers hold their screen size as the plan zooms
                        transform: `scale(${(warm ? 1.18 : 1) / view.scale})`,
                        transformOrigin: "center",
                        padding: 0,
                        borderRadius: 300,
                        display: "grid",
                        placeItems: "center",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        fontSize: f.key.length > 1 ? 12 : 13,
                        cursor: "pointer",
                        border: `2px solid ${warm ? AIM_BRIGHT : "#1a1a1a"}`,
                        background: on ? AIM_GREEN : warm ? AIM_BRIGHT : "rgba(255,255,255,0.94)",
                        color: on || warm ? "#fff" : "#000",
                        boxShadow: warm
                          ? "0 0 0 5px rgba(77,181,71,0.35), 0 2px 8px rgba(0,0,0,0.3)"
                          : "0 1px 4px rgba(0,0,0,0.28)",
                        opacity: active && !warm ? 0.45 : 1,
                        zIndex: warm ? 3 : 1,
                        transition: "opacity 140ms, background 140ms, box-shadow 140ms",
                      }}
                    >
                      {f.key}
                    </button>
                  );
                }),
              )}
            </div>

            {/* Zoom controls */}
            <div style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              zIndex: 5,
            }}>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => zoomBy(1.6)}
                aria-label="Zoom in"
                style={{ ...controlStyle, width: 36, height: 36, fontSize: 18, lineHeight: 1 }}
              >
                +
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => zoomBy(1 / 1.6)}
                aria-label="Zoom out"
                style={{ ...controlStyle, width: 36, height: 36, fontSize: 18, lineHeight: 1 }}
              >
                −
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={resetView}
                style={{
                  ...controlStyle,
                  padding: "7px 14px",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  fontSize: 12,
                  whiteSpace: "nowrap",
                }}
              >
                Reset
              </button>
            </div>

            {/* Selected feature caption */}
            {selectedFeature && (
              <div style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                maxWidth: "min(70%, 420px)",
                background: "rgba(255,255,255,0.96)",
                padding: "9px 14px",
                borderLeft: `3px solid ${ORANGE}`,
                zIndex: 5,
                pointerEvents: "none",
              }}>
                <p style={{
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  fontSize: 15,
                  lineHeight: 1.2,
                }}>
                  {selectedFeature.label}
                </p>
              </div>
            )}
          </div>

          <p style={{
            fontSize: 12,
            color: "#6c6c64",
            margin: narrow ? "10px 16px 0" : "10px 0 0",
          }}>
            Scroll or pinch to zoom, drag to move around the plan.
          </p>
        </div>
      </div>
    </div>
  );
}
