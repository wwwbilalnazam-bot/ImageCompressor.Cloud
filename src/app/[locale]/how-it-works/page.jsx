import { getRoute } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import ContentPage from '@/components/layout/ContentPage'
import { Link } from '@/i18n/navigation'

const route = getRoute('how-it-works')

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
      title="How Your Files Stay Private"
      intro="Every privacy page on the internet says some version of 'we care about your privacy.' Here's how to check ours is actually true, without taking our word for it."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">The claim, precisely</h2>
        <p>
          Image compression, PDF compression, merging, splitting, rotating, removing pages, and converting between PDF
          and image formats all run entirely inside your browser tab. The file is read into memory as soon as you
          select it and never leaves your device during any of that work.
        </p>
        <p>
          There is one exception, and we'd rather say so plainly than let the claim above overreach: converting to or
          from Word, Excel, or PowerPoint uses a server. Faithfully rebuilding real Office document layout — fonts,
          tables, page breaks — needs the same kind of rendering engine Microsoft Office itself uses, which isn't
          something a browser can do alone. For those specific conversions, and only those, your file is sent to a
          conversion service, processed, and discarded.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verify it yourself in under a minute</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            Open your browser's developer tools — press F12, or right-click anywhere on the page and choose{' '}
            <strong>Inspect</strong>.
          </li>
          <li>
            Click the <strong>Network</strong> tab. Clear it if there's anything already listed.
          </li>
          <li>
            Go to the{' '}
            <Link href="/compress-pdf" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              PDF compressor
            </Link>{' '}
            (or the{' '}
            <Link href="/" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
              image compressor
            </Link>
            ) and compress a file as normal.
          </li>
          <li>
            Watch the Network tab while it processes. You'll see the page's own scripts and stylesheets load, but no
            request carrying your file's contents to any server — nothing whose size tracks the size of the file you
            uploaded.
          </li>
          <li>
            Now try the same thing on{' '}
            <Link
              href="/word-to-pdf"
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Word to PDF
            </Link>{' '}
            and you'll see the opposite: a request does go out, matching the exception above.
          </li>
        </ol>
        <p>
          That gap is the whole point — a tool that's honest about the one thing it does send to a server is more
          trustworthy than one that quietly does it for everything while claiming otherwise.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Why this even works</h2>
        <p>
          Browsers ship real, capable APIs for this: the Canvas API can re-encode an image at a different quality
          level, and JavaScript PDF libraries can parse and rebuild a PDF's internal structure without any of it
          leaving memory. Most competing tools don't do this — not because it's impossible, but because a server
          endpoint is simpler to build than doing the work correctly in every browser. The technical tradeoffs are
          explained in more depth in{' '}
          <Link
            href="/compare/browser-vs-server-tools"
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
          >
            browser-based vs. server-based file tools
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">More</h2>
        <p>
          See the{' '}
          <Link href="/privacy" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
            privacy policy
          </Link>{' '}
          for what little data is collected, or{' '}
          <Link href="/about" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
            read more about why
          </Link>{' '}
          this site is built this way in the first place.
        </p>
      </section>
    </ContentPage>
  )
}
