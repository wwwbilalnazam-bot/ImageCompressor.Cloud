/**
 * Locale list — the single place locales are declared.
 *
 * Imported by `src/i18n/routing.js` (next-intl), `next.config.js` (redirects)
 * and `app/sitemap.js` (hreflang), so adding a language is a one-line change
 * here plus a `src/messages/<locale>.json` file. Only `en` ships today; the
 * `/[locale]` URL segment and hreflang plumbing are already in place for the
 * other nine planned languages.
 */
export const locales = ['en']

export const defaultLocale = 'en'
