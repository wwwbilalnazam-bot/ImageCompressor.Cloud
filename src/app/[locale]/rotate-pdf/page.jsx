import { getRoute } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import ToolPageShell from '@/components/tools/ToolPageShell'
import RotatePdfClient from '@/components/tools/RotatePdfClient'

const route = getRoute('rotate-pdf')

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale } = await params
  return (
    <ToolPageShell route={route} locale={locale}>
      <RotatePdfClient {...route.props} />
    </ToolPageShell>
  )
}
