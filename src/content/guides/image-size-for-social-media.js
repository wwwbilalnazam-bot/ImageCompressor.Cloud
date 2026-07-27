const imageSizeForSocialMedia = {
  pillar: 'compress',
  intro: [
    '"Just make it small" is the wrong instinct for social media — every major platform recompresses your upload anyway, so a pre-shrunk, low-quality image just gets compressed twice. What actually matters is dimensions and starting quality, not hitting the smallest possible file size yourself.',
  ],
  sections: [
    {
      heading: 'Why platforms recompress your image regardless',
      paragraphs: [
        'Instagram, LinkedIn, X and Facebook all re-encode every image you upload to their own storage format and size tiers, to keep their own bandwidth and storage costs predictable. This means your carefully-tuned file size gets discarded the moment it uploads — what survives is the pixel dimensions and the visual quality you started with.',
      ],
    },
    {
      heading: 'Dimension guidance by platform',
      paragraphs: [
        "Exact numbers shift as platforms update their apps, so treat these as the right order of magnitude rather than a permanent spec:",
      ],
      list: [
        'Instagram feed post: roughly 1080px on the long edge, square (1:1) or portrait (4:5) aspect ratio performs best in-feed',
        'LinkedIn feed image: roughly 1200×627px for link previews, up to 1200×1200px for standalone images',
        'X (Twitter) image: roughly 1200×675px (16:9) for in-feed display without cropping',
        'Facebook feed image: roughly 1200×630px, similar to LinkedIn',
        'Email: no platform recompression to rely on — compress to an actual target size (100-300KB per image is a reasonable range) since email clients don\'t optimize images for you',
      ],
    },
    {
      heading: 'What actually matters more than exact pixel counts',
      paragraphs: [
        "Uploading an image far larger than the platform's display size wastes your upload bandwidth for zero visual benefit — the platform downscales it anyway. Uploading one far smaller than needed gets upscaled and looks soft. Landing within roughly the right range, at good starting quality (avoid re-uploading an image that's already been through several compression passes), matters more than hitting an exact number.",
      ],
    },
  ],
  cta: { slug: '', label: 'Resize and compress an image' },
}

export default imageSizeForSocialMedia
