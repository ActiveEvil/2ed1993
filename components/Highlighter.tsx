"use client";

import { clsx } from "clsx";
import { useEffect } from "react";

export const Highlighter: React.FC = (): null => {
  useEffect(() => {
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  return null;
};

export const HighlighterButton: React.FC<
  {
    id?: string | undefined;
    className?: string | undefined;
    href: string;
    scroll?: boolean | undefined;
  } & React.PropsWithChildren
> = ({ id, className, href, scroll, children }): React.JSX.Element => (
  <button
    id={id}
    className={clsx("cursor-pointer", className)}
    onClick={(e) => {
      e.preventDefault();

      const previous = encodeURI(href);
      const current = window.location.pathname + window.location.hash;

      if (current === previous) {
        const target = new URL(
          window.location.pathname + "#",
          window.location.origin,
        );
        window.location.replace(target);
      } else {
        const target = new URL(href, window.location.origin);
        window.location.replace(target);
      }
    }}
  >
    {children}
  </button>
);
