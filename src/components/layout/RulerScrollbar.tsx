import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ARC_PX,
  clamp01,
  DETACH_ZONE,
  EDGE_PAD,
  easeInOutCubic,
  FLIP_ZONE,
  getDocumentHeight,
  HEADING_PX,
  QUEUE_PAD,
  QUEUE_PX,
  QUEUE_SLOT,
  RAIL_WIDTH,
  RIDING_PX,
  STAGGER,
  TOP_PAD,
  useRulerScroll,
} from '@/hooks/scroll/useRulerScroll';
import { getScrollTop } from '@/utils/scroll';

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/**
 * Top-of-rail title stack: the active section title sits at the top anchor and
 * the previous section title stays parked just above it (dimmed + slightly
 * smaller) instead of being removed the moment a new title takes the top slot.
 */
const TOP_STACK_GAP = 24;
const PREV_TOP_ALPHA = 0.45;
/** Overall size of the titles parked at the top of the rail */
const TOP_TITLE_SCALE = 0.75;

interface RulerScrollbarProps {
  /** Set to true to re-enable the right-side ruler scrollbar */
  enabled?: boolean;
}

/** Disabled by user request. Change to true to re-enable without removing code. */
const DEFAULT_ENABLED = false;

export default function RulerScrollbar({ enabled = DEFAULT_ENABLED }: RulerScrollbarProps = {}) {
  if (!enabled) return null;
  return <RulerScrollbarContent />;
}

