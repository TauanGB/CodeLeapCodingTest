import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#7695ec",
      dark: "#5f80dc",
      light: "#8da6ef",
      contrastText: "#ffffff",
    },
    background: {
      default: "#dddddd",
      paper: "#ffffff",
    },
    text: {
      primary: "#111111",
      secondary: "#777777",
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
