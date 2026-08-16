import { ImageWithCredit } from "./ImageWithCredit";
import type { Image } from "./ImageWithCredit";
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
  <Panel as="article" className="flex flex-col gap-2 p-4">
    <Link className="relative flex flex-col gap-3" href={href}>
      <span className="absolute inset-0 z-10 mx-auto mt-12 w-fit h-fit p-3 bg-black border-4 border-2ed-dark-yellow [border-style:inset] font-title tracking-widest text-center text-2xl leading-tight text-balance text-2ed-dark-yellow [-webkit-text-stroke:2px_#fff20b]">
        {name.toUpperCase()}
      </span>
      {image && (
        <ImageWithCredit
          src={image.src}
          title={image.title}
          artist={image.artist}
          aspect="aspect-portrait"
          // width="half-from-md"
        />
      )}
    </Link>
  </Panel>
);
