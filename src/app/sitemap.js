import { ROUTES } from '../config/routes'
import { routing } from '../i18n/routing'
import { absoluteUrl, localePath, buildHreflangMap } from '../lib/seo/metadata'

/**
 * Sitemap, generated from ROUTES × locales.
 *
 * This replaces a hand-maintained `public/sitemap.xml` that had drifted badly:
 * it listed two URLs that never existed (/sign-pdf, /put-logo), omitted roughly
 * fifteen live routes, and included /pdf-tools, a duplicate of /compress-pdf.
 * Reading the same array the routes and footer read makes that class of drift
 * impossible — /pdf-tools is absent here because it has no ROUTES entry, only a
 * redirect in next.config.js.
 */
export default function sitemap() {
  const lastModified = new Date()
  const entries = []

  for (const locale of routing.locales) {
    for (const route of ROUTES) {
      if (!route.sitemap) continue

      entries.push({
        url: absoluteUrl(localePath(locale, route.slug)),
        lastModified,
        changeFrequency: route.sitemap.changefreq,
        priority: route.sitemap.priority,
        alternates: { languages: buildHreflangMap(route.slug) },
      })
    }
  }

  return entries
}
