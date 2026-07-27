const whyPhotosLookWorseAfterCompressing = {
  pillar: 'compress',
  intro: [
    "Compression damage isn't random — it shows up in specific, predictable places once you know what to look for, and almost all of it is avoidable.",
  ],
  sections: [
    {
      heading: 'Blocky squares near sharp edges',
      paragraphs: [
        'JPEG compresses images in fixed 8×8 pixel blocks. At low quality settings, those block boundaries become visible as a faint grid, especially around high-contrast edges like text on a photo or the outline of a face against a plain background. This is the single most recognizable sign of over-compression.',
      ],
    },
    {
      heading: 'Color smearing and banding',
      paragraphs: [
        'JPEG stores color information at lower resolution than brightness information, because human eyes are more sensitive to brightness detail than color detail — a legitimate optimization most of the time. Pushed too far, it causes color to "bleed" across edges, and smooth gradients (skies, shadows) can break into visible bands instead of a smooth transition.',
      ],
    },
    {
      heading: 'The real cause: repeated compression, not just low quality',
      paragraphs: [
        "A single compression pass at a reasonable quality setting is usually fine — the loss is real but rarely visible. The damage compounds when an image gets compressed multiple times: downloaded, edited, re-saved, uploaded to a platform that recompresses it again, downloaded again. Each pass discards more, and the artifacts from each pass stack on top of the last one's.",
      ],
    },
    {
      heading: 'How to avoid it',
      paragraphs: [],
      list: [
        'Compress from the original file, not from a copy that\'s already been compressed once',
        "Target a specific file size or a quality setting around 75-85% rather than the lowest setting available — the size difference between \"low quality\" and \"very low quality\" is often small, but the visible damage is not",
        'For images with text or sharp lines, prefer PNG or WebP over JPEG entirely — that class of image is where JPEG artifacts are most visible',
        "If a platform (social media, a CMS) will recompress your upload anyway, don't pre-compress aggressively yourself — you're just adding a second lossy pass on top of theirs",
      ],
    },
  ],
  cta: { slug: '', label: 'Compress an image to an exact size' },
}

export default whyPhotosLookWorseAfterCompressing
