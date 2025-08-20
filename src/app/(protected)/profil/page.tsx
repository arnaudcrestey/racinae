"use client";
import React, { useEffect, useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { supabase } from "@/lib/supabaseClient";
import ToolDraggable from "../../../components/ui/ToolDraggable";
import { incrementGraines } from "@/lib/graines";
import { useRouter } from "next/navigation";
import CoupDeCoeurButton from "../../../components/ui/CoupDeCoeurButton";
import type { Dispatch, SetStateAction } from "react";


// ---- Types ----
type BlocType = "texte" | "citation" | "valeur" | "humeur" | "photo";
interface Bloc {
  id: string;      // id Supabase ou id temporaire, mais toujours string
  type: BlocType;
  content: string;
  annotation: string;
  emoji: string;
  photo_url?: string;
  page_id?: string;
  isNew?: boolean; 
  height?: number;
  coup_de_coeur?: boolean;
}
interface Page {
  id: string;         // id Supabase obligatoire
  blocs: Bloc[];
  page_number: number;
  isNew?: boolean;
}

// ---- Catégories et citations ----
const BLOCK_TYPES = [
  { type: "texte", label: "Texte", icon: "✍️", cat: "Écriture & Inspiration" },
  { type: "citation", label: "Citation", icon: "💬", cat: "Écriture & Inspiration" },
  { type: "valeur", label: "Valeur", icon: "💎", cat: "Valeurs & Émotions" },
  { type: "humeur", label: "Humeur", icon: "😊", cat: "Valeurs & Émotions" },
  { type: "photo", label: "Photo", icon: "📷", cat: "Souvenir Visuel" },
] as const;

interface LivrePageProps {
  title: string;
  page: Bloc[];
  pageIdx: number;
  onDropBloc: (bloc: Bloc, pageIdx: number) => void;
  onEditBloc: (pageIdx: number, blocIdx: number, newData: Partial<Bloc>) => void;
  moveBloc: (pageIdx: number, fromIdx: number, toIdx: number) => void;
  onRemoveBloc: (pageIdx: number, blocIdx: number) => void;
  dndEnabled: boolean;
}
interface BlocLivreDraggableProps {
  bloc: Bloc;
  pageIdx: number;
  idx: number;
  moveBloc: (pageIdx: number, fromIdx: number, toIdx: number) => void;
  onEditBloc: (pageIdx: number, blocIdx: number, newData: Partial<Bloc>) => void;
  onRemoveBloc: (pageIdx: number, blocIdx: number) => void;
  dndEnabled: boolean;
}
interface BlocAtelierDraggableProps {
  bloc: Bloc;
  onQuickAdd?: () => void;
  dndEnabled?: boolean;
}
const ATELIER_CATEGORIES = [
  { label: "Écriture & Inspiration", types: ["texte", "citation"] as BlocType[] },
  { label: "Valeurs & Émotions", types: ["valeur", "humeur"] as BlocType[] },
  { label: "Souvenir Visuel", types: ["photo"] as BlocType[] },
];
const citations = [
  "“La mémoire est un jardin que l’on cultive.”",
  "“Chaque étape forge qui nous sommes.”",
  "“Les racines profondes nourrissent l’avenir.”",
  "“Raconter sa vie, c’est transmettre un héritage.”",
];

// ---- Mobile Hook ----
function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    function check() {
      setIsMobile(window.innerWidth < breakpoint);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);
  return isMobile;
}

function uuid() {
  // simple uuid for new elements
  return "temp-" + Math.random().toString(36).substring(2, 15);
}
type PhotoMiniatureProps = {
  url: string;
  isMobile: boolean;
  currentPage: number;
  currentDoublePage: number;
  setPages: React.Dispatch<React.SetStateAction<Page[]>>;
  uuid: () => string;
  setAtelierPhotos: React.Dispatch<React.SetStateAction<string[]>>;
};

