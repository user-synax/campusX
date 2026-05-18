"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CursorContext = createContext();

const STORAGE_ENABLED = "cursorEnabled";
const STORAGE_STYLE = "cursorStyle";

export function CatProvider({ children }) {
  const [cursorEnabled, setCursorEnabled] = useState(false);
  const [cursorStyle, setCursorStyle] = useState("dot");
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const enabled = localStorage.getItem(STORAGE_ENABLED);
      if (enabled === "true") setCursorEnabled(true);
      const style = localStorage.getItem(STORAGE_STYLE);
      if (style) setCursorStyle(style);
    } catch {}
  }, []);

  const toggleCursor = useCallback(() => {
    setCursorEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_ENABLED, next); } catch {}
      return next;
    });
  }, []);

  const selectStyle = useCallback((style) => {
    setCursorStyle(style);
    try { localStorage.setItem(STORAGE_STYLE, style); } catch {}
    setCursorEnabled(true);
    try { localStorage.setItem(STORAGE_ENABLED, true); } catch {}
    setShowSelector(false);
  }, []);

  const handleToggleClick = useCallback(() => {
    if (cursorEnabled) {
      toggleCursor();
    } else {
      setShowSelector(true);
    }
  }, [cursorEnabled, toggleCursor]);

  return (
    <CursorContext.Provider
      value={{
        cursorEnabled,
        cursorStyle,
        showSelector,
        toggleCursor,
        selectStyle,
        setShowSelector,
        handleToggleClick,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export const useCat = () => useContext(CursorContext);
