"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { PHASES, PLAN, type Feature, type Phase } from "@/lib/cfaMap";

const AIM_GREEN = "#0d8240";
const AIM_BRIGHT = "#4db547";
const ORANGE = "#de752c";
const CREAM = "#f6f5ea";

const LEGEND_WIDTH = 330;
const COLUMN_GAP = 22;
const EDGE_PAD = 24;

const MAX_SCALE = 6;
const PLAN_RATIO = PLAN.height / PLAN.width;
/** how far past the plan's own resolution manual zoom may go before it softens */
const OVERZOOM = 1.35;

/**
 * The legend sets the row's height, so the frame is whatever shape that leaves
 * rather than the plan's own. The plan layer keeps its proportions inside the
 * frame: markers sit at percentages of the layer, so letting the frame stretch
 * the layer instead would slide every marker off its feature.
 */
interface Frame {
  /** the visible window onto the plan, in px */
  w: number;
  h: number;
  /** the layer's height at scale 1; its width is always the frame's */
  lh: number;
  /** the smallest scale that still covers the frame, so there are no gutters */
  minScale: number;
  /**
   * Past this the plan is being upscaled, because one plan pixel is covering
   * more than one device pixel. That upscaling is the blur, so anything the
   * widget does on its own stays at or under it. A smaller frame raises the
   * ceiling, which is why a phone tolerates more zoom than a desktop.
   */
  sharpScale: number;
  /** ceiling for manual zoom, a little past sharp where softening still reads */
  maxScale: number;
}

function frameOf(w: number, h: number, dpr = 1, sourceWidth = PLAN.width): Frame {
  const lh = w * PLAN_RATIO;
  const minScale = lh > 0 ? Math.max(1, h / lh) : 1;
  // never below minScale: covering the frame wins over staying sharp
  const sharpScale = w > 0 ? Math.max(minScale, sourceWidth / (w * dpr)) : minScale;
  return {
    w,
    h,
    lh,
    minScale,
    sharpScale,
    maxScale: Math.min(MAX_SCALE, Math.max(minScale, sharpScale * OVERZOOM)),
  };
}

interface View {
  scale: number;
  /** top-left of the plan layer, in viewport pixels */
  tx: number;
  ty: number;
}

/** Keep the plan covering the frame: no empty gutters at any zoom level. */
function clampView(v: View, f: Frame): View {
  const scale = Math.min(f.maxScale, Math.max(f.minScale, v.scale));
  return {
    scale,
    tx: Math.min(0, Math.max(f.w * (1 - scale), v.tx)),
    ty: Math.min(0, Math.max(f.h - f.lh * scale, v.ty)),
  };
}

/** Centre a point given as percentages of the plan. */
function viewCentredOn(x: number, y: number, scale: number, f: Frame): View {
  return clampView(
    { scale, tx: f.w / 2 - (x / 100) * f.w * scale, ty: f.h / 2 - (y / 100) * f.lh * scale },
    f,
  );
}

