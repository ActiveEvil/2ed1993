import { clsx } from "clsx";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<LogoSize, string> = {
  sm: "text-xl",
  md: "text-[clamp(1.25rem,6cqw,2.25rem)]",
  lg: "text-6xl",
  xl: "text-2xl md:text-6xl",
};

export const Logo: React.FC<{
  title: string;
  subtitle?: string;
  size?: LogoSize;
  dropCaps?: boolean;
  grayscale?: boolean;
  as?: "div" | "h1" | "h2";
}> = ({
  title,
  subtitle,
  size = "md",
  dropCaps,
  grayscale,
  as: Root = "div",
}): React.JSX.Element => {
  const letters = [...title.toUpperCase()];
  return (
    <Root
      className={clsx(
        "relative flex flex-col justify-center items-center w-fit max-w-full font-title tracking-[0.0267em]",
        sizes[size],
        { grayscale: Boolean(grayscale) },
      )}
    >
      <span className="relative flex justify-center items-center w-full px-[1.6em] py-[0.2em]">
        <span
          aria-hidden="true"
          className="aquilla-fins absolute inset-0 bg-2ed-light-yellow [clip-path:polygon(0_0,100%_0,calc(100%-1.3333em)_100%,1.3333em_100%)]"
        />
        <span className="relative inline-block p-[0.2667em] bg-black border-[0.0667em] border-2ed-dark-yellow [border-style:inset] leading-[1.4] text-center text-balance text-2ed-dark-yellow [-webkit-text-stroke:0.0333em_#fff20b]">
          {dropCaps && letters.length > 2 ? (
            <>
              <span className="align-text-top leading-none text-[1.6em]">
                {letters[0]}
              </span>
              {letters.slice(1, -1).join("")}
              <span className="align-text-top leading-none text-[1.6em]">
                {letters[letters.length - 1]}
              </span>
            </>
          ) : (
            letters.join("")
          )}
        </span>
      </span>
      {subtitle ? (
        <span className="relative inline-block mt-[-1.4667em] mx-[2.6667em] px-[0.5333em] py-[0.2667em] bg-2ed-light-yellow border-[0.1333em] border-2ed-dark-yellow [border-style:outset] text-[0.5em] leading-none text-2ed-dark-red">
          {subtitle.toUpperCase()}
        </span>
      ) : null}
    </Root>
  );
};
