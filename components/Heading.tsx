import { clsx } from "clsx";

export const SectionHeading: React.FC<
  {
    as?: "h2" | "h3";
    id?: string;
    className?: string;
  } & React.PropsWithChildren
> = ({ as: Tag = "h2", id, className, children }): React.JSX.Element => (
  <Tag
    id={id}
    className={clsx(
      "pb-2 border-b-4 border-frame font-title text-2xl md:text-3xl uppercase",
      className,
    )}
  >
    {children}
  </Tag>
);
