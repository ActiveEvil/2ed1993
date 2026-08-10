import NextImage from "next/image";

export type Aspect =
  | "aspect-video"
  | "aspect-portrait"
  | "aspect-retro"
  | "aspect-square"
  // Sizes from the image instead of cropping to a ratio. For scans, where a
  // fixed aspect cuts page margins and printed captions.
  | "natural";

export type Width = "full" | "half" | "half-from-md";

export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPMPff9PwAHFQMzdqydyAAAAABJRU5ErkJggg==";

const SIZES: Record<Width, string> = {
  full: "(min-width: 1024px) 960px, 100vw",
  half: "(min-width: 1024px) 480px, 50vw",
  "half-from-md": "(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw",
};

export const ImageWithCredit: React.FC<{
  src: string;
  title: string;
  artist: string | null;
  aspect?: Aspect;
  width?: Width;
}> = ({
  src,
  title,
  artist,
  aspect = "aspect-video",
  width = "full",
}): React.JSX.Element => (
  <figure
    className={`${aspect === "natural" ? "" : aspect} relative w-full border-4 border-black shadow-lg`}
  >
    <NextImage
      src={src}
      alt={artist ? `${title} by ${artist}` : title}
      quality={80}
      loading="lazy"
      sizes={SIZES[width]}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={
        aspect === "natural"
          ? "w-full h-auto"
          : "w-full h-auto object-cover object-center"
      }
      {...(aspect === "natural"
        ? { width: 0, height: 0 }
        : { fill: true as const })}
    />
    {artist && (
      <figcaption className="absolute bottom-2 right-2 ml-2 p-1 border-2 border-black bg-2ed-light-blue font-bold text-black text-xs text-center">
        &mdash;{artist}, <cite>{title}</cite>
      </figcaption>
    )}
  </figure>
);
