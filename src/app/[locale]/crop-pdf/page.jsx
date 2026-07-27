import { getRoute } from '@/config/routes'
import { buildPageMetadata } from '@/lib/seo/metadata'
import ToolPageShell from '@/components/tools/ToolPageShell'
import CropPdfClient from '@/components/tools/CropPdfClient'

const route = getRoute('crop-pdf')

export async function generateMetadata({ params }) {
  const { locale } = await params
  return buildPageMetadata({ route, locale })
}

export default async function Page({ params }) {
  const { locale } = await params
  return (
    <ToolPageShell route={route} locale={locale}>
      <CropPdfClient {...route.props} />
    </ToolPageShell>
  )
}
