"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import Arrival from "@/components/Arrival";
import AudioToggle from "@/components/AudioToggle";
import Starfield from "@/components/Starfield";
import {
  readCrestAudioEnabled,
  writeCrestAudioEnabled,
} from "@/lib/crest-audio-storage";
import { selectMatches } from "@/lib/select";
import { useCrowdAudio } from "@/lib/use-crowd-audio";
import {
  countQuizAnswers,
  initialState,
  isQuizComplete,
  loadPersistedState,
  persistState,
  quizReducer,
  TOTAL_QUIZ_QUESTIONS,
} from "@/lib/quiz-reducer";
import OpeningScreen from "./OpeningScreen";
import OwnedClubScreen from "./OwnedClubScreen";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";
import styles from "./CrestApp.module.css";

function skipArrivalOnLoad() {
  const loaded = loadPersistedState();
  return Boolean(loaded && loaded.step === "complete" && isQuizComplete(loaded));
}

/**
 * @param {{ clubs: object[] }} props
 */
export default function CrestApp({ clubs }) {
  const [state, dispatch] = useReducer(
    quizReducer,
    undefined,
    () => loadPersistedState() ?? initialState(),
  );

  const [arrivalDone, setArrivalDone] = useState(skipArrivalOnLoad);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [starfieldControl, setStarfieldControl] = useState({
    opacity: 1,
    running: true,
    warpMultiplier: 1,
    streak: false,
  });

  useEffect(() => {
    setAudioEnabled(readCrestAudioEnabled());
  }, []);

  const crowd = useCrowdAudio(audioEnabled);

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    if (state.step !== "complete") {
      setArrivalDone(false);
      setStarfieldControl({
        opacity: 1,
        running: true,
        warpMultiplier: 1,
        streak: false,
      });
    }
  }, [state.step]);

  useEffect(() => {
    if (state.step === "start" || state.step === "owned") {
      crowd.stop();
    }
  }, [state.step, crowd.stop]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  }, []);

  const pickerClubs = clubs.map((c) => ({ slug: c.slug, name: c.name }));

  const screenKey = `${state.step}-${state.quizIndex}`;

  const answeredCount = useMemo(() => countQuizAnswers(state), [state]);
  const starfieldProgress =
    TOTAL_QUIZ_QUESTIONS > 0 ? answeredCount / TOTAL_QUIZ_QUESTIONS : 1;

  const quizComplete = state.step === "complete" && isQuizComplete(state);

  const primaryClub = useMemo(() => {
    if (!quizComplete || !state.pillar) return null;
    const result = selectMatches(
      /** @type {number[]} */ (state.scores),
      clubs,
      state.pillar,
      state.ownedSlugs,
    );
    return result.primary?.club ?? null;
  }, [quizComplete, state.scores, state.pillar, state.ownedSlugs, clubs]);

  const patchStarfield = useCallback((patch) => {
    setStarfieldControl((prev) => ({ ...prev, ...patch }));
  }, []);

  const onCrowdWhiteout = useCallback(() => {
    crowd.startWhiteout();
  }, [crowd]);

  const onCrowdGround = useCallback(() => {
    crowd.startGround();
  }, [crowd]);

  const onCrowdStop = useCallback(() => {
    crowd.stop();
  }, [crowd]);

  const toggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      writeCrestAudioEnabled(next);
      if (next) {
        crowd.unlock();
      } else {
        crowd.stop();
      }
      return next;
    });
  }, [crowd]);

  const showArrival = quizComplete && !arrivalDone;
  const showResults = quizComplete && arrivalDone;
  const showAudioToggle =
    state.step === "quiz" || state.step === "complete";

  return (
    <>
      <Starfield
        progress={starfieldProgress}
        boost={answeredCount}
        opacity={starfieldControl.opacity}
        running={starfieldControl.running}
        warpMultiplier={starfieldControl.warpMultiplier}
        streak={starfieldControl.streak}
      />
      {showAudioToggle ? (
        <AudioToggle enabled={audioEnabled} onToggle={toggleAudio} />
      ) : null}
      {showArrival ? (
        <Arrival
          club={primaryClub}
          onComplete={() => setArrivalDone(true)}
          onStarfield={patchStarfield}
          onCrowdWhiteout={onCrowdWhiteout}
          onCrowdGround={onCrowdGround}
          onCrowdStop={onCrowdStop}
        />
      ) : null}
      <div
        className={`${styles.app} ${showArrival ? styles.appDuringArrival : ""}`}
      >
        {state.step === "start" && (
          <div key={screenKey} className={styles.screenEnter}>
            <OpeningScreen onStart={() => dispatch({ type: "START" })} />
          </div>
        )}
        {state.step === "owned" && (
          <div key={screenKey} className={styles.screenEnter}>
            <OwnedClubScreen
              clubs={pickerClubs}
              ownedSlugs={state.ownedSlugs}
              noClubYet={state.noClubYet}
              onToggle={(slug) =>
                dispatch({ type: "TOGGLE_OWNED", payload: slug })
              }
              onNoClub={() => dispatch({ type: "NO_CLUB_YET" })}
              onContinue={() => dispatch({ type: "OWNED_CONTINUE" })}
              onBack={() => dispatch({ type: "BACK" })}
            />
          </div>
        )}
        {state.step === "quiz" && (
          <div key={screenKey} className={styles.screenEnter}>
            <QuestionScreen
              quizIndex={state.quizIndex}
              scores={state.scores}
              character={state.character}
              onAnswerDimension={(index, value) =>
                dispatch({ type: "ANSWER_DIMENSION", payload: { index, value } })
              }
              onAnswerCharacter={(key, value) =>
                dispatch({ type: "ANSWER_CHARACTER", payload: { key, value } })
              }
              onAnswerPillar={(w) =>
                dispatch({ type: "ANSWER_PILLAR", payload: w })
              }
              onBack={() => dispatch({ type: "BACK" })}
            />
          </div>
        )}
        {showResults ? (
          <div key={screenKey} className={styles.screenEnter}>
            <ResultScreen
              scores={/** @type {number[]} */ (state.scores)}
              character={state.character}
              pillar={/** @type {{ Heart: number; Mind: number; Soul: number }} */ (
                state.pillar
              )}
              ownedSlugs={state.ownedSlugs}
              clubs={clubs}
              onRestart={() => {
                crowd.stop();
                dispatch({ type: "RESTART" });
              }}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
