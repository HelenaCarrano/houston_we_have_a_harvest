import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "800", "900"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "weharvest · Houston, We Have a Harvest",
  description:
    "Se eu plantar a soja nesta data, em quantos dos últimos 45 anos o milho safrinha teria pegado geada ou seca na fase crítica? Dados diários da NASA POWER desde 1981.",
};

export const viewport: Viewport = {
  themeColor: "#0A1424",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${plexMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-gt-bg text-gt-text font-sans">{children}</body>
    </html>
  );
}
