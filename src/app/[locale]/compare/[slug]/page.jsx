import { notFound } from 'next/navigation'
import { getRoute, routesInCategory } from '@/config/routes'
import { buildPageMetadata, seoFor } from '@/lib/seo/metadata'
import { articleSchema } from '@/lib/seo/schema'
import { getComparison } from '@/content/comparisons'
import ContentPage from '@/components/layout/ContentPage'
import JsonLd from '@/components/JsonLd'
import { Link } from '@/i18n/navigation'

export function generateStaticParams() {
  return routesInCategory('compare')
    .filter((r) => r.slug !== 'compare')
    .map((r) => ({ slug: r.slug.replace('compare/', '') }))
}

function routeFor(slug) {
  try {
    return getRoute(`compare/${slug}`)
  } catch {
    return null
  }
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params
  const route = routeFor(slug)
  if (!route) return {}
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale, slug } = await params
  const route = routeFor(slug)
  const data = getComparison(slug)
  if (!route || !data) notFound()

  const isExplainer = data.type === 'explainer'

  return (
    <ContentPage route={route} locale={locale} title={seoFor(route, locale).title}>
      <JsonLd data={articleSchema(route, locale)} />

      {data.intro.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}

      {!isExplainer && (
        <>
          <div className="not-prose overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-left">
                  <th className="px-4 py-3 font-bold text-slate-900 dark:text-white">&nbsp;</th>
                  <th className="px-4 py-3 font-bold text-emerald-700 dark:text-emerald-400">This site</th>
                  <th className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{data.competitor}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-slate-800">
                    <td className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 align-top w-1/5">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200 align-top">{row.us}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 align-top">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>{data.verdict}</p>
        </>
      )}

      {isExplainer &&
        data.sections.map((section, i) => (
          <section key={i} className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.heading}</h2>
            {section.paragraphs.map((p, j) => (
              <p key={j}>{p}</p>
            ))}
            {section.list && (
              <ol className="list-decimal list-inside space-y-1.5">
                {section.list.map((item, j) => (
                  <li key={j}>{item}</li>
                ))}
              </ol>
            )}
          </section>
        ))}

      {data.cta && (
        <p>
          <Link
            href={`/${data.cta.slug}`}
            className="inline-block px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all text-sm no-underline"
          >
            {data.cta.label} →
          </Link>
        </p>
      )}
    </ContentPage>
  )
}
