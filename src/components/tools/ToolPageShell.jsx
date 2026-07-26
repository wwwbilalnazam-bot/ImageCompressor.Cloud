import Breadcrumbs from '../layout/Breadcrumbs'
import JsonLd from '../JsonLd'
import { softwareApplicationSchema, faqPageSchema } from '../../lib/seo/schema'
import { getFaq } from '../../content/faq'

/**
 * Everything every tool page needs around its client component: the visible
 * breadcrumb trail, BreadcrumbList/SoftwareApplication JSON-LD, and — when the
 * route declares a `faq` key — FAQPage JSON-LD built from the same array the
 * visible FAQ list renders.
 *
 * Server Component, and it takes the tool as `children` rather than importing
 * the tool components itself. That matters: a dispatcher that imported all
 * five clients would pull all five into every route's client bundle and undo
 * the per-route code splitting this migration is partly for.
 */
export default function ToolPageShell({ route, locale, children }) {
  const faqItems = route.faq ? getFaq(route.faq) : null

  return (
    <>
      <JsonLd data={[softwareApplicationSchema(route, locale), faqPageSchema(faqItems)]} />

      {route.slug && (
        <div className="container max-w-6xl mx-auto px-4 pt-4">
          <Breadcrumbs route={route} locale={locale} />
        </div>
      )}

      {children}
    </>
  )
}
