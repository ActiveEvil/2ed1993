"use client";

import { useEffect } from "react";

export const Highlighter: React.FC = (): null => {
  useEffect(() => {
    const url = new URL(window.location.href);

    if (url.hash) {
      window.location.replace(url);
    }
  }, []);

  return null;
};
