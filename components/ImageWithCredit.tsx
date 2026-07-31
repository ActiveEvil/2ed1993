import NextImage from "next/image";

export type Aspect =
  "aspect-video" | "aspect-portrait" | "aspect-retro" | "aspect-square";

export const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPMPff9PwAHFQMzdqydyAAAAABJRU5ErkJggg==";

export const ImageWithCredit: React.FC<{
  src: string;
  title: string;
  artist: string | null;
  aspect?: Aspect;
}> = ({ src, title, artist, aspect = "aspect-video" }): React.JSX.Element => (
  <figure
    className={`${aspect} relative w-full border-4 border-black shadow-lg`}
  >
    <NextImage
      src={src}
      alt={artist ? `${title} by ${artist}` : title}
      quality={80}
      loading="lazy"
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className="w-full h-auto object-cover object-center"
      fill
    />
    {artist && (
      <figcaption className="absolute bottom-2 right-2 ml-2 p-1 border-2 border-black bg-2ed-light-blue font-bold text-black text-xs text-center">
        &mdash;{artist}, <cite>{title}</cite>
      </figcaption>
    )}
  </figure>
);
