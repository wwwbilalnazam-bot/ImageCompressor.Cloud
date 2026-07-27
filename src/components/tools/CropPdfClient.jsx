'use client'

import { useState, useRef, useEffect } from 'react'
import { formatBytes } from '../../utils/advancedCompression'
import { loadPdfFile, generateThumbnail } from '../../utils/pdfEditorEngine'
import { validatePdfFile, PdfValidationError, sanitizeBaseName } from '../../utils/pdfSplitEngine'
import AdBanner from '../AdBanner'

const MARGIN_FIELDS = [
  { id: 'top', label: 'Top' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'left', label: 'Left' },
  { id: 'right', label: 'Right' },
]

/**
 * Crop PDF — new UI, built on pdf-lib's setCropBox (already a project
 * dependency; no new package). Crops every page by the same percentage
 * margins, applied uniformly since per-page crop boxes are rarely useful and
 * a per-page UI would add real complexity for a niche case.
 */
export default function CropPdfClient() {
  const [file, setFile] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [srcPdfDoc, setSrcPdfDoc] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [previewThumb, setPreviewThumb] = useState(null)

  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 })

  const [isProcessing, setIsProcessing] = useState(false)
  const [cropError, setCropError] = useState(null)
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
    setCropError(null)
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
      setMargins({ top: 0, bottom: 0, left: 0, right: 0 })
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

  const setMargin = (id, value) => {
    const clamped = Math.max(0, Math.min(45, Number(value) || 0))
    setMargins((prev) => {
      const next = { ...prev, [id]: clamped }
      // Opposing margins can't sum to 100% or more — leave no page left.
      if (id === 'top' && next.top + next.bottom >= 90) next.bottom = Math.max(0, 89 - next.top)
      if (id === 'bottom' && next.top + next.bottom >= 90) next.top = Math.max(0, 89 - next.bottom)
      if (id === 'left' && next.left + next.right >= 90) next.right = Math.max(0, 89 - next.left)
      if (id === 'right' && next.left + next.right >= 90) next.left = Math.max(0, 89 - next.right)
      return next
    })
  }

  const hasCrop = margins.top + margins.bottom + margins.left + margins.right > 0

  const handleCrop = async () => {
    if (!srcPdfDoc || !hasCrop) return

    setIsProcessing(true)
    setCropError(null)
    setResult(null)

    try {
      for (const page of srcPdfDoc.getPages()) {
        const { width, height } = page.getSize()
        const left = (margins.left / 100) * width
        const right = (margins.right / 100) * width
        const top = (margins.top / 100) * height
        const bottom = (margins.bottom / 100) * height
        page.setCropBox(left, bottom, width - left - right, height - top - bottom)
      }

      const bytes = await srcPdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResult({
        filename: `${sanitizeBaseName(file.name)}-cropped.pdf`,
        blob,
        dataUrl: url,
        size: blob.size,
      })
    } catch (err) {
      console.error('Crop error:', err)
      setCropError(err.message || 'Failed to crop the PDF. Please try again.')
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
    setMargins({ top: 0, bottom: 0, left: 0, right: 0 })
    setCropError(null)
    setResult(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-6xl mx-auto font-sans">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ✂️ Crop PDF
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Trim margins from every page — set how much to remove from each side and preview it before you export.
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
                      {isValidating ? 'Reading PDF...' : isDragOver ? 'Drop your PDF here' : 'Upload a PDF to crop'}
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

                {/* Live preview with crop guides */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Preview — page 1</h2>
                  <div className="relative aspect-[3/4] max-w-xs mx-auto bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden">
                    {previewThumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewThumb} alt="Page 1 preview" className="w-full h-full object-contain" />
                    )}
                    {/* Darkened overlays showing what gets cropped away */}
                    <div
                      className="absolute inset-x-0 top-0 bg-slate-900/60"
                      style={{ height: `${margins.top}%` }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 bg-slate-900/60"
                      style={{ height: `${margins.bottom}%` }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 bg-slate-900/60"
                      style={{ width: `${margins.left}%` }}
                    />
                    <div
                      className="absolute inset-y-0 right-0 bg-slate-900/60"
                      style={{ width: `${margins.right}%` }}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-4">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Crop margins</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {MARGIN_FIELDS.map((field) => (
                      <div key={field.id} className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {field.label} — {margins[field.id]}%
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={45}
                          value={margins[field.id]}
                          onChange={(e) => setMargin(field.id, e.target.value)}
                          className="w-full accent-emerald-600"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setMargins({ top: 0, bottom: 0, left: 0, right: 0 })}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    Reset margins
                  </button>
                </div>

                {cropError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {cropError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleCrop}
                  disabled={isProcessing || !hasCrop}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>
                    {isProcessing
                      ? 'Cropping...'
                      : hasCrop
                      ? `Crop ${totalPages} Page${totalPages !== 1 ? 's' : ''}`
                      : 'Set a margin to crop'}
                  </span>
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
                      <h2 className="text-lg font-bold">Crop Complete! ✨</h2>
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
                      Crop Another
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
                  'Independent top/bottom/left/right margins',
                  'Live preview before you export',
                  'Applied to every page at once',
                  'Preserves text, images & links',
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
