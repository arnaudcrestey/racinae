import { ReactNode } from "react";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

type Props = { children: ReactNode };

export default async function ProtectedLayout({ children }: Props) {
  // ===> AJOUTE LE LOG CI-DESSOUS <===
  console.log("COOKIES SERVER:", cookies());
  // ================================

  const supabase = createServerComponentClient({ cookies }); 
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }
  return <>{children}</>;
}
