import { PrimitiveShowcase } from "@/components/PrimitiveShowcase";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Primitives | 2ed1993",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <main id="main" className="flex flex-col gap-8 w-full max-w-5xl">
      <header>
        <h1 className="font-title uppercase tracking-wide text-4xl text-center">
          Primitives
        </h1>
      </header>
      <div className="grid lg:grid-cols-2 gap-4">
        <div data-theme="light" className="border-4 border-black">
          <PrimitiveShowcase scheme="Light" />
        </div>
        <div data-theme="dark" className="border-4 border-black">
          <PrimitiveShowcase scheme="Dark" />
        </div>
      </div>
    </main>
  );
}
