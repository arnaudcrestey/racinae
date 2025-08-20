"use client";
import { useState, useEffect } from "react";

// Typage Next.js pour params dynamiques
type PageProps = { params: { id: string } };

export default function Page({ params }: PageProps) {
  const [souvenir, setSouvenir] = useState<any>(null);
  const [reponse, setReponse] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Récupère le souvenir à afficher (par l’id dans l’URL)
  useEffect(() => {
    fetch(`/api/get-souvenir?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data) setError("Souvenir introuvable.");
        else setSouvenir(data);
      })
      .catch(() => setError("Erreur de chargement."));
  }, [params.id]);

  // Envoie la réponse
  const handleReply = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/repondre-souvenir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id, reponse }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Impossible d'envoyer votre réponse.");
    } finally {
      setLoading(false);
    }
  };

  if (error) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow text-center text-red-500 font-semibold">{error}</div>
    </main>
  );

  if (!souvenir) return (
    <main className="min-h-screen flex items-center justify-center text-[#2563eb]">
      <div>Chargement…</div>
    </main>
  );

  if (sent) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow text-center text-[#10B981] font-semibold">
        Merci 💌<br />Votre réponse a bien été transmise.
      </div>
    </main>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#f6fafd] via-[#dbeafe] to-[#a7bffa33]">
      <section className="bg-white max-w-md w-full rounded-xl shadow-lg p-6 flex flex-col items-center gap-5 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-[#1E2749] mb-1">Souvenir reçu 💌</h1>
        {souvenir.photo_url && (
          <img
            src={souvenir.photo_url}
            alt="souvenir"
            className="w-36 h-36 rounded-xl object-cover mb-2 shadow"
          />
        )}
        <div className="text-lg text-[#1E2749] text-center mb-1">{souvenir.message}</div>
        <textarea
          placeholder="Votre réponse à ce souvenir…"
          className="border border-[#A78BFA] p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition mb-2 resize-none"
          rows={4}
          value={reponse}
          onChange={e => setReponse(e.target.value)}
          maxLength={1000}
        />
        <button
          className="bg-gradient-to-r from-[#2563eb] to-[#A78BFA] text-white px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition disabled:opacity-50"
          onClick={handleReply}
          disabled={!reponse.trim() || loading}
        >
          {loading ? "Envoi…" : "Envoyer ma réponse"}
        </button>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <p className="text-xs text-gray-400 mt-3">
          Merci, votre message restera confidentiel et ira directement à la personne qui vous a partagé ce souvenir.
        </p>
      </section>
    </main>
  );
}
