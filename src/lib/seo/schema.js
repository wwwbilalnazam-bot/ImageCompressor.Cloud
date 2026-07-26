import { site } from '../../config/site'
import { CATEGORIES } from '../../config/routes'
import { absoluteUrl, localePath, seoFor } from './metadata'

const CONTEXT = 'https://schema.org'

/** Organization — emitted once per page from the locale root layout. */
export function organizationSchema() {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    '@id': `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    logo: absoluteUrl('/favicon.svg'),
    description: site.description,
    email: site.contactEmail,
    ...(site.sameAs.length > 0 ? { sameAs: site.sameAs } : {}),
  }
}

/** WebSite — emitted once per page from the locale root layout. */
export function webSiteSchema(locale) {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': `${site.url}/#website`,
    name: site.siteName,
    url: absoluteUrl(localePath(locale, '')),
    description: site.description,
    inLanguage: locale,
    publisher: { '@id': `${site.url}/#organization` },
  }
}

/**
 * SoftwareApplication, per tool page.
 *
 * Replaces the single generic blob that used to be hardcoded in `index.html`
 * and therefore claimed the same application on all 28 URLs.
 */
export function softwareApplicationSchema(route, locale) {
  const seo = seoFor(route, locale)
  const url = absoluteUrl(localePath(locale, route.slug))

  return {
    '@context': CONTEXT,
    '@type': 'SoftwareApplication',
    name: seo.title,
    description: seo.description,
    url,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web Browser',
    inLanguage: locale,
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@id': `${site.url}/#organization` },
  }
}

/** FAQPage, built from the same array the visible FAQ list renders. */
export function faqPageSchema(items) {
  if (!items || items.length === 0) return null

  return {
    '@context': CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

/**
 * BreadcrumbList (Home / Category / Page) for any non-home route.
 * Paired with the visible `<Breadcrumbs>` trail, never schema-only.
 */
export function breadcrumbListSchema(route, locale) {
  const trail = breadcrumbTrail(route, locale)
  if (trail.length < 2) return null

  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: absoluteUrl(crumb.path),
    })),
  }
}

/**
 * The Home / Category / Page trail, shared by the visible breadcrumbs and the
 * BreadcrumbList schema so the two can't disagree.
 */
export function breadcrumbTrail(route, locale) {
  const trail = [{ label: 'Home', path: localePath(locale, '') }]
  if (!route.slug) return trail

  const category = CATEGORIES[route.category]
  if (category && category.href !== route.slug) {
    trail.push({ label: category.label, path: localePath(locale, category.href) })
  }

  trail.push({ label: route.navLabel, path: localePath(locale, route.slug) })
  return trail
}
