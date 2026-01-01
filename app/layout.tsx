import type { Metadata } from "next";
import { Outfit, Orbitron } from "next/font/google"; // Reverting to Outfit; Adding Orbitron
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "CampusLink - Thapar University",
  description: "Exclusive student platform for Thapar University",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${orbitron.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
