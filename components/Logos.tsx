import { clsx } from "clsx";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizes: Record<LogoSize, string> = {
  sm: "text-[clamp(1rem,6cqw,1.125rem)]",
  md: "text-[clamp(1.125rem,6cqw,1.5rem)]",
  lg: "text-[clamp(1.25rem,6cqw,2.25rem)]",
  xl: "text-[clamp(1.25rem,6cqw,3.75rem)]",
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
        "relative flex flex-col justify-center items-center w-fit max-w-full font-title",
        sizes[size],
        { grayscale: Boolean(grayscale) },
      )}
    >
      <span className="relative flex justify-center items-center w-full px-[1.625em] py-[0.25em]">
        <span
          aria-hidden="true"
          className="aquilla-fins absolute inset-0 bg-2ed-light-yellow [clip-path:polygon(0_0,100%_0,calc(100%-1.3333em)_100%,1.3333em_100%)]"
        />
        <span className="relative inline-block p-[0.2667em] bg-black border-[0.075em] border-2ed-dark-yellow [border-style:inset] leading-tight tracking-wider text-center text-balance text-2ed-dark-yellow [-webkit-text-stroke:0.0333em_#fff20b]">
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
        <span
          className={clsx(
            "relative inline-block px-[0.5em] py-[0.26em] bg-2ed-light-yellow border-[0.2em] border-2ed-dark-yellow [border-style:outset] text-[0.5em] leading-none text-2ed-dark-red tracking-wide",
            dropCaps ? "mt-[-1.5em]" : "mt-[-1.125em]",
          )}
        >
          {subtitle.toUpperCase()}
        </span>
      ) : null}
    </Root>
  );
};
