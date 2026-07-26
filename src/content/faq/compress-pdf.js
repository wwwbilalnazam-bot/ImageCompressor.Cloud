/**
 * FAQ for /compress-pdf.
 *
 * One array, two consumers: the visible <FaqList> in CompressPdfClient and the
 * FAQPage JSON-LD emitted by the page's Server Component.
 */
export const compressPdfFaq = [
  {
    q: 'Will compressing reduce my PDF quality?',
    a: 'Text, fonts, links and page layout are never touched — only embedded photos/scans are recompressed, and only if the result is actually smaller. Low compression keeps images near-original quality; High trades more image quality for maximum size reduction.',
  },
  {
    q: 'Is my file uploaded to a server?',
    a: 'No. Compression runs entirely in your browser using JavaScript — your PDF is never sent anywhere. That also means there\'s no upload wait, and nothing to clean up on our end afterward.',
  },
  {
    q: 'What\'s the maximum file size supported?',
    a: 'Files up to 300MB, limited by your browser\'s available memory rather than a server-side cap.',
  },
  {
    q: 'Why didn\'t my PDF get much smaller?',
    a: 'If your PDF is mostly text (a resume, invoice, or report with no photos), it\'s likely already close to its minimal size — compression mainly reduces size by recompressing embedded images, so text-only PDFs see smaller gains.',
  },
  {
    q: 'What happens to scanned documents?',
    a: 'A scanned PDF is usually one large photo per page, which is exactly what this tool targets — scanned documents typically see the largest size reductions.',
  },
]
