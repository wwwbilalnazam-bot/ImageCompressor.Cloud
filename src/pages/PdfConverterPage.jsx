import { useState, useRef } from 'react'
import { convertPdfToImages } from '../utils/pdfConverter'
import { createZipArchive, formatBytes } from '../utils/advancedCompression'
import SEO from '../components/SEO'
import FAQSection from '../components/FAQSection'

export default function PdfConverterPage() {
  const [pdfFile, setPdfFile] = useState(null)
  const [outputFormat, setOutputFormat] = useState('image/jpeg')
  const [resolutionScale, setResolutionScale] = useState(2.0) // 2x = ~300 DPI
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [conversionResult, setConversionResult] = useState(null)
  const [isZipping, setIsZipping] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processPdfFile(e.target.files[0])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processPdfFile(e.dataTransfer.files[0])
    }
  }

  const processPdfFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file.')
      return
    }

    setPdfFile(file)
    setIsProcessing(true)
    setProgress({ current: 0, total: 0 })
    setConversionResult(null)

    try {
      const result = await convertPdfToImages(
        file,
        {
          format: outputFormat,
          scale: parseFloat(resolutionScale),
          quality: 0.92,
        },
        (current, total) => {
          setProgress({ current, total })
        }
      )
      setConversionResult(result)
    } catch (err) {
      console.error('PDF conversion error:', err)
      alert(err.message || 'Failed to convert PDF file.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadPage = (page) => {
    const ext = outputFormat.split('/')[1] || 'jpg'
    const link = document.createElement('a')
    link.href = page.dataUrl
    link.download = `${conversionResult.filename}-page-${page.pageNumber}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadZip = async () => {
    if (!conversionResult || !conversionResult.pages) return
    setIsZipping(true)

    try {
      const ext = outputFormat.split('/')[1] || 'jpg'
      const imagesToZip = conversionResult.pages.map((p) => ({
        blob: p.blob,
        originalFile: {
          name: `${conversionResult.filename}-page-${p.pageNumber}.${ext}`,
        },
      }))

      const zipBlob = await createZipArchive(imagesToZip)
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${conversionResult.filename}-images.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('ZIP error:', err)
    } finally {
      setIsZipping(false)
    }
  }

  const handleReset = () => {
    if (conversionResult) {
      conversionResult.pages.forEach((p) => URL.revokeObjectURL(p.dataUrl))
    }
    setPdfFile(null)
    setConversionResult(null)
    setProgress({ current: 0, total: 0 })
  }

  const pdfFaqs = [
    {
      q: 'Is my PDF document uploaded to any server?',
      a: 'No. The entire PDF parsing and page rendering process runs 100% inside your web browser using HTML5 Canvas & Mozilla PDF.js technology. Your sensitive documents never leave your computer.',
    },
    {
      q: 'Which image formats can I convert PDF pages into?',
      a: 'You can convert PDF pages into JPG (JPEG), PNG (lossless transparent/sharp text), or modern WebP image formats.',
    },
    {
      q: 'Can I convert multi-page PDF documents?',
      a: 'Yes! Every page in your PDF document is rendered into an individual high-resolution image. You can download single pages or click "Download All Pages (ZIP)" to save all pages at once.',
    },
  ]

  return (
    <div className="w-full bg-white dark:bg-slate-950 transition-colors">
      <SEO
        title="PDF to JPG / PNG Converter - 100% Free & Private"
        description="Convert PDF files to JPEG, PNG, or WebP images page-by-page. 100% free, browser-based, no upload limits, and completely private."
        canonicalUrl="https://imagecompressor.cloud/pdf-to-jpg"
      />

      {/* Header Banner */}
      <section className="pt-8 pb-10 md:pt-12 md:pb-14 bg-slate-50/60 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="container max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Dedicated PDF Tool • Separate & Private</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PDF to Image Converter
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Convert PDF pages into high-resolution JPG, PNG, or WebP images instantly in your browser.
          </p>
        </div>
      </section>

      {/* Converter Main Area */}
      <section className="py-10 md:py-16 bg-white dark:bg-slate-950">
        <div className="container max-w-4xl mx-auto px-4 space-y-8">
          {!conversionResult && !isProcessing && (
            <div className="space-y-6">
              {/* Settings Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="image/jpeg">JPG / JPEG (Recommended)</option>
                    <option value="image/png">PNG (Lossless & Sharp)</option>
                    <option value="image/webp">WebP (Modern Compact)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                    Image Quality / Resolution
                  </label>
                  <select
                    value={resolutionScale}
                    onChange={(e) => setResolutionScale(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1.5">Standard Quality (150 DPI)</option>
                    <option value="2.0">High Quality (300 DPI - Clear Text)</option>
                    <option value="3.0">Ultra High Resolution (450 DPI)</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30'
                    : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 hover:border-blue-500 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      Drop your PDF document here
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                      or click to browse files from your computer
                    </p>
                  </div>

                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Select PDF File</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading / Converting State */}
          {isProcessing && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Converting PDF Pages to Images...
              </h3>
              {progress.total > 0 && (
                <div className="max-w-md mx-auto space-y-2">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-300"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Page {progress.current} of {progress.total} rendered
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Results Grid */}
          {conversionResult && (
            <div className="space-y-6">
              {/* Batch Action Bar */}
              <div className="bg-blue-600 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                <div>
                  <h3 className="text-xl font-bold">
                    Converted {conversionResult.totalPages} Pages Successfully
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    File: {conversionResult.filename}.pdf
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isZipping}
                    className="px-5 py-2.5 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-initial"
                  >
                    {isZipping ? 'Creating ZIP...' : 'Download All Pages (ZIP)'}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-xl transition-all"
                  >
                    Convert Another PDF
                  </button>
                </div>
              </div>

              {/* Pages Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {conversionResult.pages.map((p) => (
                  <div
                    key={p.pageNumber}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    {/* Thumbnail */}
                    <div className="p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[200px]">
                      <img
                        src={p.dataUrl}
                        alt={`Page ${p.pageNumber}`}
                        className="max-h-60 w-auto rounded border border-slate-200 dark:border-slate-800 shadow-sm object-contain"
                      />
                    </div>

                    {/* Page Info & Download Button */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <span>Page {p.pageNumber}</span>
                        <span>{formatBytes(p.size)}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDownloadPage(p)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download Page {p.pageNumber}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PDF FAQ Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="container max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            PDF to Image Conversion FAQs
          </h2>
          <div className="space-y-3">
            {pdfFaqs.map((faq, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
