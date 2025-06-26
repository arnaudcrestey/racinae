'use client';
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

// Exemples de souvenirs authentiques AVEC AVATAR
const sampleMemories = [
  { text: '“Maman riait sous le vieux pommier – Été 1987”', author: "C.", avatar: "/avatar1.png" },
  { text: '“Premier vélo sans petites roues, merci Papi !”', author: "A.", avatar: "/avatar2.png" },
  { text: '“La voix de grand-mère sur le vieux dictaphone”', author: "S.", avatar: "/avatar3.png" }
];

// Témoignages clients
const testimonials = [
  { text: '“Grâce à Racinae, j’ai retrouvé des lettres de mon arrière-grand-père”', author: 'Jeanne, 54 ans' },
  { text: '“Mon fils aura toujours mes histoires…”', author: 'Marc, 39 ans' },
  { text: '“C’est notre arbre de famille, version digitale !”', author: 'Léa, 29 ans' },
];

export default function HomePage() {
  const userName = "Arnaud";
  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };
  const greeting = `${getGreeting()} ${userName}, prêt à semer un nouveau souvenir ?`;

  const totalMemories = 12;
  const maxMemories = 18;
  const growthPercent = Math.min(100, Math.round(100 * totalMemories / maxMemories));

  const [popIndex, setPopIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPopIndex((i) => (i + 1) % sampleMemories.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  useEffect(() => {
    setShowWelcomeBack(true);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-racinae-blue to-racinae-ecru flex flex-col font-body">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center py-10 px-4">
        <h1 className="font-title text-3xl md:text-5xl mb-2 text-racinae-ecru drop-shadow-lg flex flex-col items-center gap-2">
          {greeting} <span className="text-2xl md:text-3xl">✨</span>
        </h1>
        <p className="font-body text-lg md:text-2xl text-racinae-grey-light mb-2 max-w-xl">
          <span className="italic">Transmettez la lumière de votre histoire familiale.</span>
        </p>
        <p className="text-sm text-racinae-grey mb-3">
          Ici, chaque souvenir est protégé et prêt à voyager vers vos proches…
        </p>
        <div className="relative flex justify-center items-center mb-4">
          <span className="absolute w-[650px] h-[650px] rounded-full bg-gradient-to-br from-yellow-200/30 via-orange-200/30 to-violet-200/30 blur-3xl opacity-70 animate-pulse -z-20" />
          <span className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-br from-yellow-300/70 via-orange-300/70 to-violet-300/80 blur-2xl opacity-90 animate-pulse -z-10" />
          <Image
            src="/logo-racinae-transparent.png"
            alt="Logo Racinae"
            width={550}
            height={550}
            className="mx-auto drop-shadow-lg animate-fade-in"
            priority
          />
        </div>
        {/* Baromètre arbre */}
        <div className="w-full max-w-xs bg-racinae-ecru rounded-full h-3 my-2 overflow-hidden shadow-inner">
          <div
            className="bg-racinae-green h-3 rounded-full transition-all duration-700"
            style={{ width: `${growthPercent}%` }}
          />
        </div>
        <p className="text-xs text-racinae-green mb-10">
          Ton arbre grandit : {totalMemories} souvenirs plantés ce mois-ci 🌱
        </p>
        <div className="flex flex-col items-center gap-2">
          <a
            href="/onboarding"
            className="relative mt-2 bg-racinae-orange text-racinae-ecru px-8 py-4 rounded-xl shadow-lg font-title text-xl transition hover:bg-racinae-violet hover:scale-105 hover:shadow-2xl before:absolute before:inset-0 before:rounded-xl before:bg-yellow-300/30 before:blur-md before:opacity-0 hover:before:opacity-70"
            style={{ boxShadow: '0 0 24px 4px #F2994A55' }}
          >
            Déposer mon tout premier souvenir
          </a>
          <span className="text-base italic text-racinae-grey">
            <span className="font-title">
              Quel souvenir souhaitez-vous préserver aujourd’hui ?
            </span>
          </span>
        </div>
        {showWelcomeBack && (
          <p className="italic text-racinae-orange text-center mt-2 animate-fade-in">
            Chaque souvenir éclaire la forêt de ta famille 🌲
          </p>
        )}
        </section>

           
      {/* Footer sensoriel bleu nuit */}
      <footer className="relative mt-auto z-10">
        {/* Halo lumineux doré */}
        <div className="absolute inset-x-0 bottom-0 h-[56px] pointer-events-none z-0">
          <div
            className="w-full h-full mx-auto blur-2xl"
            style={{
              background: "radial-gradient(ellipse at center, #F4D18F33 0%, transparent 75%)",
              opacity: 0.24,
              height: "100%",
            }}
          />
        </div>
        {/* Footer principal */}
        <div className="relative bg-[#1E2749] bg-gradient-to-t from-[#222C4E] via-[#1E2749] to-[#19213C] text-[#FEF7ED] py-5 rounded-t-2xl shadow-inner text-center">
          <p className="font-playfair text-sm mb-1">Un arbre grandit grâce à chaque mémoire déposée ici.</p>
          <div className="text-xs opacity-70">
            © {new Date().getFullYear()} Racinae. Tous droits réservés. {" "}
            <a href="/contact" className="underline hover:text-[#F2994A] transition"></a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Ajoute bien les animations dans ton CSS global :
/*
@keyframes fade-in {
  from { opacity: 0; transform: scale(0.95);}
  to { opacity: 1; transform: scale(1);}
}
.animate-fade-in { animation: fade-in 1.2s cubic-bezier(.18,.81,.34,1) both; }

@keyframes pop-in {
  0% { transform: scale(0.85); opacity:0; }
  100% { transform: scale(1); opacity:1;}
}
.animate-pop-in { animation: pop-in 0.7s cubic-bezier(.19,.8,.34,1.2) both;}
*/

