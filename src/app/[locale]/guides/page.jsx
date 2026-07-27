import { getRoute, routesInCategory } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { getGuide } from '@/content/guides'
import ContentPage from '@/components/layout/ContentPage'
import { Link } from '@/i18n/navigation'

const route = getRoute('guides')

const PILLAR_LABELS = {
  compress: 'Image Compression',
  pdf: 'PDF Tools',
  convert: 'Document Conversion',
}
const PILLAR_ORDER = ['compress', 'pdf', 'convert']

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale } = await params
  const articles = routesInCategory('guides').filter((r) => r.slug !== 'guides')

  const byPillar = PILLAR_ORDER.map((pillarId) => ({
    id: pillarId,
    label: PILLAR_LABELS[pillarId],
    articles: articles.filter((a) => getGuide(a.props.guideSlug)?.pillar === pillarId),
  })).filter((group) => group.articles.length > 0)

  return (
    <ContentPage
      route={route}
      locale={locale}
      title="Guides"
      intro="Practical answers to the questions people actually have about compression, PDFs and file conversion — not padded, not generic."
    >
      <div className="space-y-8 not-prose">
        {byPillar.map((group) => (
          <section key={group.id} className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {group.label}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {group.articles.map((article) => {
                const seo = article.seo[locale] || article.seo.en
                return (
                  <Link
                    key={article.slug}
                    href={`/${article.slug}`}
                    className="block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{article.navLabel}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{seo.description}</p>
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </ContentPage>
  )
}
