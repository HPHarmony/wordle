import { DateTime } from "luxon";
import { GameSnapshot, GameState, WordleAction, WordleHistoryEntry, WordleState } from "./types";
import { getCharacterIndicesMapForWord, getInitialCharacterStatusMap, getInitialGuesses } from "./utils";

export const wordleReducer = (state: WordleState, action: WordleAction): WordleState => {
  switch (action.type) {
    case "numGuesses.update":
      return {
        ...state,
        currentState: {
          ...state.currentState,
          numGuesses: action.newNumGuesses,
          guesses: getInitialGuesses(action.newNumGuesses, state.currentState.numCharacters),
        },
      };
    case "numCharacters.update":
      return {
        ...state,
        currentState: {
          ...state.currentState,
          numCharacters: action.newNumCharacters,
          guesses: getInitialGuesses(state.currentState.numGuesses, action.newNumCharacters),
        },
      };
    case "gameState.update":
      return getUpdatedStateAfterGameStateUpdate(state, action.newGameState, action.newWord);
    case "snackbar.show":
      return {
        ...state,
        notificationSettings: {
          notificationOpen: true,
          message: action.message,
          zIndex: action.zIndex,
          duration: action.duration,
        },
      };
    case "snackbar.hide":
      return {
        ...state,
        notificationSettings: {
          ...state.notificationSettings,
          notificationOpen: false,
        },
      };
    case "backspace.pressed": {
      const updatedGuesses = [...state.currentState.guesses];
      const currentGuessIndex = state.currentState.currentGuessIndex;
      const currentCharacterIndex = state.currentState.currentCharacterIndex;
      updatedGuesses[currentGuessIndex].characters[currentCharacterIndex - 1] = { character: "" };
      return {
        ...state,
        currentState: {
          ...state.currentState,
          guesses: updatedGuesses,
          currentCharacterIndex: currentCharacterIndex - 1,
        },
        animationType: "idle",
      };
    }
    case "enterPressed.hasError":
      return {
        ...state,
        animationType: "error",
        notificationSettings: {
          notificationOpen: true,
          message: action.errorMessage,
          zIndex: 1200,
          duration: 1000,
        },
      };
    case "enterPressed.reveal":
      return {
        ...state,
        currentState: {
          ...state.currentState,
          characterIndicesMap: getUpdatedCharacterIndicesMap(state.currentState),
        },
        animationType: "reveal",
      };
    case "enterPressed.updateCharacter":
      return getUpdatedStateAfterEnterPressedUpdateCharacter(state, action.characterIndex);
    case "enterPressed.updateState":
      return getUpdatedStateAfterEnterPressedUpdateState(state);
    case "aToZ.pressed":
      return getUpdatedStateAfterAToZPressed(state, action.key);
    case "historyEntry.restore":
      return { ...state, currentState: action.savedGameSnapshot };
    case "history.clear":
      return {
        ...state,
        history: [],
        notificationSettings: {
          message: "History cleared",
          notificationOpen: true,
          zIndex: 1400,
          duration: 2000,
        },
      };
    case "hardMode.toggled":
      return { ...state, settings: { ...state.settings, hardMode: !state.settings.hardMode } };
    case "darkTheme.toggled":
      return { ...state, settings: { ...state.settings, darkTheme: !state.settings.darkTheme } };
    case "animationType.set":
      return { ...state, animationType: action.animationType };
    case "init.updateCharacters": {
      const updatedGuesses = [...state.currentState.guesses];
      for (let i = 0; i < state.currentState.currentGuessIndex; i++) {
        updatedGuesses[i].characters[action.characterIndex].initializing = false;
      }
      return {
        ...state,
        currentState: {
          ...state.currentState,
          guesses: updatedGuesses,
        },
      };
    }
    default:
      throw new Error();
  }
};

function getUpdatedStateAfterGameStateUpdate(
  state: WordleState,
  newGameState: GameState,
  newWord?: string
): WordleState {
  if (
    newGameState === "new" ||
    (state.currentState.gameState === "new" && newGameState === "in_progress") ||
    (state.currentState.gameState === "in_progress" && newGameState === "lost")
  ) {
    const updatedState = { ...state, currentState: { ...state.currentState, gameState: newGameState } };
    if (newGameState === "new") {
      return {
        ...updatedState,
        currentState: {
          ...updatedState.currentState,
          guesses: getInitialGuesses(state.currentState.numGuesses, state.currentState.numCharacters),
          characterStatusMap: getInitialCharacterStatusMap(),
          currentGuessIndex: 0,
          currentCharacterIndex: 0,
          showCorrectWord: false,
        },
      };
    } else if (state.currentState.gameState === "new" && newGameState === "in_progress") {
      return {
        ...updatedState,
        currentState: {
          ...updatedState.currentState,
          word: newWord!,
          characterIndicesMap: getCharacterIndicesMapForWord(newWord!),
        },
      };
    } else if (state.currentState.gameState === "in_progress" && newGameState === "lost") {
      return {
        ...updatedState,
        currentState: {
          ...updatedState.currentState,
          showCorrectWord: true,
        },
        history: [getNewHistoryEntry(state.currentState, "lost"), ...state.history],
        animationType: "idle",
      };
    }
    return updatedState;
  }
  return state;
}

