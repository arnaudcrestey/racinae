"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import LogoutDropdown from "@/components/ui/LogoutDropdown";
import AvatarUser from "./AvatarUser";

const navItems = [
  { href: "/onboarding", label: "Mon racinæ" },
  { href: "/profil", label: "Le livre de ma vie" },
  { href: "/albums", label: "Mes Albums" },
  { href: "/transmission", label: "Mes coups de ♥" },
  { href: "/salon", label: "Le Courrier du temps" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Masquer l'avatar et le cadenas uniquement sur la page d'authentification
  const isAuthPage = pathname === "/auth";

  return (
    <header className="relative z-120">
      {/* Effet lumière sous le bandeau */}
      <div className="absolute inset-x-0 top-0 h-[68px] pointer-events-none z-0">
        <div
          className="w-full h-full mx-auto blur-2xl"
          style={{
            background: `radial-gradient(ellipse at center, #F4D18F33 0%, transparent 70%)`,
            opacity: 0.27,
            height: "100%",
          }}
        />
      </div>

      {/* Barre de navigation */}
      <nav className="relative flex items-center h-[56px] sm:h-[60px] bg-gradient-to-r from-[#1E2749] via-[#2563EB] to-[#65B4F6] shadow-md px-3 sm:px-8"
        aria-label="Navigation principale"
        role="navigation"
      >
        {/* Bouton burger sur mobile et tablette */}
        <button
          className="lg:hidden flex items-center justify-center w-10 h-10 focus:outline-none"
          aria-label="Ouvrir le menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <svg
            className="w-7 h-7 text-[#FEF7ED]"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"} />
          </svg>
        </button>
        {/* Menu horizontal desktop centré */}
        <ul className="hidden lg:flex gap-5 xl:gap-8 font-playfair text-[16px] lg:text-lg tracking-wider text-[#FEF7ED] mx-auto">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  "px-1 py-1 hover:text-[#F2994A] transition-colors duration-200",
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
        {/* Avatar + Logout bouton à droite */}
        {!isAuthPage && (
          <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <AvatarUser size={48} />
            <LogoutDropdown />
          </div>
        )}
      </nav>

      {/* Menu mobile/tablette (drawer) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/30 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div className="absolute top-[56px] left-0 w-full bg-gradient-to-b from-[#1E2749] via-[#2563EB] to-[#65B4F6] p-4 shadow-lg flex flex-col gap-2"
            onClick={e => e.stopPropagation()}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "py-3 px-3 rounded font-playfair text-base text-[#FEF7ED] hover:bg-[#2563EB] hover:text-[#F2994A] transition",
                  pathname === item.href ? "text-[#F2994A] font-semibold underline underline-offset-8" : ""
                )}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
