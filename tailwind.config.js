/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
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
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			title: [
  				'Playfair Display',
  				'Cormorant Garamond',
  				'serif'
  			],
  			body: [
  				'Source Sans Pro',
  				'Inter',
  				'sans-serif'
  			],
  			hand: [
  				'Dancing Script',
  				'cursive'
  			]
  		},
  		borderRadius: {
  			xl: '1.25rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			halo: '0 4px 24px 0 rgba(39,70,125,0.20)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
