const scannedVsTextPdf = {
  pillar: 'pdf',
  intro: [
    'Two PDFs can look identical on screen and compress completely differently, because a PDF doesn\'t store "a page" — it stores either real text and vector instructions, or a photograph of a page. Those are very different amounts of data.',
  ],
  sections: [
    {
      heading: 'A text PDF stores instructions, not pixels',
      paragraphs: [
        'When a PDF is generated from a Word document, a webpage, or any "real" digital source, each page is a set of drawing instructions: "place the character A at this position, in this font, at this size." Text stored this way is tiny — a whole page of dense text is often a few kilobytes of actual instruction data, because letters and words repeat constantly and compress extremely well.',
      ],
    },
    {
      heading: 'A scanned PDF stores a photograph of the page',
      paragraphs: [
        "A scanner or a phone camera doesn't know what a letter \"A\" is — it captures a grid of pixels representing however the page happened to look, shadows, paper texture and all. That page becomes one embedded image, typically hundreds of kilobytes to a few megabytes depending on scan resolution, and every one of those pixels has to be stored or compressed as image data — there's no shortcut, because the PDF has no idea there's text on it at all.",
      ],
    },
    {
      heading: 'Why this changes what compression can do',
      paragraphs: [
        "Compressing a text PDF mostly can't shrink the text itself much further — it's already tiny and already compressed by the PDF format's built-in stream compression. Any size reduction on a text PDF usually comes from images or fonts embedded alongside the text, not the text itself.",
        "Compressing a scanned PDF is fundamentally an image-compression problem: re-encoding each page's embedded photo at a lower quality or resolution, the same tradeoffs that apply to compressing any photograph apply here. This is also why scanned PDFs typically shrink dramatically under compression while already-small text PDFs barely change size — there's simply more image data to work with.",
      ],
    },
    {
      heading: 'How to tell which kind you have',
      paragraphs: [
        "The simplest test: try to select and copy text from the PDF. If you can select individual words, it's a text PDF. If clicking and dragging just selects the whole page like an image (or does nothing), it's scanned — and running it through OCR (optical character recognition) is the only way to make its text genuinely searchable and selectable, compression won't add that capability.",
      ],
    },
  ],
  cta: { slug: 'compress-pdf', label: 'Compress a scanned PDF' },
}

export default scannedVsTextPdf
