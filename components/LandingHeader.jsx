// components/LandingHeader.jsx
'use client';

import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import Image from "next/image";

// Palette lumineuse optimisée
const PARTICLE_COLORS = [
  "#FEF7ED", // blanc chaud
  "#FFF6E5", // blanc plus chaud
  "#FDE68A", // doré doux
  "#F2994A", // orange racine lumineux
  "#2563EB", // bleu racinae
  "#A78BFA", // violet mémoire
  "#FFFFFF", // blanc pur
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function generateParticles(count = 38) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + '-' + Date.now(),
    x: randomBetween(-30, 30),   // Répartition moins large, plus verticale
    y: randomBetween(-25, -180), // Pluie ascendante, plus haut
    size: randomBetween(5, 16),  // Tailles plus homogènes
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    duration: randomBetween(1.3, 1.8),
    blur: randomBetween(1, 3),
    delay: randomBetween(0, 0.18),
  }));
}

export default function LandingHeader() {
  const [showParticles, setShowParticles] = React.useState(false);
  const [particles, setParticles] = React.useState([]);
  const timerRef = useRef(null);

  const triggerParticles = () => {
    setParticles(generateParticles());
    setShowParticles(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowParticles(false), 1700);
  };

  return (
    <section className="w-full flex flex-col items-center justify-center pt-8 pb-10 bg-gradient-to-b from-[#FEF7ED] to-[#FEF7ED] relative">
      <motion.h1
        className="text-[#1E2749] text-2xl md:text-3xl font-serif font-bold mb-2 text-center drop-shadow"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        Bienvenue chez <span className="text-[#F2994A]">Racinae</span>
      </motion.h1>
      <motion.p
        className="text-[#1E2749]/80 text-lg md:text-xl font-light text-center max-w-2xl mb-5"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      >
        {/* ➡️ Ici on placera ta nouvelle baseline ! */}
        {`Déposez la lumière de votre histoire, elle vivra pour ceux que vous aimez.`}
      </motion.p>
      {/* Bouton animé */}
      <div className="relative flex flex-col items-center mb-2">
        <button
          className="relative z-10 px-7 py-4 rounded-2xl text-lg font-semibold shadow-xl transition hover:scale-105 focus:ring-4 ring-[#F2994A]/30 bg-[#2563EB] hover:bg-[#1E2749] text-white"
          onMouseEnter={triggerParticles}
          onClick={triggerParticles}
          onTouchStart={triggerParticles}
          aria-label="Ouvrir mon coffre à souvenirs"
        >
          <Play className="inline-block mr-2 w-6 h-6" />
          Ouvrir mon coffre à souvenirs
        </button>
        {/* Animation particules */}
        <AnimatePresence>
          {showParticles && (
            <motion.div
              className="pointer-events-none absolute left-1/2 top-[52%] w-[180px] h-[200px] -translate-x-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              aria-hidden="true"
            >
              {particles.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{
                    opacity: 0.96,
                    x: 0,
                    y: 0,
                    scale: randomBetween(0.8, 1.16),
                  }}
                  animate={{
                    opacity: [0.96, 0.75, 0.12, 0],
                    x: p.x,
                    y: p.y,
                    scale: [1, 1.08, 0.92],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: [0.42, 0, 0.58, 1],
                  }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: p.size,
                    height: p.size,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 50% 40%, ${p.color} 64%, transparent 100%)`,
                    pointerEvents: "none",
                    filter: `blur(${p.blur}px) brightness(1.15)`,
                    boxShadow: `0 0 16px 1px ${p.color}55`,
                    mixBlendMode: "screen"
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Texte rassurant */}
        <span className="mt-3 text-sm text-[#1E2749]/70 italic">
          Ici, chaque souvenir est en sécurité, pour vous et ceux que vous aimez.
        </span>
      </div>
      {/* Logo avec halo */}
      <div className="flex flex-col items-center justify-center w-full mt-4 mb-8 relative">
        <span className="absolute top-8 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-yellow-200/40 via-orange-200/30 to-violet-200/20 blur-3xl opacity-70 -z-10" />
        <Image
          src="/logo-racinae-transparent.png"
          alt="Logo Racinae"
          width={260}
          height={260}
          className="drop-shadow-lg animate-fade-in"
          priority
        />
      </div>
    </section>
  );
}
