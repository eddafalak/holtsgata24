import type { Config } from 'tailwindcss'

/**
 * Tailwind v4 í þessu verkefni les aðallega þema úr `src/index.css` (@theme inline).
 * Aðalliturinn er settur í :root sem `--primary: #18325a`.
 *
 * Þessi skrá er til samræmis við verkfæri og skjölun — `extend.colors.primary`
 * endurspeglar vörumerkjalitinn ef CLI les stillingar.
 */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#18325A',
          hover: '#162B47',
          foreground: '#F8FAFC',
        },
      },
    },
  },
} satisfies Config
