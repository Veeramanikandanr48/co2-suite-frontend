"use client";
import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

type ThemeContextType = {
  isDarkTheme: boolean;
  toggleTheme: (newTheme: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkTheme: true,
  toggleTheme: () => {},
});

export const DarkThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDarkTheme, setIsDarkTheme] = useState<boolean | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") === "dark";
    setIsDarkTheme(storedTheme);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isDarkTheme !== null) {
      document.body.setAttribute("data-theme", isDarkTheme ? "dark" : "light");
      localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    }
  }, [isDarkTheme]);

  const toggleTheme = (newTheme: boolean) => {
    setIsDarkTheme(newTheme);
  };

  const themeContextValue = useMemo<ThemeContextType>(
    () => ({ isDarkTheme: isDarkTheme ?? true, toggleTheme }),
    [isDarkTheme]
  );

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useDarkTheme = () => useContext(ThemeContext);
