import { Star } from "lucide-react";

type CoupDeCoeurButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: number; // 👈 clé : taille icône
};

export default function CoupDeCoeurButton({
  isFavorite,
  onToggle,
  disabled = false,
  size = 24, // 👈 taille par défaut
}: CoupDeCoeurButtonProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onToggle}
      aria-label={isFavorite ? "Retirer des coups de cœur" : "Ajouter aux coups de cœur"}
      className={`
        p-1 rounded-full transition-all shadow
        ${isFavorite ? "bg-[#A78BFA]/30 text-[#A78BFA]" : "bg-gray-100 text-gray-400 hover:bg-[#FFE7F6]"}
        focus:outline-none focus:ring-2 focus:ring-[#A78BFA]/50
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
      title={
        disabled
          ? "Ajoutez d'abord ce souvenir et attendez la sauvegarde avant de le partager"
          : isFavorite
          ? "Retirer des coups de cœur"
          : "Ajouter aux coups de cœur"
      }
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      style={{
        minWidth: size + 8, // pour garder le bouton rond même en petite taille
        minHeight: size + 8,
      }}
    >
      <Star
        className={`transition ${isFavorite ? "fill-[#A78BFA]" : ""}`}
        strokeWidth={2}
        width={size}
        height={size}
      />
    </button>
  );
}
