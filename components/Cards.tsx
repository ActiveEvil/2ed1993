import { ImageWithCredit } from "./ImageWithCredit";
import type { Image } from "./ImageWithCredit";
import { Logo } from "./Logos";
import { Panel } from "./Panel";
import { SectionBar } from "./SectionBar";
import { clsx } from "clsx";
import Link from "next/link";

export const IndexCard: React.FC<
  {
    href: string;
    title: string;
    summary?: string | null;
    wide?: boolean;
  } & React.PropsWithChildren
> = ({ href, title, summary, wide, children }): React.JSX.Element => (
  <Panel
    as="article"
    className={clsx("flex flex-col gap-2 p-4", wide && "col-span-full")}
  >
    <Link
      className="font-subtitle text-2xl leading-tight hover:underline underline-offset-4"
      href={href}
    >
      {title}
    </Link>
    {summary && <p className="text-sm">{summary}</p>}
    {children}
  </Panel>
);

export const FactionCard: React.FC<{
  href: string;
  name: string;
  image?: Image;
  disabled?: boolean;
  as?: "h2" | "h3";
}> = ({
  href,
  name,
  image,
  disabled,
  as: Heading = "h2",
}): React.JSX.Element => (
  <Link
    className={clsx(
      "@container relative flex flex-col gap-3",
      disabled && "pointer-events-none",
    )}
    href={href}
  >
    <div
      className={clsx(
        "mx-auto w-fit h-fit",
        image && "absolute inset-0 z-10 mt-8 px-8",
      )}
    >
      <Logo as={Heading} size="md" title={name} />
    </div>
    {image && (
      <ImageWithCredit
        src={image.src}
        title={image.title}
        artist={image.artist}
        aspect="aspect-portrait"
        width="half"
        openable={false}
      />
    )}
    {disabled && (
      <div className="absolute inset-0 z-10 m-auto flex flex-col justify-center size-full bg-black/50">
        <SectionBar
          as="h2"
          title="Coming soon..."
          className="justify-center!"
        />
      </div>
    )}
  </Link>
);
