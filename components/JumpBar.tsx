"use client";

import { FILTER_EVENT } from "./RowFilter";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

export type JumpItem = {
  id: string;
  label: string;
  subsections?: { id: string; label: string }[];
};

const EYEBROW = "shrink-0 font-subtitle text-xs uppercase tracking-widest";

const RAIL_QUERY = "(min-width: 64rem)";

export const JumpBar: React.FC<
  {
    items: JumpItem[];
    label?: string;
    sticky?: boolean;
    rail?: boolean;
    className?: string;
  } & React.PropsWithChildren
> = ({
  items,
  label = "On this page",
  sticky = true,
  rail = false,
  className,
  children,
}): React.JSX.Element => {
  const ref = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  const heightRef = useRef(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const root = document.documentElement;
    const publish = () => {
      const asRail = rail && window.matchMedia(RAIL_QUERY).matches;
      const height = asRail
        ? 0
        : Math.round(element.getBoundingClientRect().height);
      heightRef.current = height;
      if (sticky) root.style.setProperty("--jump-bar-height", `${height}px`);
    };

    const observer = new ResizeObserver(publish);
    observer.observe(element);
    publish();

    return () => {
      observer.disconnect();
      root.style.removeProperty("--jump-bar-height");
    };
  }, [sticky, rail]);

  useEffect(() => {
    const ids = new Set(items.map(({ id }) => id));
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (ids.has(id)) setActive(id);
    };

    requestAnimationFrame(onHash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [items]);

  useEffect(() => {
    const sections = items
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (!sections.length) return;

    let queued = false;
    const update = () => {
      queued = false;

      const onPage = sections.filter(
        (section) => section.offsetParent !== null,
      );
      const live = onPage.length ? onPage : sections;

      const root = document.documentElement;
      if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) {
        setActive(live[live.length - 1].id);
        return;
      }

      const line = (sticky ? heightRef.current : 0) + 16 + 2;
      let current = live[0];
      for (const section of live) {
        if (section.getBoundingClientRect().top <= line) current = section;
      }
      setActive(current.id);
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items, sticky]);

  useEffect(() => {
    const sync = () => {
      const next = new Set(
        items
          .filter(({ id }) => {
            const section = document.getElementById(id);
            return section !== null && section.offsetParent === null;
          })
          .map(({ id }) => id),
      );
      setHidden((previous) =>
        previous.size === next.size && [...next].every((id) => previous.has(id))
          ? previous
          : next,
      );
    };

    const frame = requestAnimationFrame(sync);
    window.addEventListener(FILTER_EVENT, sync);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(FILTER_EVENT, sync);
    };
  }, [items]);

  const activeLabel =
    items.find(({ id }) => id === active)?.label ?? items[0]?.label ?? "";

  const closeDetails = () => {
    const details = detailsRef.current;
    if (!details) return;
    details.open = false;
    details.querySelector<HTMLElement>("summary")?.focus({
      preventScroll: true,
    });
  };

  const details = (
    <details
      ref={detailsRef}
      className={clsx("group peer", rail ? "lg:hidden" : "md:hidden")}
    >
      <summary className="flex items-center gap-3 min-h-11 px-4 py-1 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <span className="shrink-0 flex items-center min-h-9 px-3 bg-2ed-light-yellow font-subtitle text-sm text-black">
          <span className="group-open:hidden">Jump</span>
          <span className="hidden group-open:inline">Close</span>
        </span>
        <span className="grow min-w-0 font-subtitle text-sm text-2ed-light-yellow text-right truncate">
          {activeLabel}
        </span>
      </summary>
      <nav
        aria-label={label}
        className="flex flex-col max-h-96 overflow-y-auto border-t-2 border-white/25"
      >
        {items.map(({ id, label: text }) => (
          <a
            key={id}
            href={`#${id}`}
            aria-current={active === id ? "true" : undefined}
            onClick={() => {
              setActive(id);
              closeDetails();
            }}
            className={clsx(
              "flex items-center min-h-11 px-4 py-2 border-b-2 border-white/15 last:border-b-0 font-subtitle text-sm",
              hidden.has(id) && "opacity-60 line-through",
              active === id
                ? "bg-2ed-light-yellow text-black"
                : "text-2ed-white",
            )}
          >
            {text}
          </a>
        ))}
      </nav>
    </details>
  );

  if (rail) {
    return (
      <div
        data-jump=""
        className={clsx(
          "contents lg:block lg:w-56 lg:shrink-0 lg:-ml-1 lg:border-r-4 lg:border-frame print:hidden",
          className,
        )}
      >
        <div
          ref={ref}
          className={clsx(
            "z-30 bg-black lg:flex lg:flex-col lg:gap-4 lg:p-4 lg:bg-transparent",
            sticky && "sticky top-0 lg:top-4",
          )}
        >
          {details}
          <nav
            aria-label={label}
            className="hidden lg:flex lg:flex-col gap-2 min-w-0"
          >
            <span className={clsx(EYEBROW, "px-2")}>{label}</span>
            <ul className="flex flex-col">
              {items.map(({ id, label: text, subsections }) => (
                <li key={id} className="flex flex-col">
                  <a
                    href={`#${id}`}
                    aria-current={active === id ? "true" : undefined}
                    onClick={() => setActive(id)}
                    className={clsx(
                      "block px-2 py-1 font-subtitle text-sm hover:underline underline-offset-4",
                      hidden.has(id) && "opacity-60 line-through",
                      active === id && "bg-2ed-light-yellow text-black",
                    )}
                  >
                    {text}
                  </a>
                  {active === id && subsections && subsections.length > 0 && (
                    <ul className="flex flex-col py-1">
                      {subsections.map((subsection) => (
                        <li key={subsection.id}>
                          <a
                            href={`#${subsection.id}`}
                            className="block pl-5 pr-2 py-1 font-subtitle text-xs hover:underline underline-offset-4"
                          >
                            {subsection.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          {children && (
            <div className="hidden peer-open:block lg:block px-4 pb-4 lg:p-0">
              {children}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={clsx(
        "z-30 bg-black border-y-4 border-frame print:hidden",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="w-full max-w-5xl mx-auto">
        {children && <div className="px-4 py-2">{children}</div>}

        <nav
          aria-label={label}
          className="hidden md:flex items-baseline gap-3 px-4 py-2"
        >
          <span className={clsx(EYEBROW, "pr-1 text-2ed-white")}>{label}</span>
          <div className="flex flex-wrap gap-2">
            {items.map(({ id, label: text }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                onClick={() => setActive(id)}
                className={clsx(
                  "shrink-0 px-2 py-1 border-2 font-subtitle text-sm whitespace-nowrap",
                  hidden.has(id) && "opacity-60 line-through",
                  active === id
                    ? "bg-2ed-light-yellow border-2ed-light-yellow text-black"
                    : "border-2ed-white text-2ed-white hover:bg-2ed-white hover:text-black",
                )}
              >
                {text}
              </a>
            ))}
          </div>
        </nav>

        {details}
      </div>
    </div>
  );
};
