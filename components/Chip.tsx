import { clsx } from "clsx";

// The chip is 20px tall, which is under any target-size guideline. Padding
// would grow the visible border box, so the target is a transparent ::after
// overlay instead: 8px above and below, for 36px. Containers that wrap chips
// need at least gap-y-4, or a chip's overlay steals clicks from the row above.
export const CHIP_CLASS =
  "relative inline-block px-1.5 border-2 border-foreground font-subtitle " +
  "text-xs whitespace-nowrap hover:bg-2ed-light-yellow hover:text-black " +
  "after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']";

export const Chip: React.FC<
  { href: string; className?: string } & React.PropsWithChildren
> = ({ href, className, children }): React.JSX.Element => (
  <a href={href} className={clsx(CHIP_CLASS, className)}>
    {children}
  </a>
);
