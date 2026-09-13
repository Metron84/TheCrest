"use client";

import { useEffect, useRef, useState } from "react";

const STAR_COUNT_DESKTOP = 220;
const STAR_COUNT_MOBILE = 120;
const MOBILE_MAX_WIDTH = 480;
const BG = "#0A111F";
const BG_RGB = "10, 17, 31";
const STAR_RGB = "242, 237, 228";
const GLOW_RGB = "216, 35, 42";
const BOOST_MS = 900;
const BOOST_PEAK = 6;
const PROGRESS_MS = 1200;
const RESIZE_DEBOUNCE_MS = 150;
const MAX_DPR = 2;
const GLOW_R_MIN = 8;
const GLOW_R_MAX = 180;
const PERF_FRAME_SAMPLES = 60;
const PERF_FRAME_BUDGET_MS = 24;

/** @param {number} t 0–1 */
function easeInOutCubic(t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** @param {number} w */
function baseStarCount(w) {
  return w < MOBILE_MAX_WIDTH ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
}

/**
 * @param {{
 *   progress?: number;
 *   boost?: number;
 *   opacity?: number;
 *   running?: boolean;
 *   warpMultiplier?: number;
 *   streak?: boolean;
 * }} props
 * progress 0–1: baseline speed 0.15 → 0.6 (smoothed over 1200ms)
 * boost: increment to trigger a 900ms speed burst (×6 easing to baseline)
 */
export default function Starfield({
  progress = 0,
  boost = 0,
  opacity = 1,
  running = true,
  warpMultiplier = 1,
  streak = false,
}) {
  const canvasRef = useRef(null);
  const starsRef = useRef(/** @type {{ x: number; y: number; z: number }[] | null} */ (null));
  const rafRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const starCountRef = useRef(STAR_COUNT_DESKTOP);
  const perfHalvedRef = useRef(false);
  const boostStartRef = useRef(0);
  const lastBoostRef = useRef(/** @type {number | null} */ (null));
  const displayProgressRef = useRef(0);
  const progressAnimRef = useRef({ from: 0, to: 0, start: 0 });
  const visibleRef = useRef(true);
  const progressPropRef = useRef(progress);
  const drawStaticRef = useRef(/** @type {((p: number) => void) | null} */ (null));
  const runningRef = useRef(running);
  const warpMultiplierRef = useRef(warpMultiplier);
  const streakRef = useRef(streak);
  const opacityRef = useRef(opacity);
  const tickRef = useRef(/** @type {((now: number) => void) | null} */ (null));
  const [reducedMotion, setReducedMotion] = useState(false);

  progressPropRef.current = progress;
  runningRef.current = running;
  warpMultiplierRef.current = warpMultiplier;
  streakRef.current = streak;
  opacityRef.current = opacity;

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);
    const onChange = () => setReducedMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const target = Math.min(1, Math.max(0, progress));
    progressAnimRef.current = {
      from: displayProgressRef.current,
      to: target,
      start: performance.now(),
    };
  }, [progress, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    if (lastBoostRef.current === null) {
      lastBoostRef.current = boost;
      return;
    }
    if (boost > lastBoostRef.current) {
      boostStartRef.current = performance.now();
    }
    lastBoostRef.current = boost;
  }, [boost, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return undefined;

    let resizeTimer = 0;

    function clampProgress(p) {
      return Math.min(1, Math.max(0, p));
    }

    function resolveDisplayProgress(now) {
      const { from, to, start } = progressAnimRef.current;
      let t = (now - start) / PROGRESS_MS;
      if (t > 1) t = 1;
      const p = from + (to - from) * easeInOutCubic(t);
      displayProgressRef.current = p;
      return p;
    }

    function staticDisplayProgress() {
      return easeInOutCubic(clampProgress(progressPropRef.current));
    }

    function baselineSpeed(p) {
      const clamped = clampProgress(p);
      return 0.15 + (0.6 - 0.15) * clamped;
    }

    function speedMultiplier(now) {
      const start = boostStartRef.current;
      if (!start) return 1;
      const t = (now - start) / BOOST_MS;
      if (t >= 1) return 1;
      const eased = 1 - (1 - t) ** 3;
      return 1 + (BOOST_PEAK - 1) * (1 - eased);
    }

    function glowRadius(p, now, animatePulse) {
      const eased = easeInOutCubic(clampProgress(p));
      const base = GLOW_R_MIN + (GLOW_R_MAX - GLOW_R_MIN) * eased;
      if (!animatePulse) return base;
      const pulse = 1 + Math.sin(now / 900) * 0.04;
      return base * pulse;
    }

    function drawDestinationGlow(w, h, p, now, animatePulse) {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const r = glowRadius(p, now, animatePulse);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${GLOW_RGB}, 0.12)`);
      g.addColorStop(1, `rgb(${BG_RGB})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    function spawnNearCentre(star, w, h) {
      const cx = w * 0.5;
      const cy = h * 0.5;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * Math.min(w, h) * 0.04;
      star.x = cx + Math.cos(angle) * radius;
      star.y = cy + Math.sin(angle) * radius;
      star.z = 0.1 + Math.random() * 0.9;
    }

    function spawnStatic(star, w, h) {
      star.x = Math.random() * w;
      star.y = Math.random() * h;
      star.z = 0.1 + Math.random() * 0.9;
    }

    function initStars(w, h, count, staticField) {
      const stars = [];
      for (let i = 0; i < count; i += 1) {
        const star = { x: 0, y: 0, z: 0.5, px: 0, py: 0 };
        if (staticField) spawnStatic(star, w, h);
        else spawnNearCentre(star, w, h);
        star.px = star.x;
        star.py = star.y;
        stars.push(star);
      }
      starsRef.current = stars;
    }

    function syncStarCount(w) {
      if (!perfHalvedRef.current) {
        starCountRef.current = baseStarCount(w);
      }
    }

    function applySize(staticField) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      syncStarCount(w);
      initStars(w, h, starCountRef.current, staticField);
    }

    function drawStars(w, h) {
      const stars = starsRef.current;
      if (!stars?.length) return;
      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i];
        const alpha = 0.3 + star.z * 0.7;
        const radius = 0.35 + star.z * 1.65;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${STAR_RGB}, ${alpha})`;
        ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function drawStaticFrame(p) {
      const { w, h } = sizeRef.current;
      if (w === 0) return;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      drawDestinationGlow(w, h, p, 0, false);
      drawStars(w, h);
    }

    drawStaticRef.current = drawStaticFrame;

    function onResizeStatic() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        applySize(true);
        drawStaticFrame(staticDisplayProgress());
      }, RESIZE_DEBOUNCE_MS);
    }

    function offScreen(star, w, h) {
      const margin = 24;
      return (
        star.x < -margin ||
        star.x > w + margin ||
        star.y < -margin ||
        star.y > h + margin
      );
    }

    /** @type {number[]} */
    let frameDeltas = [];
    let lastTickTime = 0;
    let perfSamplingDone = false;

    function maybeHalveStars() {
      if (perfSamplingDone || perfHalvedRef.current) return;
      if (frameDeltas.length < PERF_FRAME_SAMPLES) return;
      const avg =
        frameDeltas.reduce((sum, dt) => sum + dt, 0) / frameDeltas.length;
      perfSamplingDone = true;
      if (avg <= PERF_FRAME_BUDGET_MS) return;
      perfHalvedRef.current = true;
      starCountRef.current = Math.max(1, Math.floor(starCountRef.current / 2));
      const { w, h } = sizeRef.current;
      if (w > 0) initStars(w, h, starCountRef.current, false);
    }

    function tick(now) {
      if (!visibleRef.current || !runningRef.current) {
        rafRef.current = 0;
        return;
      }

      if (canvasRef.current) {
        canvasRef.current.style.opacity = String(opacityRef.current);
      }

      if (lastTickTime > 0 && !perfSamplingDone) {
        frameDeltas.push(now - lastTickTime);
        if (frameDeltas.length > PERF_FRAME_SAMPLES) {
          frameDeltas.shift();
        }
        maybeHalveStars();
      }
      lastTickTime = now;

      const { w, h } = sizeRef.current;
      const stars = starsRef.current;
      if (!stars?.length || w === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const p = resolveDisplayProgress(now);
      const cx = w * 0.5;
      const cy = h * 0.5;
      const speed =
        baselineSpeed(p) * speedMultiplier(now) * warpMultiplierRef.current;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, w, h);
      drawDestinationGlow(w, h, p, now, true);

      const drawStreaks = streakRef.current;

      for (let i = 0; i < stars.length; i += 1) {
        const star = stars[i];
        star.px = star.x;
        star.py = star.y;
        let dx = star.x - cx;
        let dy = star.y - cy;
        let dist = Math.hypot(dx, dy);
        if (dist < 0.5) {
          const angle = Math.random() * Math.PI * 2;
          dx = Math.cos(angle);
          dy = Math.sin(angle);
          dist = 1;
        }
        const step = speed * star.z;
        star.x += (dx / dist) * step;
        star.y += (dy / dist) * step;

        if (offScreen(star, w, h)) {
          spawnNearCentre(star, w, h);
          star.px = star.x;
          star.py = star.y;
          continue;
        }

        if (typeof star.px !== "number") {
          star.px = star.x;
          star.py = star.y;
        }

        const alpha = 0.3 + star.z * 0.7;
        if (drawStreaks) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${STAR_RGB}, ${alpha})`;
          ctx.lineWidth = 0.35 + star.z * 1.2;
          ctx.lineCap = "round";
          ctx.moveTo(star.px, star.py);
          ctx.lineTo(star.x, star.y);
          ctx.stroke();
        } else {
          const radius = 0.35 + star.z * 1.65;
          ctx.beginPath();
          ctx.fillStyle = `rgba(${STAR_RGB}, ${alpha})`;
          ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    function onResizeAnimated() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        applySize(false);
      }, RESIZE_DEBOUNCE_MS);
    }

    function onVisibility() {
      const show = document.visibilityState !== "hidden";
      visibleRef.current = show;
      if (show && !rafRef.current && runningRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
      if (!show && rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    }

    if (reducedMotion) {
      perfHalvedRef.current = false;
      perfSamplingDone = true;
      applySize(true);
      drawStaticFrame(staticDisplayProgress());
      window.addEventListener("resize", onResizeStatic);

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResizeStatic);
        drawStaticRef.current = null;
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      };
    }

    frameDeltas = [];
    lastTickTime = 0;
    perfSamplingDone = false;
    applySize(false);
    tickRef.current = tick;
    window.addEventListener("resize", onResizeAnimated);
    document.addEventListener("visibilitychange", onVisibility);
    if (runningRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      tickRef.current = null;
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResizeAnimated);
      document.removeEventListener("visibilitychange", onVisibility);
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      drawStaticRef.current = null;
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!reducedMotion) return;
    drawStaticRef.current?.(staticDisplayProgressFromProp(progress));
  }, [progress, reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.opacity = String(opacity);
    }
  }, [opacity]);

  useEffect(() => {
    if (!running && rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      return;
    }
    if (running && !reducedMotion && !rafRef.current && tickRef.current) {
      rafRef.current = requestAnimationFrame(tickRef.current);
    }
  }, [running, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="crest-starfield"
      style={{ opacity }}
    />
  );
}

/** @param {number} progress */
function staticDisplayProgressFromProp(progress) {
  return easeInOutCubic(Math.min(1, Math.max(0, progress)));
}
