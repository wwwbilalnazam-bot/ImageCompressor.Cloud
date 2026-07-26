/**
 * Renders one or more JSON-LD graphs as <script type="application/ld+json">.
 *
 * Server Component, so the structured data is present in the initial HTML —
 * unlike the old `<SEO schemaData>` prop, which appended the script from a
 * `useEffect` after hydration where non-JS crawlers never saw it.
 *
 * `data` may be a single object, or an array (null/undefined entries are
 * skipped so callers can pass conditional builders directly).
 */
export default function JsonLd({ data }) {
  const graphs = (Array.isArray(data) ? data : [data]).filter(Boolean)
  if (graphs.length === 0) return null

  return (
    <>
      {graphs.map((graph, index) => (
        <script
          key={index}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
      ))}
    </>
  )
}
