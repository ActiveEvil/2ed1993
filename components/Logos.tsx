import { clsx } from "clsx";

export const Oldhammer: React.FC = (): React.JSX.Element => (
  <div className="relative aquilla-bars flex flex-col justify-center items-center gap-8 ">
    <h1 className="inline-flex flex-col justify-center items-center px-4 border-2ed-light-yellow border-t-[5rem] md:border-t-[10rem] border-x-[2rem] md:border-x-[5rem] border-x-transparent font-title tracking-widest leading-0">
      <span className="inline-block -mt-18 md:-mt-[148px] p-2 md:p-4 bg-black border-2ed-dark-yellow border-4 [border-style:inset] text-2xl md:text-6xl text-2ed-dark-yellow [-webkit-text-stroke:1px_#fff20b] md:[-webkit-text-stroke:2px_#fff20b]">
        <span className="text-4xl md:text-8xl align-text-top">O</span>
        LDHAMME
        <span className="text-4xl md:text-8xl align-text-top">R</span>
      </span>
      <span className="inline-block -mt-4 md:-mt-8 px-2 py-1 md:px-4 md:py-2 bg-2ed-light-yellow border-2ed-dark-yellow border-4 [border-style:outset] text-sm md:text-3xl text-2ed-dark-red">
        40K 2ND EDITION
      </span>
    </h1>
  </div>
);

export const _2ed1993: React.FC<{
  grayscale?: boolean;
}> = ({ grayscale }): React.JSX.Element => {
  return (
    <div
      className={clsx({
        "relative aquilla-bars-black flex flex-col justify-center items-center gap-8": true,
        grayscale: !!grayscale,
      })}
    >
      <div className="inline-flex flex-col justify-center items-center px-4 border-2ed-light-yellow border-t-[8rem] border-x-[3rem] border-x-transparent font-title tracking-widest leading-0">
        <span className="inline-block -mt-28 p-4 bg-black border-2ed-dark-yellow border-4 [border-style:inset] text-6xl text-2ed-dark-yellow [-webkit-text-stroke:2px_#fff20b]">
          2ED
        </span>
        <span className="inline-block -mt-4 px-4 py-2 bg-2ed-light-yellow border-2ed-dark-yellow border-4 [border-style:outset] text-3xl text-2ed-dark-red">
          1993
        </span>
      </div>
    </div>
  );
};
