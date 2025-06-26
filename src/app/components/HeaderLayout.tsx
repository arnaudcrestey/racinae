"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderLayout() {
  const pathname = usePathname();
  const isLanding = pathname === "/"; // tu peux adapter si besoin

  // N'affiche le Header que si on N'EST PAS sur la landing page "/"
  return !isLanding ? <Header /> : null;
}
