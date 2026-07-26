/**
 * Compact FAQ list rendered from a shared `src/content/faq/*` array.
 *
 * The exact same array is passed to `faqPageSchema()` by the page's Server
 * Component, so the visible questions and the FAQPage structured data are
 * guaranteed to match. Uses native <details>, so it needs no JavaScript and
 * the answers are in the initial HTML for crawlers.
 */
export default function FaqList({ items, title = '❓ Frequently Asked Questions' }) {
  if (!items || items.length === 0) return null

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
      <h2 className="font-bold text-slate-900 dark:text-white text-sm">{title}</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <details key={item.q} className="group">
            <summary className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer list-none flex items-start justify-between gap-2">
              <span>{item.q}</span>
              <svg
                className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  )
}
