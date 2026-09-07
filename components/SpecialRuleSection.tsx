import { SectionHeading } from "@/components/Heading";
import { HighlighterLink } from "@/components/Highlighter";
import Link from "next/link";

export const SpecialRuleSection: React.FC<{
  id: string;
  name: string;
  href: string;
  html: string;
  related?: { name: string; href: string } | null;
}> = ({ id, name, href, html, related }): React.JSX.Element => (
  <section
    id={id}
    data-search={name.toLowerCase()}
    className="highlight-target flex flex-col gap-4 target:-m-4 target:p-4 target:bg-2ed-light-yellow target:text-black"
  >
    <SectionHeading as="h3">
      <HighlighterLink
        className="hover:underline underline-offset-4"
        href={href}
      >
        {name}
      </HighlighterLink>
    </SectionHeading>
    <section
      className="dynamic-content measure flex flex-col gap-4"
      dangerouslySetInnerHTML={{ __html: html }}
    />
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
