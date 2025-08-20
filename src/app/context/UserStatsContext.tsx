// /context/UserStatsContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";

export type UserStats = {
  graines: number;
  clesOr: number;
  courriers: Array<{
    id: string;
    destinataire: string;
    referents: string[];
    date: string;
    status: boolean;
    duree: string;
  }>;
};

const defaultStats: UserStats = {
  graines: 0,
  clesOr: 0,
  courriers: [],
};

const UserStatsContext = createContext<{
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}>({
  stats: defaultStats,
  setStats: () => {},
});

export function useUserStats() {
  return useContext(UserStatsContext);
}

export function UserStatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<UserStats>(defaultStats);

  useEffect(() => {
    async function loadStats() {
      // 1) Récupère l'utilisateur Supabase
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) return;
      const uid = user.id;

      // 2) Upsert dans profiles pour créer la ligne si besoin
      await supabase
        .from("profiles")
        .upsert({ id: uid })
        .select();

      // 3) Compte les mémoires => graines
      const { count: memoriesCount } = await supabase
        .from("memories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", uid);

      const grainesCount = memoriesCount || 0;

      // 4) Calcule les clés d'or
      const clesOrCount = Math.floor((grainesCount % 5000) / 1000);

      // 5) Récupère les time_capsules (courriers du temps)
      const { data: capsules } = await supabase
        .from("time_capsules")
        .select("id, destinataire, referees, send_date, sent, duree")
        .eq("user_id", uid);

      const courriers = (capsules || []).map((c) => ({
        id:           c.id,
        destinataire: c.destinataire,
        referents: (String(c.referees))
  .split(",")
  .map((r: string) => r.trim()),
        date:         c.send_date,
        status:       c.sent,
        duree:        c.duree,
      }));

      // 6) Met à jour le contexte
      setStats({
        graines: grainesCount,
        clesOr:  clesOrCount,
        courriers,
      });
    }

    loadStats();
  }, []);

  return (
    <UserStatsContext.Provider value={{ stats, setStats }}>
      {children}
    </UserStatsContext.Provider>
  );
}
