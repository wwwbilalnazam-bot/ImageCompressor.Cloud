import Breadcrumbs from './Breadcrumbs'

/**
 * Shared chrome for the plain content pages (/about, /privacy, /contact):
 * breadcrumb trail + BreadcrumbList JSON-LD, page heading, and a readable
 * measure. Server Component — these pages ship zero client JavaScript of their
 * own.
 */
export default function ContentPage({ route, locale, title, intro, children }) {
  return (
    <div className="w-full container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Breadcrumbs route={route} locale={locale} />

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
        {intro && <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">{intro}</p>}
      </header>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{children}</div>
    </div>
  )
}
