export const CREST_AUDIO_KEY = "crest_audio";

/** @returns {boolean} */
export function readCrestAudioEnabled() {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(CREST_AUDIO_KEY) === "1";
  } catch {
    return false;
  }
}

/** @param {boolean} enabled */
export function writeCrestAudioEnabled(enabled) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CREST_AUDIO_KEY, enabled ? "1" : "0");
  } catch {
    /* private mode */
  }
}
