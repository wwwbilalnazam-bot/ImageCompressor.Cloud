/**
 * General explainer, not a single-competitor comparison — shaped differently
 * from the other files (`sections` + `verificationSteps` instead of `rows`),
 * rendered by a dedicated branch in the [slug] page rather than the generic
 * comparison table.
 */
const browserVsServerTools = {
  type: 'explainer',
  intro: [
    'Almost every free PDF or image tool works the same way: you upload a file, it gets processed on the company\'s servers, and you download the result. A much smaller number of tools — this site included, for most of its features — do the processing inside your browser instead, so the file never leaves your device. Here\'s what that actually means, mechanically, and how to check which kind any given tool really is.',
  ],
  sections: [
    {
      heading: 'What "server-based" actually means',
      paragraphs: [
        'When you drop a file onto a server-based tool, your browser sends the entire file — as an HTTP upload — to that company\'s infrastructure. The file exists on their servers, however briefly, before a result comes back. Most companies state they delete files shortly after processing, and there\'s no reason to doubt that claim for reputable services — but the file did leave your device and did sit on hardware you don\'t control, if only for a few seconds.',
        "This is completely normal and unavoidable for some jobs. Faithfully reconstructing Word or PowerPoint layout, for instance, generally needs the same rendering engines Microsoft Office itself uses — which is why even this site sends Office-format conversions to a server, and only those.",
      ],
    },
    {
      heading: 'What "browser-based" actually means',
      paragraphs: [
        "Modern browsers can do a surprising amount of real work themselves. The Canvas API can re-encode a JPEG or PNG at a different quality level. Libraries like pdf-lib and pdf.js can parse, restructure, and re-render a PDF entirely in JavaScript, operating on the file as an in-memory Blob object rather than a stream sent anywhere. When a tool is built this way, the file is read into your browser tab's memory, processed there, and the result is offered as a download — no network request carrying your file's contents ever happens.",
      ],
    },
    {
      heading: "Why most tools are server-based anyway",
      paragraphs: [
        "It's usually not because browser-based processing is impossible — it's because building and maintaining it is more work than standing up a server endpoint, and because some specific conversions (Office formats being the main one) are genuinely hard to do faithfully without server-side rendering engines. Most companies default to server-based for everything, including jobs a browser could handle directly.",
      ],
    },
    {
      heading: 'How to check which kind any tool actually is',
      paragraphs: [
        "You don't have to take any site's word for this, including ours. Modern browsers let you watch every network request a page makes in real time.",
      ],
      list: [
        'Open your browser\'s developer tools (F12, or right-click → Inspect) and switch to the Network tab.',
        'Clear the log, then use the tool as normal — upload a file and trigger whatever action compresses, converts, or edits it.',
        "Watch for a request whose size roughly matches your file's size, sent to that site's own domain (not a CDN or analytics request).",
        "If you see one, your file was uploaded — the tool is server-based, whatever its marketing copy says. If you don't see a matching upload, the file was processed locally.",
      ],
    },
  ],
  cta: { slug: 'how-it-works', label: 'See this walkthrough done on this site specifically' },
}

export default browserVsServerTools
