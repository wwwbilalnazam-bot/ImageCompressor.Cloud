'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { formatBytes } from '../../utils/advancedCompression'
import { sanitizeBaseName } from '../../utils/pdfSplitEngine'
import {
  validatePdfFile,
  PdfValidationError,
  compressPdf,
  loadFreshDocument,
  getAutomaticLevel,
  COMPRESSION_LEVELS,
  DPI_PRESETS,
} from '../../utils/pdfCompressionEngine'
import { compressPdfFaq } from '../../content/faq/compress-pdf'
import AdBanner from '../AdBanner'
import FaqList from '../FaqList'

const LEVEL_LIST = [
  { id: 'auto', label: 'Automatic', desc: 'Smart default — recommended for most PDFs' },
  { id: 'low', ...COMPRESSION_LEVELS.low },
  { id: 'medium', ...COMPRESSION_LEVELS.medium },
  { id: 'high', ...COMPRESSION_LEVELS.high },
]

const AUTO_CLEAR_MS = 20 * 60 * 1000

/**
 * PDF compressor — ported from pages/CompressPdfPage.jsx.
 *
 * Removed: the `<SEO>` element and the inline `faqSchema` object it was handed.
 * The FAQ content now lives in `src/content/faq/compress-pdf.js` and is used
 * twice — by <FaqList> below for the visible UI, and by the page's Server
 * Component to emit FAQPage JSON-LD in the initial HTML (the old version built
 * the schema client-side, where crawlers without JS never saw it).
 */
