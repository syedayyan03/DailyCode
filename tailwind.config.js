/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#07090E',            // Royal Midnight Onyx
          surface: '#0D111A',       // Elevated Velvet Obsidian
          card: '#111624',          // Luxury Card
          'card-hover': '#161D2E',  // Hovered Card
          border: '#1E2638',        // Fine Platinum-Slate Border
          'border-subtle': '#141A28',
          muted: '#131824',
        },
        royal: {
          // Imperial & Champagne Gold
          gold: '#D4AF37',
          'gold-light': '#F3E5AB',
          'gold-champagne': '#E6CA65',
          'gold-dark': '#997D24',

          // Royal Sapphire
          sapphire: '#3B82F6',
          'sapphire-light': '#60A5FA',
          'sapphire-dark': '#1D4ED8',

          // Royal Emerald
          emerald: '#10B981',
          'emerald-light': '#34D399',
          'emerald-dark': '#047857',

          // Imperial Ruby
          ruby: '#E11D48',
          'ruby-light': '#FB7185',
          'ruby-dark': '#9F1239',

          // Royal Amethyst
          amethyst: '#8B5CF6',
          'amethyst-light': '#A78BFA',
          'amethyst-dark': '#6D28D9',

          // Platinum Text
          text: '#F8FAFC',
          subtext: '#94A3B8',
          muted: '#64748B'
        },
        brand: {
          // Backwards compatibility mappings for existing component names
          mint: '#D4AF37',           // Maps to Royal Gold
          'mint-light': '#F3E5AB',
          'mint-dark': '#997D24',
          cyan: '#3B82F6',           // Maps to Royal Sapphire
          'cyan-light': '#60A5FA',
          'cyan-dark': '#1D4ED8',
          violet: '#8B5CF6',         // Maps to Royal Amethyst
          'violet-light': '#A78BFA',
          'violet-dark': '#6D28D9',
          purple: '#8B5CF6',
          'purple-light': '#A78BFA',
          'purple-dark': '#6D28D9',
          blue: '#3B82F6',
          'blue-light': '#60A5FA',
          'blue-dark': '#1D4ED8',
          text: '#F8FAFC',
          subtext: '#94A3B8',
          success: '#10B981',
          warning: '#D4AF37',
          danger: '#E11D48'
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glow-gold': '0 0 35px -5px rgba(212, 175, 55, 0.3)',
        'glow-champagne': '0 0 30px -5px rgba(230, 202, 101, 0.25)',
        'glow-sapphire': '0 0 35px -5px rgba(59, 130, 246, 0.25)',
        'glow-ruby': '0 0 35px -5px rgba(225, 29, 72, 0.25)',
        'glow-amethyst': '0 0 35px -5px rgba(139, 92, 246, 0.25)',
        'glow-mint': '0 0 35px -5px rgba(212, 175, 55, 0.3)',
        'glow-cyan': '0 0 35px -5px rgba(59, 130, 246, 0.25)',
        'glow-violet': '0 0 35px -5px rgba(139, 92, 246, 0.25)',
        'glow-purple': '0 0 35px -5px rgba(139, 92, 246, 0.25)',
        'glow-blue': '0 0 35px -5px rgba(59, 130, 246, 0.25)',
        'glow-success': '0 0 35px -5px rgba(16, 185, 129, 0.25)',
        'glow-danger': '0 0 35px -5px rgba(225, 29, 72, 0.25)',
        'card-subtle': '0 10px 40px -10px rgba(0, 0, 0, 0.85)'
      }
    },
  },
  plugins: [],
}
