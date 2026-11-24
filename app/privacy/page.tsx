import { Panel } from "@/components/Panel";
import { TitleBand } from "@/components/TitleBand";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <Panel as="main" className="flex flex-col w-full max-w-5xl">
      <TitleBand title="Privacy" />
    </Panel>
  );
}
