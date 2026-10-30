import type { Config } from 'tailwindcss'

export default {
    darkMode: 'class',
    content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: 'var(--pf-bg)',
                card: 'var(--pf-card)',
                ink: 'var(--pf-ink)',
                muted: 'var(--pf-muted)',
                line: 'var(--pf-line)',
                accent: 'var(--pf-accent)',
                'accent-ink': 'var(--pf-accent-ink)',
            },
            fontFamily: {
                display: ['var(--font-display)', 'system-ui', 'sans-serif'],
                sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
            },
        },
    },
} satisfies Config