const passportPhotoSizeByCountry = {
  pillar: 'compress',
  intro: [
    "Passport, visa and exam-application photo rules are precise for a reason — automated processing systems reject anything outside spec, and a rejected photo can delay an entire application. The figures below are the commonly published requirements as of this writing, but requirements change and vary by exact application type — always confirm against the official government page for your specific application before submitting, this page is a starting point, not a substitute for that.",
  ],
  sections: [
    {
      heading: 'United States',
      paragraphs: [
        'Physical passport photos: 2×2 inches (51×51mm), head height 1 to 1⅜ inches from chin to crown, plain white or off-white background.',
        'US visa applications (DS-160, submitted online): digital JPEG, square, between 600×600 and 1200×1200 pixels, file size under 240KB — this specific digital limit trips up a lot of applicants, since it\'s stricter than most people expect.',
      ],
    },
    {
      heading: 'United Kingdom',
      paragraphs: [
        'Photo dimensions: 45mm × 35mm. For online applications, a digital JPG under roughly 6MB is generally accepted, which is a far more generous limit than the US visa photo — the constraint here is usually about photo composition (plain background, neutral expression, no glasses glare) rather than file size.',
      ],
    },
    {
      heading: 'Schengen Area (EU)',
      paragraphs: [
        'The ICAO standard most Schengen countries follow: 35mm × 45mm, with specific head-size proportions within that frame. Individual consulates sometimes add their own digital file requirements on top of the physical print spec, so check the specific country\'s consulate page you\'re applying through.',
      ],
    },
    {
      heading: 'India',
      paragraphs: [
        'Indian passport photos generally follow the 2×2 inch / 51×51mm standard. Where file-size limits get genuinely strict is government exam and recruitment forms — SSC, UPSC, IBPS, railway recruitment and similar applications commonly require a photo (and separately, a signature scan) in a very specific KB range, frequently 20KB to 50KB, sometimes with an exact pixel dimension like 200×230px specified alongside it. These forms are usually unforgiving about exceeding the limit even slightly.',
      ],
    },
    {
      heading: 'Canada',
      paragraphs: [
        'Physical photo: 50mm × 70mm. Digital upload requirements vary by application type (visitor visa, permanent residency, etc.) — IRCC\'s own application pages specify the exact digital format for whichever application you\'re filing.',
      ],
    },
    {
      heading: 'Hitting an exact file size without guessing',
      paragraphs: [
        "Most photo editors let you set pixel dimensions easily but don't give you direct control over the final file size in kilobytes — which is exactly what strict forms ask for. A compressor that targets an exact size (20KB, 50KB, 100KB) rather than a vague \"quality\" percentage removes the trial-and-error.",
      ],
    },
  ],
  cta: { slug: 'compress-image-to-50kb', label: 'Compress a photo to an exact KB size' },
}

export default passportPhotoSizeByCountry
