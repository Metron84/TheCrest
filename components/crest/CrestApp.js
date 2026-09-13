"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import Arrival from "@/components/Arrival";
import GroundFinale from "@/components/GroundFinale";
import Starfield from "@/components/Starfield";
import {
  destinationGlowColors,
  provisionalDestination,
} from "@/lib/provisional-match";
import { selectMatches } from "@/lib/select";
import { describeMatchClub } from "@/lib/tier";
import {
  countQuizAnswers,
  initialState,
  isQuizComplete,
  loadPersistedState,
  persistState,
  quizReducer,
  TOTAL_QUIZ_QUESTIONS,
} from "@/lib/quiz-reducer";
import JourneyShell from "./JourneyShell";
import OpeningScreen from "./OpeningScreen";
import OwnedClubScreen from "./OwnedClubScreen";
import QuestionScreen from "./QuestionScreen";
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
  const [starfieldControl, setStarfieldControl] = useState(() =>
    skipArrivalOnLoad()
      ? { opacity: 0, running: false, warpMultiplier: 1, streak: false }
      : { opacity: 1, running: true, warpMultiplier: 1, streak: false },
  );

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
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  }, []);

  const screenKey = `${state.step}-${state.quizIndex}`;

  const answeredCount = useMemo(() => countQuizAnswers(state), [state]);
  const journeyProgress =
    TOTAL_QUIZ_QUESTIONS > 0 ? answeredCount / TOTAL_QUIZ_QUESTIONS : 0;

  const quizComplete = state.step === "complete" && isQuizComplete(state);

  const provisional = useMemo(
    () => provisionalDestination(state, clubs),
    [state.scores, state.pillar, state.ownedSlugs, state.hatedColor, clubs],
  );

  const finalResult = useMemo(() => {
    if (!quizComplete || !state.pillar) return null;
    return selectMatches(
      /** @type {number[]} */ (state.scores),
      clubs,
      state.pillar,
      state.ownedSlugs,
      state.hatedColor,
    );
  }, [
    quizComplete,
    state.scores,
    state.pillar,
    state.ownedSlugs,
    state.hatedColor,
    clubs,
  ]);

  const finalClub = finalResult?.primary?.club ?? null;

  const destinationClub = finalClub ?? provisional?.club ?? null;

  const glow = useMemo(
    () => destinationGlowColors(destinationClub),
    [destinationClub],
  );

  const destinationMix = useMemo(() => {
    if (answeredCount <= 0) return 0;
    const journey = journeyProgress;
    const fit = provisional?.raw ?? 0;
    return Math.min(1, journey * 0.85 + fit * 0.2);
  }, [answeredCount, journeyProgress, provisional?.raw]);

  const starfieldProgress = useMemo(() => {
    const fit = provisional?.raw ?? 0;
    return Math.min(1, journeyProgress * 0.9 + fit * 0.12);
  }, [journeyProgress, provisional?.raw]);

  const homingLabel = destinationClub
    ? describeMatchClub(destinationClub)
    : null;

  const patchStarfield = useCallback((patch) => {
    setStarfieldControl((prev) => ({ ...prev, ...patch }));
  }, []);

  const onArrivalComplete = useCallback(() => {
    setArrivalDone(true);
  }, []);

  const handleRestart = useCallback(() => {
    dispatch({ type: "RESTART" });
  }, []);

  const showLanding = state.step === "start";
  const showJourney = state.step === "owned" || state.step === "quiz";
  const showArrival = quizComplete && !arrivalDone;
  const showGroundFinale = quizComplete && arrivalDone;
  const showStarfield = !showGroundFinale;

  return (
    <>
      {showStarfield ? (
        <Starfield
          progress={starfieldProgress}
          boost={answeredCount}
          opacity={starfieldControl.opacity}
          running={starfieldControl.running}
          warpMultiplier={starfieldControl.warpMultiplier}
          streak={starfieldControl.streak}
          destinationGlowRgb={glow.primary}
          destinationMix={destinationMix}
          horizonRgb={glow.secondary}
        />
      ) : null}
      {showArrival ? (
        <Arrival
          club={destinationClub}
          onComplete={onArrivalComplete}
          onStarfield={patchStarfield}
        />
      ) : null}
      {showGroundFinale ? (
        <GroundFinale
          club={destinationClub}
          countryFits={finalResult?.byCountry ?? []}
          onRestart={handleRestart}
        />
      ) : null}
      {showLanding ? (
        <div className={`${styles.app} ${styles.appLanding}`}>
          <OpeningScreen onStart={() => dispatch({ type: "START" })} />
        </div>
      ) : null}
      {showJourney ? (
        <div className={`${styles.app} ${styles.appJourney}`}>
          <JourneyShell homingLabel={homingLabel} progress={starfieldProgress}>
            {state.step === "owned" && (
              <div key={screenKey} className={styles.screenEnter}>
                <OwnedClubScreen
                  clubs={clubs}
                  onChooseClub={(slug) =>
                    dispatch({ type: "CHOOSE_OWNED", payload: slug })
                  }
                  onNoClub={() => dispatch({ type: "NO_CLUB_YET" })}
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
                  hatedColor={state.hatedColor}
                  onAnswerDimension={(index, value) =>
                    dispatch({
                      type: "ANSWER_DIMENSION",
                      payload: { index, value },
                    })
                  }
                  onAnswerCharacter={(key, value) =>
                    dispatch({
                      type: "ANSWER_CHARACTER",
                      payload: { key, value },
                    })
                  }
                  onAnswerPillar={(w) =>
                    dispatch({ type: "ANSWER_PILLAR", payload: w })
                  }
                  onAnswerColor={(color) =>
                    dispatch({ type: "ANSWER_COLOR", payload: color })
                  }
                  onBack={() => dispatch({ type: "BACK" })}
                  journey
                />
              </div>
            )}
          </JourneyShell>
        </div>
      ) : null}
    </>
  );
}
