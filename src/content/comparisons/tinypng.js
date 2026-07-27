/**
 * Every claim about TinyPNG here was pulled directly from tinypng.com's own
 * live HTML (title/meta/on-page copy) or its official developer docs — not
 * assumed. Where something couldn't be confirmed, it's left out rather than
 * guessed at.
 */
const tinypng = {
  competitor: 'TinyPNG',
  intro: [
    'TinyPNG is one of the best-known image compressors online, and for good reason — it has a simple, fast tool and a genuinely useful developer API. It\'s also a server-based tool: your image is uploaded to TinyPNG\'s infrastructure, compressed there, and sent back.',
    'imagecompressor.cloud does the same core job — shrinking JPG, PNG and WebP files — entirely inside your browser tab. Nothing is uploaded. Below is how the two actually differ, not just how they market themselves.',
  ],
  rows: [
    {
      label: 'Where compression happens',
      us: 'In your browser — the file never leaves your device',
      them: "Uploaded to TinyPNG's servers, processed, then returned",
    },
    {
      label: 'Free-tier limits',
      us: 'No batch or file-size cap enforced by this site',
      them: "TinyPNG's own stated free limit: 20 images per batch, 5MB max per file",
    },
    {
      label: 'PDF tools',
      us: 'Compress, merge, split, rotate, remove pages, convert',
      them: 'None — TinyPNG is image-only',
    },
    {
      label: 'Formats supported',
      us: 'JPG, PNG, WebP',
      them: 'JPG, PNG, WebP, AVIF',
    },
    {
      label: 'Beyond the website',
      us: 'Web tool only, for now',
      them: 'Developer API, official WordPress plugin, official Figma plugin, image CDN product',
    },
  ],
  verdict:
    "If you need TinyPNG's developer API or one of its plugins, it's the right tool for that job — this site doesn't have an equivalent yet. But if you're compressing anything you'd rather not hand to a third-party server (ID photos, contracts, private images), or you also need PDF tools without switching sites, that's exactly the gap this site fills.",
  cta: { slug: '', label: 'Try the image compressor' },
}

export default tinypng
