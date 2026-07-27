const jpegVsPngVsWebp = {
  pillar: 'compress',
  intro: [
    "The honest answer to \"which format is best\" is that it depends on what's in the image — not a universal ranking. Here's the actual decision, not a spec sheet.",
  ],
  sections: [
    {
      heading: 'Use JPEG for photos',
      paragraphs: [
        'JPEG compresses photographic images — continuous gradients of color, like skin tones or skies — extremely well, because its compression algorithm is built around how the human eye perceives smooth color transitions. The tradeoff is that JPEG is lossy: every save discards some detail permanently, and it does that by grouping pixels into 8×8 blocks, which is where "JPEG artifacts" (blocky edges, color smearing near sharp lines) come from at low quality.',
        "JPEG has no transparency support at all — a transparent area becomes solid white or black depending on the tool. If you need a see-through background, JPEG can't do it, full stop.",
      ],
    },
    {
      heading: 'Use PNG for screenshots, logos, and anything with transparency',
      paragraphs: [
        'PNG is lossless — it never discards image data — and compresses flat colors and sharp edges (text, UI screenshots, line art, logos) far better than JPEG does, because there\'s no gradient noise for its compression to fight against. It also supports full alpha transparency, not just on/off transparency.',
        'The tradeoff: PNG compresses photographs poorly. A photo saved as PNG is typically several times larger than the same photo as JPEG, for no visible quality benefit, because lossless compression can\'t exploit the redundancy lossy compression can.',
      ],
    },
    {
      heading: 'Use WebP when you can, for either',
      paragraphs: [
        "WebP is the newer format built to solve this tradeoff: it has a lossy mode (typically 25-35% smaller than an equivalent-quality JPEG) and a lossless mode (typically smaller than PNG for the same image), plus full alpha transparency in both. If your use case allows it — modern browsers and most apps support WebP now, though some older software and print workflows still don't — it's usually the better choice over both JPEG and PNG for web use.",
      ],
    },
    {
      heading: 'The practical rule',
      paragraphs: ['If you have to pick fast, without checking compatibility:'],
      list: [
        'A photograph, going on a website or in an email → JPEG (or WebP if you know it\'s supported)',
        'A screenshot, logo, or anything with sharp text/edges → PNG (or WebP)',
        'Anything needing a transparent background → PNG or WebP, never JPEG',
        'Print, or software that might not support newer formats → JPEG or PNG, not WebP',
      ],
    },
  ],
  cta: { slug: '', label: 'Compress an image now' },
}

export default jpegVsPngVsWebp
