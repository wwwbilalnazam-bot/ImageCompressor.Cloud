/**
 * Empty stub used by the `canvas` resolve alias in next.config.js.
 *
 * pdfjs-dist ships one generic build that contains a Node-only
 * `require('canvas')` branch for server-side rendering. We only ever run pdf.js
 * in the browser, where that branch is unreachable, but the bundler still has
 * to resolve the specifier. `canvas` is an optionalDependency that is not
 * installed, so it is aliased here instead.
 */
export default {}
