import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import createNextIntlPlugin from 'next-intl/plugin'
import { locales } from './src/config/locales.js'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.js')

/**
 * /pdf-tools used to render byte-identical content to /compress-pdf — two live,
 * self-canonicalizing URLs for one page. It is now a permanent redirect and has
 * no page file and no sitemap entry.
 *
 * Generated per locale from `locales` so new languages need no config change.
 */
const pdfToolsRedirects = [
  { source: '/pdf-tools', destination: '/compress-pdf', permanent: true },
  ...locales.map((locale) => ({
    source: `/${locale}/pdf-tools`,
    destination: `/${locale}/compress-pdf`,
    permanent: true,
  })),
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pinned explicitly: there are lockfiles above this directory (the repo is
  // checked out inside a git worktree), and Turbopack would otherwise infer a
  // workspace root outside the project.
  turbopack: {
    root: dirname(fileURLToPath(import.meta.url)),
    resolveAlias: {
      // pdfjs-dist has a Node-only `require('canvas')` branch that is dead code
      // in the browser, but still has to resolve. `canvas` is an uninstalled
      // optionalDependency, so point it at a stub.
      canvas: './src/lib/empty-module.js',
    },
  },
  async redirects() {
    return pdfToolsRedirects
  },
}

export default withNextIntl(nextConfig)
