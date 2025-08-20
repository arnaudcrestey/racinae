'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AccueilPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth?requireAuth=1');
        return;
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      console.log('Profil Supabase récupéré:', profile);
      setProfile({ ...profile, email: user.email });
      setLoading(false);
    };
    fetchProfile();
  }, [router]); // <--- Un seul useEffect

  if (loading) return <div>Chargement...</div>;
  if (!profile) return <div>Erreur de chargement du profil</div>;

  const userName = profile.full_name || profile.email || 'Utilisateur';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth');
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1E2749] to-[#2563EB] px-2">
      <div className="bg-white/90 rounded-2xl shadow-xl px-6 py-8 max-w-xl w-full flex flex-col items-center">
        <h1 className="text-3xl font-serif font-bold text-[#1E2749] mb-2">
          Bonjour, {userName} 🌱
        </h1>
        <p className="text-[#1E2749]/80 mb-6 text-center">
          Heureux de te retrouver sur Racinae !
        </p>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#F2994A] rounded-lg text-white font-semibold mt-2 hover:bg-[#2563EB] transition"
        >
          Déconnexion
        </button>
        {!profile.full_name && (
          <button
            onClick={() => router.push('/profil')}
            className="px-4 py-2 bg-[#10B981] rounded-lg text-white font-semibold mt-6 hover:bg-[#A78BFA] transition"
          >
            Compléter mon profil
          </button>
        )}
      </div>
    </main>
  );
}
