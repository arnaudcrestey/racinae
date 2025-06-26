import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/HeaderLayout"; // <-- Ajout du Header global

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Racinae",
  description: "L'application qui préserve vos racines, vos souvenirs, vos valeurs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} bg-ecru-chaleureux`}>
        <Header /> {/* Ton menu s'affichera ici, sur toutes les pages */}
        {children}
      </body>
    </html>
  );
}
