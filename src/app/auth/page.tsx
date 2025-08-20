'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { racinaeToast } from '@/components/ui/racinae-toast';
import { showRequireAuthToast } from '@/components/ui/require-auth-toast';
import { Mail, KeyRound, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const hasShownToast = useRef(false);

  // Toast pour accès non authentifié
  useEffect(() => {
    if (searchParams.get('requireAuth') === '1' && !hasShownToast.current) {
      showRequireAuthToast();
      window.history.replaceState({}, document.title, window.location.pathname);
      hasShownToast.current = true;
    }
  }, [searchParams]);

  // Toast pédagogique avant inscription (si champs vides)
  const showSignupInfoToast = () => {
    racinaeToast({
      title: "Création du compte",
      description:
        "Merci de renseigner votre email et un mot de passe, puis cliquez sur « S’inscrire ». Vous recevrez un email de validation.",
      type: "info",
    });
  };

  // --- Inscription ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // appel Supabase
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      racinaeToast({
        title: "Erreur à l'inscription",
        description: error.message,
        type: 'error',
      });
    } else {
      // crée un profil vide associé à ce user
      const user = data.user;
      if (user) {
        await supabase
          .from('profiles')
          .insert({ id: user.id })
          .single();
      }
      racinaeToast({
        title: 'Bienvenue chez Racinae 🌱',
        description: 'Vérifie tes emails pour activer ton compte !',
        type: 'success',
      });
    }

    setLoading(false);
  };

  // --- Connexion ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      racinaeToast({
        title: 'Erreur de connexion',
        description: error.message,
        type: 'error',
      });
    } else {
      racinaeToast({
        title: 'Connexion réussie !',
        description: 'Heureux de vous retrouver !',
        type: 'success',
      });
      setTimeout(() => {
        router.push('/onboarding');
      }, 1200);
    }

    setLoading(false);
  };

  // --- Réinitialisation de mot de passe ---
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    const targetEmail = resetEmail || email;
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      racinaeToast({
        title: 'Erreur',
        description: error.message,
        type: 'error',
      });
    } else {
      racinaeToast({
        title: 'Email envoyé !',
        description: 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.',
        type: 'success',
      });
      setShowReset(false);
      setResetEmail('');
    }

    setResetLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1E2749] to-[#2563EB] px-2">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 drop-shadow text-center">
        Bienvenue chez Racinae
      </h1>
      <p className="text-white/80 mb-8 text-center max-w-xl">
        <span className="font-semibold text-[#F2994A]">
          Déposez vos souvenirs, ils vivront pour ceux que vous aimez.
        </span>
        <br />
        Créez votre espace en toute sécurité.
      </p>

      <form className="bg-[#FEF7ED] rounded-2xl shadow-xl px-4 sm:px-8 py-8 w-full max-w-xs sm:max-w-sm space-y-4 border border-[#E5E7EB]/80">
        {/* Email */}
        <label htmlFor="email" className="block font-medium text-[#1E2749] mb-1">
          Email
        </label>
        <div className="flex items-center bg-white rounded-lg px-3 py-2 border border-[#E5E7EB] focus-within:ring-2 focus-within:ring-[#2563EB] w-full">
          <Mail className="text-[#2563EB] mr-2" size={20} />
          <input
            id="email"
            type="email"
            placeholder="Votre email"
            className="w-full bg-transparent outline-none text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
            required
          />
        </div>

        {/* Mot de passe */}
        <label htmlFor="password" className="block font-medium text-[#1E2749] mt-3 mb-1">
          Mot de passe
        </label>
        <div className="relative flex items-center bg-white rounded-lg px-3 py-2 border border-[#E5E7EB] focus-within:ring-2 focus-within:ring-[#2563EB] w-full">
          <KeyRound className="text-[#F2994A] mr-2" size={20} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Votre mot de passe"
            className="w-full bg-transparent outline-none pr-9 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={loading}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute right-3 text-[#2563EB] hover:text-[#1E2749]"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Mot de passe oublié */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-[#2563EB] hover:text-[#F2994A] underline"
            onClick={() => setShowReset(true)}
          >
            Mot de passe oublié&nbsp;?
          </button>
        </div>

        {/* Popin Réinitialisation */}
        {showReset && (
          <div className="mt-2 p-4 bg-white border rounded-xl shadow-sm space-y-2">
            <label htmlFor="reset-email" className="block text-sm font-medium text-[#1E2749]">
              Votre email
            </label>
            <input
              id="reset-email"
              type="email"
              placeholder="Votre email"
              className="w-full border rounded-lg px-3 py-2 outline-none text-sm"
              value={resetEmail || email}
              onChange={(e) => setResetEmail(e.target.value)}
              autoComplete="email"
              disabled={resetLoading}
              required
            />
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={handlePasswordReset}
                disabled={resetLoading}
                className="bg-[#2563EB] text-white px-4 py-1 rounded-lg text-sm"
              >
                Envoyer
              </button>
              <button
                type="button"
                onClick={() => setShowReset(false)}
                disabled={resetLoading}
                className="text-[#F2994A] font-bold text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-6">
          <button
            type="submit"
            onClick={handleLogin}
            disabled={loading}
            className="bg-[#2563EB] text-white py-2 rounded-xl font-semibold text-lg"
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={(e) => {
              if (!email || !password) {
                showSignupInfoToast();
                return;
              }
              handleSignup(e);
            }}
            disabled={loading}
            className="bg-[#F2994A] text-white py-2 rounded-xl font-semibold text-lg flex items-center justify-center gap-2"
          >
            <UserPlus size={20} /> S'inscrire
          </button>
        </div>

        <p className="mt-2 text-xs text-[#1E2749] text-center opacity-70">
          Mot de passe ≥ 6 caractères. Un email de validation sera envoyé.
        </p>
      </form>
    </div>
  );
}
