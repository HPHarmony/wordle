import { SelectChangeEvent } from "@mui/material";
import { Theme } from "@mui/material/styles";

export type GameState = "new" | "in_progress" | "won" | "lost" | "saved";

export type GameSnapshot = {
  numGuesses: number;
  numCharacters: number;
  guesses: Guess[];
  characterStatusMap: Map<string, CharacterStatus>;
  word: string;
  characterIndicesMap: Map<string, Set<number>>;
  gameState: GameState;
  currentGuessIndex: number;
  currentCharacterIndex: number;
  showCorrectWord: boolean;
};

export type Guess = {
  characters: GuessCharacter[];
};

export type GuessCharacter = {
  character: string;
  status?: CharacterStatus;
  initializing?: boolean;
};

export type CharacterStatus = "unknown" | "not_used" | "wrong_position" | "correct";

export type WordleHistoryEntry = {
  state: GameSnapshot;
  result: string;
  date: string;
};

export type Settings = {
  hardMode: boolean;
  darkTheme: boolean;
};

export type AnimationType = "initial" | "error" | "letter_typed" | "reveal" | "won" | "idle";

export type NotificationSettings = {
  notificationOpen: boolean;
  message: string;
  zIndex?: number;
  duration?: number;
};

export type WordleState = {
  currentState: GameSnapshot;
  history: WordleHistoryEntry[];
  settings: Settings;
  animationType: AnimationType;
  notificationSettings: NotificationSettings;
};

export type WordleAction =
  | { type: "numGuesses.update"; newNumGuesses: number }
  | { type: "numCharacters.update"; newNumCharacters: number }
  | { type: "gameState.update"; newGameState: GameState; newWord?: string }
  | { type: "snackbar.show"; message: string; zIndex?: number; duration?: number }
  | { type: "snackbar.hide" }
  | { type: "backspace.pressed" }
  | { type: "enterPressed.hasError"; errorMessage: string }
  | { type: "enterPressed.reveal" }
  | { type: "enterPressed.updateCharacter"; characterIndex: number }
  | { type: "enterPressed.updateState" }
  | { type: "aToZ.pressed"; key: string }
  | { type: "historyEntry.restore"; savedGameSnapshot: GameSnapshot }
  | { type: "history.clear" }
  | { type: "hardMode.toggled" }
  | { type: "darkTheme.toggled" }
  | { type: "animationType.set"; animationType: AnimationType }
  | { type: "init.updateCharacters"; characterIndex: number }

export type TitleBarProps = {
  showHistory: () => void;
  historyDialogOpen: boolean;
  onHistoryDialogClose: () => void;
  wordleHistory: WordleHistoryEntry[];
  restoreHistoryEntry: (savedGameSnapshot: GameSnapshot) => void;
  clearHistory: () => void;
  showStatistics: () => void;
  statisticsDialogOpen: boolean;
  onStatisticsDialogClose: () => void;
  share: () => void;
  showSettings: () => void;
  settingsDialogOpen: boolean;
  onSettingsDialogClose: () => void;
  hardModeEnabled: boolean;
  onHardModeToggled: () => void;
  hardModeToggleDisabled: boolean;
  darkThemeEnabled: boolean;
  onDarkThemeToggled: () => void;
};

export type HistoryDialogProps = {
  open: boolean;
  onClose: () => void;
  history: WordleHistoryEntry[];
  restore: (savedGameSnapshot: GameSnapshot) => void;
  clearHistory: () => void;
};

export type StatisticsDialogProps = {
  open: boolean;
  onClose: () => void;
  history: WordleHistoryEntry[];
  share: () => void;
};

export type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  hardModeEnabled: boolean;
  onHardModeToggled: () => void;
  hardModeToggleDisabled: boolean;
  darkThemeEnabled: boolean;
  onDarkThemeToggled: () => void;
};

export type ToolbarProps = {
  theme: Theme;
  gameState: GameState;
  numGuesses: string;
  onGuessesChanged: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isGuessesValid: () => boolean;
  numCharacters: number;
  onCharactersChanged: (event: SelectChangeEvent<number>) => void;
  shareLink: () => void;
  isValid: () => boolean;
  isAdminPage: () => boolean;
};

export type KeyboardProps = {
  animationType: AnimationType;
  characterStatusMap: Map<string, CharacterStatus>;
  onClickCharacter: (character: string) => void;
  onClickEnter: () => void;
  onClickBackspace: () => void;
  isAdminPage: () => boolean;
};

export type KeyboardCharacterProps = {
  character: string;
  status: CharacterStatus;
  onClick: () => void;
};
