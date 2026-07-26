/**
 * Filesystem-root layout.
 *
 * Deliberately a pass-through: every real URL lives under `[locale]`, and
 * `app/[locale]/layout.jsx` is the layout that renders <html>/<body>. Next
 * still requires a file here so that root-level metadata routes
 * (`sitemap.js`, `robots.js`) and the global `not-found.jsx` have a layout to
 * mount under — `not-found.jsx` therefore renders its own <html>/<body>.
 */
export default function RootLayout({ children }) {
  return children
}
