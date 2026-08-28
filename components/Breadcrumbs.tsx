"use client";

import { generateAnchorId } from "@/lib/anchors";
import Link from "next/link";

export const Breadcrumbs: React.FC<{
  crumbs: {
    href?: string;
    anchor: string;
  }[];
}> = ({ crumbs }): React.JSX.Element => {
  const list = crumbs.map((crumb, index) => {
     const key = generateAnchorId(crumb.anchor);

    if (!crumb.href) {
      return (
        <li key={key} aria-current="page" className="font-subtitle">
          {crumb.anchor}
        </li>
      );
    }

    if (index === 0) {
      return (
        <li key={key} className="font-subtitle after:content-['/'] after:ml-2">
          <Link className=" hover:underline underline-offset-4" href={crumb.href}>
            {crumb.anchor}
          </Link>
        </li>
      );
    }

    return (
      <li key={key} className="font-subtitle after:content-['/'] after:ml-2">
        <Link className="hover:underline underline-offset-4" href={crumb.href}>
          <span className="hidden md:inline">{crumb.anchor}</span>
          <span className="md:hidden ">&hellip;</span>
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