/** A view that frames every marker belonging to one feature. */
function viewFramingFeature(feature: Feature, f: Frame): View {
  const xs = feature.points.map((p) => p.x);
  const ys = feature.points.map((p) => p.y);
  const spanX = Math.max(...xs) - Math.min(...xs);
  const spanY = Math.max(...ys) - Math.min(...ys);
  // a single marker gets a fixed comfortable zoom; a spread-out feature gets
  // whatever zoom fits its extent plus room to see what surrounds it
  const pad = 22;
  // a vertical extent is a share of the plan's height but has to fit the
  // frame's, so put it in the same units as the horizontal one before comparing
  const vertical = f.h > 0 ? ((spanY + pad) * f.lh) / f.h : spanY + pad;
  const wanted =
    feature.points.length === 1
      ? 3
      : Math.min(3.2, Math.max(1.4, 100 / Math.max(spanX + pad, vertical)));
  // an automatic flight never lands past sharp, so selecting a feature cannot
  // be what makes the plan look soft
  const scale = Math.min(wanted, f.sharpScale);
  return viewCentredOn(
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
    scale,
    f,
  );
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CfaMapClient() {
  const [phaseId, setPhaseId] = useState<Phase["id"]>("one");
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dpr, setDpr] = useState(1);
  // the detail render, once it has arrived: until then zoom is capped against
  // the base so nobody is offered a sharpness the loaded art cannot deliver
  const [detailReady, setDetailReady] = useState(false);
  const [narrow, setNarrow] = useState(false);
  // null means "wherever this phase opens"; any gesture pins it to a real view
  const [pinned, setPinned] = useState<View | null>(null);
  const [dragging, setDragging] = useState(false);

  const phase = useMemo(() => PHASES.find((p) => p.id === phaseId)!, [phaseId]);
  const frameRef = useRef<HTMLDivElement>(null);
  const legendRows = useRef(new Map<string, HTMLButtonElement>());
  const animation = useRef<number | null>(null);
  const landing = useRef<number | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: boolean; distance: number; scale: number } | null>(null);

  const sourceWidth = detailReady ? PLAN.detailWidth : PLAN.width;
  const frame = useMemo(
    () => frameOf(size.w, size.h, dpr, sourceWidth),
    [size.w, size.h, dpr, sourceWidth],
  );
  const baseView = useMemo(() => {
    if (!frame.w) return { scale: 1, tx: 0, ty: 0 };
    const { x, y, scale } = phase.initialView;
    const wanted = narrow ? scale * 1.25 : scale;
    return viewCentredOn(x, y, Math.min(wanted, frame.sharpScale), frame);
  }, [phase, narrow, frame]);
  // clamped on every render so a window resize cannot leave the plan off-frame
  const view = useMemo(
    () => (frame.w ? clampView(pinned ?? baseView, frame) : baseView),
    [pinned, baseView, frame],
  );

  // gesture handlers update from the latest view without re-subscribing
  const baseRef = useRef(baseView);
  const sourceRef = useRef(sourceWidth);
  useEffect(() => {
    baseRef.current = baseView;
    sourceRef.current = sourceWidth;
  }, [baseView, sourceWidth]);

  const active = selected ?? hovered;

  // Measure the frame itself, not the window: with the columns stretched the
  // legend sets the row's height, so the frame changes shape for reasons the
  // window never sees. A stale size feeds clampView the wrong bounds, which
  // pushes the plan clean out of view.
  //
  // Both setters return the previous value when nothing moved, so running this
  // after every commit costs one comparison and cannot loop.
  const measure = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    // moving the window between a retina and a standard display changes how far
    // the plan can be zoomed before it softens
    const ratio = window.devicePixelRatio || 1;
    setDpr((prev) => (prev === ratio ? prev : ratio));
  }, []);

  // after every commit, so a layout change is picked up in the same frame
  useLayoutEffect(measure);

  // ResizeObserver catches frame-only changes, but do not depend on it: some
  // embedded webviews never deliver the initial callback the spec requires.
  useEffect(() => {
    window.addEventListener("resize", measure);
    const el = frameRef.current;
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (el) observer?.observe(el);
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [measure]);

  // Off the critical path: the base is already on screen, and a failed load
  // just leaves the zoom ceiling where it is.
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setDetailReady(true);
    img.src = PLAN.detail;
  }, []);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /** Drop any flight in progress, frame and safety timer both. */
  const stopAnimation = useCallback(() => {
    if (animation.current) cancelAnimationFrame(animation.current);
    if (landing.current) clearTimeout(landing.current);
    animation.current = null;
    landing.current = null;
  }, []);

  const animateTo = useCallback(
    (from: View, target: View) => {
      stopAnimation();
      // An embed can sit in a hidden tab or scrolled off the page, and a hidden
      // document is served no animation frames at all. Move without animating
      // rather than not moving.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.hidden) {
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
        else if (landing.current) clearTimeout(landing.current);
      };
      animation.current = requestAnimationFrame(step);
      // and if the frames stop arriving mid-flight, still land on the target
      landing.current = window.setTimeout(() => setPinned(target), 700);
    },
    [stopAnimation],
  );

  const selectFeature = useCallback(
    (feature: Feature | null, source: "legend" | "map") => {
      if (!feature) {
        setSelected(null);
        return;
      }
      setSelected(feature.key);
      if (source === "legend" && frame.w) {
        animateTo(view, viewFramingFeature(feature, frame));
      }
      if (source === "map") {
        legendRows.current
          .get(feature.key)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    },
    [animateTo, view, frame],
  );

  // wheel zoom has to be non-passive to stop the page scrolling underneath
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopAnimation();
      const box = el.getBoundingClientRect();
      const px = e.clientX - box.left;
      const py = e.clientY - box.top;
      const f = frameOf(box.width, box.height, window.devicePixelRatio || 1, sourceRef.current);
      setPinned((current) => {
        const v = current ?? baseRef.current;
        const next = Math.min(
          f.maxScale,
          Math.max(f.minScale, v.scale * Math.exp(-e.deltaY * 0.0016)),
        );
        const k = next / v.scale;
        return clampView(
          { scale: next, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k },
          f,
        );
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [stopAnimation]);

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
    stopAnimation();
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
      const f = frameOf(box.width, box.height, window.devicePixelRatio || 1, sourceRef.current);
      setPinned((current) => {
        const v = current ?? baseRef.current;
        const next = Math.min(f.maxScale, Math.max(f.minScale, startScale * ratio));
        const k = next / v.scale;
        return clampView(
          { scale: next, tx: px - (px - v.tx) * k, ty: py - (py - v.ty) * k },
          f,
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
        return clampView(
          { ...v, tx: v.tx + dx, ty: v.ty + dy },
          frameOf(box.width, box.height, window.devicePixelRatio || 1, sourceRef.current),
        );
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
      if (!frame.w) return;
      const next = Math.min(frame.maxScale, Math.max(frame.minScale, view.scale * factor));
      const k = next / view.scale;
      animateTo(
        view,
        clampView(
          {
            scale: next,
            tx: frame.w / 2 - (frame.w / 2 - view.tx) * k,
            ty: frame.h / 2 - (frame.h / 2 - view.ty) * k,
          },
          frame,
        ),
      );
    },
    [animateTo, view, frame],
  );

  const resetView = useCallback(() => {
    setSelected(null);
    setPinned(null);
    stopAnimation();
  }, [stopAnimation]);

  const controlStyle: React.CSSProperties = {
    borderRadius: 300,
    border: "1px solid rgba(0,0,0,0.15)",
    background: "rgba(255,255,255,0.94)",
    cursor: "pointer",
  };
  const hint = (
    <p style={{ fontSize: 12, color: "#6c6c64", margin: narrow ? "10px 16px 0" : "10px 0 0" }}>
      Scroll or pinch to zoom, drag to move around the map.
    </p>
  );
  // the plan's dense corners put six markers inside a thumb's width on a phone,
  // so narrow screens get smaller circles and open a little further in
  const markerSize = narrow ? 25 : 28;
  const selectedFeature = phase.features.find((f) => f.key === selected);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: narrow ? "0 0 32px" : "0 0 48px" }}>
      {/* Phase switch */}
      <div style={{ textAlign: "center", padding: narrow ? "26px 16px 18px" : "40px 24px 24px" }}>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 500,
          fontSize: narrow ? 32 : 46,
          lineHeight: 1.12,
          marginBottom: 20,
        }}>
          Explore the Site Map
        </h1>
        {/* stacked and equal width on a phone, where the two labels cannot sit
            side by side and ragged widths read as a mistake */}
        <div style={
          narrow
            ? { display: "grid", gap: 8, width: "100%" }
            : { display: "inline-flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }
        }>
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
                  padding: "12px 26px",
                  borderRadius: 300,
                  border: `1px solid ${on ? AIM_GREEN : "#c9c9c0"}`,
                  background: on ? AIM_GREEN : "transparent",
                  color: on ? "#fff" : "#000",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                  fontSize: narrow ? 15 : 16,
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
        gap: narrow ? 0 : COLUMN_GAP,
        // stretched, so the plan ends level with the legend instead of leaving a
        // ragged gap under the shorter of the two
        alignItems: narrow ? "flex-start" : "stretch",
        padding: narrow ? 0 : `0 ${EDGE_PAD}px`,
      }}>
        {/* Legend. Beside the plan rather than above it, so selecting a row
            never pushes the thing it highlights out of view. */}
        <div style={{
          order: narrow ? 2 : 1,
          width: narrow ? "100%" : LEGEND_WIDTH,
          flexShrink: 0,
          background: CREAM,
          padding: narrow ? "18px 16px 22px" : "20px 18px",
          borderTop: narrow ? "1px solid #e2e1d6" : "none",
        }}>
          <h2 style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            fontWeight: 500,
            // caps at this size need the tracking to stay readable
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            lineHeight: 1.3,
            color: AIM_GREEN,
            margin: "0 0 8px",
          }}>
            {/* "Phase One:" on its own line, the way the printed legend sets it */}
            {phase.title.split(/:\s*/).map((line, i, all) => (
              <span key={line} style={{ display: "block" }}>
                {i < all.length - 1 ? `${line}:` : line}
              </span>
            ))}
          </h2>
          <p style={{ fontSize: 13, color: "#494949", margin: "0 0 14px" }}>
            Select a feature to find it on the site map, or choose a marker on the map.
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
                        <span style={{
                          display: "block",
                          color: "#7a7a72",
                          fontWeight: 400,
                          fontSize: 12,
                        }}>
                          {f.points.length} locations
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
        <div style={{
          order: narrow ? 1 : 2,
          flex: 1,
          width: "100%",
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}>
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
              // side by side, the legend sets the height and the plan fills it;
              // stacked on a phone, the plan sets its own
              flex: narrow ? "none" : 1,
              minHeight: narrow ? undefined : 400,
              aspectRatio: narrow ? "4 / 3" : undefined,
              overflow: "hidden",
              background: "#cfd3c6",
              cursor: dragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              // the layer keeps the plan's proportions whatever shape the frame
              // is: this is what holds every marker on its feature
              aspectRatio: String(PLAN.width / PLAN.height),
              transformOrigin: "0 0",
              transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.scale})`,
              willChange: "transform",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={PLAN.src}
                alt="Aerial site map of the Center for Food and Agriculture at the Marin Civic Center campus"
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

              {/* The detail render, laid over the base once it has loaded. The
                  base stays underneath so there is never a blank frame, and
                  this carries no alt text: it is the same picture. */}
              {detailReady && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={PLAN.detail}
                  alt=""
                  aria-hidden
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}

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

          {narrow && hint}
        </div>
      </div>

      {!narrow && (
        <div style={{ padding: `0 ${EDGE_PAD}px`, marginLeft: LEGEND_WIDTH + COLUMN_GAP }}>
          {hint}
        </div>
      )}
    </div>
  );
}
