import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import DarkModeToggle from "./components/DarkModeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Load PP Editorial font with Next.js font optimization
const ppEditorial = localFont({
  src: [
    {
      path: "../../public/fonts/otf/PPEditorialOld-Ultralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/otf/PPEditorialOld-UltralightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "../../public/fonts/otf/PPEditorialOld-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/otf/PPEditorialOld-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../public/fonts/otf/PPEditorialOld-Ultrabold.otf",
      weight: "800",
      style: "normal",
    },
    {
      path: "../../public/fonts/otf/PPEditorialOld-UltraboldItalic.otf",
      weight: "800",
      style: "italic",
    },
  ],
  variable: "--font-pp-editorial",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Arjun A I",
  description: "Portfolio of Arjun A I",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=target" 
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ppEditorial.variable} antialiased`}
      >
        <DarkModeToggle />
        {children}
      </body>
    </html>
  );
}
