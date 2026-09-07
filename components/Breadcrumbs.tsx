import { generateAnchorId } from "@/lib/anchors";
import { clsx } from "clsx";
import Link from "next/link";

export const Breadcrumbs: React.FC<{
  crumbs: {
    href?: string;
    anchor: string;
  }[];
}> = ({ crumbs }): React.JSX.Element => {
  const parent = crumbs.length - 2;
  const list = crumbs.map((crumb, index) => {
    const key = generateAnchorId(crumb.anchor);

    if (!crumb.href) {
      return (
        <li
          key={key}
          aria-current="page"
          className="min-w-0 font-subtitle truncate"
        >
          {crumb.anchor}
        </li>
      );
    }

    return (
      <li
        key={key}
        className={clsx(
          "shrink-0 font-subtitle after:content-['/'] after:ml-2",
          index !== parent && "hidden md:block",
        )}
      >
        <Link className="hover:underline underline-offset-4" href={crumb.href}>
          {crumb.anchor}
        </Link>
      </li>
    );
  });

  return (
    <nav aria-label="Breadcrumb" className="w-full max-w-5xl">
      <ul className="flex gap-2 w-full max-w-5xl mb-2">{list}</ul>
    </nav>
  );
};
