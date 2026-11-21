import {
  MagazineHead,
  MagazineMark,
  SectionHeading,
} from "@/components/Heading";
import { HighlighterLink } from "@/components/Highlighter";
import { markExtensions } from "@/lib/magazine";
import { clsx } from "clsx";
import Link from "next/link";

export const SpecialRuleSection: React.FC<{
  id: string;
  name: string;
  href: string;
  html: string;
  related?: { name: string; href: string } | null;
  source?: string | null;
}> = ({ id, name, href, html, related, source }): React.JSX.Element => {
  const prose = (
    <section
      className="dynamic-content measure flex flex-col gap-4"
      dangerouslySetInnerHTML={{ __html: markExtensions(html) }}
    />
  );

  return (
    <section
      id={id}
      data-search={name.toLowerCase()}
      className={clsx(
        "highlight-target flex flex-col",
        source ? "gap-2" : "gap-4",
        "target:-m-4 target:p-4 target:bg-2ed-light-yellow target:text-black",
      )}
    >
      <SectionHeading as="h3" ruled={!source}>
        <HighlighterLink
          className="hover:underline underline-offset-4"
          href={href}
        >
          {name}
        </HighlighterLink>
        <MagazineMark source={source} />
      </SectionHeading>
      {source ? (
        <div className="mag flex flex-col gap-4">
          <MagazineHead source={source} />
          {prose}
        </div>
      ) : (
        prose
      )}
      {related && (
        <p className="max-w-prose text-lg">
          {"See "}
          <Link
            className="font-bold underline underline-offset-4"
            href={related.href}
          >
            {related.name}
          </Link>
          {"."}
        </p>
      )}
    </section>
  );
};
