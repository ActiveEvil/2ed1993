import "./globals.css";
import { TopNav } from "@/components/TopNav";
import type { Metadata } from "next";
import { Merriweather, IBM_Plex_Sans, Crimson_Text } from "next/font/google";
import Link from "next/link";

const merriweather = Merriweather({
  variable: "--merriweather",
  subsets: ["latin"],
  weight: ["900"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--ibm-plex-sans",
  subsets: ["latin"],
  weight: ["700"],
});

const crimsonText = Crimson_Text({
  variable: "--crimson-text",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "2ed1993",
  description: "A digital record of the 2nd Edition of Warhammer 40,000",
  icons: [
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "shortcut icon", url: "/favicon.ico" },
  ],
};

export function generateViewport() {
  return {
    viewport:
      "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="2ed1993" />
      </head>
      <body
        className={`${merriweather.variable} ${ibmPlexSans.variable} ${crimsonText.variable} font-block text-base antialiased flex flex-col justify-center items-center w-full`}
      >
        <TopNav />
        <div className="flex flex-col justify-center items-center w-full p-2 md:p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
