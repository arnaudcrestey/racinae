"use client";
import { usePathname } from "next/navigation";
import ChatbotFloatingButton from "./ChatbotFloatingButton";

// Liste des routes où le chatbot doit être caché
const EXCLUDED_PATHS = [
  "/",
  "/login",
  "/signup",
  "/register",
  "/auth",
];

export default function ChatbotOnlyNotHome() {
  const pathname = usePathname();

  // Cacher le chatbot sur toutes les routes d'authentification et la landing page
  if (
    EXCLUDED_PATHS.includes(pathname) ||
    pathname.startsWith("/auth") // Pour masquer tout sous-chemin de /auth (ex : /auth/reset)
  ) {
    return null;
  }

  return <ChatbotFloatingButton />;
}

