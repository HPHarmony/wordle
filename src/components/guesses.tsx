import { useRef } from "react";
import { Guess, GuessCharacter } from "../wordle/types";

export const GuessesComponent: React.FC<{
  guesses: Guess[];
  onAnimationEnd: (ref: HTMLDivElement | null, i?: number) => void;
  isAdminPage: boolean;
}> = ({ guesses, onAnimationEnd , isAdminPage}) => {
  if (isAdminPage) {
    return null;
  }
  return (
    <div className="guesses">
      {guesses.map((guess, i) => (
        <GuessComponent key={`guess_${i}`} guess={guess} onAnimationEnd={onAnimationEnd} />
      ))}
    </div>
  );
};

const GuessComponent: React.FC<{
  guess: Guess;
  onAnimationEnd: (ref: HTMLDivElement | null, i?: number) => void;
}> = ({ guess, onAnimationEnd }) => {
  const guessRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="guess_row"
      ref={(ref) => (guessRef.current = ref)}
      onAnimationEnd={() => onAnimationEnd(guessRef.current)}
    >
      {guess.characters.map((guessCharacter, i) => (
        <GuessCharacterComponent
          key={`guess_character_${i}`}
          guessCharacter={guessCharacter}
          numCharacters={guess.characters.length}
          onAnimationEnd={(ref) => onAnimationEnd(ref, i)}
        />
      ))}
    </div>
  );
};

const GuessCharacterComponent: React.FC<{
  guessCharacter: GuessCharacter;
  numCharacters: number;
  onAnimationEnd: (ref: HTMLDivElement | null) => void;
}> = ({ guessCharacter, numCharacters, onAnimationEnd }) => {
  const characterRef = useRef<HTMLDivElement | null>(null);

  let className = "";
  if (guessCharacter.character === "") {
    className = `guess_character_div_${numCharacters} guess_character_empty`;
  } else {
    const statusForClassName = guessCharacter.initializing ? "unknown" : guessCharacter.status;
    className = `guess_character_div_${numCharacters} guess_character guess_character_${statusForClassName}`;
  }

  return (
    <div
      className={`${className}`}
      ref={(ref) => (characterRef.current = ref)}
      onAnimationEnd={(event) => {
        onAnimationEnd(characterRef.current);
        event.stopPropagation();
      }}
    >
      {guessCharacter.character}
    </div>
  );
};
