"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Image as ImgIcon, Video, Mic, Pencil, BookText, Mail, X, Quote } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@supabase/auth-helpers-react";
import { useSearchParams, useRouter } from "next/navigation";

export default function TransmissionPage() {
  const user = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  // States principaux
  const [citation, setCitation] = useState("");
  const [blocsLivre, setBlocsLivre] = useState<any[]>([]);
  const [souvenirsAlbums, setSouvenirsAlbums] = useState<any[]>([]);
  const [selectedSouvenir, setSelectedSouvenir] = useState<any>(null);
  const [destinataire, setDestinataire] = useState("");
  const [message, setMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [tab, setTab] = useState<"livre" | "albums">("livre");
  const [historique, setHistorique] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dernieresFavorites, setDernieresFavorites] = useState<any[]>([]);

  // Animation de la liste (effet doux)
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 1) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.07, duration: 0.5, type: "spring" }
    }),
  };

  // 1. Chargement initial des souvenirs & historique
useEffect(() => {
  setCitation("“Chaque souvenir transmis est une graine semée dans le cœur d’un proche.”");
  if (!user?.id) return;

  // Récupère souvenirs du livre
  supabase
    .from("life_book_blocks")
    .select("id, type, content, photo_url, annotation, created_at")
    .in("type", ["texte", "citation", "photo"])
    .eq("user_id", user.id)
    .eq("coup_de_coeur", true)
    .then(({ data }) => setBlocsLivre(data || []));

  // Récupère souvenirs albums (coup de coeur seulement)
  supabase
    .from("album_medias")
    .select("id, type, url, created_at, annotation")
    .eq("user_id", user.id)
    .eq("coup_de_coeur", true)
    .then(({ data }) => setSouvenirsAlbums(data || []));

  fetchHistorique();
}, [user]);
// 2. Chargement des derniers coups de cœur albums (max 6 par ex.)
useEffect(() => {
  if (!user?.id) return;
  supabase
    .from("album_medias")
    .select("id, type, url, annotation, created_at")
    .eq("user_id", user.id)
    .eq("coup_de_coeur", true)
    .order("created_at", { ascending: false })
    .limit(6)
    .then(({ data }) => setDernieresFavorites(data || []));
}, [user]);

// Sélectionne automatiquement le souvenir demandé dans l’URL
useEffect(() => {
  const selectedId = searchParams.get("selected");
  const selectedType = searchParams.get("type");

  // Si pas d’id ou pas de type dans l’URL, on sort (rien à faire)
  if (!selectedId || !selectedType) return;

  // S’il y a des blocs du livre
  if (selectedType === "livre" && blocsLivre.length > 0) {
    const bloc = blocsLivre.find(b => b.id === selectedId);
    if (bloc) {
      setSelectedSouvenir({
        ...bloc,
        // Pour une photo : prends photo_url, ou content si jamais
        photo_url: bloc.type === "photo" ? (bloc.photo_url || bloc.content || "") : undefined,
        title: bloc.type === "texte" || bloc.type === "citation"
          ? (bloc.content || "").substring(0, 32) + "..."
          : "Photo",
        date: new Date(bloc.created_at).toLocaleDateString("fr-FR"),
      });
      setTab("livre");
    }
  }

  // S’il y a des souvenirs albums
  if (selectedType === "albums" && souvenirsAlbums.length > 0) {
    const media = souvenirsAlbums.find(m => m.id === selectedId);
    if (media) {
      setSelectedSouvenir({
        ...media,
        title: media.annotation ? media.annotation : media.type,
        date: new Date(media.created_at).toLocaleDateString("fr-FR"),
      });
      setTab("albums");
    }
  }
}, [searchParams, blocsLivre, souvenirsAlbums]);

  // Cette fonction ajoute l'URL de la photo à chaque souvenir envoyé (si c’est une photo)
