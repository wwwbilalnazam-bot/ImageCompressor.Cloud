import { site } from '../config/site'
import { absoluteUrl } from '../lib/seo/metadata'

/** Generated robots.txt — replaces the static file in public/. */
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: site.url,
  }
}
