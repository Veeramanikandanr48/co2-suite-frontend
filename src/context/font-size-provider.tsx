"use client";
import React, { createContext, useContext, useState, useMemo } from "react";

type FontSizeContextType = {
  fontSize: number;
  setFontSize: (size: number) => void;
};

const FontSizeContext = createContext<FontSizeContextType>({
  fontSize: 16,
  setFontSize: () => {},
});

export const FontSizeProvider = ({ children }: { children: React.ReactNode }) => {
  const [fontSizeState, setFontSizeState] = useState(16);

  const setFontSize = (size: number) => {
    setFontSizeState(size);
  };

  const fontSizeContextValue = useMemo<FontSizeContextType>(
    () => ({ fontSize: fontSizeState, setFontSize }),
    [fontSizeState]
  );

  return (
    <FontSizeContext.Provider value={fontSizeContextValue}>
      {children}
    </FontSizeContext.Provider>
  );
};

export const useFontSize = () => useContext(FontSizeContext);
