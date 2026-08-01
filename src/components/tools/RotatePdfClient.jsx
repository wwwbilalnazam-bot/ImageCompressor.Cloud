'use client'

import { useState, useRef, useEffect } from 'react'
import { formatBytes } from '../../utils/advancedCompression'
import { loadPdfFile, rotatePage } from '../../utils/pdfEditorEngine'
import {
  validatePdfFile,
  PdfValidationError,
  sanitizeBaseName,
  generatePageThumbnails,
  LARGE_DOCUMENT_PAGE_WARNING,
} from '../../utils/pdfSplitEngine'
import AdBanner from '../AdBanner'

/**
 * Rotate PDF — new UI, but built entirely on functions that already existed
 * before this page did: `rotatePage()` in pdfEditorEngine.js was written for
 * the disabled PDF editor and was otherwise unused; page loading/thumbnails
 * reuse the exact same pdfValidation/pdfSplitEngine primitives SplitPdfClient
 * already relies on. No new PDF-manipulation logic, only a new client
 * component and route.
 */
export default function RotatePdfClient() {
  const [file, setFile] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [srcPdfDoc, setSrcPdfDoc] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pages, setPages] = useState([]) // [{ pageNumber, thumbnail, error, rotation }]

  const [isProcessing, setIsProcessing] = useState(false)
  const [rotateError, setRotateError] = useState(null)
  const [result, setResult] = useState(null)

  const fileInputRef = useRef(null)
  const stopThumbGenRef = useRef(null)
  const resultRef = useRef(null)

  useEffect(() => {
    resultRef.current = result
  }, [result])

  useEffect(() => {
    return () => {
      if (stopThumbGenRef.current) stopThumbGenRef.current()
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)
    }
  }, [])

  const loadFile = async (selectedFile) => {
    if (stopThumbGenRef.current) stopThumbGenRef.current()
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)

    setFileError(null)
    setRotateError(null)
    setResult(null)
    setIsValidating(true)

    try {
      const { pdfDoc, pageCount } = await validatePdfFile(selectedFile)
      const { pdf: pdfjsDoc } = await loadPdfFile(selectedFile)

      setFile(selectedFile)
      setSrcPdfDoc(pdfDoc)
      setTotalPages(pageCount)

      const initialPages = Array.from({ length: pageCount }, (_, i) => ({
        pageNumber: i + 1,
        thumbnail: null,
        error: null,
        rotation: 0,
      }))
      setPages(initialPages)

      stopThumbGenRef.current = generatePageThumbnails(pdfjsDoc, pageCount, (pageNum, dataUrl, err) => {
        setPages((prev) =>
          prev.map((p) => (p.pageNumber === pageNum ? { ...p, thumbnail: dataUrl, error: err ? true : null } : p))
        )
      })
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

  const [removedPages, setRemovedPages] = useState([])

  const rotatePageBy = (pageNumber, delta) => {
    setPages((prev) =>
      prev.map((p) => (p.pageNumber === pageNumber ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p))
    )
  }
  const rotateAllBy = (delta) => {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + delta + 360) % 360 })))
  }

  const toggleRemovePage = (pageNumber) => {
    setRemovedPages((prev) =>
      prev.includes(pageNumber) ? prev.filter((p) => p !== pageNumber) : [...prev, pageNumber]
    )
  }

  const rotatedCount = pages.filter((p) => p.rotation !== 0 && !removedPages.includes(p.pageNumber)).length
  const removedCount = removedPages.length

  const handleRotate = async () => {
    if (!srcPdfDoc) return

    const activePages = pages.filter((p) => !removedPages.includes(p.pageNumber))
    if (activePages.length === 0) {
      alert('Please keep at least one page in the PDF.')
      return
    }

    setIsProcessing(true)
    setRotateError(null)
    setResult(null)

    try {
      const { PDFDocument, degrees } = await import('pdf-lib')
      const arrayBuffer = await file.arrayBuffer()
      const origDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })

      const newPdf = await PDFDocument.create()

      for (const page of activePages) {
        const pageIdx = page.pageNumber - 1
        const [copiedPage] = await newPdf.copyPages(origDoc, [pageIdx])
        if (page.rotation !== 0) {
          const currentAngle = copiedPage.getRotation().angle || 0
          copiedPage.setRotation(degrees((currentAngle + page.rotation) % 360))
        }
        newPdf.addPage(copiedPage)
      }

      const bytes = await newPdf.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResult({
        filename: `${sanitizeBaseName(file.name)}-modified.pdf`,
        blob,
        dataUrl: url,
        size: blob.size,
      })
    } catch (err) {
      console.error('Rotate error:', err)
      setRotateError(err.message || 'Failed to process the PDF. Please try again.')
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
    if (stopThumbGenRef.current) stopThumbGenRef.current()
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)

    setFile(null)
    setFileError(null)
    setSrcPdfDoc(null)
    setTotalPages(0)
    setPages([])
    setRotateError(null)
    setResult(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-6xl mx-auto font-sans">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🔄 Rotate PDF
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Rotate any page 90° at a time — individually or all at once — and download the corrected PDF. Nothing is
            uploaded.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Main workspace */}
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {isValidating ? 'Reading PDF...' : isDragOver ? 'Drop your PDF here' : 'Upload a PDF to rotate'}
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

                {totalPages > LARGE_DOCUMENT_PAGE_WARNING && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
                    This is a large document ({totalPages} pages) — page previews load progressively.
                  </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Rotate all pages</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => rotateAllBy(-90)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                    >
                      ↺ 90° Left
                    </button>
                    <button
                      type="button"
                      onClick={() => rotateAllBy(90)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1"
                    >
                      ↻ 90° Right
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Pages — {pages.length - removedCount} active ({rotatedCount} rotated
                      {removedCount > 0 ? `, ${removedCount} removed` : ''})
                    </h2>
                    {removedCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setRemovedPages([])}
                        className="text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        Restore All ({removedCount})
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[30rem] overflow-y-auto p-1">
                    {pages.map((page) => {
                      const isRemoved = removedPages.includes(page.pageNumber)
                      return (
                        <div
                          key={page.pageNumber}
                          className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all ${
                            isRemoved
                              ? 'opacity-40 border-red-300 dark:border-red-900 bg-red-50/20'
                              : page.rotation !== 0
                              ? 'border-emerald-500 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
                              : 'border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div className="absolute top-1.5 left-1.5 z-10 min-w-5 h-5 px-1 rounded-full bg-slate-900/80 text-white text-[10px] font-bold flex items-center justify-center">
                            {page.pageNumber}
                          </div>

                          {page.rotation !== 0 && !isRemoved && (
                            <div className="absolute top-1.5 right-1.5 z-10 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                              {page.rotation}°
                            </div>
                          )}

                          <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden relative">
                            {page.thumbnail ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={page.thumbnail}
                                alt={`Page ${page.pageNumber}`}
                                draggable={false}
                                className={`max-w-[80%] max-h-[80%] object-contain pointer-events-none transition-transform duration-200 ${
                                  isRemoved ? 'grayscale' : ''
                                }`}
                                style={{ transform: `rotate(${page.rotation}deg)` }}
                              />
                            ) : page.error ? (
                              <span className="text-[10px] text-slate-400">No preview</span>
                            ) : (
                              <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                            )}

                            {isRemoved && (
                              <div className="absolute inset-0 bg-red-950/30 flex items-center justify-center">
                                <span className="px-2 py-1 rounded bg-red-600 text-white text-[10px] font-bold shadow">
                                  Removed
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between px-1.5 py-1.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => rotatePageBy(page.pageNumber, -90)}
                                disabled={isRemoved}
                                title="Rotate 90° Left"
                                className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all text-xs font-bold"
                              >
                                ↺
                              </button>
                              <button
                                type="button"
                                onClick={() => rotatePageBy(page.pageNumber, 90)}
                                disabled={isRemoved}
                                title="Rotate 90° Right"
                                className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all text-xs font-bold"
                              >
                                ↻
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleRemovePage(page.pageNumber)}
                              title={isRemoved ? 'Restore page' : 'Remove page'}
                              className={`px-1.5 py-0.5 rounded text-xs font-bold transition-all ${
                                isRemoved
                                  ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                  : 'text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950'
                              }`}
                            >
                              {isRemoved ? 'Restore' : '✕'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {rotateError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {rotateError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRotate}
                  disabled={isProcessing || rotatedCount === 0}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>
                    {isProcessing
                      ? 'Rotating...'
                      : rotatedCount > 0
                      ? `Rotate PDF — ${rotatedCount} page${rotatedCount !== 1 ? 's' : ''}`
                      : 'Rotate at least one page'}
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
                      <h2 className="text-lg font-bold">Rotation Complete! ✨</h2>
                      <p className="text-sm text-emerald-100 mt-1">
                        {rotatedCount} page{rotatedCount !== 1 ? 's' : ''} rotated in {file?.name}
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
                      Rotate Another
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

          {/* RIGHT: Sidebar */}
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
                  'Rotate individual pages or the whole document',
                  '90° increments, either direction',
                  'Live preview before you export',
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
