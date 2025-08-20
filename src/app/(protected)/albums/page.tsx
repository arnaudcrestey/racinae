"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

const WOOD_TEXTURE_URL = "/wood-texture.jpg";
const COVER_DESIGNS = [
  { id: "blue", name: "Bleu profond", url: "/covers/blue.svg" },
  { id: "violet", name: "Violet mémoire", url: "/covers/violet.svg" },
  { id: "orange", name: "Orange racine", url: "/covers/orange.svg" },
  { id: "ecru", name: "Écru doux", url: "/covers/ecru.svg" },
  { id: "vert", name: "Vert feuille", url: "/covers/vert.svg" },
  { id: "cuir", name: "Cuir brun", url: "/covers/cuir.svg" },
  { id: "pastel", name: "Pastel", url: "/covers/pastel.svg" },
  { id: "tissu", name: "Tissu ancien", url: "/covers/tissu.svg" },
  { id: "bois", name: "Bois clair", url: "/covers/bois.svg" },
  { id: "papier", name: "Papier ancien", url: "/covers/papier.svg" },
];

const ALBUM_LIMIT = 6; // Limite max d'albums

type Album = {
  id: string;
  title: string;
  cover_url: string;
  description?: string;
  created_at?: string;
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function getCoverFromUrl(url?: string) {
  return COVER_DESIGNS.find(d => d.url === url) || COVER_DESIGNS[0];
}

export default function AlbumsPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCoverId, setNewCoverId] = useState(COVER_DESIGNS[0].id);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Charger l'utilisateur connecté
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Charger les albums du user connecté à chaque changement de userId
  useEffect(() => {
    async function fetchAlbums() {
      if (!userId) return;
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setAlbums(data);
      }
    }
    fetchAlbums();
  }, [userId]);

  const albumShelvesMobile = chunkArray(albums, 2);

  // Fonction création d'album avec limite et feedback pro
  async function handleCreateAlbum() {
    if (!newTitle.trim() || !userId) return;
    if (albums.length >= ALBUM_LIMIT) {
      alert("Nombre maximum d'albums atteint.");
      return;
    }

    const coverUrl = COVER_DESIGNS.find(c => c.id === newCoverId)?.url || "";

    const { data: albumData, error: albumError } = await supabase
      .from("albums")
      .insert([
        {
          user_id: userId,
          title: newTitle,
          cover_url: coverUrl,
          description: "",
        },
      ])
      .select()
      .single();

    if (albumError || !albumData) {
      alert("Erreur lors de la création de l'album : " + (albumError?.message || "Réessaie."));
      return;
    }

    await supabase.from("memories").insert([
      {
        user_id: userId,
        type: "album",
        content: newTitle,
        metadata: { cover_url: albumData.cover_url, album_id: albumData.id },
      }
    ]);

    setModalOpen(false);
    setNewTitle("");
    setNewCoverId(COVER_DESIGNS[0].id);
    router.push(`/albums/${albumData.id}`);
  }

  function handleEditTitle(id: string, title: string) {
    setEditingId(id);
    setEditValue(title);
  }
  function handleSaveEdit(id: string) {
    if (!editValue.trim()) return;
    setAlbums(albums => albums.map(a => a.id === id ? { ...a, title: editValue } : a));
    setEditingId(null);
    setEditValue("");
    // Tu peux ajouter la requête pour mettre à jour en base si besoin !
  }
  function handleCancelEdit() {
    setEditingId(null);
    setEditValue("");
  }

  // RENDER
  return (
    <main
      className="px-2 py-5 flex flex-col items-center min-h-screen font-sans relative"
      style={{
        background: `
          linear-gradient(135deg, #2e358e 20%, #6c86f5 60%, #f8e7fb 100%),
          radial-gradient(ellipse 80% 40% at 70% 10%, #f3cb7b55 10%, transparent 100%),
          radial-gradient(circle 55vw at 10vw 120vh, #c4a9ff33 0%, transparent 100%)
        `
      }}
    >
      {/* HEADER */}
      <header className="w-full pt-5 pb-2 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-2xl sm:text-4xl font-title text-white drop-shadow-lg mb-3 mt-2 text-center"
        >
          Ma bibliothèque d'albums 🌿
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="text-base sm:text-lg text-yellow-200 italic text-center mb-12"
        >
          Choisissez, créez et feuilletez vos albums souvenirs.
        </motion.p>
      </header>

      {/* MOBILE */}
      <div className="w-full flex flex-col items-center mt-7 mb-2 sm:hidden">
        {albumShelvesMobile.map((shelf, idx) => (
          <div key={idx} className="flex flex-col items-center w-full mb-2">
            <div className="flex flex-row justify-center gap-2 w-full">
              {shelf.map((album, albumIdx) => {
                const cover = getCoverFromUrl(album.cover_url);
                return (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 + albumIdx * 0.08 + idx * 0.08, duration: 0.5 }}
                    whileTap={{ scale: 0.97 }}
                    className="group flex flex-col items-center cursor-pointer"
                    style={{ width: 140, minWidth: 110, maxWidth: 170 }}
                  >
                    <div
                      className="w-24 h-32 rounded shadow-2xl border-[3px] border-white flex flex-col items-center relative overflow-hidden"
                      style={{
                        background: `url(${cover.url}) center/cover, #fff`,
                        boxShadow: "0 8px 24px #a9853f55, 0 1px 8px #fff5",
                        transform: "rotateY(-4deg) skewY(-1.5deg)",
                      }}
                      onClick={() => !editingId && (window.location.href = `/albums/${album.id}`)}
                      tabIndex={0}
                      aria-label={`Ouvrir l'album ${album.title}`}
                    >
                      <div className="absolute -right-2 bottom-0 w-3 h-32 rounded-r-md bg-gradient-to-b from-white/80 via-white/40 to-transparent shadow-inner z-0" />
                      <div className="flex flex-col items-center w-full relative pt-2">
                        {editingId === album.id ? (
                          <form
                            onSubmit={e => {
                              e.preventDefault();
                              handleSaveEdit(album.id);
                            }}
                            className="flex flex-col items-center gap-1 w-full"
                            tabIndex={-1}
                          >
                            <input
                              type="text"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="px-2 py-1 rounded bg-white/90 text-blue-900 font-title font-bold text-center w-[90%] text-xs border-2 border-blue-200 outline-none focus:ring-2 focus:ring-blue-400"
                              autoFocus
                              maxLength={40}
                            />
                            <div className="flex gap-2 mt-1">
                              <button
                                type="submit"
                                className="px-2 py-0.5 text-xs bg-blue-800 text-white rounded hover:bg-blue-700"
                              >
                                Valider
                              </button>
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-2 py-0.5 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                Annuler
                              </button>
                            </div>
                          </form>
                        ) : (
                          <span
                            className="
                              font-title text-center text-xs font-bold px-2 py-1
                              rounded select-none
                              bg-white/80 backdrop-blur-[2px]
                              text-blue-900 border border-blue-100
                              shadow-[0_2px_8px_#a1a1aa33,0_0px_12px_#2563eb22]
                            "
                            style={{
                              textShadow: "0 2px 6px #fff9, 0 1px 4px #2563eb22",
                              letterSpacing: "0.01em",
                              lineHeight: "1.13",
                              boxShadow: "0 2px 8px #1e274933",
                              filter: "drop-shadow(0 2px 8px #ffe5b077)"
                            }}
                            title={album.title}
                          >
                            {album.title}
                          </span>
                        )}
                        {editingId !== album.id && (
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleEditTitle(album.id, album.title);
                            }}
                            className="absolute top-1 right-1 bg-white/80 hover:bg-yellow-100 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                            tabIndex={-1}
                            aria-label={`Modifier le titre de l'album ${album.title}`}
                            title="Modifier le titre"
                          >
                            <Pencil className="w-3 h-3 text-blue-900" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {/* Support bois */}
            <div
              className="w-[92vw] max-w-xs h-[26px] mt-[-12px] mb-1 rounded-b-[16px] relative mx-auto transition-all shadow-[0_8px_40px_#8d684066,0_2px_0_#fff5_inset,0_1px_8px_#fff6]"
              style={{
                background: `url(${WOOD_TEXTURE_URL}) center/cover, linear-gradient(90deg,#e1c08d 40%,#b09058 100%)`,
                filter: "brightness(1.05) saturate(1.04)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 6,
                  borderRadius: "0 0 16px 16px",
                  background: "linear-gradient(90deg, #fff9 40%, #fff0 100%)",
                  opacity: 0.6,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          </div>
        ))}
        {/* BOUTON CREER ALBUM */}
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 mb-1 w-[45vw] max-w-xs mx-auto tracking-wide flex items-center justify-center gap-2 bg-yellow-200 text-blue-900 font-bold px-3 py-2 rounded-full shadow-lg hover:bg-yellow-100 transition text-sm sm:hidden"
          disabled={albums.length >= ALBUM_LIMIT}
        >
          + Créer un album
        </button>
        {albums.length >= ALBUM_LIMIT && (
          <div className="mt-2 text-center text-red-600 font-semibold text-sm">
            Nombre maximum d'albums atteint (6). Supprime un album pour en créer un nouveau.
          </div>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:flex flex-col items-center w-full mt-8 mb-2 sm:mb-8">
        {chunkArray(albums, 5).map((shelf, idx) => (
          <div key={idx} className="flex flex-col items-center w-full mb-4">
            <div className="flex flex-row justify-center gap-8 w-full">
              {shelf.map((album, albumIdx) => {
                const cover = getCoverFromUrl(album.cover_url);
                return (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 60, rotateZ: -4 + albumIdx * 2 }}
                    animate={{ opacity: 1, y: 0, rotateZ: 0 }}
                    transition={{ delay: 0.08 + albumIdx * 0.08 + idx * 0.04, duration: 0.7 }}
                    whileHover={{
                      scale: 1.06,
                      y: -12,
                      boxShadow: "0 16px 48px #b09058bb, 0 1px 10px #fff5, 0 0px 24px #ffefb088",
                    }}
                    className="group relative flex flex-col items-center cursor-pointer transition-transform"
                    style={{ perspective: 900, minWidth: 152 }}
                  >
                    <div
                      className="w-24 h-40 rounded shadow-2xl border-[3px] border-white flex flex-col items-center relative overflow-hidden"
                      style={{
                        background: `url(${cover.url}) center/cover, #fff`,
                        boxShadow: "0 8px 36px #a9853f44, 0 1px 10px #fff5",
                        transform: "rotateY(-7deg) skewY(-2deg)",
                      }}
                      onClick={() => !editingId && (window.location.href = `/albums/${album.id}`)}
                      tabIndex={0}
                      aria-label={`Ouvrir l'album ${album.title}`}
                    >
                      <span
                        className="
                          font-title text-center text-xs md:text-sm font-bold px-2 py-1 mt-2
                          rounded select-none
                          bg-white/80 backdrop-blur-[2px]
                          text-blue-900 border border-blue-100
                          shadow-[0_2px_8px_#a1a1aa33,0_0px_12px_#2563eb22]
                        "
                        style={{
                          textShadow: "0 2px 6px #fff9, 0 1px 4px #2563eb22",
                          letterSpacing: "0.01em",
                          lineHeight: "1.13",
                          boxShadow: "0 2px 8px #1e274933",
                          filter: "drop-shadow(0 2px 8px #ffe5b077)"
                        }}
                        title={album.title}
                      >
                        {album.title}
                      </span>
                      <div className="absolute -right-2 bottom-0 w-4 h-40 rounded-r-md bg-gradient-to-b from-white/80 via-white/40 to-transparent shadow-inner z-0" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div
              className="w-[90vw] max-w-5xl h-[25px] mt-[-10px] mb-3 rounded-b-[18px] relative mx-auto transition-all shadow-[0_8px_56px_#8d684066,0_2px_0_#fff5_inset,0_1px_10px_#fff6]"
              style={{
                background: `url(${WOOD_TEXTURE_URL}) center/cover, linear-gradient(90deg,#e1c08d 40%,#b09058 100%)`,
                filter: "brightness(1.08) saturate(1.05)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: "0 0 18px 18px",
                  background: "linear-gradient(90deg, #fff9 40%, #fff0 100%)",
                  opacity: 0.65,
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          </div>
        ))}
        <button
          onClick={() => setModalOpen(true)}
          className="mt-6 mb-2 w-[200px] mx-auto flex items-center justify-center gap-2 bg-yellow-200 text-blue-900 font-bold px-3 py-2 rounded-full shadow-lg hover:bg-yellow-100 transition text-sm"
          disabled={albums.length >= ALBUM_LIMIT}
        >
          + Créer un album
        </button>
        {albums.length >= ALBUM_LIMIT && (
  <div className="mt-2 text-center text-red-600 font-semibold text-base">
    <span>
      Nombre maximum d’albums atteint <b>({ALBUM_LIMIT})</b>.<br />
      <span className="text-yellow-600 font-bold">
        <span className="inline-block px-2 py-1 rounded bg-yellow-100 border border-yellow-300 shadow-sm mx-1">
          Passez au <span className="underline">forfait supérieur</span> pour créer des albums illimités.
        </span>
      </span>
    </span>
    <br />
    <button
      className="mt-3 px-4 py-2 bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-blue-900 rounded-xl shadow font-bold text-sm transition"
      onClick={() => alert("👉 Bientôt disponible ! L’offre premium sera lancée prochainement.")}
    >
      Découvrir l’offre premium
    </button>
  </div>
)}
      </div>

      {/* MODALE création d'album */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex justify-center items-center">
          <div className="bg-white rounded-2xl p-5 shadow-2xl flex flex-col gap-4 w-[98vw] max-w-xs">
            <h2 className="font-title text-xl mb-1">Créer un nouvel album</h2>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Titre de l'album…"
              className="border px-3 py-2 rounded-lg mb-2 focus:ring-2 ring-[#2563EB] text-base"
              autoFocus
              maxLength={50}
            />
            <div className="grid grid-cols-5 gap-1 mb-4">
              {COVER_DESIGNS.map(design => (
                <button
                  key={design.id}
                  onClick={() => setNewCoverId(design.id)}
                  className={`w-9 h-12 rounded border-2 ${newCoverId === design.id ? "ring-4 ring-[#A78BFA]" : "border-gray-200"}`}
                  style={{ background: `url(${design.url}) center/cover` }}
                  aria-label={design.name}
                  type="button"
                />
              ))}
            </div>
            <button
              onClick={handleCreateAlbum}
              className="bg-blue-900 text-white font-bold py-2 rounded-xl shadow hover:bg-blue-800"
              type="button"
              disabled={albums.length >= ALBUM_LIMIT}
            >
              Créer l'album
            </button>
            <button
              onClick={() => setModalOpen(false)}
              className="text-gray-500 mt-1 hover:underline text-xs"
              type="button"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-10 mb-1 text-center text-blue-100 text-xs opacity-80 px-2">
        Tous vos albums sont privés et protégés.{" "}
        <span className="font-bold text-yellow-200">
          Racinae, votre refuge mémoire.
        </span>
      </footer>
    </main>
  );
}
