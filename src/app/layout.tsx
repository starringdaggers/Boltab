import type { Metadata } from "next";
import { Fraunces, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["500", "600", "700"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-worksans",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plexmono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://boltab.vercel.app"),
  title: "Boltab Brilliant Schools — Results Portal | Otta, Ogun State",
  description:
    "Boltab Brilliant Schools' official results portal in Otta, Ogun State — students and parents can view term results instantly, and teachers post scores in minutes.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${workSans.variable} ${plexMono.variable} font-body bg-antique text-bistre antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
