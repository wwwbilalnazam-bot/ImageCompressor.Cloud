/**
 * Locale list — the single place locales are declared.
 *
 * Imported by `src/i18n/routing.js` (next-intl), `next.config.js` (redirects)
 * and `app/sitemap.js` (hreflang), so adding a language is a one-line change
 * here plus a `src/messages/<locale>.json` file. The `/[locale]` URL segment
 * and hreflang plumbing were already in place for all ten planned languages
 * from Phase 1 — `es` is the first one actually turned on, as the proof of
 * pattern for real (not just metadata) localization: the home page's UI
 * strings are wired through next-intl (see MainCompressorClient, Uploader,
 * TargetSizeSelector, ResultsSection), not just its `<title>`/meta. Other
 * routes still render English UI chrome until they get the same treatment —
 * their `seo.es` entries don't exist yet, so `seoFor()` falls back to `en`
 * metadata for those, gracefully, by design.
 */
export const locales = ['en', 'es']

export const defaultLocale = 'en'
