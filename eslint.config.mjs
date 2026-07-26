import next from 'eslint-config-next/core-web-vitals'

/**
 * Flat ESLint config, replacing the Vite-era `.eslintrc.cjs`.
 *
 * `eslint-config-next/core-web-vitals` bundles the React, React Hooks and
 * Next-specific rules, so the previous hand-assembled plugin list is gone.
 */
export default [
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  ...next,
]
