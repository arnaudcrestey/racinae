'use client';
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    size: randomBetween(14, 28),
    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
    duration: randomBetween(1.2, 1.8),
    blur: randomBetween(0, 1),
    delay: randomBetween(0, 0.18),
  }));
}

export default function ParticlesButton({ children, onClick }) {
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
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={triggerParticles}
        onTouchStart={triggerParticles}
        className="relative bg-transparent border-none outline-none group"
        style={{ background: 'none' }}
      >
        {children}
      </button>
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
                  background: p.color,
                  pointerEvents: "none",
                  filter: `blur(${p.blur}px) brightness(1.01)`,
                  boxShadow: `0 0 16px 1px ${p.color}88`,
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