export default function CompressPdfClient() {
  const [file, setFile] = useState(null)
  const [arrayBuffer, setArrayBuffer] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [isValidating, setIsValidating] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [quality, setQuality] = useState(COMPRESSION_LEVELS.medium.quality)
  const [maxDimension, setMaxDimension] = useState(COMPRESSION_LEVELS.medium.maxDimension)
  const [grayscale, setGrayscale] = useState(false)
  const [removeMetadata, setRemoveMetadata] = useState(false)
  const [optimizeForWeb, setOptimizeForWeb] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [compressError, setCompressError] = useState(null)

  const [result, setResult] = useState(null)

  const fileInputRef = useRef(null)
  const resultRef = useRef(null)
  const autoClearTimerRef = useRef(null)

  useEffect(() => {
    resultRef.current = result
  }, [result])

  useEffect(() => {
    return () => {
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)
      if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current)
    if (result) {
      autoClearTimerRef.current = setTimeout(() => resetAll(), AUTO_CLEAR_MS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const activeLevelId = useMemo(() => {
    if (!file) return 'auto'
    const auto = getAutomaticLevel(file.size)
    if (quality === auto.quality && maxDimension === auto.maxDimension) return 'auto'
    for (const lvl of Object.values(COMPRESSION_LEVELS)) {
      if (quality === lvl.quality && maxDimension === lvl.maxDimension) return lvl.id
    }
    return null
  }, [file, quality, maxDimension])

  const selectLevel = (levelId, fileForAuto) => {
    const preset = levelId === 'auto' ? getAutomaticLevel((fileForAuto || file).size) : COMPRESSION_LEVELS[levelId]
    setQuality(preset.quality)
    setMaxDimension(preset.maxDimension)
  }

  const loadFile = async (selectedFile) => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)

    setFileError(null)
    setCompressError(null)
    setResult(null)
    setIsValidating(true)

    try {
      // Only pageCount/arrayBuffer are kept — the parsed pdfDoc instance
      // itself isn't reused for compression (see loadFreshDocument).
      const { arrayBuffer: buf, pageCount } = await validatePdfFile(selectedFile)
      setFile(selectedFile)
      setArrayBuffer(buf)
      setTotalPages(pageCount)
      selectLevel('auto', selectedFile)
      setGrayscale(false)
      setRemoveMetadata(false)
      setOptimizeForWeb(false)
      setShowAdvanced(false)
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

  const handleCompress = async () => {
    if (!arrayBuffer || !file) return

    setIsProcessing(true)
    setCompressError(null)
    setProgressMsg('Preparing...')
    setProgressPct(0)
    setResult(null)

    try {
      // Reparse from the original bytes every run so trying multiple levels
      // on the same upload never compounds compression from a prior attempt.
      const freshDoc = await loadFreshDocument(arrayBuffer)

      const effectiveRemoveMetadata = removeMetadata || optimizeForWeb
      const effectiveMaxDimension = optimizeForWeb ? Math.min(maxDimension || 1500, 1500) : maxDimension

      const { bytes, totalImages, imagesRecompressed } = await compressPdf(
        freshDoc,
        { quality, maxDimension: effectiveMaxDimension, grayscale, removeMetadata: effectiveRemoveMetadata },
        (current, total) => {
          setProgressMsg(total ? `Compressing image ${current} of ${total}...` : 'Optimizing document...')
          setProgressPct(total ? Math.round((current / total) * 100) : 100)
        }
      )

      let compressedBlob = new Blob([bytes], { type: 'application/pdf' })
      let compressedSize = compressedBlob.size
      let reduction = Math.round((1 - compressedSize / file.size) * 100)

      // Never ship a "compressed" file that's actually bigger than the original.
      if (compressedSize >= file.size) {
        compressedBlob = file
        compressedSize = file.size
        reduction = 0
      }

      setResult({
        blob: compressedBlob,
        dataUrl: URL.createObjectURL(compressedBlob),
        filename: `${sanitizeBaseName(file.name)}-compressed.pdf`,
        originalSize: file.size,
        compressedSize,
        reduction: Math.max(0, reduction),
        totalImages,
        imagesRecompressed,
      })
    } catch (err) {
      console.error('Compression error:', err)
      setCompressError(err.message || 'Failed to compress the PDF. Please try again.')
    } finally {
      setIsProcessing(false)
      setProgressMsg('')
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

  const clearResult = () => {
    if (result) URL.revokeObjectURL(result.dataUrl)
    setResult(null)
    setCompressError(null)
  }

  const resetAll = () => {
    if (resultRef.current) URL.revokeObjectURL(resultRef.current.dataUrl)
    setFile(null)
    setArrayBuffer(null)
    setTotalPages(0)
    setFileError(null)
    setResult(null)
    setCompressError(null)
    setIsProcessing(false)
    setGrayscale(false)
    setRemoveMetadata(false)
    setOptimizeForWeb(false)
    setShowAdvanced(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const dpiId = useMemo(() => {
    const preset = DPI_PRESETS.find((p) => p.maxDimension === maxDimension)
    return preset ? preset.id : 'none'
  }, [maxDimension])

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-6xl mx-auto font-sans">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🗜️ Compress PDF
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Shrink PDF file size while keeping text sharp and readable — entirely in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Main workspace */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload Zone */}
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
                      {isValidating ? 'Reading PDF...' : isDragOver ? 'Drop your PDF here' : 'Upload a PDF to compress'}
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
                    PDF only • up to 300MB • 100% processed in your browser
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

            {/* File loaded — compression workspace */}
            {file && !result && (
              <div className="space-y-4">
                {/* File info bar */}
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

                {/* Compression level selector */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 space-y-3">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">Compression level</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {LEVEL_LIST.map((lvl) => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => selectLevel(lvl.id)}
                        title={lvl.desc}
                        className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs transition-all ${
                          activeLevelId === lvl.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                    {LEVEL_LIST.find((l) => l.id === activeLevelId)?.desc || 'Custom settings (see Advanced Options)'}
                  </p>

                  {/* Advanced options toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-700"
                  >
                    <span>Advanced Options</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showAdvanced && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">Image quality</label>
                          <span className="text-slate-500 dark:text-slate-400">{Math.round(quality * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={95}
                          step={5}
                          value={Math.round(quality * 100)}
                          onChange={(e) => setQuality(parseInt(e.target.value, 10) / 100)}
                          className="w-full accent-emerald-600"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Max image resolution
                        </label>
                        <select
                          value={dpiId}
                          onChange={(e) => {
                            const preset = DPI_PRESETS.find((p) => p.id === e.target.value)
                            setMaxDimension(preset ? preset.maxDimension : null)
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {DPI_PRESETS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={grayscale}
                            onChange={(e) => setGrayscale(e.target.checked)}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          Convert images to grayscale
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={removeMetadata}
                            onChange={(e) => setRemoveMetadata(e.target.checked)}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          Remove metadata (title, author, keywords...)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={optimizeForWeb}
                            onChange={(e) => setOptimizeForWeb(e.target.checked)}
                            className="w-4 h-4 accent-emerald-600"
                          />
                          Optimize for web (caps resolution + strips metadata)
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {compressError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {compressError}
                  </div>
                )}

                {isProcessing ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">{progressMsg || 'Compressing...'}</h2>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-200"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompress}
                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7m14-6l-7 7-7-7" />
                    </svg>
                    <span>Compress PDF</span>
                  </button>
                )}
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg space-y-4">
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
                      <h2 className="text-lg font-bold">Compression Complete! ✨</h2>
                      <p className="text-sm text-emerald-100 mt-1">
                        {result.reduction > 0
                          ? `Reduced by ${result.reduction}% — ${result.imagesRecompressed} of ${result.totalImages} image${
                              result.totalImages !== 1 ? 's' : ''
                            } optimized`
                          : result.totalImages === 0
                          ? 'This PDF has no compressible images — text-based PDFs are already highly optimized.'
                          : 'This file was already well-optimized — no further reduction was possible.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-4 rounded-xl bg-slate-100 dark:bg-slate-800">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Original</p>
                      <p className="text-lg font-bold text-slate-700 dark:text-slate-300">
                        {formatBytes(result.originalSize)}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Compressed</p>
                      <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                        {formatBytes(result.compressedSize)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${Math.max(4, 100 - result.reduction)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      -{result.reduction}%
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Text, fonts, links and page layout are always preserved — only embedded images are recompressed.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={clearResult}
                      className="py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                    >
                      Try Another Level
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
                      Download
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={resetAll}
                    className="w-full py-2.5 rounded-xl font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-all text-sm"
                  >
                    Compress Another PDF
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-4">
            {file && !result && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-900 space-y-3">
                <h2 className="font-bold text-slate-900 dark:text-white text-sm">📊 Summary</h2>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">File Size:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatBytes(file.size)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Pages:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                  </div>
                  <div className="border-t border-blue-300 dark:border-blue-800 pt-2 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Level:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {LEVEL_LIST.find((l) => l.id === activeLevelId)?.label || 'Custom'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy note */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900 space-y-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">🔒 Privacy</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your files are automatically deleted after processing. Everything runs 100% in your browser — nothing is
                ever uploaded to a server.
              </p>
            </div>

            {/* Features */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">✨ Features</h2>
              <div className="space-y-2 text-xs">
                {[
                  'Automatic, Low, Medium & High presets',
                  'Preserves text, fonts and links',
                  'Grayscale, DPI & metadata controls',
                  'Before/after size comparison',
                  'Handles files up to 300MB',
                  '100% private, browser-based',
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                    <span className="text-slate-600 dark:text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Same array that feeds this page's FAQPage JSON-LD */}
            <FaqList items={compressPdfFaq} />
          </div>
        </div>

        {/* SEO content section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">How PDF compression works</h2>
          <p>
            Most oversized PDFs are large because of embedded photos or scanned pages, not text. This tool finds every
            embedded JPEG image in your document — including ones reused across multiple pages — and re-encodes each one
            at a lower quality and resolution based on the level you choose. Vector text, fonts, and links are part of
            the PDF&apos;s structure rather than an image, so they&apos;re left completely untouched, keeping your
            document sharp and readable after compression.
          </p>
        </div>
      </div>

      <div className="pt-6 shrink-0">
        <AdBanner position="bottom" type="horizontal-banner" />
      </div>
    </div>
  )
}
