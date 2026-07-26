import { defineRouting } from 'next-intl/routing'
import { locales, defaultLocale } from '../config/locales'

/**
 * `localePrefix: 'always'` means every URL carries its locale (`/en/...`)
 * from day one. That keeps the URL shape uniform with the nine languages
 * still to come, instead of special-casing an unprefixed default locale that
 * would have to be unwound later.
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
