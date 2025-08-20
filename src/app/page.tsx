'use client';

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState, useEffect } from "react";
import TimeLineRituel from "../../components/TimeLineRituel";
import { Sparkles, Users, Info, BookOpenCheck, Star } from "lucide-react";
import ParticlesButton from "../../components/ParticlesButton";

// === Données photos ===
const PHOTOS = [
  { src: "/pelmel1.jpg", alt: "Souvenir 1", size: 106 },
  { src: "/pelmel2.jpg", alt: "Souvenir 2", size: 84 },
  { src: "/pelmel3.jpg", alt: "Souvenir 3", size: 96 },
  { src: "/pelmel4.jpg", alt: "Souvenir 4", size: 84 },
  { src: "/pelmel5.jpg", alt: "Souvenir 5", size: 88 },
  { src: "/pelmel6.jpg", alt: "Souvenir 6", size: 86 },
  { src: "/pelmel7.jpg", alt: "Souvenir 7", size: 94 },
  { src: "/pelmel8.jpg", alt: "Souvenir 8", size: 90 },
  { src: "/pelmel9.jpg", alt: "Souvenir 9", size: 84 },
  { src: "/pelmel10.jpg", alt: "Souvenir 10", size: 88 },
  { src: "/pelmel11.jpg", alt: "Souvenir 11", size: 88 },
  { src: "/pelmel12.jpg", alt: "Souvenir 12", size: 88 },
  { src: "/pelmel13.jpg", alt: "Souvenir 13", size: 88 },
  { src: "/pelmel14.jpg", alt: "Souvenir 14", size: 88 },
  { src: "/pelmel15.jpg", alt: "Souvenir 15", size: 88 },
  { src: "/pelmel16.jpg", alt: "Souvenir 16", size: 88 },
];

// Utilitaire couronne
function polarToCartesian(radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: radius * Math.cos(angleRad),
    y: radius * Math.sin(angleRad),
  };
}

