const whatIsPdfa = {
  pillar: 'convert',
  intro: [
    'PDF/A comes up when a form or institution specifically requires it, usually without explaining why — it\'s not a better PDF, it\'s a more restricted one, built for a specific purpose regular PDF doesn\'t serve.',
  ],
  sections: [
    {
      heading: 'It\'s an archival standard, not a quality tier',
      paragraphs: [
        "PDF/A (ISO 19005) is designed for long-term archiving — the goal is that a PDF/A file opens and looks identical in 50 years, regardless of what software or fonts exist by then. Regular PDF has no such guarantee: it can reference external fonts that might not be installed later, external content, or features tied to specific software versions.",
      ],
    },
    {
      heading: 'What it actually restricts',
      paragraphs: [],
      list: [
        'All fonts must be embedded in the file — nothing can rely on a font being installed on the viewing device',
        'No audio, video, or executable JavaScript content — anything that depends on software capabilities that might not exist later',
        'No encryption or password protection — an archived file needs to remain openable indefinitely',
        'Color must be defined in a device-independent way, so it renders consistently regardless of the display or printer used',
      ],
    },
    {
      heading: 'Who actually requires it',
      paragraphs: [
        'Government records systems, legal filings, medical records, and academic thesis/dissertation submissions commonly require PDF/A specifically, because these are documents with genuine long-term retention requirements — sometimes decades, sometimes permanently. If a form or institution says "PDF/A required," it\'s almost always one of these contexts.',
      ],
    },
    {
      heading: 'Do you need it?',
      paragraphs: [
        "If nothing you're submitting to has explicitly asked for PDF/A, you don't need it — a regular PDF is fine, and PDF/A's restrictions (no encryption, mandatory font embedding) can even work against you for everyday use. Only convert to PDF/A when a specific requirement names it.",
      ],
    },
  ],
  cta: { slug: 'compress-pdf', label: 'Work with a PDF' },
}

export default whatIsPdfa
