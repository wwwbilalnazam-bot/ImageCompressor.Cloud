const lossyVsLosslessCompression = {
  pillar: 'compress',
  intro: [
    'Both terms get used constantly and explained vaguely. Here\'s what actually happens to the data in each case.',
  ],
  sections: [
    {
      heading: 'Lossless: nothing is discarded',
      paragraphs: [
        'Lossless compression finds and removes redundancy — repeated patterns, predictable sequences — and can perfectly reconstruct the original data byte-for-byte when decompressed. A ZIP file is lossless. PNG is lossless. Nothing about the image changes; the file is just stored more efficiently.',
        "The limit of lossless compression is how much genuine redundancy exists in the data. A photograph has relatively little exploitable redundancy — every pixel is subtly different from its neighbors — so lossless compression barely shrinks it. A screenshot with large flat-color areas has a lot of redundancy, so lossless compresses it dramatically.",
      ],
    },
    {
      heading: 'Lossy: some information is discarded, deliberately',
      paragraphs: [
        "Lossy compression identifies information a viewer is unlikely to notice missing and removes it permanently. JPEG does this based on human color-perception limits — it keeps brightness detail (which eyes are sensitive to) and discards some color detail (which eyes are less sensitive to). The decompressed image is an approximation, not a perfect reconstruction, but a well-tuned approximation is visually indistinguishable from the original at reasonable quality settings.",
        "This is why lossy compression achieves far higher compression ratios than lossless for photographic content — it's not competing on the same terms. It's trading a small, carefully chosen amount of fidelity for a large reduction in file size.",
      ],
    },
    {
      heading: 'Which to use when',
      paragraphs: [],
      list: [
        'Photographs, where a viewer won\'t notice small detail loss → lossy (JPEG, lossy WebP)',
        'Screenshots, diagrams, text, logos — anything where a viewer will notice smudging or artifacts → lossless (PNG, lossless WebP)',
        'Archival copies you might need to edit or reprint later at full fidelity → lossless, keep an uncompressed or lossless master and only export lossy copies for distribution',
        'Anything already lossy-compressed once → avoid re-compressing lossy repeatedly, since each pass discards more',
      ],
    },
  ],
  cta: { slug: '', label: 'Compress an image now' },
}

export default lossyVsLosslessCompression
