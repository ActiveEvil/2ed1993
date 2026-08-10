import { clsx } from "clsx";

export const SectionBar: React.FC<{
  as?: "div" | "h2";
  title: string;
  note?: string | null;
  className?: string;
}> = ({ as: Tag = "div", title, note, className }): React.JSX.Element => (
  <Tag
    className={clsx(
      "flex justify-between items-baseline gap-4 m-0 px-2.5 py-1.5",
      "bg-black font-subtitle text-sm text-white uppercase tracking-[0.14em]",
      className,
    )}
  >
    <span>{title}</span>
    {note && <span className="text-2ed-light-yellow">{note}</span>}
  </Tag>
);
