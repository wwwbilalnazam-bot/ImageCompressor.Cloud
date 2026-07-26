import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  /**
   * Everything except Next internals, the API namespace and any path with a
   * file extension (so /sitemap.xml, /robots.txt and /favicon.svg are served
   * directly rather than being redirected into a locale).
   */
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