const hydrateHistorique = async (list: any[]) => {
  return Promise.all(list.map(async (t: any) => {
    let photoUrl = null;

    if (t.bloc_id) {
      // Cherche la photo dans le livre
      const { data } = await supabase
        .from("life_book_blocks")
        .select("photo_url, content, type")
        .eq("id", t.bloc_id)
        .single();
      if (data && data.type === "photo") {
        photoUrl = data.photo_url || data.content;
      }
    }
    if (t.media_id) {
      // Cherche la photo dans les albums
      const { data } = await supabase
        .from("album_medias")
        .select("url, type")
        .eq("id", t.media_id)
        .single();
      if (data && data.type === "photo") {
        photoUrl = data.url;
      }
    }
    return { ...t, photoUrl };
  }));
};


  // 3. Historique envoi (pour la liste de souvenirs partagés)
  const fetchHistorique = useCallback(async () => {
  if (!user?.id) return;
  const { data, error } = await supabase
    .from("transmissions")
    .select("*")
    .eq("sender_id", user.id)
    .order("sent_at", { ascending: false });

  if (error) {
  console.error("Erreur historique :", error);
  return;
}

// Hydrate chaque item pour avoir photoUrl si besoin
const hydrated = await hydrateHistorique(data || []);
setHistorique(hydrated);
}, [user]);

  // Reset form après envoi
  function resetForm() {
    setSelectedSouvenir(null);
    setDestinataire("");
    setMessage("");
  }

  // Icône selon type
  function getIcon(type: string) {
    if (type === "photo") return <ImgIcon className="w-6 h-6 text-[#2563eb]" />;
    if (type === "video") return <Video className="w-6 h-6 text-[#A78BFA]" />;
    if (type === "audio") return <Mic className="w-6 h-6 text-[#10B981]" />;
    if (type === "citation") return <Quote className="w-6 h-6 text-[#F2994A]" />;
    return <Pencil className="w-6 h-6 text-[#F2994A]" />;
  }

  // Affichage aperçu du souvenir sélectionné
  function renderPreview() {
  if (!selectedSouvenir) return null;
  if (tab === "livre") {
    // 👉 Bloc photo : affiche la photo
    if (selectedSouvenir.type === "photo") {
      // Cherche l'image dans photo_url, puis content (sécurité)
      const src = selectedSouvenir.photo_url || selectedSouvenir.content || "";
      if (src)
        return (
          <img
            src={src}
            alt="photo"
            className="w-20 h-20 rounded-xl object-cover mx-auto shadow"
          />
        );
    }
    // 👉 Bloc texte/citation : affiche le texte
    return (
      <div className="italic text-gray-600 text-center px-2">
        {selectedSouvenir.content || selectedSouvenir.annotation}
      </div>
    );
  }
    if (tab === "albums") {
      if (selectedSouvenir.type === "photo")
        return <img src={selectedSouvenir.url} alt="photo" className="w-20 h-20 rounded-xl object-cover mx-auto shadow" />;
      if (selectedSouvenir.type === "video")
        return <video src={selectedSouvenir.url} controls className="w-24 h-16 rounded-lg mx-auto shadow" />;
      if (selectedSouvenir.type === "audio")
        return <audio src={selectedSouvenir.url} controls className="w-full" />;
    }
    return null;
  }

  // Liste pour la modal (adaptée au tab actif)
  const modalList = tab === "livre"
    ? blocsLivre.map(b => ({
      ...b,
      title:
        b.type === "texte" || b.type === "citation"
          ? (b.content || "").substring(0, 32) + "..."
          : "Photo",
      date: new Date(b.created_at).toLocaleDateString("fr-FR"),
    }))
    : souvenirsAlbums.map(m => ({
      ...m,
      title: m.annotation ? m.annotation : m.type,
      date: new Date(m.created_at).toLocaleDateString("fr-FR"),
    }));

  // Suppression d'un souvenir de l'historique d'envoi
async function supprimeHistorique(id: string) {
  const { error } = await supabase
    .from("transmissions")
    .delete()
    .eq("id", id); // <-- on cible la bonne colonne

  if (error) {
    console.error("Erreur suppression :", error);
    toast.error("Impossible de supprimer.");
    return;
  }

  toast.info("Souvenir supprimé.");
  fetchHistorique();
}


