"use client";

import { FilterField } from "./FilterField";
import { useEffect, useRef, useState } from "react";

const ROW = "[data-search]";

/** Fired after a filter pass, so the jump bar can re-read what is on screen. */
export const FILTER_EVENT = "2ed:filter";

/**
 * Filters server-rendered rows by hiding them, rather than re-rendering a
 * client-side copy of the data. Every row stays in the HTML, so the page is
 * complete without JavaScript and to a crawler.
 *
 * Rows carry data-search (lowercased haystack), section wrappers carry
 * data-group, and the no-matches message carries data-empty.
 */
export const RowFilter: React.FC<{
  label: string;
  unit: string;
  total: number;
  placeholder?: string;
}> = ({ label, unit, total, placeholder }): React.JSX.Element => {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = Array.from(document.querySelectorAll<HTMLElement>(ROW));

    let shown = 0;
    const matched: HTMLElement[] = [];
    for (const row of rows) {
      const match = terms.every((term) =>
        (row.dataset.search ?? "").includes(term),
      );
      row.hidden = !match;
      if (match) {
        shown += 1;
        matched.push(row);
      }
    }

    for (const row of matched) {
      for (const id of (row.dataset.refs ?? "").split(" ")) {
        if (!id) continue;
        const referenced = document.getElementById(id);
        if (referenced?.hasAttribute("data-search")) referenced.hidden = false;
      }
    }

    for (const group of document.querySelectorAll<HTMLElement>(
      "[data-group]",
    )) {
      group.hidden = !group.querySelector(`${ROW}:not([hidden])`);
    }

    const empty = document.querySelector<HTMLElement>("[data-empty]");
    if (empty) empty.hidden = shown > 0;

    window.dispatchEvent(new Event(FILTER_EVENT));

    if (countRef.current) {
      countRef.current.textContent = terms.length
        ? `${shown} of ${rows.length}`
        : `${rows.length} ${unit}`;
    }
  }, [query, unit]);

  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;

      const target = document.getElementById(id);
      if (!target || target.offsetParent !== null) return;

      setQuery("");

      requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView(),
      );
    };

    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const input = inputRef.current;
      if (e.key === "/" && document.activeElement !== input) {
        e.preventDefault();
        input?.focus();
      } else if (e.key === "Escape") {
        setQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(
    () => () => {
      for (const row of document.querySelectorAll<HTMLElement>(ROW)) {
        row.hidden = false;
      }
    },
    [],
  );

  return (
    <FilterField
      label={label}
      value={query}
      count={`${total} ${unit}`}
      countRef={countRef}
      placeholder={placeholder}
      inputRef={inputRef}
      onChange={setQuery}
    />
  );
};
