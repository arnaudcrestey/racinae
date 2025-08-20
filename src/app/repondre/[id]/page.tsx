"use client";

import { useState, useEffect } from "react";

// Typage des props (params) + souvenir
interface PageProps {
  params: { id: string };
}

interface Souvenir {
  id: string;
  message: string;
  photo_url?: string | null;
}

export default function Page({ params }: PageProps) {
  const [souvenir, setSouvenir] = useState<Souvenir | null>(null);
  const [reponse, setReponse] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupération du souvenir
  useEffect(() => {
    const fetchSouvenir = async () => {
      try {
        const res = await fetch(`/api/get-souvenir?id=${params.id}`);
        if (!res.ok) throw new Error("Erreur serveur");
        const data = await res.json();
        if (!data) setError("Souvenir introuvable.");
        else setSouvenir(data);
      } catch (err) {
        setError("Erreur de chargement.");
      }
    };
    fetchSouvenir();
  }, [params.id]);

  // Envoi de la réponse
  const handleReply = async () => {
    setLoading(true);
    setError(null);

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

  // États de rendu
  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow text-red-500 font-semibold">
          ❌ {error}
        </div>
      </main>
    );
  }

  if (!souvenir) {
    return (
      <main className="min-h-screen flex items-center justify-center text-blue-600">
        ⏳ Chargement…
      </main>
    );
  }

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-xl shadow text-green-600 font-semibold text-center">
          ✅ Merci 💌<br />
          Votre réponse a bien été envoyée !
        </div>
      </main>
    );
  }

  // Affichage principal
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#f6fafd] via-[#dbeafe] to-[#a7bffa33]">
      <section className="bg-white max-w-md w-full rounded-xl shadow-lg p-6 flex flex-col items-center gap-5">
        <h1 className="text-2xl font-bold text-[#1E2749]">Souvenir reçu 💌</h1>

        {souvenir.photo_url && (
          <img
            src={souvenir.photo_url}
            alt="Souvenir"
            className="w-36 h-36 rounded-xl object-cover shadow"
          />
        )}

        <p className="text-lg text-[#1E2749] text-center">{souvenir.message}</p>

        <textarea
          placeholder="Votre réponse à ce souvenir…"
          className="border border-[#A78BFA] p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#A78BFA] transition resize-none"
          rows={4}
          value={reponse}
          onChange={(e) => setReponse(e.target.value)}
          maxLength={1000}
        />

        <button
          className="bg-gradient-to-r from-[#2563eb] to-[#A78BFA] text-white px-6 py-3 rounded-xl font-semibold shadow hover:scale-105 transition disabled:opacity-50"
          onClick={handleReply}
          disabled={!reponse.trim() || loading}
        >
          {loading ? "Envoi…" : "Envoyer ma réponse"}
        </button>

        <p className="text-xs text-gray-400 mt-2 text-center">
          Merci, votre message restera confidentiel et ira directement à la
          personne qui vous a partagé ce souvenir.
        </p>
      </section>
    </main>
  );
}
