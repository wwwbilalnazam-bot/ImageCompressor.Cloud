const pdfToWordFormattingIssues = {
  pillar: 'convert',
  intro: [
    "PDF to Word conversion isn't lossy the way image compression is — it's reconstructive. The converter has to guess the original document structure from what the PDF actually stores, and that guess is where things break.",
  ],
  sections: [
    {
      heading: 'PDF doesn\'t store "a table" — it stores positioned lines and text',
      paragraphs: [
        'A table in Word is a real structural object: rows, columns, cell boundaries the software understands as a table. A PDF has no such concept. What looks like a table in a PDF is usually just text positioned at specific x/y coordinates, with separate thin rectangles drawn for the gridlines — visually a table, structurally just a pile of unconnected text and shapes.',
        "Converting that back to Word means inferring which text belongs in which cell purely from position — text that's roughly aligned in columns, near lines that look like a grid. This works well for simple, evenly-spaced tables and breaks down for merged cells, irregular spacing, or tables that span page breaks.",
      ],
    },
    {
      heading: 'Multi-column layouts are a similar problem',
      paragraphs: [
        "Same issue in a different shape: a PDF stores text positioned in two visual columns, not \"this is a two-column section.\" A converter has to detect the column break from position alone, and text that runs close to the gap between columns can get interleaved in the wrong reading order.",
      ],
    },
    {
      heading: 'What converts reliably vs. what doesn\'t',
      paragraphs: [],
      list: [
        'Reliable: single-column body text, standard paragraph formatting, simple regular tables',
        'Usually fine: headers/footers, basic bullet lists, embedded images',
        'Often breaks: complex or merged-cell tables, multi-column layouts, text boxes overlapping other content, unusual fonts substituted with a close match',
      ],
    },
    {
      heading: 'The practical takeaway',
      paragraphs: [
        "If a PDF's layout is simple, conversion accuracy is usually very high. If it's a densely-formatted document (a form, a complex report with nested tables), expect to do some manual cleanup after conversion — that's not a broken tool, it's the nature of reconstructing structure that was never actually stored in the file to begin with.",
      ],
    },
  ],
  cta: { slug: 'pdf-to-word', label: 'Convert a PDF to Word' },
}

export default pdfToWordFormattingIssues
