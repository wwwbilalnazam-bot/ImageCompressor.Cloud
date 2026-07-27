/**
 * Adobe's site blocked every automated fetch attempt during research (6
 * attempts across different methods, all timed out or were rejected — typical
 * of enterprise bot protection). The claims below come from Adobe's own
 * public help pages and Google's indexed page titles, not direct testing —
 * flagged here rather than presented as independently verified, and kept
 * deliberately narrower than the other comparisons for that reason.
 */
const adobe = {
  competitor: "Adobe's free online tools",
  intro: [
    "Adobe offers free web-based PDF compression through Acrobat online, and image tools through Adobe Express. We couldn't directly test either — Adobe's site blocked automated access during research — so what follows is sourced from Adobe's own public documentation rather than firsthand testing, and kept intentionally narrow.",
    'One specific, sourced finding is worth calling out: according to Adobe\'s own help content, JPEG compression in Adobe Express isn\'t a native, built-in feature — it runs through a third-party add-on called "HARMAN Image Compressor," not a first-party Adobe tool.',
  ],
  rows: [
    {
      label: 'Where processing happens',
      us: 'In your browser for compression, merging, splitting and PDF↔image conversion (Office-format conversion is the one exception, and uses a server)',
      them: "On Adobe's servers, per Adobe's own documentation (\"processed on secure servers and then deleted automatically\")",
    },
    {
      label: 'JPEG/image compression',
      us: 'Native, built into the tool',
      them: 'Routed through a third-party Express add-on ("HARMAN Image Compressor"), per Adobe\'s own help content — not a native Adobe feature',
    },
    {
      label: 'Account required',
      us: 'No',
      them: 'Generally pushes toward an Adobe ID and a paid Acrobat/Creative Cloud subscription',
    },
    {
      label: 'Pricing',
      us: 'Free',
      them: "Free online tools function primarily as a lead-in to Adobe's paid subscriptions",
    },
  ],
  verdict:
    "If you're already inside the Adobe ecosystem, its tools integrate with everything else Adobe. But Adobe's own documentation shows image compression isn't even a first-party feature — it's a bolted-on add-on. If you just want to compress a JPEG or a PDF without an account or a subscription nudge, that's simpler here.",
  cta: { slug: 'compress-pdf', label: 'Try the PDF compressor' },
}

export default adobe
