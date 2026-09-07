import Link from "next/link";

export type ContentsItem = { name: string; href: string; label?: string };

export const ContentsTable: React.FC<
  { as?: "ol" | "ul" } & React.PropsWithChildren
> = ({ as: Tag = "ol", children }): React.JSX.Element => (
  <Tag className="flex flex-col border-y-4 border-frame divide-y-4 divide-frame group-last:border-b-0">
    {children}
  </Tag>
);

export const ContentsRow: React.FC<{
  number?: number;
  title: string;
  href: string;
  items: ContentsItem[];
}> = ({ number, title, href, items }): React.JSX.Element => (
  <li className="flex gap-4 px-4 md:px-8 py-4">
    <span
      aria-hidden="true"
      className="w-6 shrink-0 font-title text-xl text-leader-ink"
    >
      {number ?? ""}
    </span>
    <div className="flex flex-col md:flex-row gap-2 md:gap-8 min-w-0 grow">
      <h3 className="md:w-48 shrink-0 font-subtitle text-lg leading-tight">
        <Link className="hover:underline underline-offset-4" href={href}>
          {number !== undefined && (
            <span className="sr-only">{`${number}. `}</span>
          )}
          {title}
        </Link>
      </h3>
      <ul className="flex flex-wrap gap-x-3 gap-y-1 text-base">
        {items.map((item) => (
          <li key={item.href}>
            {item.label && `${item.label} `}
            <Link className="underline underline-offset-4" href={item.href}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  </li>
);
