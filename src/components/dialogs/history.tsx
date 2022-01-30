import CloseIcon from "@mui/icons-material/Close";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { buttonSxProps } from "../../app/styleOverrides";
import { HistoryDialogProps } from "../../wordle/types";

export const HistoryDialog: React.FC<HistoryDialogProps> = (props) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      scroll="paper"
      PaperProps={{
        sx: {
          position: "fixed",
          top: 50,
          left: "calc(50% - min(100vw - 64px, 400px) / 2)",
          width: "min(100vw - 64px, 400px)",
          margin: 0,
          height: "284.5px",
          backgroundColor: "var(--modal-content-bg)",
          color: "var(--color-tone-1)",
        },
      }}
    >
      <DialogTitle>
        <div className="dialog_title">
          <div>HISTORY</div>
          <IconButton onClick={props.onClose}>
            <CloseIcon sx={{ color: "var(--color-tone-3)" }} />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent sx={{ paddingBottom: 0 }}>
        {props.history.map((h) => {
          return (
            <div key={`${h.date}_${h.state.word}_${h.result}`} className="history_row">
              <div className="history_date">{h.date}</div>
              <div className="history_word">{h.state.word}</div>
              <div className="history_result">{h.result}</div>
              <Tooltip title="Restore">
                <IconButton onClick={() => props.restore(h.state)}>
                  <RestorePageIcon sx={{ color: "var(--color-tone-3)" }} />
                </IconButton>
              </Tooltip>
            </div>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" size="medium" onClick={props.clearHistory} sx={buttonSxProps}>
          Clear History
        </Button>
      </DialogActions>
    </Dialog>
  );
};
