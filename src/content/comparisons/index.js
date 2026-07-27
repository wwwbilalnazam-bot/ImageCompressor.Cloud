import tinypng from './tinypng'
import ilovepdf from './ilovepdf'
import smallpdf from './smallpdf'
import pdf24 from './pdf24'
import adobe from './adobe'
import imagecompressorCom from './imagecompressor-com'
import browserVsServerTools from './browser-vs-server-tools'

/**
 * Maps a comparison route's `competitorSlug` prop (see src/config/routes.js)
 * to its article content, so the dynamic /compare/[slug] page can go from
 * route entry -> rendered article without a manual per-slug import.
 */
export const COMPARISONS_BY_SLUG = {
  tinypng,
  ilovepdf,
  smallpdf,
  pdf24,
  adobe,
  'imagecompressor-com': imagecompressorCom,
  'browser-vs-server-tools': browserVsServerTools,
}

export function getComparison(slug) {
  return COMPARISONS_BY_SLUG[slug] || null
}
