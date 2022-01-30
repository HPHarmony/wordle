import { styled } from "@mui/material/styles";
import Switch, { SwitchProps } from "@mui/material/Switch";

export const IOSSwitch = styled((props: SwitchProps) => <Switch disableRipple {...props} />)(() => ({
  width: 32,
  height: 20,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    cursor: "auto",
    "&.Mui-checked": {
      transform: "translateX(12px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "var(--color-correct)",
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 16,
    height: 16,
  },
  "& .MuiSwitch-track": {
    borderRadius: 10,
    backgroundColor: "var(--color-tone-3)",
    opacity: 1,
  },
}));
