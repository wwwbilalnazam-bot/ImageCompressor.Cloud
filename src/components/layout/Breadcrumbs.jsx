import Link from 'next/link'
import { breadcrumbTrail, breadcrumbListSchema } from '../../lib/seo/schema'
import JsonLd from '../JsonLd'

/**
 * Visible Home / Category / Page trail plus the matching BreadcrumbList
 * JSON-LD, built from the same `breadcrumbTrail()` helper so the markup and
 * the structured data can never describe different paths.
 *
 * Server Component. Renders nothing on the home page (a one-item trail is
 * noise, and Google ignores single-item BreadcrumbLists anyway).
 *
 * Uses `next/link` with already-localized hrefs from `breadcrumbTrail`, rather
 * than the next-intl `Link`, because the trail paths include their locale.
 */
export default function Breadcrumbs({ route, locale }) {
  const trail = breadcrumbTrail(route, locale)
  if (trail.length < 2) return null

  return (
    <>
      <JsonLd data={breadcrumbListSchema(route, locale)} />
      <nav aria-label="Breadcrumb" className="w-full">
        <ol className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          {trail.map((crumb, index) => {
            const isLast = index === trail.length - 1
            return (
              <li key={crumb.path} className="flex items-center gap-1.5">
                {index > 0 && (
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">
                    /
                  </span>
                )}
                {isLast ? (
                  <span aria-current="page" className="text-slate-700 dark:text-slate-300">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.path}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </>
  )
}
