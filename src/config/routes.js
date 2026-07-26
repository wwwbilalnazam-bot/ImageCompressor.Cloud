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
  company: { id: 'company', label: 'Company', href: 'about' },
}

/** Order the Footer renders its columns in. */
export const CATEGORY_ORDER = ['compress', 'convert', 'pdf', 'company']

export const ROUTES = [
  // ─────────────────────────────────────────────────────────────────────────
  // Image / file compressor — MainCompressorClient
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: '',
    category: 'compress',
    component: 'MainCompressor',
    props: { defaultTargetSize: 100, pageTitle: 'Compress Files' },
    sitemap: { priority: 1.0, changefreq: 'daily' },
    navLabel: 'Image & PDF Compressor',
    seo: {
      en: {
        title: 'Free Image & PDF Compressor — Compress to an Exact File Size',
        description:
          'Compress JPG, PNG, WebP, AVIF and PDF files to an exact target size, right in your browser. Free, instant, no uploads and no signup.',
        keywords:
          'image compressor, compress image, compress pdf, free image compressor, compress to target size, reduce file size',
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
