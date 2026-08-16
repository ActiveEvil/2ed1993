import { clsx } from "clsx";

export const Warhammer: React.FC = (): React.JSX.Element => (
  <div className="relative aquilla-bars flex flex-col justify-center items-center gap-8 ">
    <h1 className="inline-flex flex-col justify-center items-center px-4 border-2ed-light-yellow border-t-[5rem] md:border-t-[10rem] border-x-[2rem] md:border-x-[5rem] border-x-transparent font-title tracking-widest leading-0">
      <span className="inline-block -mt-18 md:-mt-37 p-2 md:p-4 bg-black border-2ed-dark-yellow border-4 [border-style:inset] text-2xl md:text-6xl text-2ed-dark-yellow [-webkit-text-stroke:1px_#fff20b] md:[-webkit-text-stroke:2px_#fff20b]">
        <span className="text-4xl md:text-8xl align-text-top">W</span>
        ARHAMME
        <span className="text-4xl md:text-8xl align-text-top">R</span>
      </span>{" "}
      <span className="inline-block -mt-4 md:-mt-8 px-2 py-1 md:px-4 md:py-2 bg-2ed-light-yellow border-2ed-dark-yellow border-4 [border-style:outset] text-sm md:text-3xl text-2ed-dark-red">
        40K 2ND EDITION
      </span>
    </h1>
  </div>
);

export const Oldhammer: React.FC = (): React.JSX.Element => (
  <div className="relative aquilla-bars flex flex-col justify-center items-center gap-8 ">
    <h1 className="inline-flex flex-col justify-center items-center px-4 border-2ed-light-yellow border-t-[5rem] md:border-t-[10rem] border-x-[2rem] md:border-x-[5rem] border-x-transparent font-title tracking-widest leading-0">
      <span className="inline-block -mt-18 md:-mt-37 p-2 md:p-4 bg-black border-2ed-dark-yellow border-4 [border-style:inset] text-2xl md:text-6xl text-2ed-dark-yellow [-webkit-text-stroke:1px_#fff20b] md:[-webkit-text-stroke:2px_#fff20b]">
        <span className="text-4xl md:text-8xl align-text-top">O</span>
        LDHAMME
        <span className="text-4xl md:text-8xl align-text-top">R</span>
      </span>{" "}
      <span className="inline-block -mt-4 md:-mt-8 px-2 py-1 md:px-4 md:py-2 bg-2ed-light-yellow border-2ed-dark-yellow border-4 [border-style:outset] text-sm md:text-3xl text-2ed-dark-red">
        40K 2ND EDITION
      </span>
    </h1>
  </div>
);

export const Faction: React.FC<{ name: string }> = ({
  name,
}): React.JSX.Element => (
  // The banner used to be a fixed 8rem top border with the plaque dragged up
  // into it by a fixed margin, which fitted exactly one short line: "Sisters of
  // Battle" fell out of the bottom and "Genestealer Cults" overran the card.
  // It is a clip-path trapezoid sized to the box instead, so the banner grows
  // with whatever the name needs. Drop `w-fit max-w-full mx-auto` for a banner
  // that spans the card rather than hugging the plaque.
  <div className="relative aquilla-bars w-fit max-w-full mx-auto flex justify-center items-center px-12 pt-4 pb-6">
    <span
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-2ed-light-yellow [clip-path:polygon(0_0,100%_0,calc(100%-3rem)_100%,3rem_100%)]"
    />
    {/* z-10 because the aquila bars are positioned and would otherwise paint
        over the plaque rather than flanking it. */}
    <span className="relative z-10 p-3 bg-black border-4 border-2ed-dark-yellow [border-style:inset] font-title tracking-widest text-center text-3xl leading-tight text-balance text-2ed-dark-yellow [-webkit-text-stroke:2px_#fff20b]">
      {name.toUpperCase()}
    </span>
  </div>
);

export const _2ed1993: React.FC<{
  grayscale?: boolean;
}> = ({ grayscale }): React.JSX.Element => {
  return (
    <div
      className={clsx({
        "relative aquilla-bars-black flex flex-col justify-center items-center gap-8": true,
        grayscale: Boolean(grayscale),
      })}
    >
      <div className="inline-flex flex-col justify-center items-center px-4 border-2ed-light-yellow border-t-[8rem] border-x-[3rem] border-x-transparent font-title tracking-widest leading-0">
        <span className="inline-block -mt-28 p-4 bg-black border-2ed-dark-yellow border-4 [border-style:inset] text-6xl text-2ed-dark-yellow [-webkit-text-stroke:2px_#fff20b]">
          2ED
        </span>{" "}
        <span className="inline-block -mt-4 px-4 py-2 bg-2ed-light-yellow border-2ed-dark-yellow border-4 [border-style:outset] text-3xl text-2ed-dark-red">
          1993
        </span>
      </div>
    </div>
  );
};

export const Tiny2ed1993: React.FC<{
  grayscale?: boolean;
}> = ({ grayscale }): React.JSX.Element => {
  return (
    <div
      className={clsx({
        "relative aquilla-bars-tiny flex flex-col justify-center items-center gap-8": true,
        grayscale: Boolean(grayscale),
      })}
    >
      <div className="inline-flex flex-col justify-center items-center px-1 border-2ed-light-yellow border-t-[3rem] border-x-[0.6rem] border-x-transparent font-title tracking-widest leading-0">
        <span className="inline-block -mt-11 p-1 bg-black border-2ed-dark-yellow border-2 [border-style:inset] text-xl text-2ed-dark-yellow [-webkit-text-stroke:1px_#fff20b]">
          2ED
        </span>
        <span className="inline-block -mt-2 px-1/2 py-1/2 bg-2ed-light-yellow border-2ed-dark-yellow border-2 [border-style:outset] text-xs text-2ed-dark-red">
          1993
        </span>
      </div>
    </div>
  );
};
