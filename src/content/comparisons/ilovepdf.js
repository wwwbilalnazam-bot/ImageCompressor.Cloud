/**
 * Sourced from direct HTTP fetches of ilovepdf.com/iloveimg.com pages (exact
 * titles, meta, and a grep of raw HTML for JSON-LD markers). Where something
 * wasn't directly observed (e.g. exact server architecture), it's described
 * as how hosted SaaS tools generally work rather than stated as fact-checked.
 */
const ilovepdf = {
  competitor: 'iLovePDF',
  intro: [
    "iLovePDF is a large, well-established PDF toolkit — genuinely one of the broadest catalogs in this category, with compress, merge, split, rotate, unlock, e-sign and more. Image tools live on a separate sister site, iloveimg.com, rather than the same domain.",
    "Like essentially every large hosted PDF service, iLovePDF's tools run on their servers: your file is uploaded, processed, and returned. imagecompressor.cloud takes the opposite approach for most of its tools — the file stays in your browser.",
  ],
  rows: [
    {
      label: 'Where processing happens',
      us: 'In your browser for compression, merging, splitting and PDF↔image conversion. Word/Excel/PowerPoint conversion is the one exception that uses a server, since faithfully rebuilding Office layout isn\'t something a browser can do alone.',
      them: 'On iLovePDF\'s servers for every tool',
    },
    {
      label: 'Image + PDF tools, one site?',
      us: 'Yes — same domain, same upload flow',
      them: 'No — PDF tools on ilovepdf.com, image tools on a separate domain, iloveimg.com',
    },
    {
      label: 'Tool catalog breadth',
      us: 'Compress, merge, split, rotate, remove pages, convert (growing)',
      them: '25+ tools, including e-signing and PDF editing this site does not yet offer',
    },
    {
      label: 'Account required',
      us: 'No',
      them: 'No for the free tier',
    },
    {
      label: 'Structured data (rich results eligibility)',
      us: 'Organization, WebSite, SoftwareApplication, FAQPage and Breadcrumb markup on every page',
      them: 'None found in either site\'s HTML at the time of this comparison',
    },
  ],
  verdict:
    "If you need e-signing, PDF editing, or a tool this site hasn't built yet, iLovePDF's catalog is broader today — that's a fair advantage to acknowledge. If what you actually want is compress, merge, split or convert without your file leaving your machine, and without switching domains between PDF and image tools, this site does that in one place.",
  cta: { slug: 'compress-pdf', label: 'Try the PDF compressor' },
}

export default ilovepdf
