import "./globals.css";
// import { InstallPrompt } from "@/components/InstallPrompt";
import { TopNav } from "@/components/TopNav";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Merriweather, IBM_Plex_Sans, Crimson_Text } from "next/font/google";

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
  metadataBase: new URL("https://2ed1993.com"),
  alternates: {
    canonical: "./",
  },
  title: "2ed1993",
  description: "The Warhammer 40,000 2nd Edition digital record project.",
  icons: [
    { rel: "apple-touch-icon", url: "/apple-touch-icon.png" },
    { rel: "shortcut icon", url: "/favicon.ico" },
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2d2d2d",
};

export default async function RootLayout({
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
        className={`${merriweather.variable} ${ibmPlexSans.variable} ${crimsonText.variable} font-block text-base antialiased flex flex-col justify-center items-center w-full min-w-10`}
      >
        <TopNav />
        <div className="flex flex-col justify-center items-center w-full p-2 md:p-4">
          {children}
        </div>
        <footer className="p-4 mb-4 font-title text-xs text-center">
          ©{new Date().getFullYear()} 2ed1993 (the Warhammer 40,000 2nd Edition
          digital record project). All rights reserved.
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
