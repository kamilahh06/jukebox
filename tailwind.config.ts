import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-mono)', 'ui-monospace', 'monospace'],
        display: ['var(--font-orbitron)', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.12' },
          '50%': { opacity: '0.22' },
        },
        'holo-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'aurora-drift-1': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(80px, 40px) scale(1.1)' },
          '50%': { transform: 'translate(-40px, 80px) scale(0.95)' },
          '75%': { transform: 'translate(60px, -30px) scale(1.05)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'aurora-drift-2': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(-60px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(40px, 60px) scale(0.92)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'aurora-drift-3': {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(50px, -50px) scale(1.12)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        'vinyl-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'twinkle': {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.8' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'glow-pulse': 'glow-pulse 8s ease-in-out infinite',
        'holo-shift': 'holo-shift 8s ease-in-out infinite',
        'aurora-1': 'aurora-drift-1 20s ease-in-out infinite',
        'aurora-2': 'aurora-drift-2 25s ease-in-out infinite',
        'aurora-3': 'aurora-drift-3 18s ease-in-out infinite',
        'vinyl-spin': 'vinyl-spin 3s linear infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.4s ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config
