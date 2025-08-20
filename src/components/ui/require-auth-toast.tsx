"use client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export function showRequireAuthToast() {
  toast(
    <div className="flex items-center gap-2">
      <Lock className="text-blue-600" size={20} />
      <span>Connexion requise ✨</span>
    </div>,
    {
      description: "Pour accéder à votre espace Racinae, merci de vous connecter ou de créer un compte.",
      duration: 8000,
      className: "border-blue-500 shadow-lg bg-white",
    }
  );
}

