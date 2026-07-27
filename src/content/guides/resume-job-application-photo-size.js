const resumeJobApplicationPhotoSize = {
  pillar: 'compress',
  intro: [
    "Whether a photo belongs on a resume at all depends heavily on country and industry norms — skip it entirely for US/UK/Canada applications, where it's often discouraged or even flagged as a bias risk by HR, but expected in much of continental Europe, and common in Japan and parts of Asia. If a photo is expected (or requested by an application portal), the file-size problem is usually the same regardless: most job portals cap photo uploads, and resume file size itself matters for a different reason.",
  ],
  sections: [
    {
      heading: 'Two separate size problems, easy to conflate',
      paragraphs: [
        "A resume photo (a headshot embedded in or attached to the document) has its own size limit, usually because applicant tracking systems (ATS) cap total upload size. A resume PDF that's bloated because of a poorly-compressed photo is a real, common problem — a high-resolution phone photo pasted directly into a Word document can add several megabytes for a headshot that only needs to display at a few centimeters.",
      ],
    },
    {
      heading: 'What actually matters for a resume headshot',
      paragraphs: [
        "Unlike a passport photo, there's no official size specification — but the practical target is small: a headshot displayed at roughly business-card size on a resume doesn't need more than 100-200KB to look sharp, and keeping it in that range keeps the overall resume file well under most portals' upload caps (commonly 2-5MB for the whole document).",
      ],
    },
    {
      heading: 'If a specific portal states a limit',
      paragraphs: [
        'LinkedIn, Indeed, and company-specific ATS portals sometimes state their own photo size caps directly (LinkedIn profile photos, for instance, have their own recommended dimensions separate from a resume attachment). When a specific number is given, target that number directly rather than guessing at a "reasonable" size — the same target-size compression approach used for passport or exam photos works here too.',
      ],
    },
  ],
  cta: { slug: 'compress-image-to-100kb', label: 'Compress a headshot for a resume or profile' },
}

export default resumeJobApplicationPhotoSize
