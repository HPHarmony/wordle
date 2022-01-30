import GlobalStyles from "@mui/material/GlobalStyles";
import { SxProps } from "@mui/material/styles";

export const globalStyles = (
  <GlobalStyles
    styles={{
      "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
        display: "none",
      },
    }}
  />
);

export const buttonSxProps: SxProps = {
  marginTop: "8px",
  marginBottom: "8px",
  background: "var(--key-bg-correct)",
  ":hover": {
    background: "var(--key-bg-correct)",
    opacity: 0.9,
  },
  color: "var(--key-evaluated-text-color)",
  fontWeight: "bold",
  letterSpacing: 0,
};
