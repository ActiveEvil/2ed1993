"use client";

import Link from "next/link";
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

export const HighlighterLink: React.FC<
  {
    className?: string | undefined;
    href: string;
    scroll?: boolean | undefined;
  } & React.PropsWithChildren
> = ({ className, href, scroll, children }): React.JSX.Element => (
  <Link
    className={className}
    href={href}
    onNavigate={(e) => {
      e.preventDefault();

      const previous = encodeURI(href);
      const current = window.location.pathname + window.location.hash;

      if (current === previous) {
        window.location.replace(
          new URL(window.location.origin + window.location.pathname + "#"),
        );
      } else {
        window.location.replace(new URL(window.location.origin + href));
      }
    }}
    scroll={scroll}
  >
    {children}
  </Link>
);
