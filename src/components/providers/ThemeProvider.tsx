"use client";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect, useState, createContext, useContext } from "react";
import { lightTheme, darkTheme } from "@/lib/theme";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);
  const [systemIsDark, setSystemIsDark] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode | null;
    if (savedMode) {
      setModeState(savedMode);
    }

    // Set up system theme listener
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemIsDark(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    mediaQuery.addEventListener("change", listener);
    setMounted(true);

    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const isDark =
    mode === "dark" || (mode === "system" && systemIsDark);

  useEffect(() => {
    if (!mounted) return;
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, mounted]);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ mode, setMode, isDark }}>
      <AppRouterCacheProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {!mounted ? (
            <div style={{ visibility: "hidden" }}>{children}</div>
          ) : (
            children
          )}
        </MuiThemeProvider>
      </AppRouterCacheProvider>
    </ThemeContext.Provider>
  );
}
