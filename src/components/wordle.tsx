import { Fade, SelectChangeEvent, Snackbar } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { useCallback, useEffect, useReducer, useState } from "react";
import { wordleReducer } from "../wordle/reducer";
import { GameSnapshot } from "../wordle/types";
import { getInitialState, nth, replacer } from "../wordle/utils";
import { GuessesComponent } from "./guesses";
import { KeyboardComponent } from "./keyboard";
import { TitleBarComponent } from "./titleBar";
import { ToolbarComponent } from "./toolbar";

export const Wordle: React.FC<{ wordsMap: Map<number, string[]>; allwordsMap: Map<number, string[]> }> = ({
  wordsMap,
  allwordsMap,
}) => {
  const [state, dispatch] = useReducer(wordleReducer, getInitialState());
  const [numGuessesInput, setNumGuessesInput] = useState(state.currentState.numGuesses.toString());
  const [timeLimitInput, setTimeLimitInput] = useState((state.currentState.timeLimit ?? 0).toString());
  const [showTimeRemaining, setShowTimeRemaining] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [timeRemainingInterval, setTimeRemainingInterval] = useState<NodeJS.Timer>();

  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [statisticsDialogOpen, setStatisticsDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);

  const [theme, setTheme] = useState(createTheme({ palette: { mode: "dark" } }));

  useEffect(() => {
    const updateContentContainerHeight = () => {
      const contentContainerElement = document.getElementsByClassName("content_container")[0] as HTMLElement;
      contentContainerElement.style.height = window.innerHeight - 200 + "px";
    };
    updateContentContainerHeight();
    window.addEventListener("resize", updateContentContainerHeight);

    return () => {
      window.removeEventListener("resize", updateContentContainerHeight);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem("wordleState", JSON.stringify(state.currentState, replacer));
  }, [state.currentState]);
  useEffect(() => {
    window.localStorage.setItem("wordleHistory", JSON.stringify(state.history, replacer));
  }, [state.history]);
  useEffect(() => {
    window.localStorage.setItem("wordleSettings", JSON.stringify(state.settings));
  }, [state.settings]);

  useEffect(() => {
    if ((state.currentState.gameState === "won" || state.currentState.gameState === "lost") && timeRemainingInterval) {
      setShowTimeRemaining(false);
      setTimeRemaining("");
      clearInterval(timeRemainingInterval);
    }
  }, [state.currentState.gameState, timeRemainingInterval]);

  useEffect(() => {
    if (state.settings.darkTheme) {
      document.body.classList.add("darktheme");
    } else {
      document.body.classList.remove("darktheme");
    }
    setTheme(createTheme({ palette: { mode: state.settings.darkTheme ? "dark" : "light" } }));
  }, [state.settings.darkTheme]);

  // prettier-ignore
  useEffect(() => {
    switch (state.animationType) {
      case "initial":
        if (state.currentState.currentGuessIndex === 0) {
          dispatch({ type: "animationType.set", animationType: "idle" });
        } else {
          let i = 0;
          const initialInterval = setInterval(() => {
            for (let j = 0; j < state.currentState.currentGuessIndex; j++) {
              const guessCharacterElem = document.querySelector<HTMLElement>(`.guess_row:nth-child(${j + 1}) .guess_character:nth-child(${i + 1})`)!;
              guessCharacterElem.dataset.animationName = "flip_in";
              guessCharacterElem.dataset.guessIndex = j.toString();
            }
            i++;
            if (i === state.currentState.numCharacters) {
              clearInterval(initialInterval);
            }
          }, 100);
        }
        return;
      case "error": {
        const currentGuessElem = document.querySelector<HTMLElement>(`.guess_row:nth-child(${state.currentState.currentGuessIndex + 1})`)!;
        currentGuessElem.dataset.animationName = "shake";
        return;
      }
      case "letter_typed": {
        const currentGuessCharacterElem = document.querySelector<HTMLElement>(`.guess_row:nth-child(${state.currentState.currentGuessIndex + 1}) .guess_character:nth-child(${state.currentState.currentCharacterIndex})`)!;
        currentGuessCharacterElem.dataset.animationName = "pop_in";
        return;
      }
      case "reveal": {
        let i = 0;
        const revealInterval = setInterval(() => {
          const guessCharacterElem = document.querySelector<HTMLElement>(`.guess_row:nth-child(${state.currentState.currentGuessIndex + 1}) .guess_character:nth-child(${i + 1})`)!;
          guessCharacterElem.dataset.animationName = "flip_in";
          i++;
          if (i === state.currentState.numCharacters) {
            clearInterval(revealInterval);
          }
        }, 250);
        return;
      }
      case "won": {
        let i = 0;
        const wonInterval = setInterval(() => {
          const guessCharacterElem = document.querySelector<HTMLElement>(`.guess_row:nth-child(${state.currentState.currentGuessIndex}) .guess_character:nth-child(${i + 1})`)!;
          guessCharacterElem.dataset.animationName = "bounce";
          i++;
          if (i === state.currentState.numCharacters) {
            clearInterval(wonInterval);
          }
        }, 100);
        return;
      }
      case "idle":
        return;
      default:
        throw new Error();
    }
  }, [
    state.animationType,
    state.currentState.currentGuessIndex,
    state.currentState.numCharacters,
    state.currentState.currentCharacterIndex,
  ]);

  const isValidForHardMode = useCallback(() => {
    const previousGuess = state.currentState.guesses[state.currentState.currentGuessIndex - 1];
    const currentGuess = state.currentState.guesses[state.currentState.currentGuessIndex];
    for (let i = 0; i < state.currentState.numCharacters; i++) {
      if (
        previousGuess.characters[i].status === "correct" &&
        currentGuess.characters[i].character !== previousGuess.characters[i].character
      ) {
        dispatch({
          type: "enterPressed.hasError",
          errorMessage: `${nth(i + 1)} letter must be ${previousGuess.characters[i].character}`,
        });
        return false;
      } else if (
        previousGuess.characters[i].status === "wrong_position" &&
        !currentGuess.characters.some((character) => character.character === previousGuess.characters[i].character)
      ) {
        dispatch({
          type: "enterPressed.hasError",
          errorMessage: `Guess must contain ${previousGuess.characters[i].character}`,
        });
        return false;
      }
    }
    return true;
  }, [state.currentState.guesses, state.currentState.currentGuessIndex, state.currentState.numCharacters]);
  const handleEnter = useCallback(() => {
    if (state.currentState.currentCharacterIndex !== state.currentState.numCharacters) {
      dispatch({ type: "enterPressed.hasError", errorMessage: "Not enough letters" });
      return;
    }
    const guess = state.currentState.guesses[state.currentState.currentGuessIndex].characters
      .map((guessCharacter) => guessCharacter.character)
      .join("");
    if (!allwordsMap.get(state.currentState.numCharacters)!.includes(guess)) {
      dispatch({ type: "enterPressed.hasError", errorMessage: "Not in word list" });
      return;
    }
    if (state.settings.hardMode && state.currentState.currentGuessIndex > 0 && !isValidForHardMode()) {
      return;
    }
    dispatch({ type: "enterPressed.reveal" });
  }, [
    state.currentState.currentCharacterIndex,
    state.currentState.numCharacters,
    state.currentState.guesses,
    state.currentState.currentGuessIndex,
    allwordsMap,
    state.settings.hardMode,
    isValidForHardMode,
  ]);
  const handleKeydownEvent = useCallback(
    (event: KeyboardEvent) => {
      if (state.currentState.gameState === "in_progress" && !event.ctrlKey && !event.metaKey) {
        if (event.keyCode === 8 && state.currentState.currentCharacterIndex > 0) {
          dispatch({ type: "backspace.pressed" });
        } else if (event.keyCode === 13) {
          handleEnter();
        } else if (
          event.keyCode >= 65 &&
          event.keyCode <= 90 &&
          state.currentState.currentCharacterIndex < state.currentState.numCharacters
        ) {
          dispatch({ type: "aToZ.pressed", key: event.key.toUpperCase() });
        }
      }
      if (event.keyCode === 13) {
        event.preventDefault();
      }
    },
    [
      state.currentState.gameState,
      state.currentState.currentCharacterIndex,
      handleEnter,
      state.currentState.numCharacters,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeydownEvent);

    return () => {
      document.removeEventListener("keydown", handleKeydownEvent);
    };
  }, [handleKeydownEvent]);

  const showHistory = () => {
    setHistoryDialogOpen(true);
  };
  const onHistoryDialogClose = () => {
    setHistoryDialogOpen(false);
  };
  const restoreHistoryEntry = (savedGameSnapshot: GameSnapshot) => {
    dispatch({ type: "historyEntry.restore", savedGameSnapshot });
    setHistoryDialogOpen(false);
  };
  const clearHistory = () => {
    dispatch({ type: "history.clear" });
    setHistoryDialogOpen(false);
  };
  const showStatistics = () => {
    setStatisticsDialogOpen(true);
  };
  const onStatisticsDialogClose = () => {
    setStatisticsDialogOpen(false);
  };
  const share = () => {
    navigator.clipboard.writeText(getShareableResult());
    dispatch({ type: "snackbar.show", message: "Copied results to clipboard", zIndex: 1400, duration: 2000 });
  };
  const getShareableResult = () => {
    let result = "Wordle+ ";
    result += wordsMap.get(state.currentState.numCharacters)!.indexOf(state.currentState.word);
    result += ": ";
    if (state.currentState.gameState === "won") {
      result += state.currentState.currentGuessIndex;
    } else if (state.currentState.gameState === "lost") {
      result += "X";
    }
    result += "/";
    result += state.currentState.numGuesses;
    result += "\n";
    for (let i = 0; i < state.currentState.currentGuessIndex; i++) {
      result += state.currentState.guesses[i].characters
        .map((guessCharacter) => {
          if (guessCharacter.status === "not_used") {
            return "⬜";
          } else if (guessCharacter.status === "wrong_position") {
            return "🟨";
          } else if (guessCharacter.status === "correct") {
            return "🟩";
          }
          return "";
        })
        .join("");
      result += "\n";
    }
    return result;
  };
  const showSettings = () => {
    setSettingsDialogOpen(true);
  };
  const onSettingsDialogClose = () => {
    setSettingsDialogOpen(false);
  };

  const onGuessesChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumGuessesInput(event.target.value);
    const valueAsNumber = Number(event.target.value);
    if (Number.isInteger(valueAsNumber) && valueAsNumber > 0) {
      dispatch({ type: "numGuesses.update", newNumGuesses: valueAsNumber });
    }
  };
  const isGuessesValid = () => {
    const numGuesses = Number(numGuessesInput);
    return numGuessesInput.trim() !== "" && Number.isInteger(numGuesses) && numGuesses > 0;
  };
  const onCharactersChanged = (event: SelectChangeEvent<number>) => {
    dispatch({ type: "numCharacters.update", newNumCharacters: event.target.value as number });
  };
  const onTimeLimitChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTimeLimitInput(event.target.value);
    const valueAsNumber = Number(event.target.value);
    if (Number.isInteger(valueAsNumber) && valueAsNumber >= 0) {
      dispatch({ type: "timeLimit.update", newTimeLimit: valueAsNumber });
    }
  };
  const isTimeLimitValid = () => {
    const timeLimit = Number(timeLimitInput);
    return timeLimitInput.trim() !== "" && Number.isInteger(timeLimit) && timeLimit >= 0;
  };
  const shareLink = () => {
    const shareableLink = new URL(window.location.origin + window.location.pathname);
    shareableLink.searchParams.append("word", btoa(state.currentState.word));
    shareableLink.searchParams.append("numGuesses", state.currentState.numGuesses.toString());
    navigator.clipboard.writeText(shareableLink.href);
    dispatch({ type: "snackbar.show", message: "Copied link to clipboard", zIndex: 1200, duration: 2000 });
  };
  const start = () => {
    const listOfWords = wordsMap.get(state.currentState.numCharacters)!;
    const randomWord = listOfWords[Math.floor(Math.random() * listOfWords.length)];
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("debug") === "true") {
      console.log(randomWord);
    }
    dispatch({ type: "gameState.update", newGameState: "in_progress", newWord: randomWord });
    if (state.currentState.timeLimit && state.currentState.timeLimit > 0) {
      setTimeRemaining(`Time Remaining: ${state.currentState.timeLimit!}s`);
      setShowTimeRemaining(true);
      let i = 0;
      setTimeRemainingInterval(
        setInterval(() => {
          i++;
          if (i < state.currentState.timeLimit!) {
            setTimeRemaining(`Time Remaining: ${state.currentState.timeLimit! - i}s`);
          } else if (i === state.currentState.timeLimit!) {
            setTimeRemaining("Time's Up!");
            dispatch({ type: "gameState.update", newGameState: "lost" });
          } else if (i === state.currentState.timeLimit! + 1) {
            setShowTimeRemaining(false);
            setTimeRemaining("");
            clearInterval(timeRemainingInterval!);
          }
        }, 1000)
      );
    }
  };
  const isValid = () => {
    return isGuessesValid() && isTimeLimitValid();
  };
  const reset = () => {
    if (state.animationType === "idle") {
      if (timeRemainingInterval) {
        setShowTimeRemaining(false);
        setTimeRemaining("");
        clearInterval(timeRemainingInterval);
      }
      dispatch({ type: "gameState.update", newGameState: "new" });
    }
  };

  const onAnimationEnd = (ref: HTMLDivElement | null, i?: number) => {
    if (ref) {
      if (ref.dataset.animationName === "flip_in") {
        if (state.animationType === "initial") {
          if (ref.dataset.guessIndex === (state.currentState.currentGuessIndex - 1).toString()) {
            dispatch({ type: "init.updateCharacters", characterIndex: i! });
          }
          delete ref.dataset.guessIndex;
        } else if (state.animationType === "reveal") {
          dispatch({ type: "enterPressed.updateCharacter", characterIndex: i! });
        }
        ref.dataset.animationName = "flip_out";
      } else {
        if (ref.dataset.animationName === "flip_out") {
          if (i === state.currentState.numCharacters - 1) {
            if (state.animationType === "initial") {
              dispatch({ type: "animationType.set", animationType: "idle" });
              const lastGuess = state.currentState.guesses[state.currentState.currentGuessIndex - 1];
              if (lastGuess.characters.map((character) => character.character).join("") === state.currentState.word) {
                setStatisticsDialogOpen(true);
              }
            } else if (state.animationType === "reveal") {
              dispatch({ type: "enterPressed.updateState" });
            }
          }
        } else if (
          ref.dataset.animationName === "shake" ||
          (ref.dataset.animationName === "pop_in" && state.animationType === "letter_typed") ||
          (ref.dataset.animationName === "bounce" && i === state.currentState.numCharacters - 1)
        ) {
          dispatch({ type: "animationType.set", animationType: "idle" });
        }
        delete ref.dataset.animationName;
      }
    }
  };

  return (
    <div className="wordle">
      <div className="content_container">
        <TitleBarComponent
          showHistory={showHistory}
          historyDialogOpen={historyDialogOpen}
          onHistoryDialogClose={onHistoryDialogClose}
          wordleHistory={state.history}
          restoreHistoryEntry={restoreHistoryEntry}
          clearHistory={clearHistory}
          showStatistics={showStatistics}
          statisticsDialogOpen={statisticsDialogOpen}
          onStatisticsDialogClose={onStatisticsDialogClose}
          share={share}
          showSettings={showSettings}
          settingsDialogOpen={settingsDialogOpen}
          onSettingsDialogClose={onSettingsDialogClose}
          hardModeEnabled={state.settings.hardMode}
          onHardModeToggled={() => {
            if (
              state.currentState.gameState === "in_progress" &&
              state.currentState.currentGuessIndex > 0 &&
              !state.settings.hardMode
            ) {
              dispatch({
                type: "snackbar.show",
                message: "Hard mode can only be enabled at the start of a round",
                zIndex: 1400,
                duration: 2000,
              });
            } else {
              dispatch({ type: "hardMode.toggled" });
            }
          }}
          hardModeToggleDisabled={
            state.currentState.gameState === "in_progress" && state.currentState.currentGuessIndex > 0
          }
          darkThemeEnabled={state.settings.darkTheme}
          onDarkThemeToggled={() => dispatch({ type: "darkTheme.toggled" })}
        />
        <ToolbarComponent
          theme={theme}
          gameState={state.currentState.gameState}
          numGuesses={numGuessesInput}
          onGuessesChanged={onGuessesChanged}
          isGuessesValid={isGuessesValid}
          numCharacters={state.currentState.numCharacters}
          onCharactersChanged={onCharactersChanged}
          timeLimit={timeLimitInput}
          onTimeLimitChanged={onTimeLimitChanged}
          isTimeLimitValid={isTimeLimitValid}
          shareLink={shareLink}
          start={start}
          isValid={isValid}
          reset={reset}
        />
        <GuessesComponent guesses={state.currentState.guesses} onAnimationEnd={onAnimationEnd} />
      </div>
      <KeyboardComponent
        animationType={state.animationType}
        characterStatusMap={state.currentState.characterStatusMap}
        onClickCharacter={(character) => {
          if (
            state.currentState.gameState === "in_progress" &&
            state.currentState.currentCharacterIndex < state.currentState.numCharacters
          ) {
            dispatch({ type: "aToZ.pressed", key: character });
          }
        }}
        onClickEnter={() => {
          if (state.currentState.gameState === "in_progress") {
            handleEnter();
          }
        }}
        onClickBackspace={() => {
          if (state.currentState.gameState === "in_progress" && state.currentState.currentCharacterIndex > 0) {
            dispatch({ type: "backspace.pressed" });
          }
        }}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transitionDuration={{ enter: 0 }}
        open={showTimeRemaining}
        sx={{ zIndex: 1201 }}
      >
        <div className="notification_message notification_message_top">{timeRemaining}</div>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transitionDuration={{ enter: 0 }}
        open={state.currentState.showCorrectWord}
        sx={{ zIndex: 1200 }}
      >
        <div className="notification_message notification_message_top">{state.currentState.word}</div>
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={state.notificationSettings.duration}
        transitionDuration={{ enter: 0, exit: 500 }}
        TransitionComponent={Fade}
        open={state.notificationSettings.notificationOpen}
        onClose={(_, reason) => {
          if (reason === "timeout") {
            dispatch({ type: "snackbar.hide" });
          }
        }}
        sx={{ zIndex: state.notificationSettings.zIndex }}
      >
        <div className="notification_message">{state.notificationSettings.message}</div>
      </Snackbar>
    </div>
  );
};
