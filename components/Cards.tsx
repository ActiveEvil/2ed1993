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

export const ImageCard: React.FC<{
  href: string;
  title: string;
  image?: Image;
}> = ({ href, title, image }): React.JSX.Element => (
  <Panel as="article" className="flex flex-col gap-2 p-4">
    <Link
      className="flex flex-col gap-3 font-subtitle text-2xl leading-tight hover:underline underline-offset-4"
      href={href}
    >
      {title}
      {image && (
        <ImageWithCredit
          src={image.src}
          title={image.title}
          artist={image.artist}
          width="half-from-md"
        />
      )}
    </Link>
  </Panel>
);
