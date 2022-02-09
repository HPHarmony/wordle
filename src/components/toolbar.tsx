import LinkIcon from "@mui/icons-material/Link";
import { Button, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { ToWords } from "to-words";
import { buttonSxProps } from "../app/styleOverrides";
import { maxWordLen, minWordLen } from "../wordle/constants";
import { ToolbarProps } from "../wordle/types";

const toWords = new ToWords();

export const ToolbarComponent: React.FC<ToolbarProps> = (props) => {
  if (props.isAdminPage()) {
    return (
      <ThemeProvider theme={props.theme}>
        <div className="toolbar">
          <div className="word_input">
            <InputLabel sx={{ color: "var(--color-tone-1)" }}>Enter a Word (4-7 characters):</InputLabel>
            <TextField
              size="medium"
              value={props.numGuesses}
              onChange={props.onGuessesChanged}
              sx={{ marginLeft: "8px", width: 200 }}
            />
          </div>
        </div>
      </ThemeProvider>
    );
  } else {
    return (
      <ThemeProvider theme={props.theme}>
        <div className="toolbar">
          {props.gameState === "new" && (
            <div>
              <div className="num_guesses_setting">
                <InputLabel sx={{ color: "var(--color-tone-1)" }}>Number of Guesses:</InputLabel>
                <TextField
                  size="small"
                  value={props.numGuesses}
                  onChange={props.onGuessesChanged}
                  sx={{ marginLeft: "8px", width: 50 }}
                  error={!props.isGuessesValid()}
                />
              </div>
              <div className="num_characters_setting">
                <InputLabel sx={{ color: "var(--color-tone-1)" }}>Word Length:</InputLabel>
                <Select
                  size="small"
                  value={props.numCharacters}
                  onChange={props.onCharactersChanged}
                  sx={{ width: 95 }}
                >
                  {Array.from({ length: maxWordLen - minWordLen + 1 }, (_, i) => i + minWordLen).map((i) => (
                    <MenuItem key={i} value={i}>
                      {toWords.convert(i)}
                    </MenuItem>
                  ))}
                </Select>
              </div>
            </div>
          )}
          {(props.gameState === "won" || props.gameState === "lost") && (
            <Button variant="contained" size="medium" onClick={props.shareLink} sx={buttonSxProps}>
              Share Link
              <LinkIcon sx={{ marginLeft: "4px" }} />
            </Button>
          )}
        </div>
      </ThemeProvider>
    );
  }
};
