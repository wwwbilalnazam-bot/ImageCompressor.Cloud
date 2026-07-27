import { getRoute, routesInCategory } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import ContentPage from '@/components/layout/ContentPage'
import { Link } from '@/i18n/navigation'

const route = getRoute('compare')

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale } = await params
  const articles = routesInCategory('compare').filter((r) => r.slug !== 'compare')

  return (
    <ContentPage
      route={route}
      locale={locale}
      title="Compare"
      intro="Honest, fact-checked comparisons against the tools you're probably also considering — sourced from what each site actually shows, not marketing copy."
    >
      <div className="grid sm:grid-cols-2 gap-4 not-prose">
        {articles.map((article) => {
          const seo = article.seo[locale] || article.seo.en
          return (
            <Link
              key={article.slug}
              href={`/${article.slug}`}
              className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
            >
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{article.navLabel}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{seo.description}</p>
            </Link>
          )
        })}
      </div>
    </ContentPage>
  )
}
