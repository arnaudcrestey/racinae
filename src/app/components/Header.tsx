// TEST SYNC PUSH 27/06 à 15h45

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";

// Palette Racinae
const COLORS = {
  blueNuit: "#1E2749",
  ecru: "#FEF7ED",
  gold: "#F4D18F",
};

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "ACCUEIL" },
  { href: "/onboarding", label: "Mon arbre" },
  { href: "/profil", label: "Qui suis-je" },
  { href: "/journal", label: "Carnet de vie" },
  { href: "/albums", label: "ALBUMS" },
  { href: "/transmission", label: "Partage" },
  { href: "/salon", label: "Courrier du temps" },
];

// 🟢 Fix ultime : on force TypeScript à ne rien vérifier sur ces variables d'env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as any,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as any
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fonction de déconnexion
  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/"); // Redirige vers l'accueil public
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="relative z-20">
      {/* Effet lumière sous le bandeau */}
      <div className="absolute inset-x-0 top-0 h-[68px] pointer-events-none z-0">
        <div
          className="w-full h-full mx-auto blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, ${COLORS.gold}33 0%, transparent 70%)`,
            opacity: 0.27,
            height: "100%",
          }}
        />
      </div>
      {/* Bandeau principal */}
      <nav
        className="relative flex justify-center items-center h-[60px] bg-gradient-to-r from-[#1E2749] via-[#2563EB] to-[#65B4F6] shadow-md"
        aria-label="Navigation principale"
        role="navigation"
      >
        <ul className="flex gap-6 md:gap-8 font-playfair text-[16px] md:text-lg tracking-wider text-[#FEF7ED]">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  "px-1 py-1 uppercase hover:text-[#F2994A] transition-colors duration-200",
                  pathname === item.href
                    ? "text-[#F2994A] font-semibold underline underline-offset-8"
                    : ""
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* BOUTON DECONNEXION (cadenas) */}
        <button
          onClick={handleLogout}
          disabled={loading}
          aria-label="Se déconnecter"
          title="Se déconnecter"
          className="ml-4 p-2 rounded-full bg-[#2563EB] hover:bg-[#F2994A] transition-colors shadow-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            // Icône de chargement
            <svg className="animate-spin" width="26" height="26" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.3"/>
              <path fill="white" d="M4 12a8 8 0 0 1 8-8V2.5A9.5 9.5 0 0 0 2.5 12H4z"/>
            </svg>
          ) : (
            // Icône cadenas (SVG accessible)
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              <circle cx="12" cy="16" r="1" />
            </svg>
          )}
        </button>
      </nav>
    </header>
  );
}
