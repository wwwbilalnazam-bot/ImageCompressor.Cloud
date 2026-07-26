/**
 * Office Open XML MIME types.
 *
 * Kept in `config/` (rather than inside `utils/fileConverter.js`) so route
 * configuration — which is read by Server Components, the sitemap and the
 * footer — can reference them without pulling the whole conversion engine
 * into the server bundle. `utils/fileConverter.js` re-exports these, so the
 * existing import sites keep working unchanged.
 */
export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
export const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
export const PPTX_MIME = 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
