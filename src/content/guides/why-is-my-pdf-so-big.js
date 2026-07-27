const whyIsMyPdfSoBig = {
  pillar: 'pdf',
  intro: [
    'A PDF is a container, not a single format — its size comes from what got packed inside it, and different causes need different fixes. Here are the ones that actually matter.',
  ],
  sections: [
    {
      heading: '1. High-resolution scanned images',
      paragraphs: [
        "The single biggest cause, by far: a PDF made by scanning paper pages stores each page as a full raster image, usually at 300 DPI or higher — appropriate for print, wildly oversized for screen reading or email. A 20-page scanned document at high DPI can easily run to tens of megabytes, where the same content as real text would be a few hundred kilobytes.",
      ],
    },
    {
      heading: '2. Embedded fonts (especially full font files, not subsets)',
      paragraphs: [
        "PDFs commonly embed the fonts they use, so the document renders identically on any device. A well-built PDF embeds only the specific characters actually used (a \"subset\"); some tools embed the entire font file regardless, which can add hundreds of kilobytes per unique font — multiplied if a document uses several typefaces.",
      ],
    },
    {
      heading: '3. Duplicate embedded resources',
      paragraphs: [
        "A logo or background image pasted onto every page should be stored once and referenced repeatedly. Some document generators instead embed a fresh copy on every page. A 200KB logo repeated across 50 pages, stored inefficiently, adds 10MB for an image that should have added 200KB total.",
      ],
    },
    {
      heading: '4. Uncompressed or poorly compressed embedded images',
      paragraphs: [
        'Even non-scanned PDFs often contain photos or screenshots pasted in at full resolution and without re-compression — a 4000×3000 pixel photo embedded at full size and quality inside a report that only displays it at postage-stamp size.',
      ],
    },
    {
      heading: '5. Unused or leftover data from editing',
      paragraphs: [
        "PDFs edited repeatedly can accumulate deleted content that isn't actually removed from the file — earlier revisions, unused form fields, orphaned objects. This is why \"save as\" or a dedicated compression pass sometimes shrinks a file dramatically even with no visible content changes.",
      ],
    },
    {
      heading: '6. Complex vector graphics or forms',
      paragraphs: [
        "Detailed vector illustrations, maps, or forms with many fields generate a large number of internal PDF objects — each with its own overhead. This is a real but comparatively minor contributor next to the first two causes.",
      ],
    },
    {
      heading: 'What compression can and can\'t fix',
      paragraphs: [
        "Causes 1, 3 and 4 — image-related bloat — are exactly what PDF compression targets: re-encoding the embedded images at a lower size while leaving text and structure untouched. Cause 2 (fonts) and cause 6 (vector complexity) generally aren't touched by standard compression, since removing font data or simplifying vectors risks visibly breaking the document.",
      ],
    },
  ],
  cta: { slug: 'compress-pdf', label: 'Compress a PDF now' },
}

export default whyIsMyPdfSoBig
