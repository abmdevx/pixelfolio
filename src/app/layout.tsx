import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abdullah — Pixel Portfolio",
  description:
    "An explorable pixel-art world. Walk around, find the five landmarks, and discover the portfolio behind each one.",
  icons: {
    icon: "/assets/tiny-dungeon/tile_0108.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#120f16",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
