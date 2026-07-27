const exportToPdfVsPrintToPdf = {
  pillar: 'convert',
  intro: [
    'Both produce a PDF from the same document, but they go through different pipelines internally, and the results aren\'t always equivalent — one preserves more of the original document than the other.',
  ],
  sections: [
    {
      heading: '"Export to PDF" (or "Save as PDF")',
      paragraphs: [
        'This uses the source application\'s own PDF export engine, which has direct access to the document\'s real structure — actual paragraphs, actual table objects, actual embedded fonts and hyperlinks. A Word document exported to PDF this way keeps working hyperlinks, a proper document outline/bookmarks if headings are structured correctly, and searchable, selectable text drawn from the real characters, not an image of them.',
      ],
    },
    {
      heading: '"Print to PDF"',
      paragraphs: [
        'This routes the document through the operating system\'s print pipeline, using a virtual "printer" that captures print output as a PDF instead of physical paper. Because it goes through the same path as printing to an actual printer, it generally reproduces visual layout accurately — but it can lose things that only exist for on-screen or interactive use: hyperlinks sometimes don\'t survive, form fields can become flat/uneditable, and document structure (bookmarks, tagged headings) is often stripped since a physical printer never needed that information.',
      ],
    },
    {
      heading: 'When it actually matters',
      paragraphs: [
        "For a simple document you just need to look right, either method usually works fine. It matters when the PDF needs to do more than just display: if you need working hyperlinks, an editable form, proper accessibility tagging for screen readers, or a navigable bookmark outline, use the source application's direct \"Export to PDF\" rather than printing to PDF — the difference in output isn't visual, so it's easy to not notice until someone tries to click a link that no longer works.",
      ],
    },
  ],
  cta: { slug: 'word-to-pdf', label: 'Convert Word to PDF' },
}

export default exportToPdfVsPrintToPdf
