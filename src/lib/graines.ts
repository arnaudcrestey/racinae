import { supabase } from "./supabaseClient";

// Incrémente de 1 le compteur graines_semees pour l'utilisateur
export async function incrementGraines(userId: string) {
  // 1. Récupère la valeur actuelle
  const { data, error: errorGet } = await supabase
    .from('profiles')
    .select('graines_semees')
    .eq('id', userId)
    .single();

  if (errorGet) {
    console.error("Erreur récupération graines :", errorGet);
    return;
  }

  // 2. Fait l'update
  const newCount = (data.graines_semees || 0) + 1;
  const { error: errorUpdate } = await supabase
    .from('profiles')
    .update({ graines_semees: newCount })
    .eq('id', userId);

  if (errorUpdate) {
    console.error("Erreur increment graines :", errorUpdate);
  }
}
