'use client';

import { useEffect, useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function MonComptePage() {
  const [user, setUser] = useState<any>(null);
  const [prenom, setPrenom] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // Pour la preview locale
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  // 1. Lecture du profil à chaque affichage
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth?requireAuth=1");
        return;
      }
      setUser(user);

      // Lecture du profil (y compris avatar_url)
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .single();

      setPrenom(data?.full_name || "");
      setAvatarUrl(data?.avatar_url || "");
    })();
  }, [router]);

  // 2. Upload avatar et sauvegarde dans Supabase
  const handleAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    setLoading(true);
    setMessage(null);

    const file = e.target.files[0];

    // 2.1 Afficher la preview immédiate de la nouvelle image
    setAvatarPreview(URL.createObjectURL(file));

    const ext = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${ext}`;

    // 2.2 Upload dans Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      setMessage("Erreur upload avatar : accès refusé (voir sécurité Supabase)");
      setLoading(false);
      return;
    }

    // 2.3 Obtenir l'URL publique et ajouter un cache-buster
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = data.publicUrl + `?t=${Date.now()}`;

    // 2.4 Sauvegarder l'URL dans le profil
    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    setAvatarUrl(publicUrl);     // On met à jour l'image affichée (définitive)
    setAvatarPreview(null);      // On retire la preview (devient l'image réelle)
    setLoading(false);

    setMessage("✅ Photo de profil mise à jour !");
    window.dispatchEvent(new Event('avatar-updated'));
  };

  // 3. Sauvegarder le prénom
  const handleSave = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: prenom })
      .eq("id", user.id);

    if (error) setMessage("Erreur sauvegarde : " + error.message);
    else setMessage("✅ Profil enregistré !");
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1E2749] to-[#2563EB] px-4">
      <form
        onSubmit={handleSave}
        className="bg-white/90 rounded-2xl shadow-xl px-6 py-8 w-full max-w-sm flex flex-col gap-4"
        autoComplete="off"
      >
        <h2 className="text-xl font-serif font-bold text-[#1E2749] mb-3 text-center">
          Mon Compte
        </h2>

        {/* Avatar */}
        <div className="flex flex-col items-center gap-2 mb-2 relative">
          {(avatarPreview || avatarUrl)
            ? <img src={avatarPreview || avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover border" />
            : <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-4xl">🙂</div>
          }
          {/* Animation de chargement (optionnel) */}
          {loading && (
            <div className="absolute w-24 h-24 rounded-full border-4 border-blue-400 animate-pulse opacity-70"></div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatar}
            disabled={loading}
            className="block"
            title="Changer la photo de profil"
          />
        </div>

        {/* Prénom */}
        <div>
          <label className="block font-medium mb-1">Votre prénom ou surnom</label>
          <input
            type="text"
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            disabled={loading}
            placeholder="Votre prénom"
            autoFocus
          />
        </div>

        {/* Message feedback */}
        {message && (
          <div className={`text-center text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-500"} mb-1`}>
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-[#2563EB] text-white px-6 py-2 rounded-xl font-semibold transition hover:bg-[#1E2749]"
        >
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-blue-700 underline text-center mt-1"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