function PhotoMiniature({
  url,
  isMobile,
  currentPage,
  currentDoublePage,
  setPages,
  uuid,
}: PhotoMiniatureProps) {
  // Activation du drag & drop desktop
  const [{ isDragging }, drag] = useDrag({
    type: "ATELIER_BLOC",
    item: {
      id: uuid(),
      type: "photo",
      content: url,
      annotation: "",
      emoji: "",
      isNew: true,
      photo_url: url,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag} // ← le drag & drop natif réagit ici !
      className={`rounded-lg overflow-hidden border shadow bg-indigo-50 transition ${isDragging ? "opacity-30" : ""}`}
      style={{ width: 90, height: 90, position: "relative", cursor: "grab" }}
      title="Glisse cette photo sur une page OU clique pour l'ajouter"
      onClick={() => {
        // Le clic fonctionne toujours pour mobile ET desktop si on veut
        setPages((prev) =>
          prev.map((p, i) =>
            i === (isMobile ? currentPage : currentDoublePage * 2)
              ? {
                  ...p,
                  blocs: [
                    ...p.blocs,
                    {
                      id: uuid(),
                      type: "photo",
                      content: url,
                      annotation: "",
                      emoji: "",
                      isNew: true,
                      photo_url: url,
                    },
                  ],
                }
              : p
          )
        );
      }}
    >
      <img src={url} alt="Photo importée" className="w-full h-full object-cover" />
    </div>
  );
}
// ---- Page Principale ----
export default function ProfilPage() {
  const [citation, setCitation] = useState<string>("");
  const [pages, setPages] = useState<Page[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [currentDoublePage, setCurrentDoublePage] = useState<number>(0);
  const [atelierBlocs, setAtelierBlocs] = useState<Bloc[]>([]);
  const [atelierPhotos, setAtelierPhotos] = useState<string[]>([]);
  const handleImportPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const fileNameSafe = file.name.replace(/\s/g, "_").replace(/[^\w.-]/g, "");
  const filePath = `${Date.now()}_${fileNameSafe}`;
  const { error: upErr } = await supabase
    .storage
    .from("life-book-photos")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (upErr) {
    alert("Erreur upload photo : " + upErr.message);
    return;
  }
  const publicUrl = supabase.storage
    .from("life-book-photos")
    .getPublicUrl(filePath).data.publicUrl;

  setAtelierPhotos((prev) => [...prev, publicUrl]);
};
  const [atelierOpen, setAtelierOpen] = useState<boolean>(false);

  // 1. CHARGEMENT initial depuis Supabase
  useEffect(() => {
    setCitation(citations[Math.floor(Math.random() * citations.length)]);
    const fetchBook = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // a. Charger les pages
      const { data: pageRows } = await supabase
        .from("life_book_pages")
        .select("id, page_number")
        .eq("user_id", user.id)
        .order("page_number");
      if (!pageRows) { setLoading(false); return; }

      // b. Charger tous les blocs des pages
      const pageIds = pageRows.map((p: any) => p.id);
      const { data: blocRows } = await supabase
        .from("life_book_blocks")
        .select("*")
        .in("page_id", pageIds);

      // c. Recomposer les pages avec leurs blocs
      const pagesWithBlocs: Page[] = pageRows.map((page: any) => ({
        id: page.id,
        page_number: page.page_number,
        blocs: (blocRows ?? [])
          .filter((b: any) => b.page_id === page.id)
          .sort((a, b) => a.position - b.position)
          .map((b: any) => ({
            id: b.id, // id Supabase direct !
            page_id: b.page_id,
            type: b.type,
            content: b.content,
            annotation: b.annotation,
            emoji: b.emoji,
            photo_url: b.photo_url ?? "",
            height: b.height ?? 88,
            coup_de_coeur: b.coup_de_coeur ?? false,
          })),
      }));
      setPages(
        pagesWithBlocs.length > 0
          ? pagesWithBlocs
          : [
              { id: uuid(), page_number: 0, blocs: [], isNew: true },
              { id: uuid(), page_number: 1, blocs: [], isNew: true },
            ]
      );
      setLoading(false);
    };
    fetchBook();
  }, []);

  // 2. SAUVEGARDE auto sur Supabase à chaque changement (debounced)
  useEffect(() => {
  if (!userId || pages.length === 0 || loading) return;
  const timeout = setTimeout(async () => {
    setSaveState("saving");
    try {
      for (let i = 0; i < pages.length; i++) {
        let page = pages[i];
        let pageId = page.id;

        // a. Upsert page si nouvelle
        if (!pageId || page.isNew) {
          const { data: newPage } = await supabase
            .from("life_book_pages")
            .insert({
              user_id: userId,
              page_number: i,
            })
            .select("id")
            .single();
          pageId = newPage?.id;
          pages[i].id = pageId;
          pages[i].isNew = false;
        }
        if (!pageId) continue;

        // ⚠️ NE PLUS DELETE MASSIVEMENT !
        // Sauvegarde chaque bloc séparément (insert ou update)
        for (let pos = 0; pos < page.blocs.length; pos++) {
          const bloc = page.blocs[pos];
          if (bloc.id && !bloc.id.startsWith("temp-")) {
            // Bloc déjà existant : UPDATE uniquement les champs éditables
            await supabase.from("life_book_blocks").update({
              content: bloc.content,
              annotation: bloc.annotation,
              emoji: bloc.emoji,
              position: pos,
              photo_url: bloc.type === "photo" ? bloc.content : null,
              height: bloc.height ?? 88,
              coup_de_coeur: bloc.coup_de_coeur ?? false,
            }).eq("id", bloc.id);
          } else {
  // Nouveau bloc : INSERT
  const { data: newBloc } = await supabase.from("life_book_blocks").insert({
    page_id: pageId,
    user_id: userId,
    type: bloc.type,
    content: bloc.content,
    annotation: bloc.annotation,
    emoji: bloc.emoji,
    position: pos,
    photo_url: bloc.type === "photo" ? bloc.content : null,
    height: bloc.height ?? 88,
    coup_de_coeur: bloc.coup_de_coeur ?? false,
  })
  .select("id")
  .single();
  // Remplace l'id temporaire par le vrai id Supabase, côté front !
  if (newBloc && pages[i].blocs[pos].id.startsWith("temp-")) {
    pages[i].blocs[pos].id = newBloc.id;
    pages[i].blocs[pos].isNew = false;
  }
}

        }
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1400);
    } catch (err) {
      setSaveState("error");
    }
  }, 600);
  return () => clearTimeout(timeout);
}, [pages, userId, loading]);


  // 3. FONCTIONS qui modifient les pages/blocs
  // --- Ajoute un bloc dans l’atelier ---
// S’assure que les blocs "photo" contiennent une URL valide
function addBlocAtelier(type: BlocType) {
  if (type === "photo" && atelierPhotos.length > 0) {
    // Prend la dernière photo importée (ou choisis-en une)
    const url = atelierPhotos[atelierPhotos.length - 1];
    setAtelierBlocs((prev) => [
      ...prev,
      {
        id: uuid(),
        type: "photo",
        content: url,
        annotation: "",
        emoji: "",
        isNew: true,
        photo_url: url,
      },
    ]);
  } else {
    setAtelierBlocs((prev) => [
      ...prev,
      {
        id: uuid(),
        type,
        content: "",
        annotation: "",
        emoji: "",
        isNew: true,
      },
    ]);
  }
}

// --- Drag & drop d’un bloc sur une page du livre ---
async function handleDropOnPage(bloc: Bloc, pageIdx: number) {
  console.log("Bloc reçu dans handleDropOnPage :", bloc, "Page idx :", pageIdx);
  // 1. Supprimer de l’atelier AVANT d’ajouter à la page, sinon l’état risque de se croiser.
  setAtelierBlocs((blocs) => blocs.filter((b) => b.id !== bloc.id));

  // 2. Ajouter dans la page SANS CHANGER L'ID !
  setPages((prevPages) =>
  prevPages.map((p, i) =>
    i === pageIdx
      ? {
          ...p,
          blocs: [
            ...p.blocs,
            {
              ...bloc,
              page_id: p.id,
              // Sécurise toujours l’URL de la photo pour affichage parfait :
              content: bloc.photo_url || bloc.content || "",
              photo_url: bloc.photo_url || bloc.content || "",
            },
          ],
        }
      : p
  )
);


  // 3. Facultatif : Si tu veux vraiment un nouvel id pour la DB, tu peux le changer juste après l’ajout, ou lors de la sauvegarde en base.
  if (userId) {
    await incrementGraines(userId);
  }
}

// --- Ajout rapide d’un bloc depuis l’atelier (clic mobile, bouton “ajouter”) ---
async function handleQuickAddBloc(bloc: Bloc) {
  setPages((prevPages) =>
    prevPages.map((p, i) =>
      i === (isMobile ? currentPage : currentDoublePage * 2)
        ? {
            ...p,
            blocs: [
              ...p.blocs,
              {
                ...bloc,
  id: uuid(),
  isNew: true,
  page_id: p.id,
  content: bloc.photo_url || bloc.content || "",
photo_url: bloc.photo_url || bloc.content || "",

              },
            ],
          }
        : p
    )
  );
  setAtelierBlocs((blocs) => blocs.filter((b) => b.id !== bloc.id));
  setAtelierOpen(false);

  // Incrémente les graines si l’utilisateur est connecté
  if (userId) {
    console.log("Appel incrementGraines pour userId :", userId);
    await incrementGraines(userId);
  }
}

// --- Modification d’un bloc existant dans une page ---
function handleEditBloc(pageIdx: number, blocIdx: number, newData: Partial<Bloc>) {
  setPages((prevPages) =>
    prevPages.map((page, pi) =>
      pi !== pageIdx
        ? page
        : {
            ...page,
            blocs: page.blocs.map((b, bi) =>
              bi !== blocIdx ? b : { ...b, ...newData }
            ),
          }
    )
  );
}


  function moveBlocWithinPage(pageIdx: number, fromIdx: number, toIdx: number) {
    setPages((prevPages) =>
      prevPages.map((page, pi) => {
        if (pi !== pageIdx) return page;
        const copy = [...page.blocs];
        const [removed] = copy.splice(fromIdx, 1);
        copy.splice(toIdx, 0, removed);
        return { ...page, blocs: copy };
      })
    );
  }

  // Suppression pro : supprime bloc en base ET, si photo, le storage aussi
  async function handleRemoveBloc(pageIdx: number, blocIdx: number) {
    const bloc = pages[pageIdx]?.blocs[blocIdx];
    if (!bloc) return;
    // Si bloc existant (en base)
    if (!bloc.id.startsWith("temp-")) {
      // Si photo, on supprime le fichier aussi !
      if (bloc.type === "photo" && bloc.content) {
        const publicUrl = bloc.content;
        const filename = publicUrl.split("/").pop();
        if (filename)
          await supabase.storage.from("life-book-photos").remove([filename]);
      }
      await supabase.from("life_book_blocks").delete().eq("id", bloc.id);
    }
    // Front : on enlève le bloc côté client
    setPages((prevPages) =>
      prevPages.map((page, pi) =>
        pi !== pageIdx
          ? page
          : { ...page, blocs: page.blocs.filter((_, bi) => bi !== blocIdx) }
      )
    );
  }

  function handleAddDoublePage() {
    setPages((prev) => [
      ...prev,
      { id: uuid(), page_number: prev.length, blocs: [], isNew: true },
      { id: uuid(), page_number: prev.length + 1, blocs: [], isNew: true },
    ]);
  }

  // Navigation
  function handlePrev() {
    if (isMobile) {
      if (currentPage > 0) setCurrentPage((prev) => prev - 1);
    } else {
      if (currentDoublePage > 0) setCurrentDoublePage((prev) => prev - 1);
    }
  }
  function handleNext() {
    if (isMobile) {
      if (currentPage < pages.length - 1) setCurrentPage((prev) => prev + 1);
    } else {
      if (currentDoublePage < pages.length / 2 - 1) setCurrentDoublePage((prev) => prev + 1);
    }
  }

  // ---- RENDER ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="animate-pulse text-xl text-indigo-700">Chargement de votre livre...</div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <main
        className="px-1 sm:px-2 py-6 max-w-full flex flex-col gap-7 sm:gap-12 items-center min-h-screen font-sans relative"
        style={{
          background: `
            linear-gradient(135deg, #f7f6fa 60%, #e8d4fc 90%, #a7bffa 100%),
            radial-gradient(ellipse 70% 40% at 60% 0%, #f5d1fa55 40%, transparent 100%),
            radial-gradient(circle 60vw at 100vw 100vh, #a78bfa11 50%, transparent 100%),
            radial-gradient(circle 20vw at 10vw 100vh, #e0c09022 40%, transparent 100%)
          `
        }}
      >

        {/* Header */}
        <section className="text-center animate-fade-in space-y-2 w-full px-2">
          <h1 className="text-2xl sm:text-3xl font-title mb-1 text-[#1E2749] tracking-tight">Mon histoire 🌿</h1>
          <p className="text-base sm:text-lg text-gray-700">
            Racontez, agencez, annotez chaque moment de votre vie : composez votre propre livre vivant.
          </p>
          <div className="text-base sm:text-lg text-indigo-500 italic mt-3">{citation}</div>
        </section>

        {/* Atelier mobile : bouton flottant bas droite */}
        {!atelierOpen && (
          <button
            onClick={() => setAtelierOpen(true)}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full bg-[#2563EB] text-white font-bold px-7 py-3 shadow-lg hover:bg-indigo-700 transition-all sm:top-28 sm:right-6 sm:left-auto sm:bottom-auto sm:translate-x-0"
            aria-label="Ouvrir l'atelier"
          >
            🛠️
          </button>
        )}

        {/* LIVRE */}
        <section className={`w-full flex ${isMobile ? "flex-col" : "flex-row"} gap-4 sm:gap-8 justify-center items-start relative`}>
          {isMobile ? (
            <div className="flex flex-col items-center w-full sm:w-auto">
              <LivrePage
                title={`Page ${currentPage + 1}`}
                page={pages[currentPage]?.blocs || []}
                pageIdx={currentPage}
                onDropBloc={handleDropOnPage}
                onEditBloc={handleEditBloc}
                moveBloc={moveBlocWithinPage}
                onRemoveBloc={handleRemoveBloc}
                dndEnabled={false}
              />
              <div className="flex items-center gap-2 mt-3 justify-center w-full">
                <button
                  type="button"
                  className="p-2 rounded-xl bg-gray-100 text-xl font-bold shadow hover:bg-gray-200"
                  onClick={handlePrev}
                  disabled={currentPage === 0}
                  aria-label="Page précédente"
                >◀</button>
                <span className="font-bold text-base text-gray-700">
                  Page {currentPage + 1} / {pages.length}
                </span>
                <button
                  type="button"
                  className="p-2 rounded-xl bg-gray-100 text-xl font-bold shadow hover:bg-gray-200"
                  onClick={handleNext}
                  disabled={currentPage >= pages.length - 1}
                  aria-label="Page suivante"
                >▶</button>
              </div>
            </div>
          ) : (
            <div
              className="relative flex gap-0 min-w-[980px] max-w-[1300px] w-full mx-auto rounded-[2.5rem] shadow-[0_18px_48px_0_#baa06b,0_0_0_10px_#e8d4b7_inset] border-8 border-[#8d6840] bg-gradient-to-br from-[#f6eedc] via-[#ecd8b7] to-[#e0c090] ring-4 ring-[#b09058] transition-all duration-300"
              style={{
                boxShadow: "0 18px 48px 0 #baa06b, 0 0 0 10px #e8d4b7 inset",
                borderColor: "#8d6840",
                background: "linear-gradient(135deg,#f8efdb 65%,#ecd8b7 90%,#e0c090 100%)",
              }}
            >
              <div className="flex flex-row w-full h-full gap-10 px-10 py-4">
                <div className="w-1/2 h-full flex flex-col items-center">
                  <LivrePage
                    title={`Page ${currentDoublePage * 2 + 1}`}
                    page={pages[currentDoublePage * 2]?.blocs || []}
                    pageIdx={currentDoublePage * 2}
                    onDropBloc={handleDropOnPage}
                    onEditBloc={handleEditBloc}
                    moveBloc={moveBlocWithinPage}
                    onRemoveBloc={handleRemoveBloc}
                    dndEnabled={true}
                  />
                </div>
                <div className="w-1/2 h-full flex flex-col items-center">
                  <LivrePage
                    title={`Page ${currentDoublePage * 2 + 2}`}
                    page={pages[currentDoublePage * 2 + 1]?.blocs || []}
                    pageIdx={currentDoublePage * 2 + 1}
                    onDropBloc={handleDropOnPage}
                    onEditBloc={handleEditBloc}
                    moveBloc={moveBlocWithinPage}
                    onRemoveBloc={handleRemoveBloc}
                    dndEnabled={true}
                  />
                </div>
              </div>
              <div className="absolute top-3 bottom-3 left-1/2 w-5 -translate-x-1/2 bg-gradient-to-b from-[#ece7de] to-[#e2d8c5] shadow-inner rounded-full pointer-events-none opacity-80"></div>
            </div>
          )}

          {/* Atelier : modal mobile ou panneau desktop */}
          <div
            className={`fixed sm:static left-1/2 sm:left-auto bottom-0 z-50
              bg-white/95 shadow-2xl
              border-t sm:border border-indigo-100
              transition-transform duration-300
              flex flex-col
              ${atelierOpen ? "translate-y-0" : "translate-y-full sm:translate-y-0"}
              ${isMobile ? "rounded-2xl" : "sm:rounded-l-2xl sm:rounded-t-none"}
              ${isMobile ? "w-[340px] max-w-[97vw] mx-auto pb-3 pt-1 px-2" : "sm:w-[360px]"}
            `}
            style={{
              maxHeight: isMobile ? "74vh" : undefined,
              overflowY: "auto",
              right: isMobile ? "auto" : 0,
              left: isMobile ? "50%" : undefined,
              transform: isMobile && atelierOpen ? "translate(-50%, 0)" : undefined,
              display: atelierOpen ? "flex" : "none",
              boxShadow: isMobile ? "0 8px 48px 0 #a78bfa60, 0 0 0 2px #e5e7eb" : undefined,
            }}
          >
            {/* Contenu atelier */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg text-indigo-800">🛠️ Atelier</h3>
              <button
                className="text-xl font-bold text-gray-400 hover:text-indigo-600 px-2"
                onClick={() => setAtelierOpen(false)}
                aria-label="Fermer l'atelier"
              >✕</button>
            </div>
            {ATELIER_CATEGORIES.map((cat) => (
              <div key={cat.label} className="mb-1">
                <div className="text-indigo-800 font-semibold mb-1 text-sm text-center w-full">{cat.label}</div>
                {/* Ajout Import Photo si Souvenir Visuel */}
                {cat.label === "Souvenir Visuel" && (
  <div className="mb-3">
    <label
      htmlFor="input-import-photo"
      className="block cursor-pointer px-3 py-2 rounded bg-indigo-100 text-indigo-800 font-semibold shadow hover:bg-indigo-200 transition w-full text-center mx-auto"
      style={{ marginBottom: 4 }}
    >
      📷 Importer une photo
      <input
        id="input-import-photo"
        type="file"
        accept="image/*"
        onChange={handleImportPhoto}
        className="hidden"
      />
    </label>
  </div>
)}

{cat.label === "Souvenir Visuel" && atelierPhotos.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-2 justify-center">
    {atelierPhotos.map((url, idx) => (
      <PhotoMiniature
        key={url + idx}
        url={url}
        isMobile={isMobile}
        currentPage={currentPage}
        currentDoublePage={currentDoublePage}
        setPages={setPages}
        uuid={uuid}
        setAtelierPhotos={setAtelierPhotos}
        />
    ))}
  </div>
)}


                <div className="flex flex-wrap gap-2 mb-2 justify-center">
  {BLOCK_TYPES.filter(
    (b) =>
      cat.types.includes(b.type) &&
      !(cat.label === "Souvenir Visuel" && b.type === "photo") // 👈 On cache "Photo" dans cette catégorie
  ).map((b) => (
    <button
      key={b.type}
      type="button"
      onClick={() => addBlocAtelier(b.type)}
      className="px-3 py-1 rounded shadow-sm border text-sm font-semibold hover:bg-indigo-100"
      style={{
        background:
          b.type === "humeur"
            ? "#FEF5C1"
            : b.type === "valeur"
            ? "#E8F8F8"
            : "#F1F3FD",
      }}
      aria-label={`Ajouter un bloc ${b.label}`}
    >
      {b.icon} {b.label}
    </button>
  ))}
</div>

                <div className="flex flex-col gap-2">
                  {atelierBlocs
                    .filter((bloc) => cat.types.includes(bloc.type))
                    .map((bloc) => (
                      <BlocAtelierDraggable
                        key={bloc.id}
                        bloc={bloc}
                        onQuickAdd={() => handleQuickAddBloc(bloc)}
                        dndEnabled={!isMobile}
                      />
                    ))}
                </div>
              </div>
            ))}
            {atelierBlocs.length === 0 && (
              <div className="text-gray-800 text-sm text-center py-4">
                Cliquez sur un type de bloc pour le préparer, puis <b>{isMobile ? "ajoute-le sur la page" : "glissez-le sur une page"}.</b>
                <br />
                Pour annoter un bloc, {isMobile ? "utilise les options de la page" : <b>faites glisser "annoter" sur le bloc de votre choix !</b>}
              </div>
            )}
            {/* --- Poubelle & Annoter (desktop only) --- */}
            {!isMobile && (
              <div className="flex items-center gap-6 mt-auto px-2 mb-3 justify-center">
                <ToolTrashDropZone onDropBloc={handleRemoveBloc} />
                <ToolDraggable toolType="annoter" label="Annoter" icon="🗒️" />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddDoublePage}
              className="mt-2 w-full rounded-lg bg-[#faf5e9] border border-indigo-100 py-2 font-bold text-indigo-700 shadow hover:bg-[#f0e7d6] transition"
              aria-label="Ajouter une double page"
            >
              ➕ Ajouter une double page
            </button>
          </div>
        </section>

        {/* Pagination double page desktop */}
        {!isMobile && (
          <div className="flex items-center justify-center gap-4 mt-6 mb-2 w-full">
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full text-xl bg-[#ECE7DE] text-[#8d6840] font-bold shadow disabled:opacity-40"
              onClick={() => setCurrentDoublePage(Math.max(0, currentDoublePage - 1))}
              disabled={currentDoublePage === 0}
              aria-label="Double-page précédente"
            >◀</button>
            <span className="font-title text-lg text-[#8d6840] font-semibold">Double-page</span>
            <select
              className="rounded-lg border px-3 py-1 bg-[#FEF7ED] text-[#1E2749] text-base font-semibold shadow"
              value={currentDoublePage}
              onChange={e => setCurrentDoublePage(Number(e.target.value))}
              style={{ minWidth: 56 }}
              aria-label="Sélectionner une double-page"
            >
              {Array.from({ length: Math.ceil(pages.length / 2) }).map((_, i) => (
                <option key={i} value={i}>{i + 1}</option>
              ))}
            </select>
            <span className="text-[#8d6840] text-lg font-title">/ {Math.ceil(pages.length / 2)}</span>
            <button
              type="button"
              className="w-10 h-10 flex items-center justify-center rounded-full text-xl bg-[#ECE7DE] text-[#8d6840] font-bold shadow disabled:opacity-40"
              onClick={() => setCurrentDoublePage(Math.min(Math.ceil(pages.length / 2) - 1, currentDoublePage + 1))}
              disabled={currentDoublePage >= Math.ceil(pages.length / 2) - 1}
              aria-label="Double-page suivante"
            >▶</button>
          </div>
        )}

        <section className="text-center mt-2 space-y-2 w-full px-2">
          <p className="text-base text-gray-700">
            🎂 Prenez une photo de vous régulièrement pour voir votre évolution au fil du temps.
          </p>
        </section>

        {/* Feedback sauvegarde */}
        {saveState === "saving" && (
          <div className="fixed bottom-24 right-6 bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow z-50 animate-pulse">
            Sauvegarde en cours…
          </div>
        )}
        {saveState === "saved" && (
          <div className="fixed bottom-24 right-6 bg-green-100 text-green-800 px-4 py-2 rounded shadow z-50">
            ✅ Modifications sauvegardées
          </div>
        )}
        {saveState === "error" && (
          <div className="fixed bottom-24 right-6 bg-red-100 text-red-800 px-4 py-2 rounded shadow z-50">
            ❌ Erreur de sauvegarde
          </div>
        )}
      </main>
    </DndProvider>
  );
}

// ---- COMPOSANTS ENFANTS ----

function LivrePage(props: LivrePageProps ) {
  const { title, page, pageIdx, onDropBloc, onEditBloc, moveBloc, onRemoveBloc, dndEnabled } = props;

  // Drag&drop atelier (bloc) sur desktop uniquement
  const [, drop] = useDrop({
  accept: "ATELIER_BLOC",
  drop: dndEnabled ? (item: Bloc) => {
    console.log("DROP", item); // Teste ici pour voir le contenu
    onDropBloc(item, pageIdx); // Direct, pas de .bloc !
  } : undefined,
  canDrop: () => dndEnabled,
})

  return (
    <div className={`relative w-full max-w-[580px] min-w-[340px] flex flex-col items-center`}>
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 px-7 py-1 bg-gradient-to-br from-indigo-50 via-white to-indigo-100 text-indigo-800 border border-indigo-200 rounded-full shadow-md text-base font-bold tracking-wide select-none"
        style={{
          minWidth: "92px",
          letterSpacing: "0.02em",
          filter: "drop-shadow(0 4px 12px rgba(170,170,200,0.17))",
          opacity: 0.97,
        }}
      >{title}</div>
      <div
        ref={drop as any}
        className={`relative bg-[#FEF7ED] min-h-[320px] sm:min-h-[420px] w-full rounded-2xl sm:rounded-3xl border-2 border-[#e6dfd1] shadow-xl flex flex-col p-2 sm:p-5 gap-3 sm:gap-4 overflow-y-auto transition-transform transition-shadow duration-200 hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.015] hover:z-20`}
        style={{
          boxShadow: "0 4px 32px 0 #e5dfd5, 0 0 0 8px #fff inset, 0 1.5px 0 #e6dfd1 inset",
        }}
      >
        {page.length === 0 && (
          <div className="text-gray-300 text-center my-auto py-20 text-sm">
            {dndEnabled ? "Glissez ici un bloc depuis l’atelier" : "Ajoutez un bloc via l'atelier"}
          </div>
        )}
        {page.map((bloc, i) => (
          <BlocLivreDraggable
            key={bloc.id}
            bloc={bloc}
            pageIdx={pageIdx}
            idx={i}
            moveBloc={moveBloc}
            onEditBloc={onEditBloc}
            onRemoveBloc={onRemoveBloc}
            dndEnabled={dndEnabled}
          />
        ))}
      </div>
    </div>
  );
}

function BlocAtelierDraggable({ bloc, onQuickAdd, dndEnabled }: BlocAtelierDraggableProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "ATELIER_BLOC",
    item: { ...bloc },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: dndEnabled,
  });

  return (
    <div
      ref={dndEnabled ? (drag as any) : undefined}
      className={`rounded-lg p-2 text-sm font-semibold border shadow ${dndEnabled ? "cursor-move" : ""} select-none flex items-center gap-2 transition ${isDragging ? "opacity-30" : ""} ${
        bloc.type === "humeur"
          ? "bg-[#FEF5C1]"
          : bloc.type === "valeur"
          ? "bg-[#E8F8F8]"
          : "bg-indigo-50 text-indigo-700"
      }`}
      aria-label={`Bloc ${bloc.type.charAt(0).toUpperCase() + bloc.type.slice(1)}`}
    >
      {getBlocIcon(bloc.type)}
      {bloc.type === "texte" && "Texte"}
      {bloc.type === "valeur" && "Valeur"}
      {bloc.type === "citation" && "Citation"}
      {bloc.type === "photo" && "Photo"}
      {bloc.type === "humeur" && "Humeur"}
      {!dndEnabled && onQuickAdd && (
        <button
          type="button"
          className="ml-3 px-2 py-1 rounded bg-[#2563EB] text-white text-xs font-bold shadow hover:bg-indigo-700 transition"
          onClick={onQuickAdd}
          aria-label="Ajouter ce bloc à la page"
        >
          ➕ Ajouter
        </button>
      )}
    </div>
  );
}

