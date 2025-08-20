'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AvatarUser({ size = 46 }: { size?: number }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour charger l'avatar depuis Supabase
  const fetchAvatar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAvatarUrl(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();
    setAvatarUrl(data?.avatar_url || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchAvatar(); // Charger au montage

    // Ecouter l'événement "avatar-updated" (refresh automatique)
    const handleUpdate = () => {
      setLoading(true); // Optionnel : petit effet de loading
      fetchAvatar();
    };
    window.addEventListener("avatar-updated", handleUpdate);

    // Nettoyage de l'écouteur quand le composant se démonte
    return () => {
      window.removeEventListener("avatar-updated", handleUpdate);
    };
  }, []);

  // Si pas connecté, rien du tout (pas d’avatar sur la page /auth)
  if (!avatarUrl && !loading) return null;

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden border-2 border-[#F2994A] bg-white flex items-center justify-center shadow"
    >
      {loading ? (
        <span className="text-xs text-gray-400 animate-pulse">...</span>
      ) : avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          width={size}
          height={size}
          className="object-cover w-full h-full rounded-full"
        />
      ) : (
        <span className="text-2xl flex items-center justify-center w-full h-full">🙂</span>
      )}
    </div>
  );
}
