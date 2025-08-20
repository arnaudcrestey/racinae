"use client";
import { useState, useEffect } from "react";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  const [souvenir, setSouvenir] = useState<any>(null);
  const [reponse, setReponse] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/get-souvenir?id=${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (!data) setError("Souvenir introuvable.");
        else setSouvenir(data);
      })
      .catch(() => setError("Erreur de chargement."));
  }, [params?.id]);

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

  if (error) return <main>❌ {error}</main>;
  if (!souvenir) return <main>⏳ Chargement…</main>;
  if (sent) return <main>✅ Merci ! Réponse envoyée.</main>;

  return (
    <main>
      <h1>Souvenir {params.id}</h1>
      <p>{souvenir.message}</p>
      <textarea value={reponse} onChange={e => setReponse(e.target.value)} />
      <button onClick={handleReply} disabled={!reponse.trim() || loading}>
        {loading ? "Envoi…" : "Envoyer"}
      </button>
    </main>
  );
}
