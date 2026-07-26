import { getRoute } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import { site } from '@/config/site'
import ContentPage from '@/components/layout/ContentPage'
import { Link } from '@/i18n/navigation'

const route = getRoute('about')

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
      title={`About ${site.name}`}
      intro="A set of file tools that do their work on your machine instead of ours."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Why browser-based</h2>
        <p>
          Almost every free image compressor and PDF tool online works the same way: you upload your file, a server
          processes it, and you download the result. That means your documents — contracts, ID photos, invoices,
          medical scans — sit on someone else&apos;s hardware, however briefly.
        </p>
        <p>
          Modern browsers can do this work themselves. Canvas can re-encode images, and PDF parsing libraries can
          restructure a document without a server ever seeing it. So image compression, PDF compression, splitting,
          merging, PDF-to-image and text conversion all run locally here. Your file never leaves the tab.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">The one exception</h2>
        <p>
          Converting to and from Office formats (Word, Excel, PowerPoint) is the exception. Reproducing real Word
          layout — fonts, tables, page breaks — is not something a browser can do faithfully, so those conversions go
          to a dedicated conversion service, and only those. Files are converted, returned, and discarded; nothing is
          retained.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">What that gets you</h2>
        <ul className="list-disc list-inside space-y-1.5">
          <li>No upload wait — big files start processing immediately</li>
          <li>No account, no daily limit, no watermark</li>
          <li>Exact target sizes rather than a vague quality slider</li>
          <li>Nothing stored, so there is nothing to leak later</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">More</h2>
        <p>
          Read the{' '}
          <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
            privacy policy
          </Link>{' '}
          for specifics on data handling, or{' '}
          <Link href="/contact" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
            get in touch
          </Link>{' '}
          with a bug report or a request for a tool we don&apos;t have yet.
        </p>
      </section>
    </ContentPage>
  )
}
