import { createTheme, ThemeOptions } from "@mui/material/styles";

// Shared typography settings
const typography = {
  fontFamily: "var(--font-sans)",
  h1: { fontWeight: 700 },
  h2: { fontWeight: 600 },
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { textTransform: "none" as const, fontWeight: 500 },
};

const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: "0.5rem",
        boxShadow: "none",
        "&:hover": {
          boxShadow: "none",
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "0.5rem",
        boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      rounded: {
        borderRadius: "0.5rem",
      },
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#3b82f6", // Tailwind blue-500
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#64748b", // Tailwind slate-500
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#ffffff",
    },
    text: {
      primary: "#09090b",
      secondary: "#64748b",
    },
    divider: "#e2e8f0",
  },
  typography,
  components,
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b82f6", // Tailwind blue-500
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#a1a1aa", // Tailwind zinc-400
      contrastText: "#09090b",
    },
    background: {
      default: "#09090b",
      paper: "#18181b",
    },
    text: {
      primary: "#fafafa",
      secondary: "#a1a1aa",
    },
    divider: "#27272a",
  },
  typography,
  components,
});
