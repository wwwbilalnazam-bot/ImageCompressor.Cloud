const fixSidewaysScannedPdf = {
  pillar: 'pdf',
  intro: [
    'A sideways or upside-down page in an otherwise normal PDF is almost always a scanning artifact, not something wrong with the document itself — and it\'s a two-second fix once you know it\'s just a rotation flag, not a re-scan.',
  ],
  sections: [
    {
      heading: 'Why it happens',
      paragraphs: [
        "Scanners and scanning apps capture whatever orientation the physical page or camera was in — a document fed into a scanner sideways, or a phone held in a different orientation than the previous page, produces a page that's genuinely stored rotated 90 or 180 degrees from the rest of the document. It's especially common in the middle of multi-page scans, where one page got fed differently from the rest.",
      ],
    },
    {
      heading: 'Rotation is metadata, not re-processing',
      paragraphs: [
        "Every PDF page carries a rotation value alongside its content — the actual page content doesn't need to be touched or re-rendered to fix the orientation, only that rotation value needs to change. This is why rotating a PDF page is instant and lossless: nothing about the underlying image or text is modified, only how it's displayed.",
      ],
    },
    {
      heading: 'Fixing it',
      paragraphs: [
        "Open the PDF in a rotate tool, find the specific page (or pages) that are wrong, and rotate just those — 90° at a time until they're upright, since a page might need one turn or three depending on which way it's off. There's no need to rotate the whole document if only a page or two is affected.",
      ],
    },
  ],
  cta: { slug: 'rotate-pdf', label: 'Rotate PDF pages' },
}

export default fixSidewaysScannedPdf
