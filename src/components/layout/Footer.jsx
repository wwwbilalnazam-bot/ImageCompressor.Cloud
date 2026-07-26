import { getTranslations } from 'next-intl/server'
import { Link } from '../../i18n/navigation'
import Logo from '../Logo'
import { CATEGORY_ORDER, CATEGORIES, routesInCategory } from '../../config/routes'

/**
 * Site footer — Server Component, no client JavaScript.
 *
 * The link columns are GENERATED from `ROUTES` grouped by `category`, not
 * hand-typed. The old footer was a single copyright line with zero links,
 * which left most tool pages with no internal links pointing at them at all.
 * Because this reads the same array the sitemap and metadata read, a new route
 * appears here automatically and the three can't drift apart.
 */
export default async function Footer() {
  const t = await getTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900">
      <div className="container max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand blurb */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size="small" />
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Image<span className="text-emerald-600 dark:text-emerald-400">Compress</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{t('tagline')}</p>
          </div>

          {CATEGORY_ORDER.map((categoryId) => {
            const category = CATEGORIES[categoryId]
            const routes = routesInCategory(categoryId)
            if (routes.length === 0) return null

            return (
              <nav key={categoryId} aria-label={category.label} className="space-y-3">
                <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t(`categories.${categoryId}`)}
                </h2>
                <ul className="space-y-2">
                  {routes.map((route) => (
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
            )
          })}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-900 text-[11px] text-slate-400 dark:text-slate-500 text-center">
          <p>
            © {year} ImageCompress Cloud ® - {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  )
}
