import { notFound } from 'next/navigation'
import { getRoute, routesInCategory } from '@/config/routes'
import { buildPageMetadata, seoFor } from '@/lib/seo/metadata'
import { articleSchema } from '@/lib/seo/schema'
import { getGuide } from '@/content/guides'
import ContentPage from '@/components/layout/ContentPage'
import JsonLd from '@/components/JsonLd'
import { Link } from '@/i18n/navigation'

export function generateStaticParams() {
  return routesInCategory('guides')
    .filter((r) => r.slug !== 'guides')
    .map((r) => ({ slug: r.slug.replace('guides/', '') }))
}

function routeFor(slug) {
  try {
    return getRoute(`guides/${slug}`)
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
  const data = getGuide(slug)
  if (!route || !data) notFound()

  return (
    <ContentPage route={route} locale={locale} title={seoFor(route, locale).title}>
      <JsonLd data={articleSchema(route, locale)} />

      {data.intro.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}

      {data.sections.map((section, i) => (
        <section key={i} className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.heading}</h2>
          {section.paragraphs.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
          {section.list && (
            <ul className="list-disc list-inside space-y-1.5">
              {section.list.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
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
