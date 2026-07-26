import { Inter } from 'next/font/google'

/**
 * Inter, self-hosted and preloaded by Next.
 *
 * Replaces the previous double load — a Google Fonts <link> in `index.html`
 * plus a second `@import` inside `index.css` — with one self-hosted subset and
 * no third-party font request at all.
 *
 * `variable` exposes it as a CSS custom property so `globals.css` and the
 * Tailwind `font-sans` stack can both reference it.
 */
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})
