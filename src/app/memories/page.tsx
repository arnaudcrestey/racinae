'use client';

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/lib/useUser';

type Memory = {
  id: string;
  content: string;
  mood: string;
  created_at: string;
};

export default function MemoriesPage() {
  const user = useUser();
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('😊'); 
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Charger la liste
  useEffect(() => {
    if (!user) return;
    fetchMemories();
  }, [user]);

  async function fetchMemories() {
    const { data, error } = await supabase
      .from('memories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) alert(error.message);
    else setMemories(data);
  }

  // 2. Ajouter un souvenir
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content) return; // pas de contenu vide
    setLoading(true);
    const { error } = await supabase
      .from('memories')
      .insert({ user_id: user.id, content, mood });
    if (error) alert(error.message);
    else {
      setContent('');
      setMood('😊');
      fetchMemories();
    }
    setLoading(false);
  };

  if (user === null) {
  return (
    <div className="p-4 text-center">
      <p className="text-lg">🚪 Merci de vous <a href="/auth" className="underline">connecter</a> pour voir votre carnet.</p>
    </div>
  );
}


  return (
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Mon Carnet de vie</h1>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Votre souvenir</label>
          <textarea
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Racontez un moment..."
            disabled={loading}
          />
        </div>
        <div>
          <label className="block font-medium">Humeur</label>
          <select
            value={mood}
            onChange={e => setMood(e.target.value)}
            className="border rounded px-3 py-2"
            disabled={loading}
          >
            <option>😊 Joyeux</option>
            <option>😢 Triste</option>
            <option>😲 Surprise</option>
            <option>😡 En colère</option>
            <option>❤️ Amoureux</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#2563EB] text-white px-6 py-2 rounded font-semibold"
        >
          {loading ? 'Enregistrement...' : 'Ajouter au carnet'}
        </button>
      </form>

      {/* Liste des souvenirs */}
      <ul className="space-y-4">
        {memories.map(mem => (
          <li key={mem.id} className="border rounded p-3">
            <div className="text-sm text-gray-500">
              {new Date(mem.created_at).toLocaleDateString()} – {mem.mood}
            </div>
            <p className="mt-1">{mem.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
