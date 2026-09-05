import { DesignSystem } from "./DesignSystem";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: "Design",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <>
      <Breadcrumbs
        crumbs={[{ href: "/", anchor: "2ed1993" }, { anchor: "Design" }]}
      />
      <DesignSystem />
    </>
  );
}