function RulerScrollbarContent() {
  const {
    sections,
    metrics,
    ghostY,
    ghostPercent,
    jumpToSection,
    handleRailClick,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerLeave,
  } = useRulerScroll();

  const [vh, setVh] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800,
  );

  const needleRef = useRef<HTMLDivElement | null>(null);
  const readoutRef = useRef<HTMLDivElement | null>(null);
  const digitRefs = useRef<Array<HTMLSpanElement | null>>([null, null, null]);
  const letterRefs = useRef<Record<string, Array<HTMLSpanElement | null>>>({});
  const hitRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const tickRefs = useRef<Array<HTMLSpanElement | null>>([]);
  // Smoothed top-slot presentation (y / opacity / scale) per section index
  const topStateRef = useRef<Array<{ y: number; alpha: number; scale: number }>>(
    [],
  );

  const smoothScrollYRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const velocityRef = useRef(0);

  useEffect(() => {
    const handleResize = () => setVh(window.innerHeight);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const usableHeight = Math.max(100, vh - 2 * EDGE_PAD);

  // Static tick positions
  const ticks = useMemo(() => {
    const items = [];
    for (let p = 0; p <= 100; p += 2.5) {
      const rounded = Math.round(p * 10) / 10;
      const isMajor = rounded % 5 === 0;
      const y = EDGE_PAD + (rounded / 100) * usableHeight;
      items.push({
        pct: rounded,
        isMajor,
        label: isMajor ? String(Math.round(rounded)) : undefined,
        y,
      });
    }
    return items;
  }, [usableHeight]);

  // Main high-performance animation frame loop: 100% direct DOM manipulation, zero React re-renders
  useEffect(() => {
    let animId: number;

    const frame = (now: number) => {
      const currentVh = window.innerHeight;
      const currentVw = window.innerWidth;
      const docH = getDocumentHeight();
      const maxScroll = Math.max(1, docH - currentVh);
      const actualY = getScrollTop();

      // Smooth lerp
      const dt = Math.max(0.016, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const dy = actualY - smoothScrollYRef.current;
      smoothScrollYRef.current += dy * Math.min(1, 16 * dt);
      const currY = smoothScrollYRef.current;

      const vel = Math.abs(actualY - lastScrollYRef.current) / dt;
      lastScrollYRef.current = actualY;
      velocityRef.current = velocityRef.current * 0.75 + vel * 0.25;

      const pct = clamp01(currY / maxScroll);
      const uHeight = Math.max(100, currentVh - 2 * EDGE_PAD);
      const needleY = EDGE_PAD + pct * uHeight;
      const needleOpacity = Math.min(1, Math.max(0, (pct - 0.005) / 0.02));

      // 1. Update Needle
      if (needleRef.current) {
        needleRef.current.style.transform = `translate3d(0, ${needleY}px, 0)`;
        needleRef.current.style.opacity = String(needleOpacity);
      }

      // 2. Update Digit Tumbler Odometer
      const currentPctInt = Math.min(100, Math.max(0, Math.round(pct * 100)));
      const digitsArr = [
        Math.floor(currentPctInt / 100),
        Math.floor((currentPctInt % 100) / 10),
        currentPctInt % 10,
      ];

      digitsArr.forEach((d, idx) => {
        const el = digitRefs.current[idx];
        if (el) {
          el.style.transform = `translateY(-${d}em)`;
        }
      });

      if (readoutRef.current) {
        const isNearBottom = needleY > currentVh - 45;
        readoutRef.current.className = `ruler-readout ${
          isNearBottom ? 'readout-above' : 'readout-below'
        }`;
      }

      // 3. Dynamic Ticks Velocity Stretch
      const velFactor = Math.min(1.5, velocityRef.current / 1500);
      ticks.forEach((tick, tIdx) => {
        const el = tickRefs.current[tIdx];
        if (!el) return;
        const distToNeedle = Math.abs(tick.y - needleY);
        if (distToNeedle < 120) {
          const proximity = 1 - distToNeedle / 120;
          const scaleStretch = 1 + velFactor * proximity * 0.8;
          el.style.transform = `scaleX(${scaleStretch})`;
          el.style.opacity = String(
            tick.isMajor
              ? Math.min(1, 0.72 + proximity * 0.28)
              : Math.min(0.85, 0.24 + proximity * 0.45),
          );
        } else {
          el.style.transform = 'scaleX(1)';
          el.style.opacity = tick.isMajor ? '0.72' : '0.24';
        }
      });

      // 4. Section Letter Arc Curves & Hitboxes
      const totalSecs = sections.length;
      if (totalSecs > 0) {
        const thresholdY = currY + currentVh * 0.35;
        let activeIdx = 0;
        for (let i = 0; i < totalSecs; i++) {
          if (sections[i].top <= thresholdY) {
            activeIdx = i;
          } else {
            break;
          }
        }

        sections.forEach((sec, sIdx) => {
          const m = metrics[sec.label];
          const letterEls = letterRefs.current[sec.id];
          const hitEl = hitRefs.current[sec.id];
          if (!m || !letterEls) return;

          const numLetters = sec.label.length;
          const o = sec.top - currY;
          const thresholdLine = 0.12 * currentVh;

          let flipP = 0;
          if (sIdx === 0) {
            const heroOut = Math.max(0, currY / Math.max(1, sec.height * 0.7));
            flipP = Math.max(0, 1 - heroOut);
          } else {
            flipP = clamp01((thresholdLine + FLIP_ZONE - o) / FLIP_ZONE);
          }

          const yq =
            currentVh - QUEUE_PAD - (totalSecs - 1 - sIdx) * QUEUE_SLOT;
          const rideLen = m.total * HEADING_PX * (RIDING_PX / HEADING_PX);
          const detachP = clamp01(
            (yq + DETACH_ZONE - (o + rideLen)) / DETACH_ZONE,
          );

          const textPad = 18;
          const ridingRatio = RIDING_PX / HEADING_PX;
          const queueRatio = QUEUE_PX / HEADING_PX;
          const targetTopY = TOP_PAD + 44;
          const isCurrentActive = sIdx === activeIdx;

          // Top-slot stack state: rank 0 = active, rank 1 = previous (stays
          // visible above the active one), rank 2+ = hidden but still eased out.
          const topRank = activeIdx - sIdx;
          const bTargetY =
            targetTopY - (topRank > 0 ? topRank * TOP_STACK_GAP : 0);
          const bTargetAlpha =
            topRank === 0 ? 1.0 : topRank === 1 ? PREV_TOP_ALPHA : 0;
          const bTargetScale =
            (topRank === 0 ? 1.0 : 0.85) * TOP_TITLE_SCALE;

          // Ease toward the target so titles hand off smoothly instead of
          // snapping between slots when the active section changes.
          const ease = Math.min(1, 10 * dt);
          const prevTop = topStateRef.current[sIdx];
          const smoothTop = prevTop
            ? {
                y: prevTop.y + (bTargetY - prevTop.y) * ease,
                alpha: prevTop.alpha + (bTargetAlpha - prevTop.alpha) * ease,
                scale: prevTop.scale + (bTargetScale - prevTop.scale) * ease,
              }
            : { y: bTargetY, alpha: bTargetAlpha, scale: bTargetScale };
          topStateRef.current[sIdx] = smoothTop;

          let minX = Infinity;
          let maxX = -Infinity;
          let minY = Infinity;
          let maxY = -Infinity;

          for (let e = 0; e < numLetters; e++) {
            const letterEl = letterEls[e];
            if (!letterEl) continue;

            // Target B: Horizontal at top (placed safely to the left of the rail)
            const bTotalOffset =
              (m.total - m.cum[e] - m.adv[e] / 2) * HEADING_PX;
            const bX = currentVw - (RAIL_WIDTH + textPad + bTotalOffset);
            const bY = smoothTop.y;
            const bRot = 0;
            const bScale = smoothTop.scale;
            const bAlpha = smoothTop.alpha;

            // Target Z: Vertical riding along rail (placed to the left of tick numbers)
            const zTotalOffset =
              (m.total - m.cum[e] - m.adv[e] / 2) * HEADING_PX * ridingRatio;
            const zX = currentVw - (RAIL_WIDTH + 10);
            const zY = o + zTotalOffset;
            const zRot = -90;
            const zScale = ridingRatio;
            const zAlpha = 0.45;

            // Target Q: Horizontal queued at bottom
            const qTotalOffset =
              (m.total - m.cum[e] - m.adv[e] / 2) * HEADING_PX * queueRatio;
            const qX = currentVw - (RAIL_WIDTH + textPad + qTotalOffset);
            const qY = yq;
            const qRot = 0;
            const qScale = queueRatio;
            const qAlpha = 0.32;

            let curX: number;
            let curY: number;
            let curRot: number;
            let curScale: number;
            let curAlpha: number;

            if (flipP > 0) {
              const t = flipP;
              const O = 1 + (numLetters - 1) * STAGGER;
              const l = clamp01(t * O - e * STAGGER);
              const d = easeInOutCubic(l);

              const midX = (zX + bX) / 2 - ARC_PX;
              const midY = (zY + bY) / 2;

              const b1 = 1 - d;
              curX = b1 * b1 * zX + 2 * b1 * d * midX + d * d * bX;
              curY = b1 * b1 * zY + 2 * b1 * d * midY + d * d * bY;
              curRot = zRot + (bRot - zRot) * d;
              curScale = zScale + (bScale - zScale) * d;
              curAlpha = zAlpha + (bAlpha - zAlpha) * d;
            } else if (detachP < 1) {
              const t = detachP;
              const O = 1 + (numLetters - 1) * STAGGER;
              const l = clamp01(t * O - e * STAGGER);
              const d = easeInOutCubic(l);

              const midX = (qX + zX) / 2 - ARC_PX;
              const midY = (qY + zY) / 2;

              const b1 = 1 - d;
              curX = b1 * b1 * qX + 2 * b1 * d * midX + d * d * zX;
              curY = b1 * b1 * qY + 2 * b1 * d * midY + d * d * zY;
              curRot = qRot + (zRot - qRot) * d;
              curScale = qScale + (zScale - qScale) * d;
              curAlpha = qAlpha + (zAlpha - qAlpha) * d;
            } else {
              curX = zX;
              curY = zY;
              curRot = zRot;
              curScale = zScale;
              curAlpha = isCurrentActive ? 0.9 : zAlpha;
            }

            letterEl.style.transform = `translate3d(${curX}px, ${curY}px, 0) translate(-50%, -50%) rotate(${curRot}deg) scale(${curScale})`;
            letterEl.style.opacity = String(curAlpha);

            minX = Math.min(minX, curX - 16);
            maxX = Math.max(maxX, curX + 16);
            minY = Math.min(minY, curY - 16);
            maxY = Math.max(maxY, curY + 16);
          }

          if (hitEl && isFinite(minX)) {
            hitEl.style.left = `${minX}px`;
            hitEl.style.top = `${minY}px`;
            hitEl.style.width = `${Math.max(20, maxX - minX)}px`;
            hitEl.style.height = `${Math.max(20, maxY - minY)}px`;
          }
        });
      }

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animId);
  }, [sections, metrics, ticks]);

  return (
    <div
      className="ruler-container"
      role="region"
      aria-label="Scroll ruler and section navigator"
    >
      {/* Top Wordmark */}
      <div className="ruler-top-wordmark" aria-hidden="true">
        SHOAIB
      </div>

      {/* Kinetic Letters Layer */}
      {sections.map((sec) => (
        <React.Fragment key={sec.id}>
          {/* Clickable Hitbox */}
          <a
            href={`#${sec.id}`}
            ref={(el) => {
              hitRefs.current[sec.id] = el;
            }}
            onClick={(e) => {
              e.preventDefault();
              jumpToSection(sec.id);
            }}
            className="ruler-hitbox"
            aria-label={`Jump to ${sec.label}`}
          />

          {/* Letter Spans */}
          <div className="ruler-letter-group" aria-hidden="true">
            {sec.label.split('').map((char, charIdx) => (
              <span
                key={charIdx}
                ref={(el) => {
                  if (!letterRefs.current[sec.id]) {
                    letterRefs.current[sec.id] = [];
                  }
                  letterRefs.current[sec.id][charIdx] = el;
                }}
                className="ruler-letter"
                style={{ fontSize: `${HEADING_PX}px` }}
              >
                {char}
              </span>
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* The Ruler Tick Rail */}
      <div
        className="ruler-rail"
        role="scrollbar"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Page scroll position"
        onClick={handleRailClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
      >
        {/* Ruler Ticks */}
        {ticks.map((tick, tIdx) => (
          <React.Fragment key={tick.pct}>
            <span
              ref={(el) => {
                tickRefs.current[tIdx] = el;
              }}
              className={`ruler-tick ${
                tick.isMajor ? 'ruler-tick-major' : 'ruler-tick-minor'
              }`}
              style={{ top: `${tick.y}px` }}
              aria-hidden="true"
            />
            {tick.isMajor && tick.label !== undefined && (
              <span
                className="ruler-tick-label"
                style={{ top: `${tick.y}px` }}
                aria-hidden="true"
              >
                {tick.label}
              </span>
            )}
          </React.Fragment>
        ))}

        {/* Hover Ghost Line */}
        {ghostY !== null && (
          <div
            className="ruler-ghost-line"
            style={{ top: `${ghostY}px` }}
            aria-hidden="true"
          >
            <span className="ruler-ghost-pill">
              {Math.round(ghostPercent * 100)}%
            </span>
          </div>
        )}

        {/* Active Needle & Live Rolling Dial Readout */}
        <div
          ref={needleRef}
          className="ruler-needle"
          style={{ top: '0px', opacity: 0 }}
          aria-hidden="true"
        >
          {/* Mechanical Digit Tumbler Odometer */}
          <div ref={readoutRef} className="ruler-readout readout-below">
            <div className="ruler-digits">
              {[0, 1, 2].map((colIdx) => (
                <span
                  key={colIdx}
                  ref={(el) => {
                    digitRefs.current[colIdx] = el;
                  }}
                  className="ruler-digit-col"
                  style={{ transform: 'translateY(0em)' }}
                >
                  {DIGITS.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </span>
              ))}
            </div>
            <span>%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
