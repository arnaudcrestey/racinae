"use client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react"; // Arbre possible plus tard si SVG fourni
import clsx from "clsx";

const gradient =
  "bg-gradient-to-r from-[#1E2749] via-[#2563EB] to-[#A78BFA]";
const shadow = "shadow-lg shadow-[#1E2749]/10";
const radius = "rounded-2xl";
const border = "border border-[#E5E7EB]";
const text = "text-[#FEF7ED]";

export function racinaeToast({
  title,
  description,
  type = "success",
}: {
  title: string;
  description?: string;
  type?: "success" | "error" | "info";
}) {
  toast.custom((t) => (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        "flex gap-4 items-center px-5 py-4 max-w-xs min-w-[280px]",
        gradient,
        shadow,
        radius,
        border,
        text
      )}
      onClick={() => toast.dismiss(t)}
      style={{ cursor: "pointer" }}
      role="alert"
      aria-live="polite"
    >
      <motion.span
        initial={{ scale: 0.7 }}
        animate={{ scale: 1.1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.9 }}

        className="flex items-center justify-center w-10 h-10 bg-white/50 rounded-full shadow"
      >
        <Sparkles
          size={28}
          className={clsx({
            "text-[#10B981]": type === "success",
            "text-[#F2994A]": type === "error",
            "text-[#A78BFA]": type === "info",
          })}
        />
      </motion.span>
      <div className="flex-1">
        <div className="font-serif text-lg font-bold leading-tight mb-1 text-[#FEF7ED] drop-shadow">
          {title}
        </div>
        {description && (
          <div className="font-sans text-base text-[#FEF7ED] opacity-90">
            {description}
          </div>
        )}
      </div>
    </motion.div>
  ));
}
