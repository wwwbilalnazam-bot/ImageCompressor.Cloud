import { converterFaq } from './converter'
import { compressPdfFaq } from './compress-pdf'

/**
 * Maps a route's `faq` key (see src/config/routes.js) to its question array,
 * so a page can go from route entry -> FAQPage schema without a manual import.
 */
export const FAQ_BY_KEY = {
  converter: converterFaq,
  compressPdf: compressPdfFaq,
}

export function getFaq(key) {
  return FAQ_BY_KEY[key] || null
}
