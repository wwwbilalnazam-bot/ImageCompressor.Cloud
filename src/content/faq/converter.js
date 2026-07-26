/**
 * FAQ for the converter routes.
 *
 * One array, two consumers: the visible <FaqList> in FileConverterClient and
 * the FAQPage JSON-LD emitted by each converter page's Server Component. They
 * can't drift apart because there is only one copy of the text.
 */
export const converterFaq = [
  {
    q: 'How accurate is the formatting after conversion?',
    a: 'PDF↔Word/Excel/PowerPoint conversions run through a dedicated conversion service that reconstructs real layout — text position, tables, fonts and images — not just extracted text. PDF to PowerPoint preserves the exact visual appearance of each page, though slide content isn\'t individually editable text (PDFs have no native "slide" structure to reconstruct from). Image and text conversions run in your browser and are lossless for the content they carry.',
  },
  {
    q: 'Is my file uploaded anywhere?',
    a: 'Only Office-format conversions (PDF↔Word/Excel/PowerPoint) are sent to our conversion service, since real formatting fidelity for those isn\'t possible in a browser. Every other conversion — images, PDF↔images, text→PDF — runs entirely on your device and never leaves it.',
  },
  {
    q: 'Why did my conversion fail?',
    a: 'The most common causes are a corrupted or password-protected source file, or the file exceeding the size limit. If Office-document conversion shows as unavailable, our conversion service may be temporarily offline — everything else on this page keeps working regardless.',
  },
  {
    q: 'Can I convert multiple files at once?',
    a: 'Yes — select or drop multiple files and each one is converted in turn, with its own progress and result. Download them individually or all together as a ZIP.',
  },
]