function getUpdatedCharacterIndicesMap(currentState: GameSnapshot) {
  const updatedCharacterIndicesMap = new Map(currentState.characterIndicesMap);
  for (let i = 0; i < currentState.numCharacters; i++) {
    if (
      currentState.guesses[currentState.currentGuessIndex].characters[i].character === currentState.word[i] &&
      updatedCharacterIndicesMap.has(currentState.word[i])
    ) {
      updatedCharacterIndicesMap.get(currentState.word[i])!.delete(i);
      if (updatedCharacterIndicesMap.get(currentState.word[i])!.size === 0) {
        updatedCharacterIndicesMap.delete(currentState.word[i]);
      }
    }
  }
  return updatedCharacterIndicesMap;
}

function getUpdatedStateAfterEnterPressedUpdateCharacter(state: WordleState, characterIndex: number): WordleState {
  const currentGuess = state.currentState.guesses[state.currentState.currentGuessIndex];
  const currentCharacter = currentGuess.characters[characterIndex];
  let hasSameLetter = false;
  for (let i = 0; i < characterIndex; i++) {
    if (
      currentGuess.characters[i].character === currentCharacter.character &&
      currentGuess.characters[i].status !== "correct"
    ) {
      hasSameLetter = true;
      break;
    }
  }
  const updatedGuesses = [...state.currentState.guesses];
  if (currentCharacter.character === state.currentState.word[characterIndex]) {
    currentCharacter.status = "correct";
  } else if (state.currentState.characterIndicesMap.has(currentCharacter.character) && !hasSameLetter) {
    currentCharacter.status = "wrong_position";
  } else {
    currentCharacter.status = "not_used";
  }
  return { ...state, currentState: { ...state.currentState, guesses: updatedGuesses } };
}

function getUpdatedStateAfterEnterPressedUpdateState(state: WordleState): WordleState {
  const currentGuess = state.currentState.guesses[state.currentState.currentGuessIndex];
  const updatedCharacterStatusMap = new Map(state.currentState.characterStatusMap);
  const numCorrect = currentGuess.characters.filter((character) => character.status === "correct").length;
  for (let i = 0; i < state.currentState.numCharacters; i++) {
    if (
      currentGuess.characters[i].status === "correct" ||
      updatedCharacterStatusMap.get(currentGuess.characters[i].character) === "unknown"
    ) {
      updatedCharacterStatusMap.set(currentGuess.characters[i].character, currentGuess.characters[i].status!);
    }
  }
  const updatedCurrentState = {
    ...state.currentState,
    characterStatusMap: updatedCharacterStatusMap,
    characterIndicesMap: getCharacterIndicesMapForWord(state.currentState.word),
    currentGuessIndex: state.currentState.currentGuessIndex + 1,
    currentCharacterIndex: 0,
  };
  if (state.currentState.gameState !== "lost") {
    if (numCorrect === state.currentState.numCharacters) {
      return {
        ...state,
        currentState: {
          ...updatedCurrentState,
          gameState: "won",
        },
        history: [getNewHistoryEntry(updatedCurrentState, "won"), ...state.history],
        animationType: "won",
        notificationSettings: {
          notificationOpen: true,
          message: "Well done!",
          zIndex: 1200,
          duration: 2000,
        },
      };
    } else if (state.currentState.currentGuessIndex === state.currentState.numGuesses - 1) {
      return {
        ...state,
        currentState: {
          ...updatedCurrentState,
          gameState: "lost",
          showCorrectWord: true,
        },
        history: [getNewHistoryEntry(updatedCurrentState, "lost"), ...state.history],
        animationType: "idle",
      };
    }
  }
  return { ...state, currentState: updatedCurrentState, animationType: "idle" };
}

function getNewHistoryEntry(updatedCurrentState: GameSnapshot, newGameState: GameState): WordleHistoryEntry {
  const numAttempts = newGameState === "won" ? updatedCurrentState.currentGuessIndex : "X";
  return {
    state: {
      ...updatedCurrentState,
      gameState: "saved",
      showCorrectWord: newGameState === "lost",
    },
    result: `${numAttempts}/${updatedCurrentState.numGuesses}`,
    date: DateTime.now().toLocaleString(DateTime.DATETIME_SHORT),
  };
}

function getUpdatedStateAfterAToZPressed(state: WordleState, key: string): WordleState {
  const updatedGuesses = [...state.currentState.guesses];
  const currentGuessIndex = state.currentState.currentGuessIndex;
  const currentCharacterIndex = state.currentState.currentCharacterIndex;
  updatedGuesses[currentGuessIndex].characters[currentCharacterIndex] = {
    character: key,
    status: "unknown",
  };
  return {
    ...state,
    currentState: {
      ...state.currentState,
      guesses: updatedGuesses,
      currentCharacterIndex: currentCharacterIndex + 1,
    },
    animationType: "letter_typed",
  };
}
