import { getRoute } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import ToolPageShell from '@/components/tools/ToolPageShell'
import SplitPdfClient from '@/components/tools/SplitPdfClient'

const route = getRoute('remove-pdf-pages')

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale } = await params
  return (
    <ToolPageShell route={route} locale={locale}>
      <SplitPdfClient {...route.props} />
    </ToolPageShell>
  )
}
