import { useState } from 'react'

export const FAQS = [
  {
    q: 'How does target file size compression work?',
    a: 'Unlike basic image tools that only let you guess quality percentages, our tool uses an intelligent binary search algorithm to calculate the exact quality and canvas dimensions needed to hit your target file size in KB (e.g. 20KB, 50KB, 100KB, 200KB).',
  },
  {
    q: 'Is my image data private and secure?',
    a: 'Yes, 100% private. All compression operations are performed locally in your web browser memory using HTML5 Canvas APIs. Your photos, documents, and passport images are never sent over the network or stored on any server.',
  },
  {
    q: 'How accurate is the target KB size result?',
    a: 'Our algorithm achieves ±2KB accuracy. If you request a 100KB output, the resulting compressed file will strictly measure between 98KB and 102KB while preserving maximum visual sharpness.',
  },
  {
    q: 'Can I compress multiple images at once?',
    a: 'Yes! Batch processing is fully supported. Drag and drop multiple photos into the upload area, select your target size and format, and click "Download All (ZIP)" to download them all in one archive.',
  },
  {
    q: 'Which image formats are supported?',
    a: 'We support JPG, JPEG, PNG, WebP, and AVIF image formats. You can also convert between formats (such as converting heavy PNGs to lightweight WebP).',
  },
  {
    q: 'Is there any daily limit or subscription cost?',
    a: 'No. ImageCompressor.cloud is 100% free with no daily upload limits, no signup requirements, and no hidden subscriptions.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-950">
      <div className="container max-w-4xl mx-auto px-4 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Got Questions?
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base">
            Everything you need to know about our browser-based target image compressor.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 md:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 dark:text-white text-base md:text-lg hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
