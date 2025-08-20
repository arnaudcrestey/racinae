"use client";

import { useState, useEffect } from "react";
import { Award, Gift, Star, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import { useUserStats } from "../../context/UserStatsContext";

// Types
type Capsule = {
  id: string;
  user_id: string;
  send_date: string;
  recipient_name: string;
  recipient_email: string;
  relation: string;
  title: string;
  content?: string | null;
  photo_url?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  referents: string[];
  status: string;
  duree: string;
  created_at: string;
  sent: boolean;
};

// Constants

const CITATIONS = [
  "« Sceller une mémoire, c'est offrir un soleil au futur. »",
  "« Les mots semés maintenant feront grandir la forêt de demain. »",
  "« Une capsule d'amour traverse le temps... »"
];

const DUREE_OPTIONS = [
  { val: "1an", label: "Dans l'année" },
  { val: "5ans", label: "Entre 1 an et 5 ans" },
  { val: "10ans", label: "Au-delà de 5 ans" }
];

const CONTENT_TYPES = [
  { type: "texte", icon: "✏️", label: "Texte" },
  { type: "photo", icon: "📷", label: "Photo" },
  { type: "audio", icon: "🎤", label: "Audio" },
  { type: "video", icon: "🎥", label: "Vidéo" }
];

// Utility Functions
function validateEmail(email: string): boolean {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email);
}

