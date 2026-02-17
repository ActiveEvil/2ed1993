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
  } & React.PropsWithChildren
> = ({ className, href, children }): React.JSX.Element => (
  <Link
    className={className}
    href={href}
    onNavigate={() => {
      window.location.replace(new URL(window.location.origin + href));
    }}
  >
    {children}
  </Link>
);
