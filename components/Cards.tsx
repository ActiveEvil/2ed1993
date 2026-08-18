import { ImageWithCredit } from "./ImageWithCredit";
import type { Image } from "./ImageWithCredit";
import { Logo } from "./Logos";
import { Panel } from "./Panel";
import Link from "next/link";

export const IndexCard: React.FC<
  {
    href: string;
    title: string;
    summary?: string | null;
  } & React.PropsWithChildren
> = ({ href, title, summary, children }): React.JSX.Element => (
  <Panel as="article" className="flex flex-col gap-2 p-4">
    <Link
      className="font-subtitle text-2xl leading-tight hover:underline underline-offset-4"
      href={href}
    >
      {title}
    </Link>
    {summary && (
      <p className="pl-3 border-l-8 border-2ed-mid-blue italic text-sm leading-relaxed">
        {summary}
      </p>
    )}
    {children}
  </Panel>
);

export const FactionCard: React.FC<{
  href: string;
  name: string;
  image?: Image;
}> = ({ href, name, image }): React.JSX.Element => (
  <div
    className="@container relative flex flex-col gap-3"
    // href={href}
  >
    <div className="absolute inset-0 z-10 mx-auto mt-8 px-8 w-fit h-fit">
      <Logo as="h2" size="md" title={name} />
    </div>
    {image && (
      <ImageWithCredit
        src={image.src}
        title={image.title}
        artist={image.artist}
        aspect="aspect-portrait"
        // width="half-from-md"
      />
    )}
  </div>
);
