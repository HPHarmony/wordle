import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { buttonSxProps } from "../../app/styleOverrides";
import { StatisticsDialogProps, WordleHistoryEntry } from "../../wordle/types";

export const StatisticsDialog: React.FC<StatisticsDialogProps> = (props) => {
  const getStatistics = (history: WordleHistoryEntry[]) => {
    if (history.length === 0) {
      return {
        Played: 0,
        "Win %": 0,
        "Current Streak": 0,
        "Max Streak": 0,
      };
    }
    let i = 0;
    let numWins = 0;
    let currentStreak = 0;
    let currentMaxStreak = 0;
    let maxStreak = 0;
    for (; i < props.history.length; i++) {
      if (props.history[i].result[0] === "X") {
        break;
      }
      numWins++;
      currentStreak++;
      currentMaxStreak++;
      maxStreak++;
    }
    for (; i < props.history.length; i++) {
      if (props.history[i].result[0] !== "X") {
        numWins++;
        currentMaxStreak++;
      } else {
        if (currentMaxStreak > maxStreak) {
          maxStreak = currentMaxStreak;
        }
        currentMaxStreak = 0;
      }
    }
    if (currentMaxStreak > maxStreak) {
      maxStreak = currentMaxStreak;
    }
    return {
      Played: props.history.length,
      "Win %": Math.round((numWins / props.history.length) * 100),
      "Current Streak": currentStreak,
      "Max Streak": maxStreak,
    };
  };

  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      scroll="paper"
      PaperProps={{
        sx: {
          position: "fixed",
          top: 50,
          left: "calc(50% - min(100vw - 32px, 300px) / 2)",
          width: "min(100vw - 32px, 300px)",
          margin: 0,
          backgroundColor: "var(--modal-content-bg)",
          color: "var(--color-tone-1)",
        },
      }}
    >
      <DialogTitle>
        <div className="dialog_title">
          <div>STATISTICS</div>
          <IconButton onClick={props.onClose}>
            <CloseIcon sx={{ color: "var(--color-tone-3)" }} />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent sx={{ padding: "0 12px" }}>
        <div className="statistics_content">
          {Object.entries(getStatistics(props.history)).map((kvp) => {
            return (
              <div key={`statistics_${kvp[0]}`} className="statistics_column">
                <div className="statistics_number">{kvp[1]}</div>
                <div className="statistics_description">{kvp[0]}</div>
              </div>
            );
          })}
        </div>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" size="medium" onClick={props.share} sx={buttonSxProps}>
          Share
          <ShareIcon sx={{ marginLeft: "4px" }} />
        </Button>
      </DialogActions>
    </Dialog>
  );
};
