const splitPdfByChapter = {
  pillar: 'pdf',
  intro: [
    "Splitting a long PDF into per-chapter files is easy once you know the page ranges — the actual work is figuring out where each chapter starts, which most tools don't help with at all.",
  ],
  sections: [
    {
      heading: 'Finding chapter boundaries without scrolling through the whole document',
      paragraphs: [
        "Check the PDF's bookmark panel first (usually a sidebar icon in your PDF viewer) — many PDFs, especially ones exported from Word or a publishing tool, already have a navigable outline with chapter titles and their starting pages built in. If bookmarks exist, this is by far the fastest way to get exact page numbers.",
        'If there\'s no bookmark outline, the table of contents at the front of the document usually lists a starting page per chapter — cross-reference those printed page numbers against the PDF\'s actual page count (they can differ if there\'s a preface or unnumbered front matter) and you have your ranges without reading through the whole thing.',
      ],
    },
    {
      heading: 'Splitting by ranges once you have them',
      paragraphs: [
        'Once you know chapter 1 is pages 1-24, chapter 2 is 25-51, and so on, a page-range split tool turns that list directly into separate files in one pass — no need to extract each range one at a time.',
      ],
    },
    {
      heading: 'If chapters are roughly equal length',
      paragraphs: [
        "For documents without clear chapter breaks — a long report you just want broken into manageable chunks — splitting into equal-sized parts (every N pages) is faster than finding exact boundaries, if exact chapter alignment doesn't matter for your use case.",
      ],
    },
  ],
  cta: { slug: 'split-pdf', label: 'Split a PDF by page range' },
}

export default splitPdfByChapter
