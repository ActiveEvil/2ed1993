import { SectionHeading } from "@/components/Heading";
import { SectionBar } from "@/components/SectionBar";
import { generateAnchorId } from "@/lib/anchors";
import { clsx } from "clsx";

export const LABEL = "font-subtitle text-xs uppercase tracking-widest";

export const Group: React.FC<{ title: string } & React.PropsWithChildren> = ({
  title,
  children,
}): React.JSX.Element => (
  <section
    id={generateAnchorId(title)}
    className="flex flex-col gap-8 md:gap-12"
  >
    <SectionHeading>{title}</SectionHeading>
    {children}
  </section>
);

export const Entry: React.FC<
  {
    id?: string;
    title: string;
    source: string;
    note?: React.ReactNode;
  } & React.PropsWithChildren
> = ({ id, title, source, note, children }): React.JSX.Element => (
  <section id={id ?? generateAnchorId(title)} className="flex flex-col gap-3">
    <SectionBar
      title={title}
      note={<span className="whitespace-normal wrap-anywhere">{source}</span>}
    />
    {children}
    {note && <p className="max-w-prose text-lg">{note}</p>}
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
            "flex flex-col gap-3 p-3 bg-background text-foreground border-4 border-frame",
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

export const Fixture: React.FC<{
  html: string;
  measure?: boolean;
  compact?: boolean;
  className?: string;
}> = ({ html, measure, compact, className }): React.JSX.Element => (
  <div
    className={clsx(
      "dynamic-content flex flex-col gap-4",
      measure && "measure",
      compact && "compact",
      className,
    )}
    dangerouslySetInnerHTML={{ __html: html }}
  />
);

export const Source: React.FC<React.PropsWithChildren> = ({
  children,
}): React.JSX.Element => <p className={LABEL}>{children}</p>;
