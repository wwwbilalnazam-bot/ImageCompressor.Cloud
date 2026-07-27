/**
 * Sourced from direct HTTP fetches of tools.pdf24.org (titles, meta, JSON-LD
 * markers) and its public /en/all-tools directory, which was checked directly
 * for an image-compression entry rather than assumed absent.
 */
const pdf24 = {
  competitor: 'PDF24',
  intro: [
    "PDF24 (run by Geek Software GmbH) has the largest PDF tool catalog of any competitor we checked — close to 100 distinct tools, entirely free, funded by advertising rather than a paid tier. What it doesn't have, checked directly against its own tools directory, is any way to compress an image.",
    'imagecompressor.cloud has a much smaller catalog today, but covers image compression PDF24 lacks entirely, and runs most of its tools in your browser rather than uploading to a server.',
  ],
  rows: [
    {
      label: 'Where processing happens',
      us: 'In your browser for compression, merging, splitting and PDF↔image conversion (Office-format conversion is the one exception, and uses a server)',
      them: "On PDF24's servers",
    },
    {
      label: 'Compress an image?',
      us: 'Yes',
      them: 'No — checked their full tools directory directly; no image-compression tool exists on the platform',
    },
    {
      label: 'Tool catalog breadth',
      us: 'Compress, merge, split, rotate, remove pages, convert (growing)',
      them: 'Close to 100 tools — the largest catalog we compared against',
    },
    {
      label: 'Pricing',
      us: 'Free',
      them: 'Free, ad-supported — no paid tier for the online tools',
    },
    {
      label: 'Language support',
      us: '/en/ live today; the URL structure is already built to add more languages without a rebuild',
      them: '20+ languages, locale prefix required even for English',
    },
  ],
  verdict:
    "PDF24's tool catalog is hard to match — if you need something specific and unusual, it's worth checking there. But for the core jobs most people actually need, this site does the same work without uploading your file, and covers image compression that PDF24 simply doesn't offer.",
  cta: { slug: '', label: 'Try the image compressor' },
}

export default pdf24
