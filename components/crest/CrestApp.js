"use client";

import { useEffect, useReducer } from "react";
import {
  initialState,
  loadPersistedState,
  persistState,
  quizReducer,
} from "@/lib/quiz-reducer";
import OpeningScreen from "./OpeningScreen";
import OwnedClubScreen from "./OwnedClubScreen";
import QuestionScreen from "./QuestionScreen";
import ResultScreen from "./ResultScreen";
import styles from "./CrestApp.module.css";

/**
 * @param {{ clubs: object[] }} props
 */
export default function CrestApp({ clubs }) {
  const [state, dispatch] = useReducer(
    quizReducer,
    undefined,
    () => loadPersistedState() ?? initialState(),
  );

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  }, []);

  const pickerClubs = clubs.map((c) => ({ slug: c.slug, name: c.name }));

  const screenKey = `${state.step}-${state.quizIndex}`;

  return (
    <div className={styles.app}>
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
          onToggle={(slug) => dispatch({ type: "TOGGLE_OWNED", payload: slug })}
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
          onAnswerDimension={(index, value) =>
            dispatch({ type: "ANSWER_DIMENSION", payload: { index, value } })
          }
          onAnswerPillar={(w) =>
            dispatch({ type: "ANSWER_PILLAR", payload: w })
          }
          onBack={() => dispatch({ type: "BACK" })}
        />
        </div>
      )}
      {state.step === "complete" && state.pillar && state.scores.every((s) => s != null) ? (
        <div key={screenKey} className={styles.screenEnter}>
        <ResultScreen
          scores={state.scores}
          pillar={state.pillar}
          ownedSlugs={state.ownedSlugs}
          clubs={clubs}
          onRestart={() => dispatch({ type: "RESTART" })}
        />
        </div>
      ) : null}
    </div>
  );
}
