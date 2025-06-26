'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Fonction pour s'inscrire
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage("Vérifie tes emails pour valider l'inscription !");
    setLoading(false);
  };

  // Fonction pour se connecter
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Connexion réussie !');
      setTimeout(() => {
        router.push('/onboarding'); // Redirection vers la page membre après connexion
      }, 1000); // 1 seconde pour afficher le message
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1E2749] to-[#2563EB] px-4">
      <h1 className="text-3xl font-bold text-white mb-6">Connexion / Inscription</h1>
      <form className="bg-white rounded-xl shadow-md p-8 w-full max-w-xs space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-lg"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full px-3 py-2 border rounded-lg"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <button
          type="submit"
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#2563EB] text-white py-2 rounded-lg hover:bg-[#1E2749] transition"
        >
          Se connecter
        </button>
        <button
          type="button"
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-orange-400 text-white py-2 rounded-lg hover:bg-orange-500 transition"
        >
          S'inscrire
        </button>
        {message && <div className="text-center text-sm mt-2 text-blue-700">{message}</div>}
      </form>
    </div>
  );
}