// FAQ & Comment ça marche
const faqs = [
  { question: "Mes souvenirs sont-ils sécurisés ?", answer: "Oui, tout est sécurisé et chiffré pour vous seul(e) ou vos héritiers." },
  { question: "Comment transmettre à ma famille ?", answer: "Vous choisissez qui reçoit quoi, et à quel moment (capsule héritage, albums partagés…)." },
  { question: "Combien de souvenirs puis-je déposer ?", answer: "Autant que vous voulez : photos, écrits, audios, vidéos, sans limite !" },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="bg-racinae-ecru/90 rounded-2xl sm:rounded-3xl shadow-inner px-3 sm:px-4 py-5 sm:py-6 max-w-full sm:max-w-xl w-full card-elevate-pop card-halo transition-all duration-200">
      <h3 className="flex items-center gap-2 font-title text-base sm:text-lg mb-3 text-racinae-blue">
        <Info className="text-[#A78BFA] flex-shrink-0" size={18} /> 
        <span className="leading-tight">Questions fréquentes</span>
      </h3>
      <div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-racinae-grey-light last:border-b-0">
            <button
              className="w-full flex items-center justify-between py-3 sm:py-4 px-1 sm:px-2 text-left font-title text-sm sm:text-base md:text-lg text-racinae-blue transition hover:bg-racinae-ecru/70 focus:outline-none"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-content-${i}`}
              type="button"
            >
              <span className="pr-2 leading-tight">{faq.question}</span>
              <span className={`transition-transform duration-300 flex-shrink-0 ${open === i ? "rotate-90" : ""}`}>▶</span>
            </button>
            <div
              id={`faq-content-${i}`}
              className={`overflow-hidden transition-all duration-300 px-2 sm:px-4 pb-2 text-racinae-grey text-xs sm:text-sm md:text-base ${open === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
              style={{ willChange: "max-height, opacity" }}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommentCaMarche() {
  return (
    <div className="bg-racinae-ecru/90 rounded-2xl sm:rounded-3xl shadow-inner py-5 sm:py-6 px-4 sm:px-6 max-w-full sm:max-w-xl w-full flex flex-col justify-center card-elevate-pop card-halo transition-all duration-200">
      <h3 className="flex items-center gap-2 font-title text-base sm:text-lg mb-3 text-racinae-blue">
        <BookOpenCheck className="text-[#2563EB] flex-shrink-0" size={18} /> 
        <span className="leading-tight">Comment ça marche ?</span>
      </h3>
      <ol className="list-decimal list-inside text-left text-sm sm:text-base text-racinae-grey space-y-2 mx-auto max-w-md">
        <li className="leading-relaxed">Créez un compte sécurisé</li>
        <li className="leading-relaxed">Déposez vos souvenirs (photos, textes, voix, vidéos…)</li>
        <li className="leading-relaxed">Rendez vos souvenirs éternels pour vos proches</li>
      </ol>
    </div>
  );
}

// Bloc Souvenirs partagés
const sampleMemories = [
  { text: '"Maman riait sous le vieux pommier – Été 1987"', author: "C.", avatar: "/avatar1.png" },
  { text: '"Premier vélo sans petites roues, merci Papi !"', author: "A.", avatar: "/avatar2.png" },
  { text: '"La voix de grand-mère sur le vieux dictaphone"', author: "S.", avatar: "/avatar3.png" }
];

// Bloc Storytelling Racinae Premium
function RacinaeStorytellingBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
      viewport={{ once: true }}
      className="
        relative mx-auto mt-8 sm:mt-12 lg:mt-16 mb-6 sm:mb-8 lg:mb-10 
        max-w-xs sm:max-w-lg lg:max-w-2xl w-full 
        px-4 sm:px-6 py-6 sm:py-8 lg:py-9 
        rounded-2xl sm:rounded-3xl lg:rounded-[2.5rem]
        shadow-xl sm:shadow-2xl border border-[#e9d2b6]
        bg-gradient-to-br from-[#fff9f2] via-[#f8e7cf] to-[#fff4e0]/90
        before:absolute before:inset-0 before:rounded-2xl sm:before:rounded-3xl lg:before:rounded-[2.7rem]
        before:bg-[radial-gradient(circle,#a78bfa44_0%,#f2994a22_70%,transparent_100%)]
        before:blur-lg before:-z-10
        ring-1 sm:ring-2 ring-[#A78BFA22] ring-offset-1 sm:ring-offset-2 ring-offset-[#F6E9D8]
      "
    >
      {/* Étiquette haut */}
      <span
  className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 text-xs px-3 py-1 rounded-full bg-gradient-to-r from-[#A78BFA]/80 to-[#F2994A]/80 text-white shadow font-semibold uppercase tracking-wider z-10 whitespace-nowrap flex items-center justify-center"
  style={{ minWidth: 120, textAlign: 'center' }}
>
  LE + DE RACINAE :<br className="sm:hidden" />
  ÉMOTIONS<br className="sm:hidden" />
  GARANTIES
</span>
      <div className="flex flex-col gap-2 items-center text-center">
        <span className="text-xl sm:text-2xl mb-1 sm:mb-2 select-none">💌</span>
        <span className="font-title text-lg sm:text-xl lg:text-2xl text-[#A78BFA] font-bold mb-2 sm:mb-3 drop-shadow-md leading-tight">
          Transmettre, c'est offrir bien plus qu'une image…
        </span>
        <p className="text-base sm:text-lg lg:text-xl text-[#a87436] font-semibold leading-6 sm:leading-7 lg:leading-8 my-1">
          En ouvrant votre coffre à souvenirs, vous sécurisez et partagez
          <span className="text-[#F2994A] font-bold"> bien plus que des images</span> : 
          vous transmettez votre <span className="text-[#A78BFA] font-bold">histoire</span>,
          façonnée de moments forts, de rires et de tendresse.
        </p>
        <p className="text-base sm:text-lg lg:text-xl text-[#19213c] font-bold leading-6 sm:leading-7 mt-2">
          Offrez à vos proches le privilège de ressentir<span className="text-[#F2994A]"> <br />votre chemin de vie,</span><br />
          aujourd'hui et pour toujours.
        </p>
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  // Responsive windowWidth avec breakpoints plus précis
  const [windowWidth, setWindowWidth] = useState(1200);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Breakpoints responsive
  const isXSmall = windowWidth < 375;
  const isSmall = windowWidth < 640;
  const isMedium = windowWidth < 768;
  const isLarge = windowWidth < 1024;
  
  // Paramètres adaptatifs pour la couronne de photos
  const RADIUS = isXSmall ? 70 : isSmall ? 90 : isMedium ? 140 : isLarge ? 200 : 245;
  const CENTER = isXSmall ? 100 : isSmall ? 120 : isMedium ? 180 : isLarge ? 250 : 300;
  const LOGO_SIZE = isXSmall ? 120 : isSmall ? 150 : isMedium ? 220 : isLarge ? 350 : 450;
  const HALO_SIZE = isXSmall ? 140 : isSmall ? 180 : isMedium ? 280 : isLarge ? 420 : 540;
  const ANGLE_STEP = 360 / PHOTOS.length;
  const shouldReduce = useReducedMotion();

  // *** Correction hydratation ***
  const [photoParams, setPhotoParams] = useState<any[]>([]);
  useEffect(() => {
    setPhotoParams(
      PHOTOS.map(() => ({
        ampX: 16 + Math.random() * 24,
        ampY: 8 + Math.random() * 18,
        speed: 4 + Math.random() * 7,
        delay: Math.random() * 3
      }))
    );
  }, []);
  if (!photoParams.length) return null; // Évite l'erreur d'hydratation

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#FEF7ED] via-[#F4D18F]/30 to-[#1E2749]/10 flex flex-col items-center font-body">
      {/* Bandeau responsive */}
      <div className="w-full bg-gradient-to-r from-[#1E2749] to-[#2563EB] py-3 sm:py-4 lg:py-5 shadow-lg flex justify-center items-center">
        <span className="text-white text-sm sm:text-lg md:text-xl lg:text-2xl font-serif tracking-wide drop-shadow-lg text-center px-2 sm:px-4 leading-tight">
          Déposez vos souvenirs, ils vivront pour ceux que vous aimez
        </span>
      </div>

      {/* HERO LOGO + photos animées - Version responsive */}
      <div className="flex flex-col items-center mt-4 sm:mt-6 mb-6 sm:mb-8 lg:mb-10 px-2">
        <div className="relative mx-auto mb-10 sm:mb-16 lg:mb-20"
          style={{
            width: Math.min(CENTER * 2, windowWidth - 40),
            height: Math.min(CENTER * 2, windowWidth - 40),
            minWidth: isXSmall ? 180 : isSmall ? 200 : 360,
            minHeight: isXSmall ? 180 : isSmall ? 200 : 360,
            maxWidth: "95vw",
            maxHeight: "95vw"
          }}>
          {PHOTOS.map((img, i) => {
            const size = isXSmall ? img.size * 0.4 : isSmall ? img.size * 0.55 : isMedium ? img.size * 0.7 : img.size;
            const { x, y } = polarToCartesian(RADIUS, i * ANGLE_STEP);
            const { ampX, ampY, speed, delay } = photoParams[i];
            return (
              <motion.div
                key={i}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${x - size / 2}px)`,
                  top: `calc(50% + ${y - size / 2}px)`,
                  zIndex: 3,
                  width: size,
                  height: size,
                  borderRadius: isSmall ? 12 : 18,
                  border: `${isSmall ? 2 : 3}px solid #fff`,
                  background: "#f5f3ed",
                  boxShadow: isSmall ? "0 2px 12px #0002" : "0 4px 18px #0002",
                  overflow: "hidden",
                }}
                animate={shouldReduce ? {} : {
                  x: [0, ampX, -ampX, ampX / 2, -ampX / 2, 0],
                  y: [0, -ampY, ampY, -ampY / 2, ampY / 2, 0]
                }}
                transition={shouldReduce ? {} : {
                  duration: speed,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                  delay: delay
                }}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  style={{ objectFit: "cover", borderRadius: isSmall ? 12 : 18 }}
                  className="shadow-md"
                  sizes={`(max-width: 640px) ${size}px, (max-width: 768px) ${size}px, ${size}px`}
                />
              </motion.div>
            );
          })}
          {/* Halo responsive */}
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full animate-glow"
            style={{
              width: `${HALO_SIZE}px`,
              height: `${HALO_SIZE}px`,
              background: "radial-gradient(ellipse at center, #A78BFA88 0%, #F2994A33 50%, transparent 95%)",
              opacity: 0.83,
              filter: `blur(${isSmall ? 6 : 8}px)`,
              zIndex: 2,
            }}
          />
          {/* Logo Racinae responsive */}
          <Image
            src="/logo-racinae-transparent.png"
            alt="Logo Racinae"
            width={LOGO_SIZE}
            height={LOGO_SIZE}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: LOGO_SIZE,
              height: "auto",
              zIndex: 5,
            }}
            className="drop-shadow-xl"
            priority
          />
        </div>
        
        {/* Titre responsive */}
        <h1 className="font-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-racinae-blue text-center drop-shadow-lg mt-0 mb-6 sm:mb-8 lg:mb-12 px-2 leading-tight">
          Transmettez votre histoire
        </h1>

        {/* === BOUTON COFFRE AVEC PARTICULES + TEXTE CTA === */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8 lg:mb-10">
          {/* Effet halo animé + bouton responsive */}
          <div className="relative group">
            {/* Halo animé responsive */}
            <span
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none animate-pulse"
              style={{
                width: isSmall ? 140 : 190,
                height: isSmall ? 140 : 190,
                background: "radial-gradient(ellipse at center, #A78BFAbb 0%, #F2994A66 60%, transparent 100%)",
                opacity: 0.7,
                filter: `blur(${isSmall ? 10 : 14}px)`,
                zIndex: 1,
              }}
            />
            {/* Cercle bouton responsive */}
            <ParticlesButton onClick={() => window.location.href = '/auth'}>
              <div className={`relative z-10 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-white ${isSmall ? 'w-[90px] h-[90px]' : 'w-[120px] h-[120px]'} flex items-center justify-center transition-transform group-hover:scale-105 group-hover:shadow-[0_0_48px_#A78BFA88]`}>
                <Image
                  src="/coffre.jpg"
                  alt="Coffre à souvenirs"
                  width={isSmall ? 70 : 95}
                  height={isSmall ? 70 : 95}
                  className="rounded-xl object-cover"
                  priority
                />
              </div>
            </ParticlesButton>
          </div>
          
          {/* Micro-texte émotionnel responsive */}
          <span className="text-xs sm:text-sm md:text-base lg:text-lg text-[#7C3AED] font-semibold mt-1 mb-1 bg-[#f5e9ffbb] rounded-xl px-2 sm:px-3 py-1 shadow-sm text-center leading-tight">
            "Ouvrez et Créez dès maintenant le trésor de votre famille !💎"
          </span>
        </div>

        {/* === Bloc storytelling Racinae premium === */}
        <RacinaeStorytellingBlock />
      </div>

      {/* Comment ça marche / FAQ - Layout responsive */}
      <section className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-center items-stretch max-w-7xl mx-auto w-full mb-6 sm:mb-8 lg:mb-10 px-2 sm:px-4">
        <CommentCaMarche />
        <FAQ />
      </section>

      {/* Souvenirs partagés - Layout responsive */}
      <section className="flex flex-col items-center py-6 sm:py-8 w-full px-2 sm:px-4">
        <h2 className="flex items-center gap-2 font-title text-lg sm:text-xl md:text-2xl text-racinae-blue mb-4 sm:mb-6 text-center">
          <Sparkles className="text-[#F2994A] flex-shrink-0" size={isSmall ? 20 : 22} /> 
          <span className="leading-tight">Souvenirs partagés ce mois-ci</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full max-w-6xl">
          {sampleMemories.map((m, i) => (
            <div
              key={i}
              className="w-full sm:min-w-[240px] sm:max-w-[300px] bg-racinae-ecru rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 flex flex-col items-center border border-racinae-grey-light transition-all hover:scale-105 hover:shadow-2xl duration-300"
            >
              <Image
                src={m.avatar}
                alt={`avatar ${m.author}`}
                width={isSmall ? 48 : 56}
                height={isSmall ? 48 : 56}
                className="rounded-full mb-3 shadow-md border-2 border-racinae-violet"
              />
              <p className="font-body text-sm sm:text-base lg:text-lg mb-1 text-center leading-relaxed">{m.text}</p>
              <span className="text-xs text-racinae-grey">par {m.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Témoignages - Layout responsive */}
      <section className="flex flex-col items-center my-6 sm:my-8 lg:my-10 w-full px-2 sm:px-4">
        <h2 className="flex items-center gap-2 font-title text-lg sm:text-xl md:text-2xl mb-4 text-racinae-blue text-center">
          <Users className="text-[#10B981] flex-shrink-0" size={isSmall ? 20 : 22} /> 
          <span className="leading-tight">Ils nous font confiance</span>
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl w-full">
          <blockquote className="bg-racinae-ecru rounded-xl shadow px-4 sm:px-6 py-4 w-full sm:max-w-xs transition-all duration-300 hover:scale-105 text-center sm:text-left">
            <span className="text-sm sm:text-base leading-relaxed">"Grâce à Racinae, j'ai retrouvé des lettres de mon arrière-grand-père"</span><br />
            <span className="font-body text-xs text-racinae-violet">– Jeanne</span>
          </blockquote>
          <blockquote className="bg-racinae-ecru rounded-xl shadow px-4 sm:px-6 py-4 w-full sm:max-w-xs transition-all duration-300 hover:scale-105 text-center sm:text-left">
            <span className="text-sm sm:text-base leading-relaxed">"C'est notre arbre de famille, version digitale !"</span><br />
            <span className="font-body text-xs text-racinae-violet">– Léa</span>
          </blockquote>
        </div>
      </section>

      {/* Timeline */}
      <section className="w-full flex justify-center px-0 mb-4">
  <div className="max-w-xs w-full mx-auto p-2">
    <TimeLineRituel />
  </div>
</section>

      {/* Footer responsive */}
      <footer className="relative mt-auto w-full z-10">
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
        <div className="relative bg-[#1E2749] bg-gradient-to-t from-[#222C4E] via-[#1E2749] to-[#19213C] text-[#FEF7ED] py-4 sm:py-5 rounded-t-2xl shadow-inner text-center px-2 sm:px-4">
          <p className="font-playfair text-xs sm:text-sm mb-1 flex items-center justify-center gap-1 leading-relaxed">
            <Star className="text-[#F2994A] flex-shrink-0" size={isSmall ? 13 : 15} /> 
            <span>Un arbre grandit grâce à chaque mémoire déposée ici.</span>
          </p>
          <div className="text-xs opacity-70">
            © {new Date().getFullYear()} Racinae. Tous droits réservés.
          </div>
        </div>
      </footer>
    </main>
  );
}