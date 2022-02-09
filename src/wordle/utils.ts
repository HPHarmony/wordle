import {
  CharacterStatus,
  GameSnapshot,
  Guess,
  GuessCharacter,
  Settings,
  WordleHistoryEntry,
  WordleState,
} from "./types";

export function getInitialGuesses(numGuesses: number, numCharacters: number) {
  const guesses: Guess[] = [];
  for (let i = 0; i < numGuesses; i++) {
    const guessCharacters: GuessCharacter[] = [];
    for (let j = 0; j < numCharacters; j++) {
      guessCharacters.push({ character: "" });
    }
    guesses.push({ characters: guessCharacters });
  }
  return guesses;
}

export function getInitialCharacterStatusMap() {
  const characterStatusMap = new Map<string, CharacterStatus>();
  for (let ch = 0; ch < 26; ch++) {
    characterStatusMap.set(String.fromCharCode(65 + ch), "unknown");
  }
  return characterStatusMap;
}

export function getCharacterIndicesMapForWord(word: string) {
  const characterIndicesMapForWord = new Map<string, Set<number>>();
  for (let i = 0; i < word.length; i++) {
    if (!characterIndicesMapForWord.has(word[i])) {
      characterIndicesMapForWord.set(word[i], new Set<number>());
    }
    characterIndicesMapForWord.get(word[i])!.add(i);
  }
  return characterIndicesMapForWord;
}

export function getInitialState(): WordleState {
  const icsURLParams = getInitialCurrentStateFromURLParams();
  const icsLocalstorage = getInitialCurrentStateFromLocalstorage();
  const icsEmpty = getEmptyInitialCurrentState();
  const initialCurrentState = icsURLParams ?? icsLocalstorage ?? icsEmpty;
  const initialHistory: WordleHistoryEntry[] = window.localStorage.getItem("wordleHistory")
    ? JSON.parse(window.localStorage.getItem("wordleHistory")!, reviver)
    : [];
  const initialSettings: Settings = window.localStorage.getItem("wordleSettings")
    ? JSON.parse(window.localStorage.getItem("wordleSettings")!)
    : { hardMode: false, darkTheme: false };
  return {
    currentState: initialCurrentState,
    history: initialHistory,
    settings: initialSettings,
    animationType: "initial",
    notificationSettings: {
      notificationOpen: false,
      message: "",
    },
  };
}

function getInitialCurrentStateFromURLParams(): GameSnapshot | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("word")) {
    const word = atob(urlParams.get("word")!);
    const numGuesses = Math.max(6, word.length + 1); // Minimum 6 length for 4-length words
    return {
      numGuesses,
      numCharacters: word.length,
      guesses: getInitialGuesses(numGuesses, word.length),
      characterStatusMap: getInitialCharacterStatusMap(),
      word,
      characterIndicesMap: getCharacterIndicesMapForWord(word),
      gameState: "in_progress",
      currentGuessIndex: 0,
      currentCharacterIndex: 0,
      showCorrectWord: false,
    };
  }
  return;
}

function getInitialCurrentStateFromLocalstorage(): GameSnapshot | undefined {
  if (window.localStorage.getItem("wordleState")) {
    const initialCurrentState: GameSnapshot = JSON.parse(window.localStorage.getItem("wordleState")!, reviver);
    if (initialCurrentState.gameState === "in_progress") {
      for (let i = 0; i < initialCurrentState.numCharacters; i++) {
        if (initialCurrentState.guesses[initialCurrentState.currentGuessIndex].characters[i].character === "") {
          break;
        }
        initialCurrentState.guesses[initialCurrentState.currentGuessIndex].characters[i] = { character: "" };
      }
      initialCurrentState.currentCharacterIndex = 0;
    }
    for (let i = 0; i < initialCurrentState.currentGuessIndex; i++) {
      for (let j = 0; j < initialCurrentState.numCharacters; j++) {
        initialCurrentState.guesses[i].characters[j].initializing = true;
      }
    }
    return initialCurrentState;
  }
  return;
}

function getEmptyInitialCurrentState(): GameSnapshot {
  return {
    numGuesses: 6,
    numCharacters: 5,
    guesses: getInitialGuesses(6, 5),
    characterStatusMap: getInitialCharacterStatusMap(),
    word: "",
    characterIndicesMap: new Map<string, Set<number>>(),
    gameState: "new",
    currentGuessIndex: 0,
    currentCharacterIndex: 0,
    showCorrectWord: false,
  };
}

export function replacer(_: string, value: any) {
  if (value instanceof Map) {
    return {
      dataType: "Map",
      value: Array.from(value),
    };
  } else if (value instanceof Set) {
    return {
      dataType: "Set",
      value: Array.from(value),
    };
  }
  return value;
}

export function reviver(_: string, value: any) {
  if (typeof value === "object" && value !== null) {
    if (value.dataType === "Map") {
      return new Map(value.value);
    } else if (value.dataType === "Set") {
      return new Set(value.value);
    }
  }
  return value;
}

export function nth(n: number) {
  return n + (["st", "nd", "rd"][((((n + 90) % 100) - 10) % 10) - 1] || "th");
}
