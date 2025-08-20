"use client";
import { useState, useEffect } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const [souvenir, setSouvenir] = useState<any>(null);
  const [reponse, setReponse] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // On va chercher le souvenir quand la page charge
  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/get-souvenir?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) setError("Souvenir introuvable.");
        else setSouvenir(data);
      })
      .catch(() => setError("Erreur de chargement."));
  }, [params?.id]);

  // Quand on clique sur "Envoyer"
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

  // Affichage selon l'état
  if (error) return <main>❌ {error}</main>;
  if (!souvenir) return <main>⏳ Chargement…</main>;
  if (sent) return <main>✅ Merci ! Réponse envoyée.</main>;

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Souvenir {params.id}</h1>
      <p>{souvenir.message}</p>

      <textarea
        value={reponse}
        onChange={(e) => setReponse(e.target.value)}
        placeholder="Écrivez votre réponse ici..."
        style={{ display: "block", width: "100%", minHeight: "100px", margin: "1rem 0" }}
      />

      <button onClick={handleReply} disabled={!reponse.trim() || loading}>
        {loading ? "Envoi…" : "Envoyer"}
      </button>
    </main>
  );
}
