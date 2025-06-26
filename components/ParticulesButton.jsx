// components/ParticlesButton.jsx
'use client';
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Palette UNIQUEMENT bleus Racinae, sans blanc
const PARTICLE_COLORS = [
  "#1E2749", // Bleu foncé Racinae
  "#2563EB"  // Bleu lumineux Racinae
];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function generateParticles(count = 32) {
  return Array.from({ length: count }).map((_, i) => ({
    id: i + '-' + Date.now(),
    x: randomBetween(-30, 30),
    y: randomBetween(-24, -160),
    size: randomBetween(14, 28), // Particules bien visibles
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    duration: randomBetween(1.2, 1.8),
    blur: randomBetween(0, 1), // Peu de flou pour garder la couleur dense
    delay: randomBetween(0, 0.18),
  }));
}

export default function ParticlesButton({ children, href }) {
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
    <div className="relative flex flex-col items-center">
      <a
        href={href}
        className="bg-racinae-ecru/90 font-title text-xl md:text-2xl px-10 py-4 rounded-2xl shadow-lg mt-8 mb-12 card-halo transition hover:bg-racinae-violet hover:text-racinae-ecru hover:scale-105 border border-racinae-orange underline relative z-10"
        style={{ boxShadow: '0 0 32px 8px #F2994A44' }}
        onMouseEnter={triggerParticles}
        onClick={triggerParticles}
        onTouchStart={triggerParticles}
        aria-label={typeof children === 'string' ? children : undefined}
      >
        {children}
      </a>
      <AnimatePresence>
        {showParticles && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-[60%] w-[180px] h-[180px] -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-hidden="true"
          >
            {particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{
                  opacity: 0.93,
                  x: 0,
                  y: 0,
                  scale: randomBetween(0.9, 1.16),
                }}
                animate={{
                  opacity: [0.93, 0.7, 0.12, 0],
                  x: p.x,
                  y: p.y,
                  scale: [1, 1.10, 0.96],
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
                  background: p.color, // Couleur pleine BLEU uniquement
                  pointerEvents: "none",
                  filter: `blur(${p.blur}px) brightness(1.01)`,
                  boxShadow: `0 0 16px 1px ${p.color}88`,
                  // PAS de mixBlendMode, PAS de gradient, PAS d'autres couleurs
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
