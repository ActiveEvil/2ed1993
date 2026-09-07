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
  <div className="flex flex-col gap-2 p-3 bg-black border-2 border-frame text-white">
    <div className="flex justify-between items-baseline gap-3">
      <span className="font-subtitle text-xs uppercase tracking-widest">
        {label}
      </span>
      <span
        ref={countRef}
        aria-live="polite"
        className="font-subtitle text-xs uppercase tracking-widest text-right"
      >
        {count}
      </span>
    </div>
    <input
      id={label}
      ref={inputRef}
      type="search"
      value={value}
      placeholder={placeholder}
      aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "w-full min-w-0 min-h-11 px-2 py-1 bg-2ed-white border-2 border-2ed-white",
        "text-2ed-black text-lg focus:outline-2 focus:outline-2ed-light-yellow",
      )}
    />
  </div>
);
