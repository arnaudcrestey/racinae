'use client';
import Image from "next/image";
import { useState } from "react";
import TimeLineRituel from '../../components/TimeLineRituel';
import ParticlesButton from "../../components/ParticulesButton"; // Attention à l'orthographe ! Pas "ParticulesButton"
import { useRouter } from 'next/navigation';

const sampleMemories = [
  { text: '“Maman riait sous le vieux pommier – Été 1987”', author: "C.", avatar: "/avatar1.png" },
  { text: '“Premier vélo sans petites roues, merci Papi !”', author: "A.", avatar: "/avatar2.png" },
  { text: '“La voix de grand-mère sur le vieux dictaphone”', author: "S.", avatar: "/avatar3.png" }
];

const faqs = [
  {
    question: "Mes souvenirs sont-ils sécurisés ?",
    answer: "Oui, tout est sécurisé et chiffré pour vous seul(e) ou vos héritiers.",
  },
  {
    question: "Comment transmettre à ma famille ?",
    answer: "Vous choisissez qui reçoit quoi, et à quel moment (capsule héritage, albums partagés…).",
  },
  {
    question: "Combien de souvenirs puis-je déposer ?",
    answer: "Autant que vous voulez : photos, écrits, audios, vidéos, sans limite !",
  },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div className="bg-racinae-ecru/90 rounded-3xl shadow-inner px-4 py-6 max-w-xl w-full card-elevate-pop card-halo">
      <h3 className="font-title text-lg mb-3 text-racinae-blue">Questions fréquentes</h3>
      <div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-racinae-grey-light last:border-b-0">
            <button
              className="w-full flex items-center justify-between py-4 px-2 text-left font-title text-base md:text-lg text-racinae-blue transition hover:bg-racinae-ecru/70 focus:outline-none"
              onClick={() => setOpen(open === i ? null : i)}
              aria-expanded={open === i}
              aria-controls={`faq-content-${i}`}
              type="button"
            >
              <span>{faq.question}</span>
              <span className={`transition-transform duration-300 ${open === i ? "rotate-90" : ""}`}>▶</span>
            </button>
            <div
              id={`faq-content-${i}`}
              className={`overflow-hidden transition-all duration-300 px-4 pb-2 text-racinae-grey text-sm md:text-base ${open === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
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

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-racinae-blue to-racinae-ecru flex flex-col items-center font-body">
    {/* Bandeau bleu foncé avec la phrase d'accroche */}
<div className="w-full bg-gradient-to-r from-[#1E2749] to-[#2563EB] py-5 shadow-lg flex justify-center items-center">
  <span className="text-white text-xl md:text-2xl font-serif tracking-wide drop-shadow-lg text-center px-2" style={{fontFamily: "Playfair Display, Cormorant Garamond, serif"}}>
    Déposez vos souvenirs, ils vivront pour ceux que vous aimez
  </span>
</div>  
      {/* === Hero section avec logo + halo lumineux === */}
      <div className="flex flex-col items-center mt-16 mb-4 w-full">
        <div className="relative flex justify-center items-center w-full">
          {/* Halo lumineux autour du logo */}
          <span className="absolute w-[650px] h-[650px] rounded-full bg-gradient-to-br from-yellow-200/30 via-orange-200/30 to-violet-200/30 blur-3xl opacity-70 animate-pulse -z-20" />
          <span className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-br from-yellow-300/70 via-orange-300/70 to-violet-300/80 blur-2xl opacity-90 animate-pulse -z-10" />
          <Image
            src="/logo-racinae-transparent.png"
            alt="Logo Racinae"
            width={550}
            height={550}
            className="drop-shadow-lg animate-fade-in"
            priority
          />
        </div>
        {/* Bloc titre et sous-titre parfaitement centrés */}
        <div className="flex flex-col items-center justify-center mt-3 mb-8 max-w-2xl mx-auto">
          <h1 className="font-title text-4xl md:text-5xl mb-4 text-racinae-blue text-center drop-shadow-lg">
            Transmettez votre histoire
          </h1>
          <p className="font-body text-lg md:text-xl text-racinae-grey text-center max-w-xl mb-2">
            Créez, sauvegardez et partagez vos souvenirs précieux,<br className="hidden md:block" />
            simplement et en toute sécurité.
          </p>
        </div>
        {/* Call-to-action principal animé */}
        <ParticlesButton href="/auth">
          Ouvrir mon "coffre à souvenirs"
        </ParticlesButton>
      </div>

      {/* === Souvenirs partagés ce mois-ci === */}
      <section className="flex flex-col items-center py-8 w-full">
        <h2 className="font-title text-xl md:text-2xl text-racinae-blue mb-6">Souvenirs partagés ce mois-ci</h2>
        <div className="flex gap-6 flex-wrap justify-center w-full px-2">
          {sampleMemories.map((m, i) => (
            <div
              key={i}
              className="min-w-[240px] bg-racinae-ecru rounded-2xl shadow-md p-6 flex flex-col items-center border border-racinae-grey-light card-elevate-pop card-halo"
              style={{
                boxShadow: "0 2px 10px #E5E7EB90",
              }}
            >
              <Image
                src={m.avatar}
                alt={`avatar ${m.author}`}
                width={56}
                height={56}
                className="rounded-full mb-3 shadow-md border-2 border-racinae-violet"
              />
              <p className="font-body text-lg mb-1 text-center">{m.text}</p>
              <span className="text-xs text-racinae-grey">par {m.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* === Témoignages / preuves sociales === */}
      <section className="flex flex-col items-center my-10 w-full">
        <h2 className="font-title text-2xl mb-4 text-racinae-blue">Ils nous font confiance</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <blockquote className="bg-racinae-ecru rounded-xl shadow px-6 py-4 max-w-xs card-elevate-pop card-halo">
            “Grâce à Racinae, j’ai retrouvé des lettres de mon arrière-grand-père”<br />
            <span className="font-body text-xs text-racinae-violet">– Jeanne</span>
          </blockquote>
          <blockquote className="bg-racinae-ecru rounded-xl shadow px-6 py-4 max-w-xs card-elevate-pop card-halo">
            “C’est notre arbre de famille, version digitale !”<br />
            <span className="font-body text-xs text-racinae-violet">– Léa</span>
          </blockquote>
        </div>
      </section>

      {/* === Explication + FAQ côte à côte (responsive) === */}
      <section className="flex flex-col md:flex-row gap-6 justify-center items-stretch max-w-4xl mx-auto w-full mb-12 px-2">
        {/* Bloc "Comment ça marche ?" */}
        <div className="bg-racinae-ecru/90 rounded-3xl shadow-inner py-6 px-6 max-w-xl w-full flex flex-col justify-center mb-4 md:mb-0 card-elevate-pop card-halo">
          <h3 className="font-title text-lg mb-3 text-racinae-blue">Comment ça marche ?</h3>
          <ol className="list-decimal list-inside text-left text-base text-racinae-grey space-y-2 mx-auto max-w-md">
            <li>Créez un compte sécurisé</li>
            <li>Déposez vos souvenirs (photos, textes, voix, vidéos…)</li>
            <li>Rendez vos souvenirs éternels pour vos proches</li>
          </ol>
        </div>
        {/* Bloc FAQ */}
        <FAQ />
      </section>

      {/* === Timeline poétique rituelle === */}
      <TimeLineRituel />

      {/* Footer Racinae */}
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
        <div className="relative bg-[#1E2749] bg-gradient-to-t from-[#222C4E] via-[#1E2749] to-[#19213C] text-[#FEF7ED] py-5 rounded-t-2xl shadow-inner text-center">
          <p className="font-playfair text-sm mb-1">
            Un arbre grandit grâce à chaque mémoire déposée ici.
          </p>
          <div className="text-xs opacity-70">
            © {new Date().getFullYear()} Racinae. Tous droits réservés. {" "}
            <a href="/contact" className="underline hover:text-[#F2994A] transition"></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
