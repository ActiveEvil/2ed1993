"use client";

import { FILTER_EVENT } from "./RowFilter";
import { clsx } from "clsx";
import { useEffect, useRef, useState } from "react";

export type JumpItem = { id: string; label: string };

const EYEBROW =
  "shrink-0 font-subtitle text-[10px] uppercase tracking-[0.14em] text-2ed-light-yellow";

export const JumpBar: React.FC<
  {
    items: JumpItem[];
    label?: string;
    sticky?: boolean;
    className?: string;
  } & React.PropsWithChildren
> = ({
  items,
  label = "On this page",
  sticky = true,
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
      const height = Math.round(element.getBoundingClientRect().height);
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
  }, [sticky]);

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

  return (
    <div
      ref={ref}
      className={clsx(
        "z-30 bg-black border-y-4 border-black",
        sticky && "sticky top-0",
        className,
      )}
    >
      <div className="w-full max-w-5xl mx-auto">
        {children && <div className="px-4 py-2">{children}</div>}

        <nav
          aria-label={label}
          className="hidden md:flex items-baseline gap-2 px-4 py-2"
        >
          <span className={clsx(EYEBROW, "pr-1")}>{label}</span>
          {/* Chips wrap in their own column so a second row lines up with the
              first rather than starting under the label. */}
          <div className="flex flex-wrap gap-2">
            {items.map(({ id, label: text }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                onClick={() => setActive(id)}
                className={clsx(
                  "shrink-0 px-2 py-0.5 border-2 font-subtitle text-sm whitespace-nowrap",
                  hidden.has(id) && "opacity-40",
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

        <details ref={detailsRef} className="group md:hidden">
          <summary className="flex items-center gap-2.5 min-h-13 px-4 py-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span className={EYEBROW}>{label}</span>
            <span className="grow min-w-0 font-subtitle text-base text-2ed-white truncate">
              {activeLabel}
            </span>
            <span className="shrink-0 px-2.5 py-1 bg-2ed-light-yellow font-subtitle text-xs uppercase tracking-[0.1em] text-black">
              <span className="group-open:hidden">Jump</span>
              <span className="hidden group-open:inline">Close</span>
            </span>
          </summary>
          <nav
            aria-label={label}
            className="flex flex-col max-h-[60vh] overflow-y-auto border-t-2 border-white/25"
          >
            {items.map(({ id, label: text }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === id ? "true" : undefined}
                onClick={() => {
                  setActive(id);
                  if (detailsRef.current) detailsRef.current.open = false;
                }}
                className={clsx(
                  "flex items-center min-h-13 px-4 py-2 border-b-2 border-white/15 last:border-b-0 font-subtitle text-sm",
                  hidden.has(id) && "opacity-40",
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
      </div>
    </div>
  );
};
