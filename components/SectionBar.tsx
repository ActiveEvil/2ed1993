import { clsx } from "clsx";

export const SectionBar: React.FC<{
  as?: "div" | "h2";
  title: string;
  note?: React.ReactNode;
  className?: string;
}> = ({ as: Tag = "div", title, note, className }): React.JSX.Element => (
  <Tag
    className={clsx(
      "flex flex-col items-start m-0 px-3 py-2",
      "sm:flex-row sm:justify-between sm:items-baseline sm:gap-4",
      "bg-black font-subtitle text-sm text-white uppercase tracking-[0.14em]",
      className,
    )}
  >
    <span>{title}</span>
    {note && (
      <span className="sm:whitespace-nowrap text-2ed-light-yellow">{note}</span>
    )}
  </Tag>
);
