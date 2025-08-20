// src/lib/useUser.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

export function useUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Récupère la session au chargement
    supabase.auth.getSession().then((res) => {
      setUser(res.data.session?.user ?? null);
    });

    // 2. Écoute les changements d’authentif
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    // 3. Nettoyage à la désinstallation du hook
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return user;
}