async function uploadToSupabase(type: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop();
  const filePath = `${type}s/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("courriers").upload(filePath, file);
  if (error) throw error;

  const { data } = supabase.storage.from("courriers").getPublicUrl(filePath);
  return data.publicUrl;
}

async function notifyReferents(referents: string[], capsule: Capsule): Promise<void> {
  const resendApiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (!resendApiKey) return;

  const emailPromises = referents.map(email =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Racinae <no-reply@racinae.com>",
        to: email,
        subject: `Capsule temporelle confiée à ${capsule.recipient_name}`,
        html: `
          <p>Une capsule du temps a été scellée pour <b>${capsule.recipient_name}</b> avec vous comme référent(e).</p>
          <p>Merci pour votre confiance !<br/>L'équipe Racinae</p>
        `
      })
    })
  );

  await Promise.all(emailPromises);
}

export default function CourrierDuTempsPage() {
  const user = useUser();
  const { stats, setStats } = useUserStats();
  console.log("STATS →", stats);

  // 👇 COPIE exactement ces lignes après const { stats, setStats }...
const graines = stats?.graines ?? 0;
const clesOr = Math.floor((graines % 5000) / 1000);
const etoiles =Math.floor(graines / 5000);


  // UI State
  
  const [step, setStep] = useState<"form" | "payment">("form");
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [citation, setCitation] = useState("");

  // Form Fields
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [recipient, setRecipient] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [recipientEmailError, setRecipientEmailError] = useState("");
  const [relation, setRelation] = useState("");
  const [referents, setReferents] = useState("");
  const [date, setDate] = useState("");
  const [duree, setDuree] = useState("1an");
  const [title, setTitle] = useState("");

  // Data State
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  
  // Effects
  useEffect(() => {
    setCitation(CITATIONS[Math.floor(Math.random() * CITATIONS.length)]);
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchCapsules() {
      const { data, error } = await supabase
        .from("time_capsules")
        .select("*")
.eq("user_id", user?.id || "")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCapsules(data as Capsule[]);
        setStats((prev: any) => ({
          ...prev,
          courriers: (data as Capsule[]).map(c => ({
            id: c.id,
            destinataire: c.recipient_name,
            referents: c.referents,
            date: c.send_date,
            status: c.sent,
            duree: c.duree
          }))
        }));
      }
    }

    fetchCapsules();
  }, [user, showSuccess, setStats]);

  // Handlers
  const toggleType = (type: string) => {
    setSelectedTypes(types =>
      types.includes(type) 
        ? types.filter(t => t !== type) 
        : [...types, type]
    );
  };

  const resetForm = () => {
    setSelectedTypes([]);
    setContent("");
    setPhoto(null);
    setAudio(null);
    setVideo(null);
    setRecipient("");
    setRecipientEmail("");
    setRelation("");
    setReferents("");
    setDate("");
    setDuree("1an");
    setTitle("");
  };

  const validateForm = (): boolean => {
    // Email validation
    if (!validateEmail(recipientEmail)) {
      setRecipientEmailError("Adresse e-mail invalide.");
      return false;
    }
    setRecipientEmailError("");

    // Required fields validation
    const referentsList = referents.split(",").map(r => r.trim()).filter(r => r);
    const hasContent = selectedTypes.some(type => {
      switch (type) {
        case "texte": return content.trim() !== "";
        case "photo": return photo !== null;
        case "audio": return audio !== null;
        case "video": return video !== null;
        default: return false;
      }
    });

    return !!(
      recipient &&
      recipientEmail &&
      referentsList.length >= 2 &&
      date &&
      selectedTypes.length > 0 &&
      hasContent
    );
  };

  const handleAddCapsule = async () => {
    if (!validateForm()) {
      alert("Merci de remplir tous les champs obligatoires et au moins un contenu.");
      setStep("form");
      return;
    }

    if (!user) {
      alert("Utilisateur non connecté");
      setStep("form");
      return;
    }

    setUploading(true);

    try {
      // Upload files
      const [photoUrl, audioUrl, videoUrl] = await Promise.all([
        selectedTypes.includes("photo") && photo ? uploadToSupabase("photo", photo) : null,
        selectedTypes.includes("audio") && audio ? uploadToSupabase("audio", audio) : null,
        selectedTypes.includes("video") && video ? uploadToSupabase("video", video) : null
      ]);

      // Insert capsule
      const insertRes = await supabase.from("time_capsules").insert([{
        user_id: user.id,
        send_date: date,
        recipient_name: recipient,
        recipient_email: recipientEmail,
        relation,
        title: title || "Capsule sans titre",
        content: selectedTypes.includes("texte") ? content : null,
        photo_url: photoUrl,
        audio_url: audioUrl,
        video_url: videoUrl,
        referents: referents.split(",").map(r => r.trim()),
        status: "Offert",
        duree,
        created_at: new Date().toISOString(),
        sent: false
      }]).select("*");

      const newCapsule = insertRes.data?.[0];
      if (insertRes.error || !newCapsule) {
        throw new Error(insertRes.error?.message || "Erreur inconnue");
      }

      // Notify referents
      try {
        await notifyReferents(referents.split(",").map(r => r.trim()), newCapsule);
      } catch (e) {
        console.warn("Erreur lors de l'envoi des emails aux référents:", e);
      }

      // Success
      resetForm();
      setUploading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2700);
      const { data, error } = await supabase
  .from("profiles")
  .select("graines_semees")
  .eq("id", user.id)
  .single();
if (!error && data) {
  setStats((prev: any) => ({
    ...prev,
    graines: data.graines_semees ?? 0
  }));
}
    } catch (err: any) {
      alert("Erreur lors de la création : " + err.message);
      setUploading(false);
      setStep("form");
    }
  };

  

  const calculateDaysUntil = (sendDate: string): number | null => {
    const now = new Date();
    const target = new Date(sendDate);
    if (isNaN(target.getTime())) return null;
    return Math.max(0, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  // Render
  return (
    <main 
      className="px-2 sm:px-6 py-4 sm:py-8 w-full max-w-full flex flex-col gap-6 sm:gap-12 items-center min-h-screen font-sans relative"
      style={{
        background: `linear-gradient(120deg, #f7f7fa 0%, #a7bffa 55%, #a78bfa 100%), radial-gradient(circle 60vw at 70vw 90vh, #f3cb7b33 0%, transparent 100%)`
      }}
    >
      {/* Header */}
      <section className="w-full max-w-md sm:max-w-2xl mx-auto text-center space-y-2 animate-fade-in">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-title flex items-center justify-center gap-2 mb-1">
          📜Le Courrier du Temps
        </h1>
        
        <div className="flex flex-col xs:flex-row md:flex-row justify-center gap-2 sm:gap-3 items-center">
  <div className="flex gap-1 sm:gap-2 items-center">
    <Award size={20} className="text-[#F2994A]" />
    <span className="font-bold text-sm sm:text-base">{clesOr}</span>
    <span className="text-xs sm:text-sm">clé{clesOr > 1 ? "s" : ""} d'or</span>
  </div>
  <div className="flex gap-1 sm:gap-2 items-center">
    <Star size={20} className="text-yellow-400" />
    <span className="font-bold text-sm sm:text-base">{etoiles}</span>
    <span className="text-xs sm:text-sm">étoile{etoiles > 1 ? "s" : ""}</span>
  </div>
