import type { Metadata } from "next";
import { Archivo_Black, PT_Mono } from "next/font/google";
import "./globals.css";

const ptMono = PT_Mono({
  variable: "--font-pt-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lyon Graulty Music",
  description: "Saxophone, clarinet, composition, arranging, and performance in Austin, TX.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${ptMono.variable} ${archivoBlack.variable}`}>
      <body>{children}</body>
    </html>
  );
}
