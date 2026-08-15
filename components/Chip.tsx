import { clsx } from "clsx";

export const CHIP_CLASS =
  "relative inline-block px-1.5 border-2 border-foreground font-subtitle " +
  "text-xs whitespace-nowrap hover:bg-2ed-light-yellow hover:text-black " +
  "[tbody:target_&]:border-black [.highlight-target:target_&]:border-black " +
  "after:absolute after:inset-x-0 after:-inset-y-2 after:content-['']";

export const Chip: React.FC<
  { href: string; className?: string } & React.PropsWithChildren
> = ({ href, className, children }): React.JSX.Element => (
  <a href={href} className={clsx(CHIP_CLASS, className)}>
    {children}
  </a>
);