// Envoi du souvenir par mail (Resend API)
async function handleEnvoyer() {
  if (!selectedSouvenir || !destinataire) return;
  setLoading(true);

  // On récupère l’URL de la photo si c’est un souvenir photo
  const photoUrl =
    tab === "albums"
      ? selectedSouvenir.url
      : selectedSouvenir.photo_url || selectedSouvenir.content || "";

  // On enregistre dans Supabase l’historique
  const { data, error } = await supabase
    .from("transmissions")
    .insert({
      bloc_id: tab === "livre" ? selectedSouvenir.id : null,
      media_id: tab === "albums" ? selectedSouvenir.id : null,
      sender_id: user?.id,
      recipient_email: destinataire,
      message,
    })
    .select()
    .single();

  if (error) {
    console.error("Erreur d’envoi Supabase :", error);
    toast.error("Erreur lors de l'envoi !");
    setLoading(false);
    return;
  }

  // Envoi via ton API Next.js → Resend
  await fetch("/api/send-transmission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: destinataire,
      subject: "Vous avez reçu un souvenir sur Racinae !",
      message,           // ✅ on envoie bien le texte perso
      imageUrl: photoUrl || null, // ✅ on envoie la photo si elle existe
    }),
  });

  toast.success("✨ Souvenir envoyé !");
  fetchHistorique();
  resetForm();
  setLoading(false);
}


  // ---------- UI -------------------
  return (
    <main
      className="min-h-screen px-1 sm:px-2 py-6 flex flex-col gap-8 items-center font-sans relative bg-[#FEF7ED] sm:px-6 md:py-10"
      style={{
        background: `
          linear-gradient(120deg, #f6fafd 0%, #dbeafe 70%, #2563eb 100%),
          radial-gradient(circle 45vw at 85vw 80vh, #a7bffa22 0%, transparent 80%),
          radial-gradient(circle 30vw at 20vw 0vh, #fffbe633 30%, transparent 90%)
        `
      }}
    >
      {/* Header */}
      <motion.section className="text-center" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-4xl font-title mb-2 text-[#1E2749]">Partager un souvenir <span>💌</span></h1>
        <p className="text-lg text-[#1E2749]/80 font-medium">
          Capture un coup de cœur et diffuse-le <span className="text-[#F2994A] font-semibold">immédiatement</span>.
        </p>
      </motion.section>

      {/* Citation */}
      <motion.section className="text-center text-base sm:text-lg text-[#A78BFA] italic mb-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {citation}
      </motion.section>

      {/* Bouton principal shimmer */}
      <button
        onClick={() => setOpenModal(true)}
        className={`
          max-w-xs sm:max-w-sm mx-auto
          flex items-center justify-center gap-3
          px-6 py-4 rounded-2xl font-title text-lg sm:text-xl
          border-2 border-[#A78BFA] text-[#1E2749] shadow-lg
          relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/50
          transition group
        `}
        style={{
          boxShadow: "0 4px 32px #A78BFA12, 0 2px 6px #e5e7eb22"
        }}
      >
        <span
          className="absolute inset-0 shimmer-racinae opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />
        <Mail className="w-7 h-7 text-[#A78BFA] relative z-10 group-hover:scale-110 transition-transform duration-300" />
        <span className="ml-2 font-semibold tracking-wide relative z-10 group-hover:tracking-wider transition-all duration-300">
          Offrir un souvenir
        </span>
      </button>

      {/* Formulaire de partage */}
      <section className="w-full max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 space-y-4 animate-fade-in-up">
        {/* Capsule souvenir sélectionné */}
        {selectedSouvenir ? (
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2 text-[#1E2749] font-semibold text-lg mb-1">
              {getIcon(selectedSouvenir.type)}
              <span>{selectedSouvenir.title}</span>
            </div>
            <div>{renderPreview()}</div>
            <button
              className="text-xs text-[#A78BFA] mt-1 underline"
              onClick={() => setOpenModal(true)}
            >
              Changer de souvenir
            </button>
          </div>
        ) : (
          <div className="italic text-gray-500 text-center">Aucun souvenir sélectionné</div>
        )}

        {/* Champs destinataire + message */}
        <input
          type="email"
          placeholder="Adresse e-mail du destinataire"
          value={destinataire}
          onChange={e => setDestinataire(e.target.value)}
          className="w-full p-3 border rounded bg-[#FEF7ED] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition"
          autoFocus
        />
        <textarea
          placeholder="Écris un message personnel pour le destinataire…"
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={3}
          className="w-full p-3 border rounded bg-[#FEF7ED] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition resize-none"
        />

        <button
          type="button"
          disabled={!selectedSouvenir || !destinataire || loading}
          onClick={handleEnvoyer}
          className={`w-full py-3 rounded-xl font-title text-lg transition text-white shadow-lg bg-gradient-to-r from-[#1E2749] via-[#2563eb] to-[#A78BFA] 
            ${(!selectedSouvenir || !destinataire || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 focus:ring-2 focus:ring-[#F2994A]'}`}
          style={{ boxShadow: "0 2px 12px #A78BFA55" }}
        >
          {loading ? "Envoi..." : "🌟 Envoyer"}
        </button>
      </section>
      {/* ---- Derniers coups de cœur envoyés ---- */}
      {/* Historique réel */}
      <motion.section
        className="w-full max-w-2xl space-y-4 mt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        
        <div className="flex flex-col gap-2">
          <AnimatePresence>
            {historique.map((t, i) => (
              <motion.div
                key={t.id}
                className="
                  relative
                  min-h-[54px] sm:min-h-[72px]
                  px-2 sm:px-4
                  bg-white/90 rounded-xl shadow
                  flex flex-col gap-1
                  border-l-4
                  mb-2
                "
                style={{
                  borderColor: "#A78BFA",
                  boxShadow: "0 2px 6px #dbeafe55",
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ delay: 0.05 * i }}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  {t.photoUrl && (
  <img
    src={t.photoUrl}
    alt="Photo souvenir"
    className="w-12 h-12 rounded-lg object-cover shadow border"
    style={{ flexShrink: 0 }}
  />
)}

                  <span className="text-xl sm:text-2xl">
                    <Mail />
                  </span>
                  <div>
                    <p
                      className="font-semibold text-[#1E2749] text-xs sm:text-base truncate max-w-[130px] sm:max-w-none"
                      title={t.message}
                    >
                      {t.message}
                    </p>
                    <p className="text-[11px] sm:text-xs text-indigo-500">
                      {t.recipient_email}
                     </p> 
                    <p className="text-[11px] sm:text-xs text-[#A78BFA]">
                      {new Date(t.sent_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 sm:px-3 py-1 rounded-full font-semibold transition bg-[#10B98122] text-[#10B981]">
                  Envoyé
                </span>
                {/* Bouton suppression */}
                <button
                  className="absolute -top-2 -right-2 p-2 rounded-full bg-white shadow hover:bg-[#ffe7f6] transition w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center"
                  aria-label="Supprimer ce souvenir"
                  onClick={() => supprimeHistorique(t.id)}
                >
                  <X className="w-4 h-4 text-[#A78BFA]" />
                </button>
                {/* Bloc réponse reçue */}
                {t.reponse && (
                  <div className="mt-2 bg-indigo-50 rounded-xl px-4 py-3 text-indigo-900 shadow text-sm border-l-4 border-[#2563eb]">
                    <strong>Réponse reçue :</strong>
                    <br />
                    {t.reponse}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* --- MODALE choix souvenir existant --- */}
      <AnimatePresence>
        {openModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-30 flex justify-center items-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpenModal(false)}
            aria-modal
          >
            <motion.div
              className="relative bg-white w-[95vw] max-w-md mx-auto rounded-2xl shadow-2xl p-4 pt-6 flex flex-col gap-4 z-40"
              initial={{ scale: 0.98, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 30 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Fermer */}
              <button className="absolute top-2 right-2 p-2" onClick={() => setOpenModal(false)} aria-label="Fermer">
                <X className="w-6 h-6 text-[#A78BFA]" />
              </button>
              {/* Tabs */}
              <div className="flex mb-3">
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-l-xl transition text-base font-semibold ${tab === "livre" ? "bg-[#A78BFA]/20 text-[#A78BFA]" : "bg-gray-100 text-gray-500"}`}
                  onClick={() => setTab("livre")}
                >
                  <BookText /> Livre de ma vie
                </button>
                <button
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-r-xl transition text-base font-semibold ${tab === "albums" ? "bg-[#A78BFA]/20 text-[#A78BFA]" : "bg-gray-100 text-gray-500"}`}
                  onClick={() => setTab("albums")}
                >
                  <Mail /> Albums
                </button>
              </div>
              {/* Liste souvenirs */}
              <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                {modalList.map((souv, i) => (
                  <motion.button
                    key={souv.id}
                    className={`flex items-center gap-3 w-full text-left p-3 rounded-xl border-2 transition 
                      ${selectedSouvenir && selectedSouvenir.id === souv.id ? "border-[#A78BFA] bg-[#A78BFA]/10" : "border-transparent bg-gray-50 hover:bg-[#F3F0FF]"}`}
                    onClick={() => {
                      setSelectedSouvenir(souv);
                      setOpenModal(false);
                    }}
                    custom={i}
                    variants={fadeInUp}
                    initial="hidden"
                    animate="visible"
                  >
                    {getIcon(souv.type)}
                    {souv.type === "photo" && tab === "albums" && <img src={souv.url} alt={souv.title} className="w-12 h-12 rounded-lg object-cover shadow" />}
                    {souv.type === "photo" && tab === "livre" && <img src={souv.photo_url} alt={souv.title} className="w-12 h-12 rounded-lg object-cover shadow" />}
                    <div className="flex-1">
                      <p className="font-semibold text-[#1E2749] text-xs sm:text-base truncate max-w-[100px] sm:max-w-none" title={souv.title}>
                        {souv.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-500">{souv.date}</p>
                      {souv.type === "texte" && <p className="text-[11px] sm:text-xs text-gray-600 truncate">{souv.content?.substring(0, 50)}</p>}
                    </div>
                  </motion.button>
                ))}
                {modalList.length === 0 && (
                  <div className="text-center text-gray-400 italic p-8">
                    Aucun souvenir à partager pour l’instant.<br />
                    <span className="text-[#A78BFA]">Astuce : cliquez sur l’étoile <span aria-label="étoile" role="img">⭐</span> dans votre livre ou vos albums pour les rendre partageables.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
