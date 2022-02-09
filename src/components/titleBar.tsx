import HistoryIcon from "@mui/icons-material/History";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SettingsIcon from "@mui/icons-material/Settings";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { TitleBarProps } from "../wordle/types";
import { HistoryDialog } from "./dialogs/history";
import { SettingsDialog } from "./dialogs/settings";
import { StatisticsDialog } from "./dialogs/statistics";

export const TitleBarComponent: React.FC<TitleBarProps> = (props) => {
  return (
    <div className="title_bar">
      <div className="title_bar_button_container">
        <Tooltip title="Show History">
          <IconButton onClick={props.showHistory}>
            <HistoryIcon sx={{ color: "var(--color-tone-3)" }} />
          </IconButton>
        </Tooltip>
      </div>
      <div className="title">HARMONY</div>
      <div className="title_bar_button_container">
        <Tooltip title="Statistics">
          <IconButton onClick={props.showStatistics}>
            <LeaderboardIcon sx={{ color: "var(--color-tone-3)" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings">
          <IconButton onClick={props.showSettings}>
            <SettingsIcon sx={{ color: "var(--color-tone-3)" }} />
          </IconButton>
        </Tooltip>
      </div>
      <HistoryDialog
        open={props.historyDialogOpen}
        onClose={props.onHistoryDialogClose}
        history={props.wordleHistory}
        restore={props.restoreHistoryEntry}
        clearHistory={props.clearHistory}
      />
      <StatisticsDialog
        open={props.statisticsDialogOpen}
        onClose={props.onStatisticsDialogClose}
        history={props.wordleHistory}
        share={props.share}
      />
      <SettingsDialog
        open={props.settingsDialogOpen}
        onClose={props.onSettingsDialogClose}
        hardModeEnabled={props.hardModeEnabled}
        onHardModeToggled={props.onHardModeToggled}
        hardModeToggleDisabled={props.hardModeToggleDisabled}
        darkThemeEnabled={props.darkThemeEnabled}
        onDarkThemeToggled={props.onDarkThemeToggled}
      />
    </div>
  );
};
