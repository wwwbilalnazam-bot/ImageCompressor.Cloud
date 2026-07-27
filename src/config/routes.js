import { DOCX_MIME, XLSX_MIME, PPTX_MIME } from './mimeTypes'

/**
 * SINGLE SOURCE OF TRUTH for every public route.
 *
 * One entry per URL, carrying everything that used to be scattered across
 * `AppRouter.jsx` (props), `SEO.jsx` calls (title/description/keywords),
 * `public/sitemap.xml` (priority/changefreq) and the header/footer (labels).
 * Consumed by:
 *   - `src/app/[locale]/**\/page.jsx` via `buildPageMetadata()`
 *   - `src/app/sitemap.js`
 *   - `src/components/layout/Footer.jsx`
 *   - `src/components/layout/Breadcrumbs.jsx`
 *
 * Because all four read the same array, the sitemap can no longer drift out of
 * sync with the real route list (which is exactly how the old hand-maintained
 * sitemap ended up listing two dead URLs while missing ~15 live ones).
 *
 * Fields
 *   slug        URL path *without* the locale prefix. '' is the home page.
 *   category    Drives Footer columns + the Breadcrumbs trail.
 *   component   Which client tool renders on this route (documentation +
 *               a guard against adding a route with no implementation).
 *   props       Exact props handed to that client component.
 *   faq         Key into `src/content/faq/*` — powers both the visible FAQ
 *               list and the FAQPage JSON-LD, from one array.
 *   sitemap     { priority, changefreq } — or `false` to exclude.
 *   seo.<loc>   { title, description, keywords } per locale. Additional
 *               locales are added as extra keys; nothing else changes.
 *   navLabel    Short label used by the footer link lists.
 */

export const CATEGORIES = {
  compress: { id: 'compress', label: 'Compress', href: '' },
  convert: { id: 'convert', label: 'Convert', href: 'converter' },
  pdf: { id: 'pdf', label: 'PDF Tools', href: 'compress-pdf' },
  compare: { id: 'compare', label: 'Compare', href: 'compare' },
  guides: { id: 'guides', label: 'Guides', href: 'guides' },
  company: { id: 'company', label: 'Company', href: 'about' },
}

/** Order the Footer renders its columns in. */
export const CATEGORY_ORDER = ['compress', 'convert', 'pdf', 'compare', 'guides', 'company']

