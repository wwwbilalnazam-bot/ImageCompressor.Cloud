const compressPdfForEmail = {
  pillar: 'pdf',
  intro: [
    "Email providers cap attachment size, and the cap is usually lower than people expect. Limits below are the commonly published figures — providers do adjust these over time, so treat them as a strong guide rather than gospel.",
  ],
  sections: [
    {
      heading: 'Typical provider limits',
      paragraphs: [],
      list: [
        'Gmail: 25MB per email, combined across all attachments',
        'Outlook.com / Microsoft 365: around 20MB, though this varies by plan and organization policy',
        'Yahoo Mail: 25MB',
        'iCloud Mail: around 20MB (Apple offers Mail Drop for larger files, which uploads to iCloud and sends a download link instead)',
      ],
    },
    {
      heading: 'What actually happens when you exceed the limit',
      paragraphs: [
        "It's rarely a clean error message. Depending on the provider, an oversized attachment can silently fail to send, get auto-converted to a download link you didn't choose, or bounce back after the recipient's server rejects it — sometimes hours later. None of these are as clear as \"file too large,\" which is why oversized PDFs cause so much quiet confusion.",
      ],
    },
    {
      heading: 'What size to actually target',
      paragraphs: [
        "Don't aim for the exact limit — attachments get base64-encoded for email transport, which inflates the effective size by roughly 33%. A 20MB raw limit means your actual file should stay well under that, and most email etiquette treats anything over 5-10MB as inconsiderate regardless of the hard cap. For a document meant to just be read (not printed at high fidelity), compressing to a few hundred KB up to a couple of MB is usually more than enough quality for on-screen reading.",
      ],
    },
  ],
  cta: { slug: 'compress-pdf', label: 'Compress a PDF for email' },
}

export default compressPdfForEmail
