import { ImageWithCredit } from "./ImageWithCredit";
import type { Image } from "./ImageWithCredit";
import { clsx } from "clsx";

export const EYEBROW_CLASS =
  "font-subtitle text-xs uppercase tracking-widest text-accent";

export const TitleBand: React.FC<
  {
    title?: string;
    heading?: React.ReactNode;
    eyebrow?: React.ReactNode;
    image?: Image | null;
    className?: string;
  } & React.PropsWithChildren
> = ({
  title,
  heading,
  eyebrow,
  image,
  className,
  children,
}): React.JSX.Element => (
  <header className={clsx("flex border-b-4 border-frame", className)}>
    {image && (
      <div className="w-40 lg:w-56 shrink-0 -mt-1 -ml-1 -mb-1">
        <ImageWithCredit
          src={image.src}
          title={image.title}
          artist={image.artist}
          aspect={image.aspect ?? "aspect-portrait"}
          width="half"
          dimensions={image.dimensions}
        />
      </div>
    )}
    <div className="@container flex flex-col justify-center items-center self-stretch gap-4 min-w-0 grow p-4 lg:p-8">
      <div className="flex flex-col items-center gap-3 min-w-0 text-center">
        {eyebrow && <p className={EYEBROW_CLASS}>{eyebrow}</p>}
        {heading ?? (
          <h1 className="font-title uppercase tracking-wide text-3xl md:text-5xl">
            {title}
          </h1>
        )}
      </div>
      {children && (
        <div className="flex flex-wrap justify-center gap-2 min-w-0">
          {children}
        </div>
      )}
    </div>
  </header>
);
