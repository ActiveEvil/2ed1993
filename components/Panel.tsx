import { clsx } from "clsx";

type Element = "div" | "section" | "article" | "main";

export const Panel: React.FC<
  {
    as?: Element;
    id?: string;
    className?: string;
  } & React.PropsWithChildren
> = ({ as: Tag = "div", id, className, children }): React.JSX.Element => (
  <Tag id={id} className={clsx("border-4 border-black shadow-lg", className)}>
    {children}
  </Tag>
);
