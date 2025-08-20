import { supabase } from './supabaseClient';

// Charger toutes les pages (et blocs) du livre pour l’utilisateur connecté
export async function getAllPagesWithBlocks(user_id: string) {
  const { data, error } = await supabase
    .from('life_book_pages')
    .select(`id, page_number, blocks:life_book_blocks (id, type, content, annotation, emoji, photo_url, position)`)
    .eq('user_id', user_id)
    .order('page_number', { ascending: true });

  if (error) throw error;
  return data;
}

// Créer une nouvelle page
export async function addLifeBookPage(user_id: string, page_number: number) {
  const { data, error } = await supabase
    .from('life_book_pages')
    .insert([{ user_id, page_number }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Ajouter un bloc à une page
export async function addBlocToPage(page_id: string, bloc: {
  type: string;
  content: string;
  annotation?: string;
  emoji?: string;
  photo_url?: string;
  position?: number;
}) {
  const { data, error } = await supabase
    .from('life_book_blocks')
    .insert([{ page_id, ...bloc }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

