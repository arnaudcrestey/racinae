// src/app/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/HeaderLayout";
import { Toaster } from "sonner";
import ChatbotOnlyNotHome from "./components/ChatbotOnlyNotHome";
import { UserStatsProvider } from "./context/UserStatsContext";
import { UserProvider } from "./context/UserContext";  // 👈 AJOUT ICI

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-ecru-chaleureux min-h-screen flex flex-col`}
      >
        <UserProvider>
          <UserStatsProvider>
            {/* Header */}
            <Header />

            {/* Contenu des pages */}
            <main className="flex-1">{children}</main>

            {/* Chatbot conditionnel */}
            <ChatbotOnlyNotHome />

            {/* Toasts globaux */}
            <Toaster position="top-center" richColors />
          </UserStatsProvider>
        </UserProvider>
      </body>
    </html>
  );
}
