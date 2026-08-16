"use client";

import { clsx } from "clsx";

export const FilterField: React.FC<{
  label: string;
  value: string;
  count: string;
  countRef?: React.RefObject<HTMLSpanElement | null>;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
}> = ({
  label,
  value,
  count,
  countRef,
  placeholder,
  inputRef,
  onChange,
}): React.JSX.Element => (
  <div className="flex items-center gap-3">
    <span className="shrink-0 font-subtitle text-[11px] text-2ed-light-yellow uppercase tracking-[0.14em]">
      {label}
    </span>
    <input
      id={label}
      ref={inputRef}
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "grow min-w-0 px-2 py-1 bg-2ed-white border-2 border-2ed-white",
        "text-2ed-black text-lg focus:outline-2 focus:outline-2ed-light-yellow",
      )}
    />
    <span
      ref={countRef}
      aria-live="polite"
      className="shrink-0 font-subtitle text-[11px] text-white uppercase tracking-widest"
    >
      {count}
    </span>
  </div>
);
