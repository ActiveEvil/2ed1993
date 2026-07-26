"use client";

import { useEffect } from "react";

export const Highlighter: React.FC = (): null => {
  useEffect(() => {
    if (window.location.hash) {
      window.location.replace(window.location.href);
    }
  }, []);

  return null;
};

export const HighlighterLink: React.FC<
  {
    id?: string | undefined;
    className?: string | undefined;
    href: string;
  } & React.PropsWithChildren
> = ({ id, className, href, children }): React.JSX.Element => (
  <a
    id={id}
    href={href}
    className={className}
    onClick={(e) => {
      // Let modified clicks behave like a normal link (new tab, etc.).
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }

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
  </a>
);
