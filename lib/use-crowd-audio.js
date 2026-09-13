"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

export const CROWD_SRC = "/audio/crowd-swell.mp3";
export const SWELL_SECONDS = 6;
export const LOOP_FADE_MS = 2000;
const LOOP_TARGET_VOLUME = 0.72;
const SWELL_VOLUME = 0.5;

/**
 * @param {number} from
 * @param {number} to
 * @param {number} ms
 * @param {(v: number) => void} apply
 * @returns {() => void} cancel
 */
function fadeVolume(from, to, ms, apply) {
  const start = performance.now();
  let raf = 0;
  function tick(now) {
    const t = Math.min(1, (now - start) / ms);
    const v = from + (to - from) * t;
    apply(v);
    if (t < 1) raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/**
 * @param {HTMLAudioElement | null} audio
 * @param {number} ms
 * @returns {Promise<void>}
 */
function fadeOutAndPause(audio, ms = 500) {
  if (!audio) return Promise.resolve();
  return new Promise((resolve) => {
    const from = audio.volume;
    const cancel = fadeVolume(from, 0, ms, (v) => {
      audio.volume = v;
    });
    window.setTimeout(() => {
      cancel();
      audio.pause();
      audio.currentTime = 0;
      audio.loop = false;
      resolve();
    }, ms + 30);
  });
}

/**
 * @param {boolean} enabled preference (user opt-in)
 */
export function useCrowdAudio(enabled) {
  const audioRef = useRef(/** @type {HTMLAudioElement | null} */ (null));
  const loopBoundRef = useRef(false);
  const fadeCancelRef = useRef(/** @type {(() => void) | null} */ (null));
  const durationRef = useRef(10);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const audio = new Audio(CROWD_SRC);
    audio.preload = "auto";
    audioRef.current = audio;

    function onMeta() {
      if (Number.isFinite(audio.duration) && audio.duration > SWELL_SECONDS) {
        durationRef.current = audio.duration;
      }
    }
    audio.addEventListener("loadedmetadata", onMeta);

    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      fadeCancelRef.current?.();
      fadeOutAndPause(audio, 400);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (enabled) return;
    fadeCancelRef.current?.();
    fadeOutAndPause(audioRef.current, 350);
  }, [enabled]);

  const bindLoopHandler = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || loopBoundRef.current) return;
    loopBoundRef.current = true;

    function onTimeUpdate() {
      if (audio.loop) return;
      if (audio.currentTime >= SWELL_SECONDS - 0.08) {
        audio.loop = true;
        audio.currentTime = SWELL_SECONDS;
        if ("loopStart" in audio) {
          audio.loopStart = SWELL_SECONDS;
          audio.loopEnd = durationRef.current;
        }
      }
    }
    audio.addEventListener("timeupdate", onTimeUpdate);
  }, []);

  const startWhiteout = useCallback(() => {
    if (!enabled) return;
    const audio = audioRef.current;
    if (!audio) return;
    fadeCancelRef.current?.();
    loopBoundRef.current = false;
    audio.loop = false;
    audio.currentTime = 0;
    audio.volume = SWELL_VOLUME;
    bindLoopHandler();
    audio.play().catch(() => {});
  }, [enabled, bindLoopHandler]);

  const startGround = useCallback(() => {
    if (!enabled) return;
    const audio = audioRef.current;
    if (!audio) return;
    fadeCancelRef.current?.();
    bindLoopHandler();
    audio.loop = true;
    audio.currentTime = SWELL_SECONDS;
    if ("loopStart" in audio) {
      audio.loopStart = SWELL_SECONDS;
      audio.loopEnd = durationRef.current;
    }
    audio.volume = 0;
    if (audio.paused) {
      audio.play().catch(() => {});
    }
    fadeCancelRef.current = fadeVolume(0, LOOP_TARGET_VOLUME, LOOP_FADE_MS, (v) => {
      audio.volume = v;
    });
  }, [enabled, bindLoopHandler]);

  const stop = useCallback(() => {
    fadeCancelRef.current?.();
    fadeCancelRef.current = null;
    return fadeOutAndPause(audioRef.current, 500);
  }, []);

  const unlock = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {});
  }, []);

  return useMemo(
    () => ({ startWhiteout, startGround, stop, unlock }),
    [startWhiteout, startGround, stop, unlock],
  );
}