function BlocLivreDraggable({
  bloc,
  pageIdx,
  idx,
  moveBloc,
  onEditBloc,
  onRemoveBloc,
  dndEnabled
}: BlocLivreDraggableProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [showAnnotInput, setShowAnnotInput] = React.useState(false);
  const [annotDraft, setAnnotDraft] = React.useState(bloc.annotation || "");
  const [showConfirm, setShowConfirm] = React.useState(false);


  const [{ isDragging }, drag] = useDrag({
    type: "LIVRE_BLOC",
    item: { idx, pageIdx }, // le point clé !
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: dndEnabled,
  });
  const router = useRouter();
  // --- INSÉRER AUTOMATIQUEMENT un bloc photo tout juste uploadé ---
   // DnD pour réorganisation et annotation
  const [, drop] = useDrop({
    accept: ["LIVRE_BLOC", "SPECIAL_TOOL"],
    drop: dndEnabled
      ? (item: any, monitor) => {
          if (monitor.getItemType() === "SPECIAL_TOOL") {
            if (item.toolType === "annoter") setShowAnnotInput(true);
            return;
          }
          if (item.idx !== idx) moveBloc(pageIdx, item.idx, idx);
        }
      : undefined,
    hover: dndEnabled
      ? (item: any, monitor) => {
          if (monitor.getItemType() === "LIVRE_BLOC" && item.idx !== idx) {
            moveBloc(pageIdx, item.idx, idx);
          }
        }
      : undefined,
    canDrop: () => dndEnabled,
  });

  if (dndEnabled) drag(drop(ref));

  // --- Content ---
  let content: React.ReactNode;
  if (bloc.type === "texte") {
  // Hook mobile (pour SSR/CSR)
  const isMobile = typeof window !== "undefined"
    ? window.matchMedia("(max-width: 640px)").matches
    : false;

  content = (
  <div className="relative group w-full">
    <textarea
      value={bloc.content || ""}
      onChange={e => onEditBloc(pageIdx, idx, { content: e.target.value })}
      placeholder="Écrivez ici votre souvenir, anecdote, étape…"
      className="w-full rounded p-2 border bg-white resize-none focus:outline-indigo-400"
      style={{
        height: bloc.height ?? 88,
        minHeight: 48,
        maxHeight: 600,
        userSelect: "text",          // ← FORCE la sélection texte
        WebkitUserSelect: "text",
        MozUserSelect: "text",
        msUserSelect: "text",
        touchAction: "manipulation", // ← Optimise les gestures sur mobile
        background: "#fff",          // ← Evite tout overlay transparent
      }}
      rows={3}
      aria-label="Texte"
      spellCheck={true}
      autoCorrect="on"
    />
    {/* Coin de redimensionnement (desktop) */}
    {!isMobile && (
      <div
        className="absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize opacity-70 hover:opacity-100"
        onMouseDown={e => {
  const startY = e.clientY;
  const startHeight = bloc.height ?? 88;
  function onMouseMove(e: MouseEvent) {
    const newHeight = Math.max(48, Math.min(600, startHeight + (e.clientY - startY)));
    onEditBloc(pageIdx, idx, { height: newHeight });
  }
  function onMouseUp() {
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  }
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
}}
      >
        <svg width="20" height="20" fill="none">
          <path d="M5 15 L15 15 L15 5" stroke="#888" strokeWidth="2"/>
        </svg>
      </div>
    )}
    {/* Sélecteur mobile */}
    {isMobile && (
      <select
        className="absolute bottom-1 right-1 text-xs rounded border bg-white px-1 py-0.5"
        value={bloc.height ?? 88}
        onChange={e =>
          onEditBloc(pageIdx, idx, { height: Number(e.target.value) })
        }
      >
        <option value={72}>Petit</option>
        <option value={110}>Moyen</option>
        <option value={170}>Grand</option>
        <option value={260}>Très grand</option>
      </select>
    )}
  </div>
);
  } else if (bloc.type === "valeur") {
    content = (
      <input
        value={bloc.content || ""}
        onChange={(e) => onEditBloc(pageIdx, idx, { content: e.target.value })}
        placeholder="Valeur importante…"
        className="w-full rounded p-2 border bg-white"
        aria-label="Valeur"
      />
    );
  } else if (bloc.type === "citation") {
    content = (
      <input
        value={bloc.content || ""}
        onChange={(e) => onEditBloc(pageIdx, idx, { content: e.target.value })}
        placeholder="Citation ou phrase forte…"
        className="w-full rounded p-2 border bg-white italic"
        aria-label="Citation"
      />
    );
  } else if (bloc.type === "photo") {
  content = (
    <div className="relative flex flex-col gap-2">
      {/* Affichage photo */}
      {bloc.content && (
        <img
          src={bloc.content || bloc.photo_url || ""}
          alt="Photo souvenir"
          className="rounded w-full max-h-44 object-contain border"
        />
      )}
    </div>
  );
}
 else if (bloc.type === "humeur") {
    content = (
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-2">
          <label htmlFor={`select-humeur-${bloc.id}`} className="font-semibold">
            Emoji
          </label>
          <select
            id={`select-humeur-${bloc.id}`}
            value={bloc.emoji || ""}
            onChange={e => onEditBloc(pageIdx, idx, { emoji: e.target.value })}
            className="rounded p-1 border bg-white text-2xl"
            aria-label="Emoji Humeur"
          >
            <option value="">🙂</option>
            <option value="😊">😊</option>
            <option value="😢">😢</option>
            <option value="😍">😍</option>
            <option value="😡">😡</option>
            <option value="😱">😱</option>
            <option value="😌">😌</option>
          </select>
        </div>
        <textarea
          value={bloc.content || ""}
          onChange={(e) => onEditBloc(pageIdx, idx, { content: e.target.value })}
          placeholder="Humeur du jour…"
          className="w-full rounded p-2 border bg-white resize-y overflow-auto"
          aria-label="Texte humeur"
          rows={1}
          style={{ minHeight: 36, maxHeight: 130 }}
        />
      </div>
    );
  }

  return (
  <div
    ref={ref} // ← très important, pour activer drag&drop !
    className={`relative bg-indigo-50 rounded-xl shadow flex flex-col gap-2 p-3 transition-opacity border ${
      isDragging ? "opacity-40" : ""
    }`}
    style={{ cursor: dndEnabled ? "grab" : "default" }}
    aria-label={`Bloc de type ${bloc.type}`}
  >
    
    <div
  className="font-bold text-indigo-900 flex items-center gap-2 mb-1 justify-between"
  style={{ cursor: dndEnabled ? "grab" : "default", userSelect: "none" }}
>
  <span>
    {getBlocIcon(bloc.type)}{" "}
    {bloc.type.charAt(0).toUpperCase() + bloc.type.slice(1)}
  </span>
  {bloc.type === "photo" && (
    <CoupDeCoeurButton
      isFavorite={bloc.coup_de_coeur ?? false}
      disabled={bloc.id.startsWith("temp-")}
      onToggle={async () => {
        if (bloc.id.startsWith("temp-")) {
          alert("Ajoutez d'abord ce souvenir à la page et attendez la sauvegarde avant de le partager.");
          return;
        }
        onEditBloc(pageIdx, idx, { coup_de_coeur: !bloc.coup_de_coeur });

        const { error } = await supabase
          .from("life_book_blocks")
          .update({ coup_de_coeur: !bloc.coup_de_coeur })
          .eq("id", bloc.id);

        if (error) {
          alert("Erreur lors de la mise à jour du coup de cœur : " + error.message);
          onEditBloc(pageIdx, idx, { coup_de_coeur: bloc.coup_de_coeur });
          return;
        }

        if (!bloc.coup_de_coeur) {
          router.push(`/transmission?selected=${bloc.id}&type=livre`);
        }
      }}
    />
  )}
</div>



    {content}

      {showAnnotInput && (
        <div className="mt-2 flex flex-col gap-2">
          <textarea
            className="w-full rounded p-2 border bg-yellow-50 text-yellow-800"
            placeholder="Ajoutez une annotation (privée, commentaire, rappel...)"
            value={annotDraft}
            onChange={(e) => setAnnotDraft(e.target.value)}
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 shadow"
              onClick={() => {
                onEditBloc(pageIdx, idx, { annotation: annotDraft });
                setShowAnnotInput(false);
              }}
            >
              Sauvegarder
            </button>
            <button
              type="button"
              className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700 shadow"
              onClick={() => setShowAnnotInput(false)}
            >
              Annuler
            </button>
            {bloc.annotation && (
              <button
                type="button"
                className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 shadow"
                onClick={() => {
                  onEditBloc(pageIdx, idx, { annotation: "" });
                  setAnnotDraft("");
                  setShowAnnotInput(false);
                }}
              >
                Supprimer l’annotation
              </button>
            )}
          </div>
        </div>
      )}
      {bloc.annotation && !showAnnotInput && (
        <div className="mt-1 text-sm text-yellow-700 italic bg-yellow-50 p-2 rounded">
          {bloc.annotation}
        </div>
      )}
      {!dndEnabled && (
  <button
    className={
      "absolute top-1 " +
      (typeof window !== "undefined" && window.innerWidth < 640 ? "left-1" : "right-1") +
      " text-[10px] px-0.5 py-0.5 rounded bg-red-50 text-red-500 shadow-none border border-red-100"
    }
    style={{
      minWidth: 16, minHeight: 16, zIndex: 20, lineHeight: "12px"
    }}
    onClick={() => {
      if (typeof window !== "undefined" && window.innerWidth < 640) {
        setShowConfirm(true); // ← ouvre la modale sur mobile
        return;
      }
      onRemoveBloc(pageIdx, idx); // suppression directe sur desktop
    }}
    aria-label="Supprimer le bloc"
  >✕</button>
)}



      {!dndEnabled && (
        <button
          className="absolute bottom-1 right-1 text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 font-bold shadow"
          onClick={() => setShowAnnotInput(true)}
          aria-label="Annoter le bloc"
        >🗒️</button>
      )}
      {showConfirm && (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-2xl shadow-2xl px-7 py-7 w-80 max-w-[92vw] flex flex-col items-center border border-[#A78BFA]">
          <div className="text-lg font-title text-[#1E2749] font-bold mb-3">
            Supprimer ce bloc ?
          </div>
          <div className="text-sm text-gray-700 mb-6 text-center">
            Cette action est <span className="text-[#F2994A] font-semibold">définitive</span>.<br />
            Voulez-vous continuer ?
          </div>
          <div className="flex gap-3 w-full justify-center">
            <button
              className="px-5 py-2 rounded-xl bg-[#2563EB] text-white font-bold shadow hover:bg-[#1744ad] transition"
              onClick={() => {
                setShowConfirm(false);
                onRemoveBloc(pageIdx, idx);
              }}
            >
              Oui, supprimer
            </button>
            <button
              className="px-5 py-2 rounded-xl bg-gray-100 text-[#1E2749] font-semibold shadow hover:bg-gray-200 transition"
              onClick={() => setShowConfirm(false)}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    )}

  </div>
);
    
}
function ToolTrashDropZone({ onDropBloc }: { onDropBloc: (pageIdx: number, blocIdx: number) => void }) {
  const [{ isOver }, drop] = useDrop({
    accept: "LIVRE_BLOC",
    drop: (item: { idx: number; pageIdx: number }) => {
      if (typeof item.pageIdx === "number" && typeof item.idx === "number") {
        onDropBloc(item.pageIdx, item.idx);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  return (
    <div
      ref={drop as any}
      className={`
        flex flex-col items-center cursor-pointer select-none
        ${isOver ? "scale-110 bg-red-200" : ""}
        p-2 rounded-xl transition
      `}
    >
      <span className="text-3xl">🗑️</span>
      <span className="text-xs text-red-700 font-semibold">Poubelle</span>
    </div>
  );
}

function getBlocIcon(type: BlocType) {
  if (type === "texte") return "✍️";
  if (type === "valeur") return "💎";
  if (type === "citation") return "💬";
  if (type === "photo") return "📷";
  if (type === "humeur") return "😊";
  return "📝";
}

