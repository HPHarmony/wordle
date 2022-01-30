import BackspaceIcon from "@mui/icons-material/BackspaceOutlined";
import { KeyboardCharacterProps, KeyboardProps } from "../wordle/types";

export const KeyboardComponent: React.FC<KeyboardProps> = (props) => {
  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"],
  ];
  return (
    <div className="keyboard">
      {rows.map((r, i) => (
        <div key={`keyboard_row_${i}`} className="keyboard_row">
          {i === rows.length - 1 && <KeyboardEnterComponent onClick={props.onClickEnter} />}
          {r.map((ch) => (
            <KeyboardCharacterComponent
              key={`keyboard_character_${ch}`}
              character={ch}
              status={props.animationType === "initial" ? "unknown" : props.characterStatusMap.get(ch)!}
              onClick={() => props.onClickCharacter(ch)}
            />
          ))}
          {i === rows.length - 1 && <KeyboardBackspaceComponent onClick={props.onClickBackspace} />}
        </div>
      ))}
    </div>
  );
};

const KeyboardCharacterComponent: React.FC<KeyboardCharacterProps> = (props) => {
  return (
    <div className={`keyboard_character status_${props.status}`} onClick={props.onClick}>
      {props.character}
    </div>
  );
};

const KeyboardEnterComponent: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className="keyboard_character keyboard_character_wide status_unknown" onClick={onClick}>
      ENTER
    </div>
  );
};

const KeyboardBackspaceComponent: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div className="keyboard_character keyboard_character_wide status_unknown" onClick={onClick}>
      <BackspaceIcon />
    </div>
  );
};
