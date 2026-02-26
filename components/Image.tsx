import clsx from "clsx";
import NextImage from "next/image";

export const ImageWithCredit: React.FC<{
  src: string;
  title: string;
  artist: string;
  aspect?: "aspect-video" | "aspect-portrait" | "aspect-retro";
}> = ({ src, title, artist, aspect = "aspect-video" }): React.JSX.Element => (
  <div className={`${aspect} relative w-full border-4 border-black shadow-lg`}>
    <NextImage
      src={src}
      alt={`${title} by ${artist}`}
      quality={80}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mPMPff9PwAHFQMzdqydyAAAAABJRU5ErkJggg=="
      className="w-full h-auto object-cover object-center"
      fill
    />
    <div className="absolute bottom-2 right-2 ml-2 p-1 border-2 border-black bg-2ed-light-blue font-bold text-black text-xs text-center">
      &mdash;{artist}, <cite>{title}</cite>
    </div>
  </div>
);
