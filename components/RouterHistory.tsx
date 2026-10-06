"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Next.js ignores Back/Forward onto a history entry without its router state,
// and every hash navigation the browser makes itself leaves one behind.
const isRouterState = (state: unknown): boolean =>
  typeof state === "object" && state !== null && "__NA" in state;

let routerState: unknown = null;

export const replaceLocation = (url: string | URL): void => {
  const { state } = window.history;
  const target = new URL(url, window.location.href);
  const samePage =
    target.origin === window.location.origin &&
    target.pathname === window.location.pathname &&
    target.search === window.location.search;

  window.location.replace(target);

  if (samePage && isRouterState(state)) {
    window.history.replaceState(state, "", window.location.href);
  }
};

export const RouterHistory: React.FC = (): null => {
  const pathname = usePathname();

  useEffect(() => {
    if (isRouterState(window.history.state)) {
      routerState = window.history.state;
    }
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => {
      if (isRouterState(window.history.state)) {
        routerState = window.history.state;
      } else if (routerState !== null) {
        window.history.replaceState(routerState, "", window.location.href);
      }
    };

    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
};
