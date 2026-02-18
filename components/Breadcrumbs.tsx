"use client";

import Link from "next/link";

export const Breadcrumbs: React.FC<{
  crumbs: {
    href?: string;
    anchor: string;
  }[];
}> = ({ crumbs }): React.JSX.Element => {
  const list = crumbs.map((crumb) => {
    const key = crumb.anchor.split(" ").join("_");

    if (!crumb.href) {
      return (
        <li key={key} className="font-subtitle">
          {crumb.anchor}
        </li>
      );
    }

    return (
      <li key={key} className="font-subtitle after:content-['/'] after:ml-2">
        <Link className=" hover:underline underline-offset-4" href={crumb.href}>
          {crumb.anchor}
        </Link>
      </li>
    );
  });

  return (
    <nav className="w-full max-w-5xl">
      <ul className="flex gap-2 w-full max-w-5xl mb-2">{list}</ul>
    </nav>
  );
};
