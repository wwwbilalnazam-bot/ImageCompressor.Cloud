/**
 * Sourced from direct HTTP fetches of smallpdf.com pages (titles, meta, and a
 * grep of raw HTML for JSON-LD markers/tool availability). The "no standalone
 * image compressor" claim was verified by requesting smallpdf.com/compress-image
 * and equivalent paths directly and getting 404s, not inferred.
 */
const smallpdf = {
  competitor: 'Smallpdf',
  intro: [
    "Smallpdf is a polished, widely-used PDF toolkit with genuinely good structured data on its own pages — it's one of the more technically solid competitors in this space. Where it has a real, verifiable gap is image compression: Smallpdf has no standalone image compressor at all.",
    'The only way to shrink an image on Smallpdf is indirect: convert it to a PDF, compress that PDF, then export back to an image. imagecompressor.cloud compresses images directly, plus runs its PDF tools in your browser rather than on a server.',
  ],
  rows: [
    {
      label: 'Where processing happens',
      us: 'In your browser for compression, merging, splitting and PDF↔image conversion (Office-format conversion is the one exception, and uses a server)',
      them: "On Smallpdf's servers",
    },
    {
      label: 'Compress an image directly?',
      us: 'Yes — dedicated image compressor',
      them: 'No — only indirectly, by converting to PDF first, compressing, then exporting back',
    },
    {
      label: 'Pricing',
      us: 'Free',
      them: 'Free tier, plus paid Pro/Team subscriptions with a 7-day trial',
    },
    {
      label: 'Account required',
      us: 'No',
      them: 'No for the free tier',
    },
    {
      label: 'Structured data',
      us: 'Organization, WebSite, SoftwareApplication, FAQPage and Breadcrumb markup',
      them: 'FAQPage, Breadcrumb, Organization and WebSite markup — one of the more complete implementations we checked',
    },
  ],
  verdict:
    "Give Smallpdf credit where it's due: solid product, solid technical SEO. But if you came here to compress an image, Smallpdf genuinely can't do that in one step — and if you'd rather your PDF never touched a server at all, this site is built around that instead.",
  cta: { slug: 'compress-pdf', label: 'Try the PDF compressor' },
}

export default smallpdf
