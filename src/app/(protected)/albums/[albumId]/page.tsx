"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Image as ImgIcon, Video, Mic, ArrowLeft, Trash, MoreVertical, Pencil, X, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { incrementGraines } from "@/lib/graines";
import { useRouter } from "next/navigation";
import CoupDeCoeurButton from "../../../../components/ui/CoupDeCoeurButton";
// --- TYPES
type MediaType = "photo" | "video" | "audio";
interface Media { id: string; type: MediaType; url: string; annotation?: string; coup_de_coeur?: boolean; }
interface AlbumPage { left: Media[]; right: Media[] }
const emptyPage = { left: [], right: [] };
type PendingAnnotation = { side: "left" | "right"; idx: number } | null;

// --- Hook Mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

// --- Toast Feedback
function Toast({ message, type, onClose }: { message: string, type: "success"|"error", onClose: () => void }) {
  return (
    <div className={`
      fixed z-[999] left-1/2 -translate-x-1/2 bottom-10 min-w-[200px] 
      px-5 py-3 rounded-xl flex gap-2 items-center 
      ${type==="success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}
      shadow-lg animate-fade-in
    `}>
      {type==="success" ? <CheckCircle2 className="w-5 h-5"/> : <X className="w-5 h-5"/>}
      <span className="font-semibold">{message}</span>
      <button className="ml-4 text-white/80" onClick={onClose}>✕</button>
    </div>
  );
}

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params.albumId;
  const [userId, setUserId] = useState<string | null>(null);
  const [album, setAlbum] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<AlbumPage[]>([{ ...emptyPage }, { ...emptyPage }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [atelierOpen, setAtelierOpen] = useState(false);
  const [mediaInAtelier, setMediaInAtelier] = useState<Media | null>(null);
  const [pendingAnnot, setPendingAnnot] = useState<PendingAnnotation>(null);
  const [annotationInput, setAnnotationInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{message:string,type:"success"|"error"}|null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const isMobile = useIsMobile();

function updateMediaCoupDeCoeurLocal(mediaId: string, value: boolean) {

  setPages(prevPages =>
    prevPages.map(page => ({
      left: page.left.map(m => m.id === mediaId ? { ...m, coup_de_coeur: value } : m),
      right: page.right.map(m => m.id === mediaId ? { ...m, coup_de_coeur: value } : m),
    }))
  );
}

  // --- Utility Toast
  function showToast(msg:string, type:"success"|"error"="success") {
    setToast({message:msg, type});
    setTimeout(()=>setToast(null), 2500);
  }

  // Récupère l'utilisateur Supabase
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    }
    fetchUser();
  }, []);

  // Récupère l'album depuis Supabase
  useEffect(() => {
    async function fetchAlbum() {
      setLoading(true);
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", albumId)
        .single();
      setAlbum(error ? null : data);
      setLoading(false);
    }
    if (albumId) fetchAlbum();
  }, [albumId]);

  // --- Récupérer médias (refresh à chaque changement)
  useEffect(() => {
    async function fetchAlbumMedias() {
      if (!albumId) return;
      const { data, error } = await supabase
        .from("album_medias")
        .select("*")
        .eq("album_id", albumId);

      if (error) {
        showToast("Erreur chargement médias album", "error");
        return;
      }
      const maxPage = Math.max(0, ...data.map(m => typeof m.page_index === "number" ? m.page_index : 0));
      const loadedPages = Array.from({length: maxPage + 1}, () => ({ left: [], right: [] }));
      data.forEach(med => {
        const side = med.side === "left" ? "left" : med.side === "right" ? "right" : null;
        const pageIndex = typeof med.page_index === "number" ? med.page_index : 0;
        if (side && loadedPages[pageIndex]) {
          (loadedPages[pageIndex][side as "left" | "right"] as Media[]).push({
  id: med.id,
  type: med.type,
  url: med.url,
  annotation: med.annotation || "",
  coup_de_coeur: med.coup_de_coeur ?? false,   // 👈 NOUVEAU !
});
        }
      });
      setPages(loadedPages.length > 0 ? loadedPages : [{ left: [], right: [] }, { left: [], right: [] }]);
    }
    fetchAlbumMedias();
  }, [albumId, refreshFlag]);

  // --- UPLOAD + Sauvegarde Storage Supabase (photo, vidéo, audio)
  async function uploadToSupabaseStorage(file: File, type: MediaType): Promise<string|null> {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `albums/${albumId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    let bucket = "album-medias"; // Nom du bucket à adapter
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
    setUploading(false);
    if (error) {
      showToast("Erreur upload fichier", "error");
      return null;
    }
    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    return publicUrl;
  }

  // --- Atelier Upload bouton
  function AtelierUploadButton({ type, icon, label }: { type: MediaType; icon: React.ReactNode; label: string }) {
    async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      const url = await uploadToSupabaseStorage(file, type);
      if (!url) { setUploading(false); return; }
      setMediaInAtelier({ id: Date.now() + "", type, url });
      setUploading(false);
      e.target.value = "";
    }
    return (
      <label className="flex flex-col items-center cursor-pointer px-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-xs text-gray-600 font-semibold">{label}</span>
        <input
          type="file"
          accept={type === "photo" ? "image/*" : type === "video" ? "video/*" : "audio/*"}
          className="hidden"
          onChange={onUpload}
          disabled={uploading}
        />
        <span className="mt-1 text-xs text-blue-800 bg-blue-50 rounded px-2 py-1 shadow hover:bg-blue-100">
          {uploading ? <Loader2 className="animate-spin w-4 h-4 inline" /> : "Importer"}
        </span>
      </label>
    );
  }

  // --- Ajout d'un média (Drag&Drop ou Mobile)
// --- Ajout d'un média (Drag&Drop ou Mobile)
async function handleAddMediaToPage(item: Media, side: "left" | "right") {
  if (!userId || !albumId) return;
  setUploading(true);
  const { error } = await supabase.from("album_medias").insert({
    album_id: albumId,
    user_id: userId,
    type: item.type,
    url: item.url,
    annotation: "",
    page_index: currentPage,
    side: side,
    created_at: new Date().toISOString()
  });
  setUploading(false);
  if (error) {
    showToast("Erreur lors de l'ajout", "error");
    return;
  }
  // 🟢 AJOUTE CETTE LIGNE
  await incrementGraines(userId);

  setMediaInAtelier(null);
  setAtelierOpen(false);
  showToast("Ajout réussi !");
  setRefreshFlag(f => f+1);
}


  // --- Ajout média MOBILE
  async function handleAtelierValidateMobile(side: "left" | "right") {
    if (!mediaInAtelier) return;
    await handleAddMediaToPage(mediaInAtelier, side);
  }

  // --- PageSide (drag n drop desktop)
  function PageSide({ side, medias }: { side: "left" | "right", medias: Media[] }) {
    if (isMobile) {
      return (
        <div className="flex-1 min-h-[160px] bg-white/80 rounded-2xl mx-1 p-2 flex flex-col gap-4 border-2 border-[#e6dfd1] shadow-lg relative">
          {medias.map((media, idx) => (
            <MediaCard key={media.id} media={media} side={side} idx={idx} />
          ))}
        </div>
      );
    }
    const [, drop] = useDrop({
      accept: ["NEW_MEDIA"],
      drop: (item: Media) => handleAddMediaToPage(item, side),
    });
    // @ts-ignore
    return (
      <div ref={drop}
        className="flex-1 min-h-[210px] md:min-h-[300px] bg-white/80 rounded-2xl mx-1 md:mx-2 p-2 flex flex-col gap-4 border-2 border-[#e6dfd1] shadow-lg relative"
      >
        {medias.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-gray-300 italic text-sm text-center">
            Déposez ici une photo, vidéo, audio
          </div>
        )}
        {medias.map((media, idx) => (
          <DraggableAnnotableMedia
            key={media.id}
            media={media}
            side={side}
            idx={idx}
          />
        ))}
      </div>
    );
  }

  // --- Suppression drag & drop (desktop seulement)
  function TrashDropZone({ handleRemove }: { handleRemove: (side: "left" | "right", idx: number) => void }) {
    const [{ isOver }, dropTrash] = useDrop({
      accept: "ALBUM_MEDIA",
      drop: (item: any) => handleRemove(item.side, item.idx),
      collect: monitor => ({ isOver: monitor.isOver() }),
    });
    // @ts-ignore
    return (
      <div
        className={`flex flex-col items-center text-xs font-semibold transition ${isOver ? "text-red-700 scale-125" : "text-gray-400"}`}
        ref={dropTrash}
        style={{ cursor: "pointer" }}
      >
        <span className="text-2xl">🗑️</span>
        Poubelle
        
      </div>
    );
  }

  // --- Drag atelier (desktop)
  function AtelierDraggableMedia() {
    const [, drag] = useDrag({
      type: "NEW_MEDIA",
      item: mediaInAtelier,
      end: (item, monitor) => {
        if (monitor.didDrop()) setMediaInAtelier(null);
      }
    });
    if (!mediaInAtelier) return null;
    // @ts-ignore
    return (
      <div ref={drag} className="mt-3 flex flex-col items-center border-2 border-blue-300 rounded-xl bg-white px-2 py-2 shadow-lg cursor-grab">
        {mediaInAtelier.type === "photo" && <img src={mediaInAtelier.url} alt="Aperçu" className="rounded-lg max-h-20 max-w-24 object-contain" />}
        {mediaInAtelier.type === "video" && <video src={mediaInAtelier.url} controls className="rounded-lg max-h-16 max-w-24" />}
        {mediaInAtelier.type === "audio" && <audio src={mediaInAtelier.url} controls className="w-24 mt-2" />}
        <span className="text-xs text-blue-900 mt-2">Glisse sur la page !</span>
      </div>
    );
  }

  // --- Stylo annotation (drag pour desktop)
  function PencilDraggable() {
    const [, drag] = useDrag({
      type: "ANNOTATE",
      item: { type: "ANNOTATE" }
    });
    // @ts-ignore
    return (
      <div
        ref={drag}
        className="flex flex-col items-center text-xs text-orange-600 cursor-grab"
        style={{ marginLeft: 10, marginRight: 10 }}
      >
        <span className="text-2xl"><Pencil /></span>
        Annoter
        
      </div>
    );
  }

  // --- Média (drag desktop / simple mobile)
  function MediaCard({ media, side, idx }: { media: Media, side: "left" | "right", idx: number }) {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    return (
      <div className="relative w-full rounded-2xl bg-[#FEF7ED] shadow-sm flex flex-col items-center p-2 border border-[#e6dfd1]">
        {/* Étoile coup de cœur PARTAGE */}
      <div className="absolute top-2 right-2 z-10">
        <CoupDeCoeurButton
  isFavorite={media.coup_de_coeur ?? false}
  onToggle={async () => {
    const newValue = !media.coup_de_coeur;
    // ✅ 1. Mise à jour instantanée UI
    updateMediaCoupDeCoeurLocal(media.id, newValue);
    // ✅ 2. Mise à jour en base
    await supabase
      .from("album_medias")
      .update({ coup_de_coeur: newValue })
      .eq("id", media.id);
    // ✅ 3. Redirection uniquement si on coche
    if (newValue) {
      router.push(`/transmission?selected=${media.id}&type=albums`);
    }
    // Si on décoche : rien de plus à faire !
  }}
   size={isMobile ? 16 : 28}
/>

      </div>
        {media.type === "photo" && (
          <img src={media.url} alt="Photo" className="rounded-xl w-full max-h-36 object-cover shadow" />
        )}
        {media.type === "video" && (
          <video src={media.url} controls className="rounded-xl w-full max-h-36 object-cover shadow" />
        )}
        {media.type === "audio" && (
          <audio src={media.url} controls className="w-full mt-2" />
        )}
        {media.annotation && (
          <div className="mt-2 text-sm text-[#2563eb] font-normal">{media.annotation}</div>
        )}
        <div className="flex justify-center mt-3 mb-1 relative">
          <button
            className="p-1 rounded-full border border-[#E5E7EB] bg-[#FEF7ED] shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#A78BFA] transition"
            onClick={() => setOpen((v) => !v)}
            aria-label="Afficher les actions"
          >
            <MoreVertical className="w-5 h-5 text-[#A78BFA]" />
          </button>
          {open && (
            <div className="absolute bottom-10 z-10 bg-white border border-[#E5E7EB] rounded-xl shadow-lg flex flex-col py-1 min-w-[120px] animate-fade-in">
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-[#F1F5F9] rounded-xl text-sm text-[#A78BFA] transition"
                onClick={() => {
                  setPendingAnnot({ side, idx });
                  setAnnotationInput(media.annotation || "");
                  setOpen(false);
                }}
              >
                <Pencil className="w-4 h-4" />
                Annoter
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 hover:bg-[#FFF2ED] rounded-xl text-sm text-[#F2994A] transition"
                onClick={() => {
                  if (window.confirm("Supprimer ce média ?")) handleRemove(side, idx);
                  setOpen(false);
                }}
              >
                <Trash className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  function DraggableAnnotableMedia({ media, side, idx }: { media: Media, side: "left" | "right", idx: number }) {
  const [, drag] = useDrag({ type: "ALBUM_MEDIA", item: { side, idx } });
  const [, dropAnnot] = useDrop({ accept: "ANNOTATE", drop: () => setPendingAnnot({ side, idx }) });
  const router = useRouter(); // 👈 ajoute ceci si tu ne l'as pas en haut du fichier

  return (
    <div
      ref={node => {
        drag(node);
        dropAnnot(node);
      }}
      className="relative w-full rounded-xl bg-white shadow flex flex-col items-center gap-2 p-3 border transition"
    >
      {/* --- Étoile coup de cœur PARTAGE --- */}
      <div className="absolute top-2 right-2 z-10">
        <CoupDeCoeurButton
  isFavorite={media.coup_de_coeur ?? false}
  onToggle={async () => {
    const newValue = !media.coup_de_coeur;
    // ✅ 1. Mise à jour instantanée UI
    updateMediaCoupDeCoeurLocal(media.id, newValue);
    // ✅ 2. Mise à jour en base
    await supabase
      .from("album_medias")
      .update({ coup_de_coeur: newValue })
      .eq("id", media.id);
    // ✅ 3. Redirection uniquement si on coche
    if (newValue) {
      router.push(`/transmission?selected=${media.id}&type=albums`);
    }
    // Si on décoche : rien de plus à faire !
  }}
/>


      </div>
      {media.type === "photo" && <img src={media.url} alt="Photo" className="rounded-xl w-full max-h-32 object-contain shadow" />}
      {media.type === "video" && <video src={media.url} controls className="w-full max-h-32 rounded-xl shadow" />}
      {media.type === "audio" && <audio src={media.url} controls className="w-full mt-2" />}
      {media.annotation && (
        <div className="flex items-center gap-2 text-xs text-[#a78bfa] font-semibold bg-blue-50 rounded px-2 py-1 mt-1 relative">
          <span>{media.annotation}</span>
          <button onClick={() => handleDeleteAnnotation(side, idx)} className="ml-1 p-0.5 text-gray-400 hover:text-red-500">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}


  // --- Annotation : UPDATE réel en base
  async function handleAnnotationValidate() {
    if (!pendingAnnot) return;
    const { side, idx } = pendingAnnot;
    const media = pages[currentPage]?.[side]?.[idx];
    if (!media?.id) { setPendingAnnot(null); setAnnotationInput(""); return; }
    const { error } = await supabase.from("album_medias").update({ annotation: annotationInput }).eq("id", media.id);
    if (!error) {
      showToast("Annotation ajoutée !");
      setRefreshFlag(f => f+1);
    } else {
      showToast("Erreur annotation", "error");
    }
    setAnnotationInput("");
    setPendingAnnot(null);
  }

  // --- Suppression : delete en base puis refresh
  async function handleRemove(side: "left" | "right", idx: number) {
    const mediaToRemove = pages[currentPage]?.[side]?.[idx];
    if (!mediaToRemove?.id) return;
    const { error } = await supabase.from("album_medias").delete().eq('id', mediaToRemove.id);
    if (!error) {
      showToast("Supprimé !");
      setRefreshFlag(f => f+1);
    } else {
      showToast("Erreur suppression", "error");
    }
  }

  // --- Suppression de l’annotation (juste set vide)
  async function handleDeleteAnnotation(side: "left" | "right", idx: number) {
    const media = pages[currentPage]?.[side]?.[idx];
    if (!media?.id) return;
    const { error } = await supabase.from("album_medias").update({ annotation: "" }).eq("id", media.id);
    if (!error) {
      showToast("Annotation supprimée !");
      setRefreshFlag(f => f+1);
    }
  }

  // --- Pagination
  function Pagination() {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mt-8">
        <button
          className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-blue-900 font-bold shadow hover:bg-[#CBD5E1] transition disabled:opacity-30"
          onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
          disabled={currentPage === 0}
          aria-label="Page précédente"
        >&#x25C0;</button>
        <span className="font-serif text-base md:text-lg font-semibold text-blue-900">Double-page</span>
        <select
          className="mx-1 px-2 py-1 rounded bg-[#F1F5F9] border border-gray-300 text-blue-900 font-bold shadow-sm outline-none ring-2 ring-transparent focus:ring-[#A78BFA]"
          value={currentPage}
          onChange={e => setCurrentPage(Number(e.target.value))}
          aria-label="Choisir la page"
        >
          {pages.map((_, idx) => (
            <option
              value={idx}
              key={idx}
              style={{
                background: idx === currentPage ? "#E0E7FF" : undefined,
                fontWeight: idx === currentPage ? 700 : 400,
              }}
            >
              {idx + 1}
            </option>
          ))}
        </select>
        <span className="text-blue-800 font-semibold">/ {pages.length}</span>
        <button
          className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center text-blue-900 font-bold shadow hover:bg-[#CBD5E1] transition disabled:opacity-30"
          onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
          disabled={currentPage >= pages.length - 1}
          aria-label="Page suivante"
        >&#x25B6;</button>
        <button
          className="ml-2 flex items-center gap-1 px-3 py-1.5 rounded bg-[#A78BFA] text-white font-semibold text-base shadow hover:bg-[#2563EB] transition"
          style={{ minWidth: 0, fontSize: "1rem" }}
          onClick={() => setPages(p => [...p, { ...emptyPage }])}
          aria-label="Ajouter une double-page"
        >
          <span className="text-lg font-bold">+</span>
        </button>
      </div>
    );
  }

  // --- Atelier
  function Atelier() {
    return (
      <aside
        className={`
          fixed z-50 bg-white/95 shadow-lg border-2 border-[#A78BFA]
          flex flex-col gap-4
          rounded-2xl
          transition-all duration-300
          ${isMobile
            ? 'left-1/2 -translate-x-1/2 bottom-2 w-[95vw] max-w-sm'
            : 'top-24 left-8 w-[88vw] max-w-xs md:max-w-sm md:w-auto'
          }
        `}
        style={{ minWidth: 200, maxWidth: 340 }}
      >
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#2563EB] text-lg">Atelier</span>
          <button onClick={() => setAtelierOpen(false)} className="text-[#A78BFA] text-xl px-2">✕</button>
        </div>
        <div className="flex gap-4 justify-center mt-2">
          <AtelierUploadButton type="photo" icon={<ImgIcon />} label="Photo" />
          <AtelierUploadButton type="video" icon={<Video />} label="Vidéo" />
          <AtelierUploadButton type="audio" icon={<Mic />} label="Audio" />
        </div>
        {mediaInAtelier && (
          <div className="flex flex-col items-center gap-2 p-2 bg-white rounded-xl shadow">
            {mediaInAtelier.type === "photo" && (
              <img src={mediaInAtelier.url} alt="Aperçu" className="rounded-lg max-h-20 max-w-24 object-contain" />
            )}
            {mediaInAtelier.type === "video" && (
              <video src={mediaInAtelier.url} controls className="rounded-lg max-h-16 max-w-24" />
            )}
            {mediaInAtelier.type === "audio" && (
              <audio src={mediaInAtelier.url} controls className="w-24 mt-2" />
            )}
            {isMobile && (
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-[#2563EB] text-white rounded px-3 py-1 font-bold shadow hover:bg-[#1744ad]"
                  onClick={() => handleAtelierValidateMobile("left")}
                  disabled={uploading}
                >
                  Ajouter à gauche
                </button>
                <button
                  className="bg-[#2563EB] text-white rounded px-3 py-1 font-bold shadow hover:bg-[#1744ad]"
                  onClick={() => handleAtelierValidateMobile("right")}
                  disabled={uploading}
                >
                  Ajouter à droite
                </button>
              </div>
            )}
          </div>
        )}
        {!isMobile && <AtelierDraggableMedia />}
        {!isMobile && (
          <div className="flex items-end gap-8 justify-center mt-3">

            <PencilDraggable />
            <TrashDropZone handleRemove={handleRemove} />
          </div>
        )}
        <div className="text-xs text-gray-500 mt-2 text-center">
          {isMobile
            ? <>Choisissez un média puis validez pour l’ajouter</>
            : <>Importez puis glissez sur la page<br />Pour annoter : glissez le stylo sur une image.<br />Pour supprimer, glissez vers la poubelle.</>
          }
        </div>
        {uploading && (
          <div className="flex items-center justify-center gap-2 text-blue-700 font-bold p-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            Téléversement en cours…
          </div>
        )}
      </aside>
    );
  }

  // ----------- MAIN RENDER -------------
  return (
    <DndProvider backend={HTML5Backend}>
      <main
        className="px-1 sm:px-2 py-6 max-w-full flex flex-col gap-7 sm:gap-12 items-center min-h-screen font-sans relative"
        style={{
          background: `
            linear-gradient(135deg, #2e358e 20%, #6c86f5 60%, #f8e7fb 100%),
            radial-gradient(ellipse 80% 40% at 70% 10%, #f3cb7b55 10%, transparent 100%),
            radial-gradient(circle 55vw at 10vw 120vh, #c4a9ff33 0%, transparent 100%)
          `
        }}
      >
        {toast && <Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)} />}
        {/* HEADER */}
        <header className="w-full flex flex-col items-center pt-10 md:pt-12 pb-2">
          <div className="flex items-center gap-5 mb-3">
            <button
              onClick={() => window.history.back()}
              className="
                bg-white/80 text-blue-900 
                px-1.5 py-1 rounded-full shadow hover:bg-blue-200 
                flex items-center gap-1 min-w-0 text-xs
                sm:px-2 sm:py-1 sm:gap-2 sm:text-sm
              "
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-bold hidden xs:inline sm:inline">Ranger l’album</span>
            </button>
            {/* Couverture de l'album */}
            {!loading && album && album.cover_url ? (
              <img
                src={album.cover_url}
                alt={`Couverture de l'album ${album.title}`}
                className="w-14 h-20 rounded-md border-2 border-[#e6dfd1] shadow bg-white object-cover"
                style={{ background: '#eee' }}
              />
            ) : (
              <div className="w-14 h-20 rounded-md bg-gray-200 animate-pulse" />
            )}
            {/* Titre */}
            {!loading && album ? (
              <div className="font-title text-2xl md:text-3xl text-white font-bold drop-shadow">{album.title}</div>
            ) : (
              <span className="text-white text-lg">Album introuvable</span>
            )}
          </div>
        </header>

        {/* Atelier mobile bas / desktop latéral */}
        {atelierOpen && <Atelier />}
        {!atelierOpen && (
          <button
            onClick={() => setAtelierOpen(true)}
            className={`
              fixed z-40
              ${isMobile
                ? "bottom-5 left-1/2 -translate-x-1/2 px-4 py-3"
                : "top-24 left-7 px-6 py-3"
              }
              bg-[#2563EB] text-white rounded-full shadow hover:bg-[#1744ad] transition text-xl font-bold
            `}
            style={{ minWidth: 60 }}
          >
            🛠️
          </button>
        )}

        {/* Saisie annotation (modale simple) */}
        {pendingAnnot && (
          <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
            <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
              <div className="text-lg mb-2">Ajouter une annotation</div>
              <input
                className="border px-3 py-2 rounded w-60 text-center mb-4"
                autoFocus
                value={annotationInput}
                onChange={e => setAnnotationInput(e.target.value)}
                placeholder="Écris ton mot…"
                maxLength={50}
              />
              <div className="flex gap-3">
                <button onClick={handleAnnotationValidate} className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-900">
                  Valider
                </button>
                <button onClick={() => { setPendingAnnot(null); setAnnotationInput(""); }} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Feuilletage double-page */}
        <section
          className="
            mt-10 md:mt-12 w-full
            max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl
            mx-auto
            rounded-[2.2rem]
            border-8 border-[#b09058]
            ring-8 ring-[#f3e7cf]/80
            flex justify-center px-0 md:px-2 py-4 md:py-8 gap-2 relative
            shadow-[0_16px_60px_#b0905866,0_4px_32px_#a78bfa22,0_0_1px_#fff7]
            transition-all duration-500
            bg-gradient-to-br from-[#FEF7ED] via-[#fcf4e4] to-[#f3e7cf]
          "
          style={{
            boxShadow:
              "0 18px 72px #a9853f55, 0 4px 32px #a78bfa25, 0 0px 1px #fff7",
            filter: "drop-shadow(0 4px 44px #b0905880)",
            background:
              "repeating-linear-gradient(135deg, #fef7ed 0 6px, #f7efe4 7px 12px), radial-gradient(circle at 40% 45%, #fff6 70%, transparent 100%)",
          }}
        >
          {/* tranche */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-8 bottom-8 w-3 rounded-full bg-gradient-to-b from-[#f7e6b7] via-[#e0c684] to-[#a77f29] shadow-2xl z-20 opacity-95"
            style={{
              boxShadow: "0 0 36px #e0c68444, 0 0 60px #fff8",
              filter: "blur(0.2px)",
            }}
          />
          <PageSide side="left" medias={pages[currentPage]?.left ?? []} />
          <PageSide side="right" medias={pages[currentPage]?.right ?? []} />
        </section>

        {/* Pagination */}
        <Pagination />

        <footer className="mt-10 md:mt-14 mb-7 text-center text-blue-100 text-xs md:text-sm opacity-80">
          Ici, chaque souvenir est précieux. <span className="font-bold text-yellow-200">Tout est sécurisé.</span>
        </footer>
      </main>
    </DndProvider>
  );
}
