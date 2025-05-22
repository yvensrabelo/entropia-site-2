/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Backgrounds para tema claro
        background: '#f8fafc',           // Cinza muito claro
        secondary: '#f1f5f9',            // Cinza claro alternativo
        surface: '#ffffff',              // Branco puro
        
        // 🟢 Verde Entropia (refinado para tema claro)
        primary: {
          DEFAULT: '#16a34a',            // Verde principal mais escuro
          50: '#f0fdf4',                 // Verde muito claro
          100: '#dcfce7',                // Verde claro
          200: '#bbf7d0',                // Verde suave
          300: '#86efac',                // Verde médio claro
          400: '#4ade80',                // Verde médio
          500: '#22c55e',                // Verde padrão
          600: '#16a34a',                // Verde escuro (principal)
          700: '#15803d',                // Verde mais escuro
          800: '#166534',                // Verde muito escuro
          900: '#14532d',                // Verde quase preto
          950: '#052e16',                // Verde extremamente escuro
        },
        
        // 🔘 Cinzas (expandidos para tema claro)
        gray: {
          25: '#fcfcfd',                 // Cinza quase branco
          50: '#f8fafc',                 // Cinza muito claro
          100: '#f1f5f9',                // Cinza claro
          200: '#e2e8f0',                // Cinza suave
          300: '#cbd5e1',                // Cinza médio claro
          400: '#94a3b8',                // Cinza médio
          500: '#64748b',                // Cinza padrão
          600: '#475569',                // Cinza escuro
          700: '#334155',                // Cinza mais escuro
          800: '#1e293b',                // Cinza muito escuro
          900: '#0f172a',                // Cinza quase preto
          950: '#020617',                // Cinza extremamente escuro
        },
        
        // 📝 Textos (hierarquia clara)
        text: {
          DEFAULT: '#0f172a',           // Texto principal (cinza quase preto)
          secondary: '#475569',         // Texto secundário (cinza escuro)
          muted: '#64748b',            // Texto desbotado (cinza médio)
          light: '#94a3b8',            // Texto claro (cinza médio claro)
          inverse: '#ffffff',          // Texto inverso (branco)
        },
        
        // 🚨 Estados (cores funcionais)
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      
      // 🌟 Sombras refinadas para tema claro
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        
        // Sombras coloridas
        'green-sm': '0 1px 3px 0 rgb(22 163 74 / 0.1), 0 1px 2px -1px rgb(22 163 74 / 0.1)',
        'green': '0 10px 40px rgb(22 163 74 / 0.15)',
        'green-lg': '0 20px 60px rgb(22 163 74 / 0.2)',
        'green-glow': '0 0 20px rgb(22 163 74 / 0.3)',
        
        // Sombras especiais
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 10px 25px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'button': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'button-hover': '0 4px 12px rgb(0 0 0 / 0.15)',
        'dropdown': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'modal': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      
      // 🌫️ Backdrop blur mantido
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      
      // 🔄 Border radius expandido
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        'full': '9999px',
      },
      
      // 📏 Espaçamentos customizados
      spacing: {
        '13': '3.25rem',
        '15': '3.75rem',
        '17': '4.25rem',
        '18': '4.5rem',
        '19': '4.75rem',
        '21': '5.25rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      
      // 🎭 Animações expandidas
      animation: {
        // Animações básicas
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.2s ease-out',
        
        // Animações especiais
        'bounce-in': 'bounceIn 0.6s ease-out',
        'bounce-out': 'bounceOut 0.6s ease-out',
        'pulse-green': 'pulseGreen 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        
        // Animações de loading
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // Animações de texto
        'type': 'type 2s steps(20, end)',
        'blink': 'blink 1s infinite',
      },
      
      // 🎬 Keyframes expandidos
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        bounceIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.3)',
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05)',
          },
          '70%': { 
            transform: 'scale(0.9)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        bounceOut: {
          '0%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
          '25%': { 
            transform: 'scale(0.95)',
          },
          '50%': { 
            opacity: '1',
            transform: 'scale(1.05)',
          },
          '100%': { 
            opacity: '0',
            transform: 'scale(0.3)',
          },
        },
        pulseGreen: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(22, 163, 74, 0.4)',
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 0 10px rgba(22, 163, 74, 0)',
          },
        },
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(22, 163, 74, 0.2)',
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(22, 163, 74, 0.4)',
          },
        },
        float: {
          '0%, 100%': { 
            transform: 'translateY(0px)',
          },
          '50%': { 
            transform: 'translateY(-10px)',
          },
        },
        wiggle: {
          '0%, 100%': { 
            transform: 'rotate(-3deg)',
          },
          '50%': { 
            transform: 'rotate(3deg)',
          },
        },
        type: {
          '0%': { 
            width: '0',
          },
          '100%': { 
            width: '100%',
          },
        },
        blink: {
          '0%, 50%': { 
            opacity: '1',
          },
          '51%, 100%': { 
            opacity: '0',
          },
        },
      },
      
      // 🔤 Tipografia expandida
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // 📏 Tamanhos de fonte expandidos
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      // 🎨 Gradientes customizados
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-light': 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
        'gradient-green': 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
        'gradient-green-dark': 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #15803d 100%)',
        'pattern-dots': 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
        'pattern-grid': 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
      },
      
      // 🔲 Aspectos customizados
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'photo': '4 / 3',
        'portrait': '3 / 4',
        'wide': '21 / 9',
        'ultra-wide': '32 / 9',
      },
      
      // 📐 Larguras máximas customizadas
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        'screen-2xl': '1536px',
      },
      
      // 🎯 Z-index organizados
      zIndex: {
        '1': '1',
        '10': '10',
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
        'auto': 'auto',
      },
    },
  },
  plugins: [
    // Plugin para adicionar utilidades customizadas
    function({ addUtilities, addComponents, theme }) {
      // Utilitários para glass morphism (adaptado para tema claro)
      const glassUtilities = {
        '.glass-light': {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(22, 163, 74, 0.2)',
        },
        '.glass-light-hover': {
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(22, 163, 74, 0.3)',
        },
      }
      
      // Utilitários para texto
      const textUtilities = {
        '.text-shadow-sm': {
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow': {
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        },
        '.text-shadow-lg': {
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
        },
        '.text-outline': {
          '-webkit-text-stroke': '1px rgba(22, 163, 74, 0.5)',
        },
      }
      
      // Componentes reutilizáveis
      const components = {
        '.btn': {
          padding: `${theme('spacing.3')} ${theme('spacing.6')}`,
          borderRadius: theme('borderRadius.xl'),
          fontWeight: theme('fontWeight.semibold'),
          transition: theme('transitionProperty.all'),
          transitionDuration: theme('transitionDuration.300'),
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme('spacing.2'),
        },
        '.card-base': {
          backgroundColor: theme('colors.white'),
          border: `1px solid ${theme('colors.gray.200')}`,
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.lg'),
          transition: theme('transitionProperty.all'),
          transitionDuration: theme('transitionDuration.300'),
        },
      }
      
      addUtilities({ ...glassUtilities, ...textUtilities })
      addComponents(components)
    }
  ],
}