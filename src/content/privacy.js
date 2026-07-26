import { site } from '../config/site'

/**
 * Privacy policy content, ported from the orphaned `public/privacy.md`
 * (raw markdown that nothing linked to and no route served) into a real
 * rendered `/privacy` page.
 *
 * Deviation from the original file, deliberate: the old markdown named
 * Plausible Analytics as the analytics provider. The application as built
 * wires env-gated Google Analytics 4 and Google AdSense slots instead, so the
 * "Analytics", "Cookies" and "Third-Party Services" sections describe those.
 * Everything else is the original wording.
 *
 * Structure is data rather than markup so the page stays a thin renderer and
 * the same content can be translated per locale later.
 */
export const privacyUpdated = 'July 2026'

export const privacySections = [
  {
    heading: 'Overview',
    blocks: [
      {
        type: 'p',
        text: `${site.name} is committed to protecting your privacy. Our service is designed to compress and convert your files directly in your browser, without uploading your data to our servers.`,
      },
    ],
  },
  {
    heading: 'Data Collection',
    blocks: [
      { type: 'p', text: "What we DON'T collect:" },
      {
        type: 'ul',
        items: [
          'Your images, PDFs or documents',
          'Personal information',
          'Browsing history',
          'Device identifiers',
          'Location data',
        ],
      },
      { type: 'p', text: 'What we DO collect (only once analytics is enabled):' },
      {
        type: 'ul',
        items: [
          'Aggregate page views and referrer information',
          'Approximate location (country level only)',
          'Device type and browser',
        ],
      },
    ],
  },
  {
    heading: 'How It Works',
    blocks: [
      {
        type: 'p',
        text: 'Image compression, PDF compression, PDF splitting, PDF merging, PDF-to-image and text conversions all happen locally in your browser using standard web APIs. Those files are processed in memory and are never transmitted to our servers or any third party.',
      },
      {
        type: 'p',
        text: 'The one exception is Office-format conversion (PDF to and from Word, Excel and PowerPoint). Faithful Office formatting is not achievable in a browser, so those files — and only those files — are sent to our conversion service, converted, returned to you, and then discarded. They are not stored afterward.',
      },
    ],
  },
  {
    heading: 'Cookies',
    blocks: [
      {
        type: 'p',
        text: 'We do not set cookies of our own. Your light/dark theme preference is stored in your browser\'s local storage on your device and is never sent anywhere. If advertising is enabled, our ad provider may set its own cookies — see below.',
      },
    ],
  },
  {
    heading: 'Third-Party Services',
    blocks: [
      {
        type: 'ul',
        items: [
          'Hosting: Vercel (CDN and server infrastructure)',
          'Office-format conversion: our own conversion service, which does not retain files',
          'Analytics: Google Analytics 4 — configured but inactive until a measurement ID is supplied',
          'Advertising: Google AdSense — configured but inactive until a publisher ID is supplied',
        ],
      },
    ],
  },
  {
    heading: 'Your Rights',
    blocks: [
      { type: 'p', text: 'You have the right to:' },
      {
        type: 'ul',
        items: [
          'Know what data is collected about you',
          'Request deletion of any personal data',
          'Opt out of analytics collection',
        ],
      },
    ],
  },
  {
    heading: 'Contact Us',
    blocks: [{ type: 'p', text: `For privacy concerns, email: ${site.privacyEmail}` }],
  },
]

export const privacyClosing =
  "This tool respects your privacy by design. We believe developers and creators deserve tools that don't spy on them."
