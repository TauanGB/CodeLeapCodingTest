import { createTheme } from "@mui/material/styles";
import type { ThemeMode } from "@/store/useBonusStore";

export function createAppTheme(mode: ThemeMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#7695ec",
        dark: "#5f80dc",
        light: "#8da6ef",
        contrastText: "#ffffff",
      },
      background: {
        default: isDark ? "#131722" : "#dddddd",
        paper: isDark ? "#1b2130" : "#ffffff",
      },
      text: {
        primary: isDark ? "#f5f7ff" : "#111111",
        secondary: isDark ? "#a7b0c5" : "#777777",
      },
      error: {
        main: "#ff5151",
      },
    },
    shape: {
      borderRadius: 8,
    },
    typography: {
      fontFamily: "Roboto, Arial, sans-serif",
      h1: {
        fontSize: "1.375rem",
        fontWeight: 700,
      },
      h2: {
        fontSize: "1.125rem",
        fontWeight: 700,
      },
      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            minHeight: 32,
            minWidth: 110,
            transition: "transform 180ms ease, box-shadow 180ms ease",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: "small",
        },
        styleOverrides: {
          root: {
            borderRadius: "8px",
          },
        },
      },
    },
  });
}
