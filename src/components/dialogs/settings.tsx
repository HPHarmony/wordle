import CloseIcon from "@mui/icons-material/Close";
import { Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { SettingsDialogProps } from "../../wordle/types";
import { IOSSwitch } from "../iosSwitch";

export const SettingsDialog: React.FC<SettingsDialogProps> = (props) => {
  return (
    <Dialog
      open={props.open}
      onClose={props.onClose}
      scroll="paper"
      PaperProps={{
        sx: {
          position: "fixed",
          top: 50,
          left: "calc(50% - min(100vw - 32px, 500px) / 2)",
          width: "min(100vw - 32px, 500px)",
          margin: 0,
          backgroundColor: "var(--modal-content-bg)",
          color: "var(--color-tone-1)",
        },
      }}
    >
      <DialogTitle>
        <div className="dialog_title">
          <div>SETTINGS</div>
          <IconButton onClick={props.onClose}>
            <CloseIcon sx={{ color: "var(--color-tone-3)" }} />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent>
        <div className="setting_row">
          <div>
            <div>Hard Mode</div>
            <div className="hard_mode_description">Any revealed hints must be used in subsequent guesses</div>
          </div>
          <IOSSwitch
            checked={props.hardModeEnabled}
            onChange={props.onHardModeToggled}
            sx={
              props.hardModeToggleDisabled
                ? {
                    "& .MuiSwitch-track": {
                      opacity: 0.5,
                    },
                  }
                : {}
            }
          />
        </div>
        <div className="setting_row">
          <div>Dark Theme</div>
          <IOSSwitch checked={props.darkThemeEnabled} onChange={props.onDarkThemeToggled} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
