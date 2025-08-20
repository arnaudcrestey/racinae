"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { UserStatsProvider } from "../context/UserStatsContext"; // ← adapte ce chemin !

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/auth?requireAuth=1"); // Redirige si pas connecté
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  // On englobe les enfants avec les deux providers !
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <UserStatsProvider>
        {children}
      </UserStatsProvider>
    </SessionContextProvider>
  );
}
