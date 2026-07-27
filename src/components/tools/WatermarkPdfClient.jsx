'use client'

import { useState, useRef, useEffect } from 'react'
import { formatBytes } from '../../utils/advancedCompression'
import { loadPdfFile, generateThumbnail } from '../../utils/pdfEditorEngine'
import { validatePdfFile, PdfValidationError, sanitizeBaseName } from '../../utils/pdfSplitEngine'
import AdBanner from '../AdBanner'

const COLOR_PRESETS = [
  { id: 'gray', label: 'Gray', rgb: [0.55, 0.55, 0.55], css: '#8c8c8c' },
  { id: 'red', label: 'Red', rgb: [0.75, 0.15, 0.15], css: '#bf2626' },
  { id: 'blue', label: 'Blue', rgb: [0.15, 0.35, 0.7], css: '#2659b3' },
  { id: 'black', label: 'Black', rgb: [0.1, 0.1, 0.1], css: '#1a1a1a' },
]

/**
 * Watermark PDF — new UI, built on pdf-lib's drawText (already a project
 * dependency; no new package). Applies one centered, rotated, semi-transparent
 * text watermark to every page.
 */
export default function WatermarkPdfClient() {
  const [file, setFile] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [srcPdfDoc, setSrcPdfDoc] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [previewThumb, setPreviewThumb] = useState(null)

  const [text, setText] = useState('CONFIDENTIAL')
  const [fontSize, setFontSize] = useState(60)
  const [opacity, setOpacity] = useState(35)
  const [rotation, setRotation] = useState(45)
  const [color, setColor] = useState('gray')

  const [isProcessing, setIsProcessing] = useState(false)
  const [watermarkError, setWatermarkError] = useState(null)
  const [result, setResult] = useState(null)

  const fileInputRef = useRef(null)
  const resultRef = useRef(null)

  useEffect(() => {
    resultRef.current = result
  }, [result])
  useEffect(() => {
    return () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)
    }
  }, [])

  const loadFile = async (selectedFile) => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)
    setFileError(null)
    setWatermarkError(null)
    setResult(null)
    setIsValidating(true)

    try {
      const { pdfDoc, pageCount } = await validatePdfFile(selectedFile)
      const { pdf: pdfjsDoc } = await loadPdfFile(selectedFile)
      const thumb = await generateThumbnail(pdfjsDoc, 1, 400)

      setFile(selectedFile)
      setSrcPdfDoc(pdfDoc)
      setTotalPages(pageCount)
      setPreviewThumb(thumb)
    } catch (err) {
      console.error('PDF load error:', err)
      setFileError(err instanceof PdfValidationError ? err.message : 'Could not read this PDF file.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) loadFile(e.target.files[0])
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0])
  }

  const handleWatermark = async () => {
    if (!srcPdfDoc || !text.trim()) return

    setIsProcessing(true)
    setWatermarkError(null)
    setResult(null)

    try {
      const { StandardFonts, rgb, degrees } = await import('pdf-lib')
      const font = await srcPdfDoc.embedFont(StandardFonts.HelveticaBold)
      const [r, g, b] = COLOR_PRESETS.find((c) => c.id === color)?.rgb || COLOR_PRESETS[0].rgb

      for (const page of srcPdfDoc.getPages()) {
        const { width, height } = page.getSize()
        const textWidth = font.widthOfTextAtSize(text, fontSize)
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: height / 2,
          size: fontSize,
          font,
          color: rgb(r, g, b),
          opacity: opacity / 100,
          rotate: degrees(rotation),
        })
      }

      const bytes = await srcPdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResult({
        filename: `${sanitizeBaseName(file.name)}-watermarked.pdf`,
        blob,
        dataUrl: url,
        size: blob.size,
      })
    } catch (err) {
      console.error('Watermark error:', err)
      setWatermarkError(err.message || 'Failed to add the watermark. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement('a')
    link.href = result.dataUrl
    link.download = result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const resetAll = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)
    setFile(null)
    setFileError(null)
    setSrcPdfDoc(null)
    setTotalPages(0)
    setPreviewThumb(null)
    setWatermarkError(null)
    setResult(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const activeColor = COLOR_PRESETS.find((c) => c.id === color) || COLOR_PRESETS[0]

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-6xl mx-auto font-sans">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            💧 Watermark PDF
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Stamp a text watermark across every page — CONFIDENTIAL, DRAFT, or your own text. Nothing is uploaded.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {!file && (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl p-8 text-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center space-y-3">
                  <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {isValidating ? 'Reading PDF...' : isDragOver ? 'Drop your PDF here' : 'Upload a PDF to watermark'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Drag and drop a PDF, or click to browse
                    </p>
                  </div>
                  {isValidating ? (
                    <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mt-2" />
                  ) : (
                    <button
                      type="button"
                      className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 mt-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Select PDF</span>
                    </button>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    PDF only • 100% processed in your browser
                  </p>
                </div>
                {fileError && (
                  <div
                    className="mt-4 mx-auto max-w-md rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {fileError}
                  </div>
                )}
              </div>
            )}

            {file && !result && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatBytes(file.size)} • {totalPages} page{totalPages !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex-shrink-0"
                  >
                    Change File
                  </button>
                </div>

                {/* Live preview */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Preview — page 1</h2>
                  <div className="relative aspect-[3/4] max-w-xs mx-auto bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center">
                    {previewThumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewThumb} alt="Page 1 preview" className="w-full h-full object-contain" />
                    )}
                    {text && (
                      <div
                        className="absolute inset-0 flex items-center justify-center pointer-events-none px-2 text-center"
                        style={{
                          transform: `rotate(${-rotation}deg)`,
                          opacity: opacity / 100,
                          color: activeColor.css,
                          fontWeight: 700,
                          fontSize: `${Math.max(10, Math.min(fontSize, 48))}px`,
                          wordBreak: 'break-word',
                        }}
                      >
                        {text}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center mt-2">
                    Approximate preview — exact size/position may vary slightly from the exported PDF.
                  </p>
                </div>

                {/* Controls */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Watermark text</label>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      maxLength={60}
                      placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Size — {fontSize}px
                      </label>
                      <input
                        type="range"
                        min={20}
                        max={120}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Opacity — {opacity}%
                      </label>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={opacity}
                        onChange={(e) => setOpacity(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Rotation — {rotation}°
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Color</label>
                      <div className="flex items-center gap-2 pt-1">
                        {COLOR_PRESETS.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setColor(c.id)}
                            title={c.label}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${
                              color === c.id
                                ? 'border-emerald-600 scale-110'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                            style={{ backgroundColor: c.css }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {watermarkError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {watermarkError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleWatermark}
                  disabled={isProcessing || !text.trim()}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>{isProcessing ? 'Adding watermark...' : `Watermark ${totalPages} Page${totalPages !== 1 ? 's' : ''}`}</span>
                </button>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-bold">Watermark Added! ✨</h2>
                      <p className="text-sm text-emerald-100 mt-1">
                        Applied to all {totalPages} page{totalPages !== 1 ? 's' : ''} of {file?.name}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <div className="h-40 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <svg className="w-12 h-12 text-emerald-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{result.filename}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(result.size)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={resetAll}
                      className="py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Watermark Another
                    </button>
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900 space-y-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">🔒 Privacy</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your file is processed entirely in your browser and never uploaded to a server.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">✨ Features</h2>
              <div className="space-y-2 text-xs">
                {[
                  'Custom text, size, color and opacity',
                  'Any rotation angle',
                  'Applied to every page at once',
                  'Live preview before you export',
                  '100% browser processing',
                  'No uploads, completely private',
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                    <span className="text-slate-600 dark:text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 shrink-0">
        <AdBanner position="bottom" type="horizontal-banner" />
      </div>
    </div>
  )
}
