"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUserStats } from "../../context/UserStatsContext";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

function useTransmissionsCount(userId: string | null) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!userId) return;
    async function fetchCount() {
      const { count, error } = await supabase
        .from("transmissions")
        .select("*", { count: "exact", head: true })
        .eq("sender_id", userId);
      if (!error && typeof count === "number") setCount(count);
    }
    fetchCount();
  }, [userId]);
  return count;
}
function useAlbumCount(userId: string | null) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!userId) return;
    async function fetchCount() {
      const { count, error } = await supabase
        .from("albums")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if (!error && typeof count === "number") setCount(count);
    }
    fetchCount();
  }, [userId]);
  return count;
}

const citations = [
  "“Chaque souvenir est une graine qui traverse le temps.”",
  "“La mémoire est un jardin que l’on cultive.”",
  "“Tes racines nourrissent ceux qui viendront après toi.”",
  "“Un arbre grandit grâce à chaque mémoire déposée.”",
];
const formatNumber = (n: number) => n.toLocaleString("fr-FR");
function getGreeting() {
  const now = new Date();
  const h = now.getHours();
  if (h >= 6 && h < 12) return "Bonjour";
  if (h >= 12 && h < 18) return "Bon après-midi";
  if (h >= 18 && h < 22) return "Bonsoir";
  return "Bonne nuit";
}

function AnimatedCounter({ value, color = "#2563EB" }: { value: number | string, color?: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={{ y: -30, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.7 }}
        transition={{ type: "spring", duration: 0.6 }}
        style={{ color, minWidth: 32, display: "inline-block", fontVariantNumeric: "tabular-nums" }}
        className="drop-shadow text-2xl sm:text-3xl font-extrabold"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  );
}

