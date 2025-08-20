"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { racinaeToast } from "@/components/ui/racinae-toast";
import { Lock, User } from "lucide-react";

export default function LogoutDropdown() {
  const router = useRouter();

  // Déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut();
    racinaeToast({
      title: "À bientôt !",
      description: "Vos souvenirs sont en sécurité. Revenez quand vous voulez.",
      type: "info",
    });
    setTimeout(() => {
      router.push("/auth");
    }, 1200);
  };

  // Accès Mon compte
  const handleMonCompte = () => {
    router.push("/moncompte");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="bg-orange-400 hover:bg-orange-500 text-white rounded-full p-2 shadow transition duration-150 focus:outline-none focus:ring-2 focus:ring-orange-300"
          aria-label="Menu utilisateur"
        >
          <Lock size={28} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white rounded-xl shadow-lg p-1 mt-2 w-44">
        <DropdownMenuItem
          className="cursor-pointer font-medium text-blue-700 hover:bg-blue-100 rounded-lg py-2 px-3 transition flex items-center gap-2"
          onClick={handleMonCompte}
        >
          <User size={18} /> Mon compte
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer font-medium text-orange-600 hover:bg-orange-100 rounded-lg py-2 px-3 transition flex items-center gap-2"
          onClick={handleLogout}
        >
          <Lock size={18} /> Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
