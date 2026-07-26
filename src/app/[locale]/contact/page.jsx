import { getRoute } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { site } from '@/config/site'
import ContentPage from '@/components/layout/ContentPage'

const route = getRoute('contact')

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale } = await params

  return (
    <ContentPage
      route={route}
      locale={locale}
      title="Contact"
      intro="Bug reports, tool requests and privacy questions all go to the same place."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Email us</h2>
        <p>
          General support and feedback:{' '}
          <a
            href={`mailto:${site.contactEmail}`}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            {site.contactEmail}
          </a>
        </p>
        <p>
          Privacy and data questions:{' '}
          <a
            href={`mailto:${site.privacyEmail}`}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            {site.privacyEmail}
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Reporting a problem with a file</h2>
        <p>
          Please don&apos;t email us the file itself. Because every tool except Office conversion runs entirely in your
          browser, we can&apos;t see what happened on your machine and we don&apos;t want a copy of your document. What
          genuinely helps: which tool you used, the file type and rough size, your browser and version, and any message
          shown on screen.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Requesting a tool</h2>
        <p>
          Tell us the job you&apos;re trying to get done rather than the feature name — it usually turns out there is a
          simpler way to support it, or that an existing tool already covers it.
        </p>
      </section>
    </ContentPage>
  )
}
