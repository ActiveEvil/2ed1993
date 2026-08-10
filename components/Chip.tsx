import { clsx } from "clsx";

// border-foreground rather than border-black: at 2px a literal black border
// all but disappears against the dark background, and #2d2d2d is the site
// foreground anyway, so light mode is unchanged.
export const CHIP_CLASS =
  "inline-block px-1.5 border-2 border-foreground font-subtitle text-xs " +
  "whitespace-nowrap hover:bg-2ed-light-yellow hover:text-black";

export const Chip: React.FC<
  { href: string; className?: string } & React.PropsWithChildren
> = ({ href, className, children }): React.JSX.Element => (
  <a href={href} className={clsx(CHIP_CLASS, className)}>
    {children}
  </a>
);
