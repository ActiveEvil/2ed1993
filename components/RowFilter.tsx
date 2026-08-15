"use client";

import { FilterField } from "./FilterField";
import { FACET_HASH } from "@/lib/anchors";
import { useEffect, useRef, useState } from "react";

const ROW = "[data-search]";

export const FILTER_EVENT = "2ed:filter";

export const RowFilter: React.FC<{
  label: string;
  unit: string;
  total: number;
  placeholder?: string;
  facetAttribute?: string;
}> = ({
  label,
  unit,
  total,
  placeholder,
  facetAttribute,
}): React.JSX.Element => {
  const [query, setQuery] = useState("");
  const [facet, setFacet] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = Array.from(document.querySelectorAll<HTMLElement>(ROW));

    let shown = 0;
    const matched: HTMLElement[] = [];
    for (const row of rows) {
      const match =
        terms.every((term) => (row.dataset.search ?? "").includes(term)) &&
        (!facet ||
          !facetAttribute ||
          (row.dataset[facetAttribute] ?? "").includes(facet));
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
      countRef.current.textContent =
        terms.length || facet
          ? `${shown} of ${rows.length}`
          : `${rows.length} ${unit}`;
    }
  }, [query, facet, facetAttribute, unit]);

  useEffect(() => {
    const onHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;

      if (id.startsWith(FACET_HASH)) {
        const selected = id.slice(FACET_HASH.length).replace(/-/g, " ");
        setFacet(selected);
        if (!selected) {
          window.history.replaceState(
            null,
            "",
            window.location.pathname + window.location.search,
          );
        }
        return;
      }

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
      const plain = !e.ctrlKey && !e.metaKey && !e.altKey;
      if (e.key === "/" && plain && document.activeElement !== input) {
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
