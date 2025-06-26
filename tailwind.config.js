/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",    // Pour toute la structure Next.js App Router
    "./src/components/**/*.{js,ts,jsx,tsx}", // Pour tes futurs composants
  ],
  theme: {
    extend: {
      colors: {
        'bleu-racinae': '#2563EB',
        'ecru-chaleureux': '#FEF7ED',
        'orange-racine': '#F2994A',
        'vert-feuille': '#10B981',
        'violet-memoire': '#A78BFA',
        'gris-doux': '#E5E7EB',
        'gris-medium': '#9CA3AF',
      },
      fontFamily: {
        'title': ['Playfair Display', 'Cormorant Garamond', 'serif'],
        'body': ['Source Sans Pro', 'Inter', 'sans-serif'],
        'hand': ['Dancing Script', 'cursive'],
      },
      borderRadius: { 'xl': '1.25rem' },
      boxShadow: {
        'halo': '0 4px 24px 0 rgba(39,70,125,0.20)',
      },
    },
  },
  plugins: [],
}
