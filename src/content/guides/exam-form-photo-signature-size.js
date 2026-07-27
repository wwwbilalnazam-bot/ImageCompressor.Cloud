const examFormPhotoSignatureSize = {
  pillar: 'compress',
  intro: [
    "Government exam and recruitment forms — SSC, UPSC, IBPS, railway recruitment, state PSCs and similar — are usually the strictest file-size requirements you'll ever run into, and the ones most likely to reject an upload for being 3KB over the limit. Here's what actually trips people up, and how to hit an exact number instead of guessing.",
  ],
  sections: [
    {
      heading: 'Why these forms are stricter than passport or visa photos',
      paragraphs: [
        "Passport and visa photo rules mostly constrain physical dimensions and composition. Exam form portals go further: they typically specify an exact file-size range in kilobytes for both the photo and the signature scan separately, sometimes with an exact pixel dimension too (a common pattern is 200×230px for photos, 140×60px for signatures — but always check the specific form, this varies by exam body and can change year to year). The portal usually validates this server-side and simply rejects the upload if you're outside the range, often without a helpful explanation of by how much.",
      ],
    },
    {
      heading: 'The signature scan is often the part people get wrong',
      paragraphs: [
        "The photo gets most of the attention, but the signature requirement trips up just as many applicants — it needs to be a clean scan or photo of an actual signature on plain paper (typically white or light background, dark ink), then compressed to the same kind of strict KB range as the photo. A photo of a signature taken at an angle, or with visible paper texture/shadows, can fail even when the file size is technically correct — it's worth scanning or photographing the signature flat and well-lit before worrying about compression at all.",
      ],
    },
    {
      heading: 'Getting the file size exactly right',
      paragraphs: [
        "The core problem: a quality slider (\"80% quality\") doesn't tell you what KB size you'll end up with — it varies by image content, so hitting an exact range (say 20KB-50KB) by trial and error means repeatedly compressing, checking the resulting size, and adjusting. A tool that lets you type in the target size directly and finds the right quality automatically skips that back-and-forth entirely.",
      ],
      list: [
        'Check the specific form\'s instructions for the exact KB range and pixel dimensions — these genuinely vary between exam bodies and change between years',
        'Scan or photograph the signature flat, well-lit, on plain paper, before compressing it',
        'Compress the photo and signature separately, to their own respective size ranges — they\'re rarely the same limit',
        'Save both as JPEG unless the form specifies otherwise — most portals expect JPEG, not PNG',
      ],
    },
  ],
  cta: { slug: 'compress-image-to-50kb', label: 'Compress a photo or signature to an exact KB size' },
}

export default examFormPhotoSignatureSize