export default function MonArbreDashboard() {
  const { stats } = useUserStats();
  const grainesTarget = stats.graines;
  const courriersTarget = stats.courriers.length;
  const souvenirsTarget = stats.graines;
  const [graines, setGraines] = useState(0);
  const [courriers, setCourriers] = useState(0);
  const [souvenirs, setSouvenirs] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [citation, setCitation] = useState("");
  const [greeting, setGreeting] = useState(getGreeting());
  const [grainesSemees, setGrainesSemees] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile({ ...profile, email: user.email });
    };
    fetchProfile();
  }, []);
  const userId = profile?.id;
  const albumCount = useAlbumCount(userId);
  const transmissionsCount = useTransmissionsCount(userId);

  useEffect(() => { setCitation(citations[Math.floor(Math.random() * citations.length)]); }, []);
  useEffect(() => {
    const timer = setInterval(() => setGreeting(getGreeting()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!profile?.id) return;
    async function fetchGraines() {
      const { data, error } = await supabase
        .from("profiles")
        .select("graines_semees")
        .eq("id", profile.id)
        .single();
      if (!error && data) setGrainesSemees(data.graines_semees ?? 0);
    }
    fetchGraines();
  }, [profile?.id]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let g = 0, c = 0, s = 0;
    timer = setInterval(() => {
      let done = true;
      if (s < souvenirsTarget) { s += 1; setSouvenirs(s); done = false; }
      if (g < grainesTarget) { g += Math.ceil(grainesTarget / 70); if (g > grainesTarget) g = grainesTarget; setGraines(g); done = false; }
      if (c < courriersTarget) { c += 1; setCourriers(c); done = false; }
      if (done) clearInterval(timer);
    }, 24);
    setSouvenirs(0); setGraines(0); setCourriers(0);
    return () => clearInterval(timer);
  }, [grainesTarget, courriersTarget, souvenirsTarget]);

  const etoiles = Math.floor(grainesSemees / 5000);
  const grainesCycle = grainesSemees % 5000;
  const clesOrAnime = Math.floor(grainesCycle / 1000);
  const restePourEtoile = 5000 - grainesCycle;

  return (
    <main className="flex flex-col items-center min-h-screen py-8 px-2 sm:px-0 font-sans relative bg-[#FEF7ED]">
      <div className="relative z-10 max-w-4xl mx-auto px-2 sm:px-4 pt-6 pb-16 flex flex-col gap-10 sm:gap-14">

        {/* Header */}
        <section className="flex flex-col items-center text-center gap-3 mt-2">
          <h1
  className="
    font-title text-2xl sm:text-4xl font-bold mb-2 leading-tight text-[#232942]
    max-w-[90vw] text-center break-words
  "
>
  <span className="whitespace-nowrap">{greeting}</span>{" "}
  <span
    className="
      inline-block align-middle break-words max-w-[60vw] sm:max-w-[70%]
      overflow-hidden text-ellipsis
    "
  >
    {profile?.full_name || profile?.email || "Utilisateur"}
  </span>{" "}
  <span>🌿</span>
</h1>

          <p className="text-lg text-[#232942] font-medium">
            Aujourd’hui, ton racinæ compte{" "}
            <span className="font-semibold text-[#F2994A]">{grainesSemees}</span>{" "}
            souvenirs précieux.
          </p>
        </section>

          {/* Illustration & citation */}
        <section className="flex flex-col items-center gap-2">
          <motion.div
            className="relative w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] rounded-full shadow-xl mx-auto mb-4 bg-white flex items-center justify-center"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          >
            <Image
              src="/arbre-racinae.jpg"
              alt="Arbre Racinae"
              width={180}
              height={180}
              className="object-cover rounded-full shadow-lg"
              priority
            />
            {etoiles > 0 && (
              <motion.span
                className="absolute -left-8 top-1/2 -translate-y-1/2 flex gap-0.5"
                initial={{ scale: 0, rotate: 90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.5 }}
              >
                {Array.from({ length: etoiles }).map((_, idx) => (
                  <span className="text-3xl sm:text-4xl drop-shadow" key={idx}>⭐️</span>
                ))}
              </motion.span>
            )}
          </motion.div>
          <div className="w-full text-center text-base italic text-[#666] mb-2">{citation}</div>
        </section>

        {/* Indicateurs */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-8 max-w-3xl mx-auto">
          {[
            { count: transmissionsCount, label: "Souvenirs partagés", icon: "🌿", color: "#2563EB", glow: "from-blue-200/70 via-blue-50 to-white" },
            { count: albumCount, label: "Albums créés", icon: "📷", color: "#A78BFA", glow: "from-purple-200/80 via-purple-50 to-white" },
            { count: courriers, label: "Courriers du Temps", icon: "💌", color: "#F2994A", glow: "from-yellow-100 via-orange-50 to-white" },
            { count: formatNumber(grainesSemees), label: "Graines semées", icon: "🌱", color: "#10B981", glow: "from-green-200/60 via-green-50 to-white" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className={`
                relative group rounded-2xl bg-gradient-to-br ${item.glow} shadow-xl border-l-4
                flex flex-col items-center justify-center p-5
                transition-all duration-300 ease-out
                hover:scale-[1.045] hover:shadow-2xl hover:z-10
                border-[${item.color}]
                after:absolute after:inset-0 after:rounded-2xl
                after:bg-gradient-to-br after:from-white/0 after:to-[${item.color}] after:opacity-0 group-hover:after:opacity-20 after:transition
              `}
              style={{
                borderLeftColor: item.color,
                minHeight: 90,
              }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
            >
              <div className="text-2xl sm:text-3xl font-extrabold mb-1 flex items-center gap-2"
                style={{
                  color: item.color,
                  filter: "drop-shadow(0 2px 10px rgba(120,120,255,0.11))",
                  transition: "color 0.25s, filter 0.3s",
                }}
              >
                <span
                  className="inline-block group-hover:animate-bounce"
                  style={{ fontSize: "1.7em", transition: "transform .18s" }}
                >{item.icon}</span>
                <AnimatedCounter value={item.count} color={item.color} />
              </div>
              <div className="text-xs sm:text-sm text-[#444]">{item.label}</div>
            </motion.div>
          ))}
        </section>

        {/* Progression & paliers gamification */}
        <section className="flex flex-col items-center gap-3 w-full">
          {/* Barre progression */}
          <div className="flex flex-wrap items-center justify-center gap-2 w-full">
            <span className="text-xl">🌱</span>
            <div className="relative flex-1 min-w-[120px] max-w-[260px] h-3 rounded-lg bg-gray-200 overflow-hidden border">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#3969F2] via-[#A78BFA] to-[#F2994A] transition-all"
                style={{
                  width: `${Math.min(100, (grainesCycle / 5000) * 100)}%`,
                  transition: "width 0.6s cubic-bezier(.4,2,.6,1)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (grainesCycle / 5000) * 100)}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              ></motion.div>
            </div>
            <span className="ml-2 text-base text-[#444]">{grainesCycle}/5 000</span>
            <span className="ml-3 text-xl">🔑</span>
            <span className="text-lg font-bold text-[#F2994A]">{clesOrAnime}</span>
            <span className="ml-2 flex items-center gap-1">{etoiles > 0 && Array.from({ length: etoiles }).map((_, idx) => (<span className="text-lg" key={idx}>⭐️</span>))}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1 text-center">
            {restePourEtoile > 0
              ? `Encore ${restePourEtoile} graines pour gagner une étoile !`
              : `Bravo, tu as gagné une étoile !`}
          </div>
          {/* 3 Blocs paliers */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-3xl mx-auto justify-center items-center">
            {/* Bloc 1 an */}
            <div className={`
              w-full sm:w-auto min-w-[180px] max-w-xs flex flex-col items-center justify-center px-3 py-3 rounded-2xl
              ${clesOrAnime >= 1
                ? "bg-gradient-to-r from-[#F2994A99] to-[#A78BFA55] text-[#1E2749] font-bold shadow-lg"
                : "bg-white text-gray-500 border"}
            `}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xl">🔑</span>
                <span className="font-semibold">1</span>
                <span>=</span>
              </div>
              <div className="text-base sm:text-lg text-center leading-tight font-title">
                Un courrier du temps<br></br> ≤ 1 an
              </div>
              {clesOrAnime >= 1 && (
                <span className="mt-1 px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-xs font-semibold">
                  Gagné
                </span>
              )}
            </div>
            {/* Bloc 5 ans */}
            <div className={`
              w-full sm:w-auto min-w-[180px] max-w-xs flex flex-col items-center justify-center px-3 py-3 rounded-2xl
              ${clesOrAnime >= 3
                ? "bg-gradient-to-r from-[#F2994A99] to-[#A78BFA55] text-[#1E2749] font-bold shadow-lg"
                : "bg-white text-gray-500 border"}
            `}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xl">🔑</span>
                <span className="font-semibold">3</span>
                <span>=</span>
              </div>
              <div className="text-base sm:text-lg text-center leading-tight font-title">
                Un courrier du temps <br></br> ≥ 1 an et ≤ 5 ans
              </div>
              {clesOrAnime >= 3 && (
                <span className="mt-1 px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-xs font-semibold">
                  Gagné
                </span>
              )}
            </div>
            {/* Bloc étoile */}
            <div className={`
              w-full sm:w-auto min-w-[180px] max-w-xs flex flex-col items-center justify-center px-3 py-3 rounded-2xl
              ${etoiles >= 1
                ? "bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-200 border-yellow-200 text-[#8B6914] font-bold shadow-lg"
                : "bg-white text-gray-500 border"}
            `}>
              <div className="flex items-center gap-1 mb-">
                <span className="text-xl">⭐️</span>
                <span>=</span>
              </div>
              <div className="text-base sm:text-lg text-center leading-tight font-title">
                Un courrier du temps<br></br> ≥ 5 ans
              </div>
              {etoiles >= 1 && (
                <span className="mt-1 px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-xs font-semibold">
                  Gagné
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Call to action + boutons */}
        <section className="mt-10 w-full">
          <p className="text-base sm:text-lg text-[#1E2749] font-semibold animate-pulse leading-tight text-center mb-8">
            🎯 Dépose une nouvelle graine aujourd’hui pour te rapprocher <br></br>de ta prochaine clé d’or… ou de ta prochaine étoile !
          </p>
          <div className="
            flex flex-col gap-4 w-full max-w-xs mx-auto
            sm:flex-row sm:gap-8 sm:max-w-3xl sm:justify-center
          ">
            {[
              {
                href: "/transmission",
                label: <>Partager un coup de <span role="img" aria-label="coeur">💌</span></>,
              },
              {
                href: "/profil",
                label: <>✨ Quoi de neuf ?</>,
              },
              {
                href: "/albums",
                label: <>📷 Ajouter une photo</>,
              },
            ].map((btn, i) => (
              <Link
                key={i}
                href={btn.href}
                className={`
                  flex items-center justify-center gap-2 text-base font-bold h-16
                  w-full sm:w-[240px]
                  px-6
                  rounded-full shadow-md
                  transition hover:scale-[1.04] focus:outline-none
                  bg-gradient-to-r from-[#2563EB] via-[#A78BFA] to-[#F2994A]
                  text-white
                  whitespace-nowrap
                  ring-2 ring-[#A78BFA22] hover:ring-[#F2994A88] focus:ring-4
                  drop-shadow
                `}
              >
                {btn.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