export const ROUTES = [
  // ─────────────────────────────────────────────────────────────────────────
  // Image / file compressor — MainCompressorClient
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: '',
    category: 'compress',
    component: 'MainCompressor',
    // titleKey: the home page is the one route whose UI (not just metadata)
    // is fully wired through next-intl, as the proof-of-pattern for the
    // Spanish locale — see Uploader/TargetSizeSelector/ResultsSection.
    props: { defaultTargetSize: 100, pageTitle: 'Compress Files', titleKey: 'title' },
    sitemap: { priority: 1.0, changefreq: 'daily' },
    navLabel: 'Image & PDF Compressor',
    seo: {
      en: {
        title: 'Free Image & PDF Compressor — Compress to an Exact File Size',
        description:
          'Compress JPG, PNG, WebP, AVIF, GIF and PDF files to an exact target size, right in your browser. Free, instant, no uploads and no signup.',
        keywords:
          'image compressor, compress image, compress pdf, free image compressor, compress to target size, reduce file size',
      },
      es: {
        title: 'Compresor de Imágenes y PDF Gratis — Comprime a un Tamaño Exacto',
        description:
          'Comprime archivos JPG, PNG, WebP, AVIF, GIF y PDF a un tamaño exacto, directamente en tu navegador. Gratis, instantáneo, sin subir archivos y sin registro.',
        keywords:
          'comprimir imagen, comprimir pdf, compresor de imagenes gratis, comprimir a tamaño objetivo, reducir tamaño de archivo',
      },
    },
  },
  {
    slug: 'compress-image-to-20kb',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 20, pageTitle: 'Compress Image to 20KB' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Compress to 20KB',
    seo: {
      en: {
        title: 'Compress Image to 20KB Online — Free & Exact',
        description:
          'Shrink any JPG, PNG or WebP photo down to 20KB while keeping it as sharp as possible. Ideal for forms with strict upload limits. Runs entirely in your browser.',
        keywords: 'compress image to 20kb, reduce image to 20kb, 20kb photo compressor, resize image to 20kb',
      },
    },
  },
  {
    slug: 'compress-image-to-50kb',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 50, pageTitle: 'Compress Image to 50KB' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Compress to 50KB',
    seo: {
      en: {
        title: 'Compress Image to 50KB Online — Free & Exact',
        description:
          'Compress a photo to 50KB without guessing quality percentages — the exact size passport, ID and exam-form uploads usually ask for. Free and fully browser-based.',
        keywords: 'compress image to 50kb, reduce image to 50kb, 50kb photo compressor, passport photo 50kb',
      },
    },
  },
  {
    slug: 'compress-image-to-100kb',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 100, pageTitle: 'Compress Image to 100KB' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Compress to 100KB',
    seo: {
      en: {
        title: 'Compress Image to 100KB Online — Free & Exact',
        description:
          'Hit a 100KB target size exactly, with the highest quality that still fits. Perfect for email attachments and fast-loading web images. No uploads required.',
        keywords: 'compress image to 100kb, reduce image to 100kb, 100kb image compressor, compress jpg to 100kb',
      },
    },
  },
  {
    slug: 'compress-image-to-200kb',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 200, pageTitle: 'Compress Image to 200KB' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Compress to 200KB',
    seo: {
      en: {
        title: 'Compress Image to 200KB Online — Free & Exact',
        description:
          'Reduce a photo to 200KB while keeping detail intact — enough headroom for blog images and social posts. Compression happens locally, so nothing is uploaded.',
        keywords: 'compress image to 200kb, reduce image to 200kb, 200kb image compressor, compress photo 200kb',
      },
    },
  },
  {
    slug: 'compress-image-to-500kb',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 500, pageTitle: 'Compress Image to 500KB' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Compress to 500KB',
    seo: {
      en: {
        title: 'Compress Image to 500KB Online — Free & Exact',
        description:
          'Bring large photos under 500KB with almost no visible quality loss — the sweet spot for high-resolution displays and print previews. Free and private.',
        keywords: 'compress image to 500kb, reduce image to 500kb, 500kb image compressor, compress large photo',
      },
    },
  },
  {
    slug: 'jpg-compressor',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 100, initialFormat: 'image/jpeg', pageTitle: 'Free JPG Compressor' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'JPG Compressor',
    seo: {
      en: {
        title: 'Free JPG Compressor — Compress JPEG Photos Online',
        description:
          'Compress JPG and JPEG photos to any size you name, from 20KB upward. Batch-compress a whole folder and download everything as a ZIP. Nothing leaves your device.',
        keywords: 'jpg compressor, compress jpeg, jpeg compressor online, reduce jpg file size, compress jpg free',
      },
    },
  },
  {
    slug: 'png-compressor',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 100, initialFormat: 'image/png', pageTitle: 'Free PNG Compressor' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PNG Compressor',
    seo: {
      en: {
        title: 'Free PNG Compressor — Reduce PNG File Size Online',
        description:
          'Compress PNG images to a target size, or convert them to WebP/JPG for a much smaller file. Transparency-aware, batch-capable and processed entirely in your browser.',
        keywords: 'png compressor, compress png, reduce png file size, png optimizer, shrink png online',
      },
    },
  },
  {
    slug: 'webp-compressor',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 100, initialFormat: 'image/webp', pageTitle: 'Free WebP Compressor' },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'WebP Compressor',
    seo: {
      en: {
        title: 'Free WebP Compressor — Compress WebP Images Online',
        description:
          'Compress WebP images to an exact file size, or convert JPG and PNG into WebP for the smallest possible result. Free, unlimited and 100% browser-based.',
        keywords: 'webp compressor, compress webp, convert to webp, webp optimizer, reduce webp size',
      },
    },
  },
  {
    // GIF can be decoded but not re-encoded as GIF in any browser (confirmed
    // during the Month 2-3 format-support spike — canvas.toBlob has never
    // supported image/gif as an output). initialFormat is set to PNG rather
    // than 'original' so the output-format dropdown doesn't imply GIF stays
    // GIF, which isn't possible.
    slug: 'gif-compressor',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 100, initialFormat: 'image/png', pageTitle: 'Free GIF Compressor' },
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'GIF Compressor',
    seo: {
      en: {
        title: 'Free GIF Compressor — Reduce GIF File Size Online',
        description:
          'Compress a GIF to a smaller PNG or WebP file. Note: this flattens animated GIFs to a single static frame — canvas can decode GIF in every browser but none can re-encode animation. Free and browser-based.',
        keywords: 'gif compressor, compress gif, reduce gif file size, gif to png, gif to webp',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // File & document converter — FileConverterClient
  //
  // Every route below passes an explicit `initialPresetId`. Previously the
  // page inferred the preset by searching the preset list for a matching
  // output MIME type, which silently picked the wrong preset for any route
  // whose target MIME is shared (four routes output application/pdf, three
  // output image/jpeg, two output image/png).
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'converter',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'image/jpeg', initialPresetId: 'pdf-to-jpg' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'daily' },
    navLabel: 'All Converters',
    seo: {
      en: {
        title: 'Free File Converter — PDF, Word, Excel, PowerPoint & Images',
        description:
          'Convert between PDF, Word, Excel, PowerPoint, JPG, PNG, WebP and plain text with real formatting preserved. Batch convert and download as a ZIP, free.',
        keywords: 'file converter, document converter, pdf converter, convert files online, free online converter',
      },
    },
  },
  {
    slug: 'word-to-pdf',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'application/pdf', initialPresetId: 'word-to-pdf' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Word to PDF',
    seo: {
      en: {
        title: 'Word to PDF Converter — Convert DOCX to PDF Free',
        description:
          'Convert Word documents to PDF with fonts, tables, images and page layout intact. No watermark, no signup, no file-count limit.',
        keywords: 'word to pdf, docx to pdf, convert word to pdf, doc to pdf converter, word to pdf free',
      },
    },
  },
  {
    slug: 'pdf-to-word',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: DOCX_MIME, initialPresetId: 'pdf-to-word' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PDF to Word',
    seo: {
      en: {
        title: 'PDF to Word Converter — Convert PDF to Editable DOCX',
        description:
          'Turn a PDF into an editable Word document with real paragraphs and tables reconstructed, not just dumped plain text. Free, fast and no watermark.',
        keywords: 'pdf to word, pdf to docx, convert pdf to word, pdf to editable word, pdf to word free',
      },
    },
  },
  {
    slug: 'excel-to-pdf',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'application/pdf', initialPresetId: 'excel-to-pdf' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Excel to PDF',
    seo: {
      en: {
        title: 'Excel to PDF Converter — Convert XLSX to PDF Free',
        description:
          'Convert Excel spreadsheets to PDF with column widths, formatting and page breaks preserved. Free, unlimited and no watermark.',
        keywords: 'excel to pdf, xlsx to pdf, convert excel to pdf, spreadsheet to pdf, xls to pdf',
      },
    },
  },
  {
    slug: 'pdf-to-excel',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: XLSX_MIME, initialPresetId: 'pdf-to-excel' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PDF to Excel',
    seo: {
      en: {
        title: 'PDF to Excel Converter — Extract PDF Tables to XLSX',
        description:
          'Convert PDF tables into a real Excel spreadsheet with rows and columns detected properly, so figures stay usable instead of arriving as one text blob.',
        keywords: 'pdf to excel, pdf to xlsx, convert pdf to excel, extract pdf tables, pdf table to spreadsheet',
      },
    },
  },
  {
    slug: 'powerpoint-to-pdf',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'application/pdf', initialPresetId: 'powerpoint-to-pdf' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PowerPoint to PDF',
    seo: {
      en: {
        title: 'PowerPoint to PDF Converter — Convert PPTX to PDF Free',
        description:
          'Convert PowerPoint presentations to PDF with every slide rendered exactly as designed — fonts, images and backgrounds included. Free and watermark-free.',
        keywords: 'powerpoint to pdf, pptx to pdf, convert ppt to pdf, presentation to pdf, slides to pdf',
      },
    },
  },
  {
    slug: 'pdf-to-powerpoint',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: PPTX_MIME, initialPresetId: 'pdf-to-powerpoint' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PDF to PowerPoint',
    seo: {
      en: {
        title: 'PDF to PowerPoint Converter — Convert PDF to PPTX',
        description:
          'Convert a PDF into a PowerPoint deck, one slide per page, preserving the exact visual appearance of the original document. Free, no signup.',
        keywords: 'pdf to powerpoint, pdf to pptx, convert pdf to ppt, pdf to slides, pdf to presentation',
      },
    },
  },
  {
    slug: 'pdf-to-text',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'text/plain', initialPresetId: 'pdf-to-text' },
    faq: 'converter',
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'PDF to Text',
    seo: {
      en: {
        title: 'PDF to Text Converter — Extract Text from PDF Free',
        description:
          'Extract all the text from a PDF into a plain .txt file, page by page. Runs entirely in your browser, so even confidential documents never leave your device.',
        keywords: 'pdf to text, extract text from pdf, pdf to txt, pdf text extractor, copy text from pdf',
      },
    },
  },
  {
    slug: 'txt-to-pdf',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'application/pdf', initialPresetId: 'txt-to-pdf' },
    faq: 'converter',
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'TXT to PDF',
    seo: {
      en: {
        title: 'TXT to PDF Converter — Turn Text Files into PDF Free',
        description:
          'Convert a .txt file into a clean, paginated PDF with genuinely selectable vector text — not a screenshot of your text. Free and fully offline in your browser.',
        keywords: 'txt to pdf, text to pdf, convert text file to pdf, notepad to pdf, txt file to pdf',
      },
    },
  },
  {
    slug: 'pdf-to-jpg',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'image/jpeg', initialPresetId: 'pdf-to-jpg' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PDF to JPG',
    seo: {
      en: {
        title: 'PDF to JPG Converter — Convert PDF Pages to Images',
        description:
          'Convert every page of a PDF into a high-resolution JPG image and download them individually or as a ZIP. Rendered locally, so nothing is uploaded.',
        keywords: 'pdf to jpg, pdf to jpeg, convert pdf to image, pdf pages to images, pdf to jpg free',
      },
    },
  },
  {
    slug: 'pdf-to-png',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'image/png', initialPresetId: 'pdf-to-png' },
    faq: 'converter',
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PDF to PNG',
    seo: {
      en: {
        title: 'PDF to PNG Converter — Convert PDF Pages to PNG',
        description:
          'Turn PDF pages into lossless PNG images at 2x resolution — the right choice for diagrams, screenshots and anything with crisp text edges. Free and private.',
        keywords: 'pdf to png, convert pdf to png, pdf page to png, pdf to image lossless, pdf to png free',
      },
    },
  },
  {
    slug: 'png-to-jpg',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'image/jpeg', initialPresetId: 'png-to-jpg' },
    faq: 'converter',
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'PNG to JPG',
    seo: {
      en: {
        title: 'PNG to JPG Converter — Convert PNG to JPEG Free',
        description:
          'Convert PNG images to JPG for a dramatically smaller file, with transparency flattened onto a clean white background. Batch convert as many as you like.',
        keywords: 'png to jpg, png to jpeg, convert png to jpg, change png to jpg, png to jpg free',
      },
    },
  },
  {
    slug: 'jpg-to-png',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'image/png', initialPresetId: 'jpg-to-png' },
    faq: 'converter',
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'JPG to PNG',
    seo: {
      en: {
        title: 'JPG to PNG Converter — Convert JPEG to PNG Free',
        description:
          'Convert JPG and JPEG photos to lossless PNG, ready for editing or transparency work. Runs in your browser with no upload and no quality loss.',
        keywords: 'jpg to png, jpeg to png, convert jpg to png, change jpg to png, jpg to png free',
      },
    },
  },
  {
    slug: 'optimize-svg',
    category: 'convert',
    component: 'OptimizeSvg',
    props: {},
    sitemap: { priority: 0.7, changefreq: 'weekly' },
    navLabel: 'Optimize SVG',
    seo: {
      en: {
        title: 'Optimize SVG — Minify SVG Files Free',
        description:
          'Strip comments, unused definitions and excess numeric precision from SVG files without changing how they look. Batch-optimize and download as a ZIP, free.',
        keywords: 'optimize svg, minify svg, compress svg, svg file size, svgo online',
      },
    },
  },
  {
    slug: 'webp-to-jpg',
    category: 'convert',
    component: 'FileConverter',
    props: { defaultTargetFormat: 'image/jpeg', initialPresetId: 'webp-to-jpg' },
    faq: 'converter',
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'WebP to JPG',
    seo: {
      en: {
        title: 'WebP to JPG Converter — Convert WebP to JPEG Free',
        description:
          'Convert WebP images to JPG so they open in any app or editor that still refuses WebP. Free, batch-capable and processed entirely on your device.',
        keywords: 'webp to jpg, webp to jpeg, convert webp to jpg, change webp to jpg, webp converter',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Image → PDF — reuses MergePdfImagesClient in `mode="imageToPdf"`, which
  // restricts the uploader to one image format and swaps the copy, rather
  // than exposing the general merge UI (which also accepts PDFs) on a page
  // titled "JPG to PDF Converter". No new engineering: MergePdfImagesClient
  // already builds a PDF from images via convertImagesToPdf().
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'jpg-to-pdf',
    category: 'convert',
    component: 'MergePdfImages',
    props: {
      mode: 'imageToPdf',
      imageFormat: 'image/jpeg',
      pageTitle: 'JPG to PDF Converter',
      pageSubtitle: 'Convert JPG and JPEG photos into a PDF, one image per page. Reorder before converting — nothing is uploaded.',
    },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'JPG to PDF',
    seo: {
      en: {
        title: 'JPG to PDF Converter — Convert JPG Images to PDF Free',
        description:
          'Convert JPG and JPEG photos into a single PDF document, one image per page. Reorder before converting, no watermark, nothing uploaded — runs entirely in your browser.',
        keywords: 'jpg to pdf, convert jpg to pdf, jpeg to pdf, image to pdf converter, jpg to pdf free',
      },
    },
  },
  {
    slug: 'png-to-pdf',
    category: 'convert',
    component: 'MergePdfImages',
    props: {
      mode: 'imageToPdf',
      imageFormat: 'image/png',
      pageTitle: 'PNG to PDF Converter',
      pageSubtitle: 'Convert PNG images into a PDF, one image per page, with transparency flattened cleanly. Nothing is uploaded.',
    },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'PNG to PDF',
    seo: {
      en: {
        title: 'PNG to PDF Converter — Convert PNG Images to PDF Free',
        description:
          'Convert PNG images into a single PDF document, one image per page, with transparency flattened onto a clean background. Free, unlimited and fully browser-based.',
        keywords: 'png to pdf, convert png to pdf, image to pdf converter, png to pdf free, png to pdf online',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PDF suite
  //
  // /pdf-tools is intentionally absent: it used to serve byte-identical
  // content to /compress-pdf and is now a permanent redirect defined in
  // next.config.js, so it is neither rendered nor listed in the sitemap.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'compress-pdf',
    category: 'pdf',
    component: 'CompressPdf',
    props: {},
    faq: 'compressPdf',
    sitemap: { priority: 0.9, changefreq: 'daily' },
    navLabel: 'Compress PDF',
    seo: {
      en: {
        title: 'Compress PDF Online Free — Reduce PDF File Size',
        description:
          'Compress PDF files while keeping text sharp and readable. Automatic, low, medium and high levels plus grayscale, DPI and metadata controls — all in your browser.',
        keywords: 'compress pdf, reduce pdf size, pdf compressor, shrink pdf, compress pdf online free',
      },
      // Terms verified against live iLovePDF/Smallpdf/PDF24 Spanish pages
      // during the Phase 2 keyword research, not machine-translated guesses.
      es: {
        title: 'Comprimir PDF Online Gratis — Reduce el Tamaño del Archivo',
        description:
          'Comprime archivos PDF manteniendo el texto nítido y legible. Niveles automático, bajo, medio y alto, más controles de escala de grises, DPI y metadatos — todo en tu navegador.',
        keywords: 'comprimir pdf, reducir tamaño pdf, compresor de pdf, comprimir pdf online gratis',
      },
    },
  },
  {
    slug: 'merge-pdf',
    category: 'pdf',
    component: 'MergePdfImages',
    props: {},
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Merge PDF & Images',
    seo: {
      en: {
        title: 'Merge PDF & Images — Combine Files into One PDF Free',
        description:
          'Combine multiple PDFs and images into a single document. Drag to reorder, preview every page before merging, and download instantly. Nothing is uploaded.',
        keywords: 'merge pdf, combine pdf, join pdf files, images to pdf, merge pdf online free',
      },
    },
  },
  {
    slug: 'split-pdf',
    category: 'pdf',
    component: 'SplitPdf',
    props: {},
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Split PDF',
    seo: {
      en: {
        title: 'Split PDF — Extract, Divide & Remove PDF Pages Free',
        description:
          'Split a PDF by page ranges, extract or remove selected pages, or break it into equal parts. Preview and reorder pages, then download individually or as a ZIP.',
        keywords: 'split pdf, extract pdf pages, remove pdf pages, divide pdf, split pdf online free',
      },
    },
  },
  {
    // Presents SplitPdfClient's existing "remove" mode as its own focused
    // page rather than the general 5-mode split tool — same engine, same
    // component, just locked to one mode with tailored copy.
    slug: 'remove-pdf-pages',
    category: 'pdf',
    component: 'SplitPdf',
    props: {
      lockMode: 'remove',
      pageTitle: 'Remove PDF Pages',
      pageSubtitle: 'Delete unwanted pages from a PDF and download the rest as a new file. Nothing is uploaded.',
    },
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Remove PDF Pages',
    seo: {
      en: {
        title: 'Remove PDF Pages — Delete Pages from a PDF Free',
        description:
          'Delete unwanted pages from a PDF file and download the rest as a new document. Click to remove, click to restore, all in your browser.',
        keywords: 'remove pdf pages, delete pdf pages, remove pages from pdf, delete pages from pdf free',
      },
    },
  },
  {
    slug: 'rotate-pdf',
    category: 'pdf',
    component: 'RotatePdf',
    props: {},
    sitemap: { priority: 0.9, changefreq: 'weekly' },
    navLabel: 'Rotate PDF',
    seo: {
      en: {
        title: 'Rotate PDF — Fix Sideways or Upside-Down Pages Free',
        description:
          'Rotate any page of a PDF 90 degrees at a time, individually or all at once, and download the corrected file. Free and fully browser-based.',
        keywords: 'rotate pdf, rotate pdf pages, fix pdf orientation, rotate pdf online free, turn pdf page',
      },
    },
  },
  {
    slug: 'watermark-pdf',
    category: 'pdf',
    component: 'WatermarkPdf',
    props: {},
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'Watermark PDF',
    seo: {
      en: {
        title: 'Watermark PDF — Add Text Watermarks Free',
        description:
          'Stamp CONFIDENTIAL, DRAFT, or your own text across every page — custom size, color, opacity and rotation, with a live preview. Free and fully browser-based.',
        keywords: 'watermark pdf, add watermark to pdf, stamp pdf, pdf watermark online free, confidential stamp pdf',
      },
    },
  },
  {
    slug: 'crop-pdf',
    category: 'pdf',
    component: 'CropPdf',
    props: {},
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'Crop PDF',
    seo: {
      en: {
        title: 'Crop PDF — Trim Page Margins Free',
        description:
          'Trim margins from every page of a PDF with independent top, bottom, left and right controls, and a live preview before you export. Free and browser-based.',
        keywords: 'crop pdf, trim pdf margins, resize pdf pages, crop pdf online free, pdf margin cropper',
      },
    },
  },
  {
    slug: 'organize-pdf',
    category: 'pdf',
    component: 'OrganizePdf',
    props: {},
    sitemap: { priority: 0.8, changefreq: 'weekly' },
    navLabel: 'Organize PDF',
    seo: {
      en: {
        title: 'Organize PDF — Reorder, Rotate & Remove Pages Free',
        description:
          'Drag pages to reorder, rotate individual pages, remove and restore pages, then save it all as one document. Free, no signup, fully browser-based.',
        keywords: 'organize pdf, reorder pdf pages, rearrange pdf, pdf page organizer, organize pdf pages free',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Comparison articles — factual, sourced comparisons against named
  // competitors. Content lives in src/content/comparisons/*.js, one file per
  // slug, consumed by the single dynamic `[slug]/page.jsx`. See that folder's
  // README-style comment for the sourcing rule: every claim about a
  // competitor must trace back to something actually observed, not assumed.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'compare',
    category: 'compare',
    component: 'CompareHub',
    props: {},
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Compare',
    seo: {
      en: {
        title: 'Compare — imagecompressor.cloud vs. Other Free File Tools',
        description:
          'Honest, fact-checked comparisons against TinyPNG, iLovePDF, Smallpdf, PDF24, Adobe and others — what each one actually does differently, not just marketing claims.',
        keywords: 'image compressor comparison, pdf tool comparison, best free pdf compressor, ilovepdf vs smallpdf',
      },
    },
  },
  {
    slug: 'compare/tinypng',
    category: 'compare',
    component: 'ComparisonArticle',
    props: { competitorSlug: 'tinypng' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'vs. TinyPNG',
    seo: {
      en: {
        title: 'imagecompressor.cloud vs. TinyPNG — Which Should You Use?',
        description:
          "How this site's image compressor compares to TinyPNG: where files are processed, free-tier limits, and what each one is actually built for.",
        keywords: 'tinypng alternative, imagecompressor vs tinypng, tinypng vs',
      },
    },
  },
  {
    slug: 'compare/ilovepdf',
    category: 'compare',
    component: 'ComparisonArticle',
    props: { competitorSlug: 'ilovepdf' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'vs. iLovePDF',
    seo: {
      en: {
        title: 'imagecompressor.cloud vs. iLovePDF — Which Should You Use?',
        description:
          'A fact-checked comparison with iLovePDF: tool catalog breadth, where processing happens, and whether image compression lives on the same site.',
        keywords: 'ilovepdf alternative, imagecompressor vs ilovepdf, ilovepdf vs',
      },
    },
  },
  {
    slug: 'compare/smallpdf',
    category: 'compare',
    component: 'ComparisonArticle',
    props: { competitorSlug: 'smallpdf' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'vs. Smallpdf',
    seo: {
      en: {
        title: 'imagecompressor.cloud vs. Smallpdf — Which Should You Use?',
        description:
          "How this site compares to Smallpdf, including a gap most people don't expect: Smallpdf has no standalone image compressor.",
        keywords: 'smallpdf alternative, imagecompressor vs smallpdf, smallpdf vs',
      },
    },
  },
  {
    slug: 'compare/pdf24',
    category: 'compare',
    component: 'ComparisonArticle',
    props: { competitorSlug: 'pdf24' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'vs. PDF24',
    seo: {
      en: {
        title: 'imagecompressor.cloud vs. PDF24 — Which Should You Use?',
        description:
          "How this site compares to PDF24: tool catalog size, where files are processed, and why PDF24 can't compress images.",
        keywords: 'pdf24 alternative, imagecompressor vs pdf24, pdf24 vs',
      },
    },
  },
  {
    slug: 'compare/adobe',
    category: 'compare',
    component: 'ComparisonArticle',
    props: { competitorSlug: 'adobe' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'vs. Adobe Acrobat',
    seo: {
      en: {
        title: "imagecompressor.cloud vs. Adobe's Free Tools — Which Should You Use?",
        description:
          "How this site compares to Adobe's free online PDF and image tools, including why Adobe's JPEG compression runs through a third-party add-on.",
        keywords: 'adobe acrobat alternative free, imagecompressor vs adobe, adobe compress pdf alternative',
      },
    },
  },
  {
    slug: 'compare/imagecompressor-com',
    category: 'compare',
    component: 'ComparisonArticle',
    props: { competitorSlug: 'imagecompressor-com' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'vs. ImageCompressor.com',
    seo: {
      en: {
        title: 'imagecompressor.cloud vs. ImageCompressor.com — Not the Same Site',
        description:
          "Landed here looking for ImageCompressor.com? Here's exactly how the two differ — different company, different tools, different name by one word.",
        keywords: 'imagecompressor.com, imagecompressor cloud vs com, image compressor sites',
      },
    },
  },
  {
    slug: 'compare/browser-vs-server-tools',
    category: 'compare',
    component: 'ComparisonArticle',
    props: { competitorSlug: 'browser-vs-server-tools' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'Browser vs. Server Tools',
    seo: {
      en: {
        title: 'Browser-Based vs. Server-Based File Tools — The Actual Difference',
        description:
          'What "processed in your browser" really means technically, why almost every free PDF/image tool works the other way, and how to check which kind any tool actually is.',
        keywords: 'browser based file tools, client side pdf compression, is online file compressor safe, no upload file converter',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Guides — pillar/cluster content. One hub + one dynamic [slug] page share
  // the same content/guides/*.js pattern as the comparisons above. Each entry
  // carries a `pillar` matching a tool category, for grouping on the hub page.
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'guides',
    category: 'guides',
    component: 'GuidesHub',
    props: {},
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Guides',
    seo: {
      en: {
        title: 'Guides — imagecompressor.cloud',
        description:
          'Practical guides on image compression, PDF file size, document conversion and page management — no fluff, written to actually answer the question.',
        keywords: 'pdf guides, image compression guide, how to compress pdf, pdf help',
      },
    },
  },
  {
    slug: 'guides/jpeg-vs-png-vs-webp',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'jpeg-vs-png-vs-webp' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'JPEG vs PNG vs WebP',
    seo: {
      en: {
        title: 'JPEG vs PNG vs WebP: Which Should You Actually Use?',
        description:
          'A practical answer, not a format spec dump: which of JPEG, PNG and WebP to use for photos, screenshots, logos and transparency — and why.',
        keywords: 'jpeg vs png, png vs webp, best image format, when to use webp, image format comparison',
      },
    },
  },
  {
    slug: 'guides/why-photos-look-worse-after-compressing',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'why-photos-look-worse-after-compressing' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Why Compression Hurts Quality',
    seo: {
      en: {
        title: 'Why Your Photo Looks Worse After Compressing (And How to Avoid It)',
        description:
          'Blocky edges, muddy color, blurry text — what actually causes visible compression damage, and the settings that prevent it.',
        keywords: 'image compression quality loss, jpeg artifacts, why does compressing reduce quality, blurry compressed image',
      },
    },
  },
  {
    slug: 'guides/image-size-for-social-media',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'image-size-for-social-media' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Image Size for Social Media',
    seo: {
      en: {
        title: 'The Right Image Size for Every Social Platform',
        description:
          'File size and dimension guidance for Instagram, LinkedIn, X, Facebook and email — and why "just make it small" is the wrong instinct.',
        keywords: 'image size for instagram, linkedin image size, best image size social media, image dimensions guide',
      },
    },
  },
  {
    slug: 'guides/passport-photo-size-by-country',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'passport-photo-size-by-country' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'Passport Photo Size Requirements',
    seo: {
      en: {
        title: 'Passport, Visa & ID Photo Size Requirements — By Country',
        description:
          'Exact photo dimensions and file-size limits for US, UK, Schengen, India and Canadian passport and visa applications, and how to hit them precisely.',
        keywords: 'passport photo size kb, visa photo requirements, id photo size, passport photo dimensions by country',
      },
    },
  },
  {
    slug: 'guides/exam-form-photo-signature-size',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'exam-form-photo-signature-size' },
    sitemap: { priority: 0.7, changefreq: 'monthly' },
    navLabel: 'Exam Form Photo & Signature Size',
    seo: {
      en: {
        title: 'Government Exam Form Photo & Signature Size — SSC, UPSC, IBPS',
        description:
          'Why exam-form photo and signature uploads keep getting rejected, and how to hit an exact KB range for both instead of guessing at a quality slider.',
        keywords: 'ssc exam photo size, upsc application photo size, signature size for exam form, ibps photo size kb',
      },
    },
  },
  {
    slug: 'guides/resume-job-application-photo-size',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'resume-job-application-photo-size' },
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'Resume Photo Size',
    seo: {
      en: {
        title: 'Resume & Job Application Photo Size Guide',
        description:
          'When a resume photo is expected (and when to skip it), why a bloated headshot slows down applicant tracking systems, and the right size to target.',
        keywords: 'resume photo size, job application photo size, cv photo size, headshot file size for resume',
      },
    },
  },
  {
    slug: 'guides/lossy-vs-lossless-compression',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'lossy-vs-lossless-compression' },
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'Lossy vs Lossless',
    seo: {
      en: {
        title: 'Lossy vs Lossless Compression, Actually Explained',
        description:
          'What "lossy" and "lossless" really mean at the byte level, which formats use which, and how to pick correctly for photos versus diagrams.',
        keywords: 'lossy vs lossless, what is lossless compression, image compression explained',
      },
    },
  },
  {
    slug: 'guides/why-is-my-pdf-so-big',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'why-is-my-pdf-so-big' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Why Is My PDF So Big?',
    seo: {
      en: {
        title: 'Why Is My PDF So Big? 6 Real Causes',
        description:
          'Uncompressed scan images, embedded fonts, duplicate resources and more — the actual reasons a PDF bloats, and which ones compression can fix.',
        keywords: 'why is my pdf so large, reduce pdf file size, pdf too big, pdf file size causes',
      },
    },
  },
  {
    slug: 'guides/compress-pdf-for-email',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'compress-pdf-for-email' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Compress PDF for Email',
    seo: {
      en: {
        title: 'Compress PDF for Email: The Actual Size Limits by Provider',
        description:
          "Gmail, Outlook, Yahoo and iCloud Mail's real attachment limits, what happens when you exceed them, and the target size to aim for.",
        keywords: 'pdf too large for email, gmail attachment size limit, compress pdf for email, email attachment size limit',
      },
    },
  },
  {
    slug: 'guides/scanned-vs-text-pdf',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'scanned-vs-text-pdf' },
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'Scanned vs Text PDF',
    seo: {
      en: {
        title: 'Scanned PDF vs Text PDF: Why One Compresses So Much Better',
        description:
          'The structural difference between a PDF built from real text and one built from a photographed page, and why it changes everything about compression.',
        keywords: 'scanned pdf vs text pdf, why wont my pdf compress, image based pdf, searchable pdf vs scanned',
      },
    },
  },
  {
    slug: 'guides/pdf-to-word-formatting-issues',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'pdf-to-word-formatting-issues' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'PDF to Word Formatting Issues',
    seo: {
      en: {
        title: "PDF to Word Keeps Breaking My Tables — Here's Why",
        description:
          "PDF doesn't store tables, columns, or paragraphs the way Word does — what conversion tools are actually reconstructing, and why it sometimes goes wrong.",
        keywords: 'pdf to word table broken, pdf to word formatting wrong, pdf conversion issues, why does pdf to word look bad',
      },
    },
  },
  {
    slug: 'guides/export-to-pdf-vs-print-to-pdf',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'export-to-pdf-vs-print-to-pdf' },
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: '"Export to PDF" vs "Print to PDF"',
    seo: {
      en: {
        title: '"Export to PDF" vs "Print to PDF": What\'s Actually Different',
        description:
          'Two ways to make a PDF from the same document that can produce very different files — what each one keeps, drops, or breaks, and when to use which.',
        keywords: 'export to pdf vs print to pdf, best way to make a pdf, print to pdf quality',
      },
    },
  },
  {
    slug: 'guides/what-is-pdfa',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'what-is-pdfa' },
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'What Is PDF/A?',
    seo: {
      en: {
        title: 'What Is PDF/A, and Do You Actually Need It?',
        description:
          "PDF/A is an archival standard, not just 'a fancier PDF' — what it actually restricts, who requires it, and how to tell if a form is asking for it.",
        keywords: 'what is pdf/a, pdf/a vs pdf, pdf archival format, pdf/a compliance',
      },
    },
  },
  {
    slug: 'guides/combine-scanned-pages-from-phone',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'combine-scanned-pages-from-phone' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Combine Scanned Pages Into One PDF',
    seo: {
      en: {
        title: 'How to Combine Scanned Phone Photos Into One PDF',
        description:
          "Your phone's scanner app saves each page as a separate file — how to combine them into a single ordered PDF without emailing them to yourself one by one.",
        keywords: 'combine scanned pages into one pdf, merge phone scans, multiple photos to one pdf, scan multiple pages iphone',
      },
    },
  },
  {
    slug: 'guides/split-pdf-by-chapter',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'split-pdf-by-chapter' },
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'Split a PDF by Chapter',
    seo: {
      en: {
        title: 'Splitting a PDF by Chapter Without Counting Pages by Hand',
        description:
          "How to find chapter boundaries in a PDF without manually scrolling and counting, then split it into per-chapter files in one pass.",
        keywords: 'split pdf by chapter, split large pdf into sections, extract pdf chapters',
      },
    },
  },
  {
    slug: 'guides/fix-sideways-scanned-pdf',
    category: 'guides',
    component: 'Guide',
    props: { guideSlug: 'fix-sideways-scanned-pdf' },
    sitemap: { priority: 0.6, changefreq: 'monthly' },
    navLabel: 'Fix a Sideways-Scanned PDF',
    seo: {
      en: {
        title: 'How to Fix a Sideways or Upside-Down Scanned PDF',
        description:
          "Why scanners and phone cameras produce sideways pages in the first place, and how to correct the rotation without rescanning the document.",
        keywords: 'pdf sideways, fix rotated pdf, scanned pdf wrong orientation, upside down pdf pages',
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // Company pages
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'about',
    category: 'company',
    component: 'Static',
    props: {},
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'About',
    seo: {
      en: {
        title: 'About ImageCompress Cloud — Browser-Based File Tools',
        description:
          'Why ImageCompress Cloud processes your files in the browser instead of on a server, what that means for your privacy, and how the tools actually work.',
        keywords: 'about imagecompressor cloud, browser based file tools, private image compressor',
      },
    },
  },
  {
    slug: 'how-it-works',
    category: 'company',
    component: 'Static',
    props: {},
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'How Your Files Stay Private',
    seo: {
      en: {
        title: 'How Your Files Stay Private — Verify It Yourself',
        description:
          'A technical walkthrough of what actually happens when you use this site — and the exact DevTools steps to confirm your file was never uploaded, without taking our word for it.',
        keywords: 'is online pdf compressor safe, verify browser based file processing, no upload file tools, private pdf tools',
      },
    },
  },
  {
    slug: 'privacy',
    category: 'company',
    component: 'Static',
    props: {},
    sitemap: { priority: 0.5, changefreq: 'monthly' },
    navLabel: 'Privacy Policy',
    seo: {
      en: {
        title: 'Privacy Policy — ImageCompress Cloud',
        description:
          'What we collect (almost nothing), what never leaves your device (your files), and which third-party services are involved. Plain language, no legalese.',
        keywords: 'privacy policy, image compressor privacy, no upload image compressor',
      },
    },
  },
  {
    slug: 'contact',
    category: 'company',
    component: 'Static',
    props: {},
    sitemap: { priority: 0.4, changefreq: 'monthly' },
    navLabel: 'Contact',
    seo: {
      en: {
        title: 'Contact ImageCompress Cloud — Support & Feedback',
        description:
          'Report a bug, request a tool, or ask a privacy question. Email us and we will get back to you — no ticket portal, no account required.',
        keywords: 'contact imagecompressor cloud, report bug, feature request, support',
      },
    },
  },
]

/** Look up a route entry by slug ('' for the home page). Throws if unknown. */
export function getRoute(slug) {
  const route = ROUTES.find((r) => r.slug === slug)
  if (!route) {
    throw new Error(`Unknown route slug: "${slug}" — add it to src/config/routes.js`)
  }
  return route
}

/** All routes in a category, in declaration order — used by the Footer. */
export function routesInCategory(categoryId) {
  return ROUTES.filter((r) => r.category === categoryId)
}
