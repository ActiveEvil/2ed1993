import { OpenableFigure } from "./OpenableFigure";
import NextImage from "next/image";

export type Aspect =
  "aspect-video" | "aspect-portrait" | "aspect-retro" | "aspect-square";

export type Width = "full" | "half" | "half-from-md" | "third";

export type Dimensions = { width: number; height: number };

export type Image = {
  src: string;
  title: string;
  artist: string | null;
  aspect?: Aspect;
  width?: Width;
  dimensions?: Dimensions | null;
  openable?: boolean;
  onOpen?: () => void;
};

export const dimensionsOf = (source: {
  width: number | null;
  height: number | null;
}): Dimensions | null =>
  source.width && source.height
    ? { width: source.width, height: source.height }
    : null;

export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPMPff9PwAHFQMzdqydyAAAAABJRU5ErkJggg==";

const SIZES: Record<Width, string> = {
  full: "(min-width: 1024px) 960px, 100vw",
  half: "(min-width: 1024px) 480px, 50vw",
  "half-from-md": "(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw",
  third: "(min-width: 1024px) 320px, (min-width: 768px) 33vw, 50vw",
};

export const ImageWithCredit: React.FC<Image> = ({
  src,
  title,
  artist,
  aspect = "aspect-video",
  width = "full",
  dimensions = null,
  openable = true,
  onOpen,
}): React.JSX.Element => {
  const figure = (
    <figure
      className={`${aspect} @container relative w-full border-4 border-black shadow-lg`}
    >
      <NextImage
        src={src}
        alt={artist ? `${title} by ${artist}` : title}
        quality={80}
        loading="lazy"
        sizes={SIZES[width]}
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
        className="w-full h-auto object-cover object-center"
        fill
      />
      <figcaption className="absolute bottom-1 right-1 ml-1 p-0.5 border @3xs:bottom-2 @3xs:right-2 @3xs:ml-2 @3xs:p-1 @3xs:border-2 border-black bg-2ed-light-blue font-bold text-black text-2xs @3xs:text-xs text-right">
        {artist ? (
          <>
            &mdash;{artist}, <cite>{title}</cite>
          </>
        ) : (
          title
        )}
      </figcaption>
    </figure>
  );

  if (!openable) {
    return figure;
  }

  return (
    <OpenableFigure
      image={{
        src,
        title,
        artist,
        width: dimensions?.width ?? null,
        height: dimensions?.height ?? null,
      }}
      onOpen={onOpen}
    >
      {figure}
    </OpenableFigure>
  );
};
