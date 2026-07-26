import Link from 'next/link'
import '../styles/globals.css'
import { inter } from '../lib/fonts'
import { routing } from '../i18n/routing'

/**
 * Filesystem-root 404, for the rare requests that never reach a locale segment
 * (paths the locale middleware skips, such as anything containing a dot).
 *
 * It renders its own <html>/<body> because `app/layout.jsx` is a pass-through —
 * the document shell lives in `app/[locale]/layout.jsx`, which this page is not
 * inside. Deliberately dependency-free: no locale, so no translations.
 */
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default function GlobalNotFound() {
  return (
    <html lang={routing.defaultLocale} className={inter.variable}>
      <body className="font-sans bg-white text-slate-900">
        <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
          <p className="text-6xl font-black text-emerald-600">404</p>
          <h1 className="text-2xl font-extrabold tracking-tight">Page not found</h1>
          <p className="text-sm text-slate-600 max-w-md">
            That URL doesn&apos;t exist. Head back to the compressor to keep going.
          </p>
          <Link
            href={`/${routing.defaultLocale}`}
            className="inline-flex items-center px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
          >
            Back to the compressor
          </Link>
        </main>
      </body>
    </html>
  )
}
