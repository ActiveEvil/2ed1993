import NextImage from "next/image";

export const ImageWithCredit: React.FC<{
  src: string;
  width: number;
  height: number;
  title: string;
  artist: string;
}> = ({ src, width, height, title, artist }): React.JSX.Element => (
  <div className="relative w-full border-4 border-black shadow-lg">
    <NextImage
      src={src}
      alt={`${title} by ${artist}`}
      width={width}
      height={height}
      className="w-full h-auto"
    />
    <div className="absolute bottom-2 right-2 p-1 border-2 border-black bg-2ed-light-blue text-black text-xs md:text-sm">
      <cite>{title}</cite>, by {artist}
    </div>
  </div>
);