</div>



        <motion.p 
          className="italic text-xs sm:text-base text-[#666] mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1 } }}
        >
          {citation}
        </motion.p>

        <div className="mt-2 flex flex-col items-center">
          <span className="rounded-full bg-gradient-to-r from-[#F2994A22] to-[#A78BFA22] px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#1E2749] shadow">
            Stockage multi-cloud, chiffrement suprême, contrat légal, référents de confiance.
          </span>
        </div>
      </section>

      {/* Form */}
      <section className="space-y-8 animate-fade-in-up bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-2xl p-3 sm:p-6 border max-w-xs xs:max-w-sm sm:max-w-xl mx-auto w-full relative mt-2">
        <div className="flex justify-center">
          <span className="relative inline-block">
            <motion.span 
              className="text-[56px] xs:text-[72px] select-none"
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              💌
            </motion.span>
            <motion.span 
              className="absolute -right-6 xs:-right-8 -top-2 text-[26px] xs:text-[32px] drop-shadow-2xl select-none"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            >
              🔒
            </motion.span>
          </span>
        </div>

        <motion.h2 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl xs:text-2xl md:text-3xl font-title font-semibold text-center mb-1 bg-gradient-to-r from-[#A78BFA] via-[#F2994A] to-[#2563EB] bg-clip-text text-transparent drop-shadow-lg"
        >
          Envoyer une capsule dans le temps
        </motion.h2>

        <div className="mx-auto w-1/2 sm:w-2/3 h-1 bg-gradient-to-r from-[#A78BFA33] via-[#F2994A33] to-[#2563EB33] rounded-full mb-4"></div>

        {/* Duration selector */}
        <div className="flex gap-2 justify-center mb-2 flex-wrap">
          {DUREE_OPTIONS.map(item => (
            <button
              key={item.val}
              onClick={() => setDuree(item.val)}
              className={`rounded-full px-4 py-2 font-semibold border shadow transition text-xs sm:text-base ${
                duree === item.val 
                  ? "bg-gradient-to-r from-[#A78BFA] to-[#F2994A] text-white scale-105" 
                  : "bg-white text-[#1E2749]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Title and recipient fields */}
        <input 
          type="text" 
          placeholder="Titre (facultatif)" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-2 sm:p-3 border rounded bg-white shadow text-sm sm:text-base mb-2" 
        />

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input 
            type="text" 
            placeholder="Prénom du destinataire"
            value={recipient} 
            onChange={e => setRecipient(e.target.value)}
            className="w-full p-2 sm:p-3 border rounded bg-white shadow text-sm sm:text-base"
          />
          <input 
            type="text" 
            placeholder="Relation (fille, ami, petite-fille...)"
            value={relation} 
            onChange={e => setRelation(e.target.value)}
            className="w-full p-2 sm:p-3 border rounded bg-white shadow text-sm sm:text-base"
          />
        </div>

        {/* Content type selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-2">
          {CONTENT_TYPES.map(item => (
            <button
              key={item.type}
              type="button"
              onClick={() => toggleType(item.type)}
              className={`p-2 sm:p-4 rounded-lg sm:rounded-xl w-full shadow flex flex-col items-center space-y-1 sm:space-y-2 border transition ${
                selectedTypes.includes(item.type) 
                  ? "bg-[#A78BFA] text-white scale-105" 
                  : "bg-white text-gray-700"
              }`}
            >
              <span className="text-2xl sm:text-3xl">{item.icon}</span>
              <span className="text-xs sm:text-base">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic content fields */}
        {selectedTypes.includes("texte") && (
          <textarea
            placeholder="Écris ton message pour le futur..."
            rows={4}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-2 sm:p-3 border rounded bg-white shadow mt-2 text-sm sm:text-base"
          />
        )}

        {selectedTypes.includes("photo") && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={e => setPhoto(e.target.files?.[0] || null)}
              className="w-full p-2 sm:p-3 border rounded bg-white shadow mt-2 text-xs"
            />
            {photo && (
              <div className="flex justify-center mt-2">
                <img
                  src={URL.createObjectURL(photo)}
                  alt="Prévisualisation"
                  className="w-32 h-32 object-cover rounded-xl shadow border"
                />
              </div>
            )}
          </>
        )}

        {selectedTypes.includes("audio") && (
          <input
            type="file"
            accept="audio/*"
            onChange={e => setAudio(e.target.files?.[0] || null)}
            className="w-full p-2 sm:p-3 border rounded bg-white shadow mt-2 text-xs"
          />
        )}

        {selectedTypes.includes("video") && (
          <input
            type="file"
            accept="video/*"
            onChange={e => setVideo(e.target.files?.[0] || null)}
            className="w-full p-2 sm:p-3 border rounded bg-white shadow mt-2 text-xs"
          />
        )}

        {/* Referents and date */}
        <input
          type="text"
          placeholder="Référents de confiance (2 minimum, séparés par virgule)"
          value={referents}
          onChange={e => setReferents(e.target.value)}
          className="w-full p-2 sm:p-3 border rounded bg-white shadow mt-2 text-sm sm:text-base"
        />

        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full p-2 sm:p-3 border rounded bg-white shadow mt-2 text-sm sm:text-base"
        />

        {/* Recipient email */}
        <input
          type="email"
          placeholder="Adresse e-mail du destinataire"
          value={recipientEmail}
          onChange={e => setRecipientEmail(e.target.value)}
          className={`w-full p-2 sm:p-3 border rounded bg-white shadow mt-2 text-sm sm:text-base ${
            recipientEmailError ? "border-red-400" : ""
          }`}
          required
        />
        {recipientEmailError && (
          <div className="text-red-500 text-xs mt-1">{recipientEmailError}</div>
        )}

        {/* Submit button */}
        <button
          onClick={() => setStep("payment")}
          disabled={uploading}
          className={`w-full inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 text-base font-semibold text-white bg-gradient-to-r from-[#2563EB] via-[#A78BFA] to-[#F2994A] rounded-full shadow-lg hover:scale-105 transition gap-2 mt-2 ${
            uploading ? "opacity-50 pointer-events-none" : ""
          }`}
          style={{
            boxShadow: "0 4px 20px 0 #A78BFA22, 0 1.5px 5px 0 #2563EB11"
          }}
        >
          <Send size={20} /> 
          {uploading ? "Chargement..." : "Fermer ma capsule et la confier au temps ✨"}
        </button>
      </section>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#FEF7EDcc] backdrop-blur-sm animate-fade-in">
          <motion.div
            initial={{ y: 180, opacity: 0, scale: 0.8 }}
            animate={{ y: -40, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -300 }}
            transition={{ duration: 1.2, type: "spring" }}
            className="flex flex-col items-center"
          >
            <span className="text-[56px] xs:text-[84px] mb-2 animate-bounce-slow select-none">💌</span>
            <motion.span
              className="absolute text-[32px] xs:text-[42px] left-1/2 -translate-x-1/2 -mt-[100px] select-none"
              animate={{ rotate: [0, 18, -10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              🚀
            </motion.span>
            <div className="text-xl xs:text-2xl font-bold text-[#1E2749] mt-5 drop-shadow-xl animate-pulse">
              Ta capsule s'envole vers demain...
            </div>
            <div className="text-base xs:text-lg text-[#A78BFA] mt-2">Un feu d'artifice d'émotion 💫</div>
            <div className="mt-3 flex gap-1 text-xl xs:text-2xl">
              <span>🎆</span><span>✨</span><span>🎇</span><span>🌠</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Timeline */}
      <section className="w-full max-w-xs xs:max-w-sm sm:max-w-xl mx-auto mt-2">
        <h3 className="text-base sm:text-lg font-title text-[#1E2749] mb-2 sm:mb-3 flex items-center gap-2">
          📜 Mes capsules temporelles programmées
        </h3>
        
        <div className="flex flex-col gap-2 sm:gap-4">
          {capsules.map(c => {
            const delta = calculateDaysUntil(c.send_date);
            
            return (
              <div
                key={c.id}
                className="p-2 sm:p-3 bg-white/80 rounded-lg shadow flex flex-col md:flex-row md:justify-between md:items-center gap-1 border"
              >
                <div>
                  <p className="font-semibold text-sm sm:text-base">{c.title || "Capsule sans titre"}</p>
                  <p className="text-xs text-[#A78BFA]">Pour : <b>{c.recipient_name || "?"}</b></p>
                  <p className="text-xs text-gray-500">
                    {delta !== null 
                      ? <>À ouvrir dans <b>{delta}</b> jour{delta > 1 ? "s" : ""} (le {c.send_date})</>
                      : <>Date inconnue</>
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    Référents : {Array.isArray(c.referents) ? c.referents.join(", ") : c.referents}
                  </p>
                  
                  <div className="flex gap-1 mt-1">
                    {c.content && <span className="px-2 py-1 rounded bg-[#A78BFA22] text-[#A78BFA] text-xs">Texte</span>}
                    {c.photo_url && <span className="px-2 py-1 rounded bg-[#10B98122] text-[#10B981] text-xs">Photo</span>}
                    {c.audio_url && <span className="px-2 py-1 rounded bg-[#F2994A22] text-[#F2994A] text-xs">Audio</span>}
                    {c.video_url && <span className="px-2 py-1 rounded bg-[#2563EB22] text-[#2563EB] text-xs">Vidéo</span>}
                  </div>
                  
                  {c.photo_url && (
                    <a href={c.photo_url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={c.photo_url}
                        alt="Photo capsule"
                        className="w-20 h-20 object-cover rounded-lg shadow border mt-2 hover:scale-105 transition"
                        style={{ maxWidth: 96, maxHeight: 96 }}
                      />
                    </a>
                  )}
                </div>
                
                <span className={`text-xs font-bold px-3 py-1 rounded-full shadow ${
                  c.status === "Offert" 
                    ? "bg-[#A78BFA22] text-[#A78BFA]" 
                    : "bg-[#F2994A22] text-[#F2994A]"
                }`}>
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Payment Modal */}
      {step === "payment" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E274988] backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl p-5 sm:p-8 shadow-xl max-w-xs w-full flex flex-col items-center gap-3 animate-fade-in-up">
            <span className="text-3xl sm:text-4xl">💳</span>
            <div className="text-base sm:text-lg font-bold text-[#1E2749] mb-2">Paiement de la capsule</div>
            <div className="text-sm sm:text-base mb-2 text-[#666] text-center">
              Cette capsule sera scellée et transmise dans le temps.<br />
              <b>Prix : 0,00 €</b>
            </div>
            
            <button
              className="button-racinae mt-2"
              disabled={uploading}
              onClick={async () => {
                await handleAddCapsule();
                setStep("form");
              }}
            >
              {uploading ? "Envoi en cours..." : "Payer & sceller ma capsule"}
            </button>
            
            <button
              className="text-[#A78BFA] mt-1 text-xs"
              onClick={() => setStep("form")}
              disabled={uploading}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </main>
  );
}