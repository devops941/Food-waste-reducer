/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F3EDE0',
          300: '#E8DEC9',
        },
        sage: {
          50: '#F3F7F2',
          100: '#E8F0E3',
          200: '#D1E1CA',
          300: '#A9C69E',
          400: '#7FA873',
          500: '#4F7A4A', // Primary
          600: '#3F6A3B', // Hover
          700: '#32522E',
          800: '#263D23',
          900: '#1B2C19',
        },
        terracotta: {
          50: '#FDF4F0',
          100: '#F9E5DC',
          200: '#F3CBB8',
          300: '#EAAB8F',
          400: '#E18C67',
          500: '#D9784A', // Accent
          600: '#C66538', // Hover
          700: '#A64F28',
          800: '#833D1F',
          900: '#642D16',
        },
        charcoal: {
          DEFAULT: '#1F2A24',
          light: '#2E3D35',
          muted: '#6B7A70',
          faint: '#9EABA3',
          border: '#E2E8E2',
        },
        status: {
          fresh: '#4F9D5B',
          'fresh-bg': '#EAF6EC',
          soon: '#E0A030',
          'soon-bg': '#FEF7E6',
          expired: '#C9503F',
          'expired-bg': '#FDEEEC',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft-sm': '0 2px 8px -2px rgba(31, 42, 36, 0.05)',
        'soft': '0 4px 20px -2px rgba(31, 42, 36, 0.06), 0 2px 6px -1px rgba(31, 42, 36, 0.03)',
        'soft-lg': '0 12px 32px -4px rgba(31, 42, 36, 0.08), 0 4px 12px -2px rgba(31, 42, 36, 0.04)',
        'soft-hover': '0 16px 36px -6px rgba(31, 42, 36, 0.12), 0 6px 16px -2px rgba(79, 122, 74, 0.08)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      maxWidth: {
        'content': '1100px',
      }
    },
  },
  plugins: [],
}
