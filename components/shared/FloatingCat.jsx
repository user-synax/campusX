"use client";

import { useEffect } from "react";
import { useCat } from "@/context/CatContext";

export default function CustomCursor() {
  const { cursorEnabled, cursorStyle } = useCat();

  useEffect(() => {
    if (!cursorEnabled) {
      document.body.style.cursor = "";
      return;
    }
    document.body.style.cursor = cursorStyle;
    return () => {
      document.body.style.cursor = "";
    };
  }, [cursorEnabled, cursorStyle]);

  return null;
  }
