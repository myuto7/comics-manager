"use client";

import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  GlobalStyles,
} from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5",
      light: "#818CF8",
      dark: "#3730A3",
    },
    secondary: {
      main: "#06B6D4",
    },
    background: {
      default: "#F1F5F9",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Hiragino Sans"',
      '"Noto Sans JP"',
      "sans-serif",
    ].join(","),
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          paddingLeft: 24,
          paddingRight: 24,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          paddingTop: 14,
          paddingBottom: 14,
        },
      },
    },
  },
});

export function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "html, body": {
            minHeight: "100%",
          },
        }}
      />
      {children}
    </ThemeProvider>
  );
}
