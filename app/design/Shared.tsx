import { Panel } from "@/components/Panel";
import { SectionBar } from "@/components/SectionBar";
import { clsx } from "clsx";

export const LABEL =
  "font-subtitle text-[11px] uppercase tracking-[0.14em] opacity-60";

export const Group: React.FC<
  { id: string; title: string } & React.PropsWithChildren
> = ({ id, title, children }): React.JSX.Element => (
  <Panel
    as="section"
    id={id}
    className="flex flex-col gap-8 md:gap-12 w-full max-w-5xl p-4 md:p-8"
  >
    <div className="relative flex flex-col items-center justify-center gap-4 w-full">
      <hr className="md:absolute -z-10 w-full h-1 bg-black border border-black" />
      <h2 className="md:px-2 bg-background font-title text-3xl text-center uppercase">
        {title}
      </h2>
    </div>
    {children}
  </Panel>
);

export const Entry: React.FC<
  {
    id?: string;
    title: string;
    source: string;
    note?: React.ReactNode;
  } & React.PropsWithChildren
> = ({ id, title, source, note, children }): React.JSX.Element => (
  <section id={id} className="flex flex-col gap-3">
    <SectionBar
      title={title}
      note={<span className="whitespace-normal wrap-anywhere">{source}</span>}
    />
    {children}
    {note && <p className="text-lg">{note}</p>}
  </section>
);

export const DualScheme: React.FC<
  { className?: string } & React.PropsWithChildren
> = ({ className, children }): React.JSX.Element => (
  <div className="flex flex-col gap-2">
    <div className="grid sm:grid-cols-2 gap-2">
      {(["light", "dark"] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          className={clsx(
            "flex flex-col gap-3 p-3 bg-background text-foreground border-4 border-black",
            className,
          )}
        >
          <span className={LABEL}>{theme}</span>
          {children}
        </div>
      ))}
    </div>
    <p className={LABEL}>Both schemes. Ignores the switcher.</p>
  </div>
);

export const Fixture: React.FC<{ html: string; className?: string }> = ({
  html,
  className,
}): React.JSX.Element => (
  <div
    className={clsx("dynamic-content flex flex-col gap-4", className)}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
