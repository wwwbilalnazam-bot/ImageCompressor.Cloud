import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CATEGORY_ORDER, CATEGORIES, routesInCategory } from '@/config/routes'

/**
 * Locale-scoped 404. Renders inside `[locale]/layout.jsx`, so it gets the real
 * header, footer and styling — and, importantly, a genuine HTTP 404 status.
 *
 * Previously `vercel.json` rewrote every unmatched path to `/index.html`, so
 * unknown URLs answered HTTP 200 with the homepage. That is a soft 404: search
 * engines index junk URLs and can't tell a typo from a real page.
 */
export const metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
}

export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="w-full container max-w-3xl mx-auto px-4 py-16 space-y-8 text-center">
      <div className="space-y-3">
        <p className="text-6xl font-black text-emerald-600 dark:text-emerald-400">{t('code')}</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('title')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">{t('body')}</p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all"
      >
        {t('cta')}
      </Link>

      {/* Same ROUTES-derived link lists as the footer — a 404 is a good place
          to actually help someone find the tool they were after. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left border-t border-slate-200 dark:border-slate-800">
        {CATEGORY_ORDER.filter((id) => id !== 'company').map((categoryId) => (
          <nav key={categoryId} aria-label={CATEGORIES[categoryId].label} className="space-y-2">
            <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              {CATEGORIES[categoryId].label}
            </h2>
            <ul className="space-y-1.5">
              {routesInCategory(categoryId).map((route) => (
                <li key={route.slug || 'home'}>
                  <Link
                    href={`/${route.slug}`}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {route.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
    </div>
  )
}
