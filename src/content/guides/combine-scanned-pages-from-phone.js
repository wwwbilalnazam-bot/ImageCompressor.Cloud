const combineScannedPagesFromPhone = {
  pillar: 'pdf',
  intro: [
    'Phone scanner apps almost always save each page as a separate image or a separate single-page PDF — useful for capturing quickly, useless for actually sending a multi-page document as one file.',
  ],
  sections: [
    {
      heading: 'Why this happens',
      paragraphs: [
        "Scanner apps are built around a capture-one-page-at-a-time workflow, and most save each capture as its own file by default so you can review and retake individual pages before finalizing. Some apps do let you build a multi-page document within the app itself, but plenty of people scan pages individually, end up with a camera roll full of separate images, and then need to combine them after the fact.",
      ],
    },
    {
      heading: 'The straightforward fix',
      paragraphs: [
        'Whether you\'ve got several image files (JPG/PNG) or several single-page PDFs, the fix is the same: a merge tool that accepts both. Add the pages in the order they should appear — most tools let you drag to reorder afterward if you scanned out of sequence — and combine them into one PDF.',
      ],
    },
    {
      heading: 'Getting the order right without renumbering files',
      paragraphs: [
        "You don't need to rename or renumber your files beforehand. Add them in whatever order they land, then reorder visually — dragging thumbnails is faster and less error-prone than trying to get filenames like scan_1.jpg, scan_2.jpg right, especially past scan_9.jpg where alphabetical and numerical sorting disagree.",
      ],
    },
  ],
  cta: { slug: 'merge-pdf', label: 'Combine scans into one PDF' },
}

export default combineScannedPagesFromPhone
