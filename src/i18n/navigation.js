import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * Locale-aware replacements for `next/link` and `next/navigation`.
 * `<Link href="/compress-pdf">` resolves to `/en/compress-pdf`, and
 * `usePathname()` returns the pathname *without* the locale prefix, which is
 * what the header's active-tab logic wants.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
