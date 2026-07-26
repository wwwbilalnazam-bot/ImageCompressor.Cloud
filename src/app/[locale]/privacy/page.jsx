import { getRoute } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import ContentPage from '@/components/layout/ContentPage'
import { privacySections, privacyUpdated, privacyClosing } from '@/content/privacy'

const route = getRoute('privacy')

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale } = await params

  return (
    <ContentPage route={route} locale={locale} title="Privacy Policy" intro={`Last updated: ${privacyUpdated}`}>
      {privacySections.map((section) => (
        <section key={section.heading} className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{section.heading}</h2>
          {section.blocks.map((block, index) =>
            block.type === 'ul' ? (
              <ul key={index} className="list-disc list-inside space-y-1.5">
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={index}>{block.text}</p>
            )
          )}
        </section>
      ))}

      <p className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        {privacyClosing}
      </p>
    </ContentPage>
  )
}
