import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import SEO from '../components/SEO'
import AdBanner from '../components/AdBanner'
import { formatBytes } from '../utils/advancedCompression'
import { loadPdfFile } from '../utils/pdfEditorEngine'
import {
  validatePdfFile,
  PdfValidationError,
  extractPagesToBytes,
  parsePageRanges,
  buildEqualPartRanges,
  sanitizeBaseName,
  createPdfZip,
  generatePageThumbnails,
  LARGE_DOCUMENT_PAGE_WARNING,
} from '../utils/pdfSplitEngine'

const SPLIT_MODES = [
  { id: 'extract', label: 'Extract Pages', desc: 'Pull selected pages into one new PDF' },
  { id: 'ranges', label: 'Page Ranges', desc: 'Split by custom ranges, e.g. 1-5, 6-10' },
  { id: 'every', label: 'Every Page', desc: 'One PDF file per selected page (all selected by default)' },
  { id: 'equal', label: 'Equal Parts', desc: 'Split into fixed-size chunks' },
  { id: 'remove', label: 'Remove Pages', desc: 'Click ✕ on a page to remove it, then export the rest' },
]

const PART_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
]

const AUTO_CLEAR_MS = 20 * 60 * 1000 // privacy: auto-clear results after 20 min idle

export default function SplitPdfPage() {
  const [file, setFile] = useState(null)
  const [isValidating, setIsValidating] = useState(false)
  const [fileError, setFileError] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const [srcPdfDoc, setSrcPdfDoc] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [pages, setPages] = useState([]) // [{ pageNumber, thumbnail, error }]
  const [selectedOrder, setSelectedOrder] = useState([]) // page numbers, in chosen order

  const [splitMode, setSplitMode] = useState('extract')
  const [rangesInput, setRangesInput] = useState('')
  const [equalPartsSize, setEqualPartsSize] = useState(5)

  const [draggedPage, setDraggedPage] = useState(null)
  const [dragOverPage, setDragOverPage] = useState(null)

  const [isProcessing, setIsProcessing] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [splitError, setSplitError] = useState(null)

  const [results, setResults] = useState(null)
  const [resultWarnings, setResultWarnings] = useState([])
  const [isZipping, setIsZipping] = useState(false)

  const fileInputRef = useRef(null)
  const stopThumbGenRef = useRef(null)
  const resultsRef = useRef(null)
  const autoClearTimerRef = useRef(null)

  useEffect(() => {
    resultsRef.current = results
  }, [results])

  // Cleanup on unmount: stop background thumbnail rendering, revoke blob URLs.
  useEffect(() => {
    return () => {
      if (stopThumbGenRef.current) stopThumbGenRef.current()
      if (resultsRef.current) {
        resultsRef.current.forEach((r) => URL.revokeObjectURL(r.dataUrl))
      }
      if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current)
    }
  }, [])

  // Privacy: auto-clear generated files after a period of inactivity.
  useEffect(() => {
    if (autoClearTimerRef.current) clearTimeout(autoClearTimerRef.current)
    if (results) {
      autoClearTimerRef.current = setTimeout(() => {
        resetAll()
      }, AUTO_CLEAR_MS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results])

  const loadFile = async (selectedFile) => {
    if (stopThumbGenRef.current) stopThumbGenRef.current()
    if (resultsRef.current) resultsRef.current.forEach((r) => URL.revokeObjectURL(r.dataUrl))

    setFileError(null)
    setSplitError(null)
    setResults(null)
    setResultWarnings([])
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
      }))
      setPages(initialPages)
      setSelectedOrder(initialPages.map((p) => p.pageNumber))
      setEqualPartsSize((prev) => Math.min(prev || 5, pageCount))

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

  const togglePage = (pageNumber) => {
    setSelectedOrder((prev) =>
      prev.includes(pageNumber) ? prev.filter((n) => n !== pageNumber) : [...prev, pageNumber]
    )
  }

  const selectAllPages = () => setSelectedOrder(pages.map((p) => p.pageNumber))
  const deselectAllPages = () => setSelectedOrder([])

  // "Selected" means the opposite thing in Remove mode (excluded) vs.
  // Extract/Every (included) — carrying the same list across a mode switch
  // would otherwise flip its meaning, so reset to a sensible default whenever
  // that meaning changes.
  const handleModeChange = (modeId) => {
    const wasRemove = splitMode === 'remove'
    const willBeRemove = modeId === 'remove'
    if (wasRemove !== willBeRemove) {
      setSelectedOrder(willBeRemove ? [] : pages.map((p) => p.pageNumber))
    }
    setSplitMode(modeId)
  }

  const handleOrderDragStart = (pageNumber) => setDraggedPage(pageNumber)
  const handleOrderDragEnd = () => {
    setDraggedPage(null)
    setDragOverPage(null)
  }
  const handleOrderDragOver = (e, pageNumber) => {
    e.preventDefault()
    setDragOverPage(pageNumber)
  }
  const handleOrderDrop = (e, targetPageNumber) => {
    e.preventDefault()
    setDragOverPage(null)
    if (!draggedPage || draggedPage === targetPageNumber) {
      setDraggedPage(null)
      return
    }
    setSelectedOrder((prev) => {
      const next = [...prev]
      const from = next.indexOf(draggedPage)
      const to = next.indexOf(targetPageNumber)
      if (from === -1 || to === -1) return prev
      next.splice(from, 1)
      next.splice(to, 0, draggedPage)
      return next
    })
    setDraggedPage(null)
  }

  const isSelectableMode = splitMode === 'extract' || splitMode === 'every' || splitMode === 'remove'

  // Computes what will be produced for the current mode/inputs — recalculated
  // on every render (cheap: pure parsing/arithmetic, no PDF work happens here).
  const outputPlan = useMemo(() => {
    if (!totalPages) return null

    if (splitMode === 'extract') {
      if (selectedOrder.length === 0) return { error: 'Select at least one page to extract.' }
      return { count: 1, label: `1 PDF · ${selectedOrder.length} page${selectedOrder.length !== 1 ? 's' : ''}` }
    }

    if (splitMode === 'every') {
      if (selectedOrder.length === 0) return { error: 'Select at least one page to split out.' }
      return {
        count: selectedOrder.length,
        label: `${selectedOrder.length} separate PDF file${selectedOrder.length !== 1 ? 's' : ''}`,
      }
    }

    if (splitMode === 'remove') {
      const remaining = totalPages - selectedOrder.length
      if (selectedOrder.length === 0) return { error: 'Select at least one page to remove.' }
      if (remaining <= 0) return { error: "You can't remove every page — at least one must remain." }
      return { count: 1, label: `1 PDF · ${remaining} page${remaining !== 1 ? 's' : ''} remaining` }
    }

    if (splitMode === 'ranges') {
      try {
        const ranges = parsePageRanges(rangesInput, totalPages)
        return { count: ranges.length, label: `${ranges.length} PDF file${ranges.length !== 1 ? 's' : ''}`, ranges }
      } catch (err) {
        return { error: err.message }
      }
    }

    if (splitMode === 'equal') {
      try {
        const size = Math.min(Math.max(1, Math.round(equalPartsSize) || 1), totalPages)
        const ranges = buildEqualPartRanges(totalPages, size)
        return {
          count: ranges.length,
          label: `${ranges.length} PDF file${ranges.length !== 1 ? 's' : ''} of up to ${size} pages each`,
          ranges,
        }
      } catch (err) {
        return { error: err.message }
      }
    }

    return null
  }, [splitMode, selectedOrder, totalPages, rangesInput, equalPartsSize])

  const pagePartIndex = useCallback(
    (pageNumber) => {
      if (!outputPlan || !outputPlan.ranges) return null
      const idx = outputPlan.ranges.findIndex((r) => pageNumber >= r.start && pageNumber <= r.end)
      return idx === -1 ? null : idx
    },
    [outputPlan]
  )

  // In Extract mode, drag-to-reorder lives directly in the main grid: selected
  // pages are pulled to the front in their chosen output order, unselected
  // pages trail after in original document order. Other modes keep natural
  // page order since sequence doesn't affect their output.
  const displayPages = useMemo(() => {
    if (splitMode !== 'extract') return pages
    const selectedSet = new Set(selectedOrder)
    const selectedPages = selectedOrder.map((n) => pages.find((p) => p.pageNumber === n)).filter(Boolean)
    const unselectedPages = pages.filter((p) => !selectedSet.has(p.pageNumber))
    return [...selectedPages, ...unselectedPages]
  }, [splitMode, pages, selectedOrder])

  const handleSplit = async () => {
    if (!srcPdfDoc || !outputPlan || outputPlan.error) return

    setIsProcessing(true)
    setSplitError(null)
    setProgressMsg('Preparing...')
    setProgressPct(0)
    setResults(null)
    setResultWarnings([])

    try {
      const baseName = sanitizeBaseName(file.name)
      const outputs = []
      const warnings = []

      if (splitMode === 'extract') {
        setProgressMsg(`Extracting ${selectedOrder.length} page${selectedOrder.length !== 1 ? 's' : ''}...`)
        const indices = selectedOrder.map((n) => n - 1)
        const bytes = await extractPagesToBytes(srcPdfDoc, indices)
        outputs.push({ filename: `${baseName}-extracted.pdf`, bytes })
        setProgressPct(100)
      } else if (splitMode === 'remove') {
        setProgressMsg('Removing selected pages...')
        const removeSet = new Set(selectedOrder)
        const keepIndices = pages.filter((p) => !removeSet.has(p.pageNumber)).map((p) => p.pageNumber - 1)
        const bytes = await extractPagesToBytes(srcPdfDoc, keepIndices)
        outputs.push({ filename: `${baseName}-pages-removed.pdf`, bytes })
        setProgressPct(100)
      } else if (splitMode === 'every') {
        const targets = [...selectedOrder].sort((a, b) => a - b)

        for (let i = 0; i < targets.length; i++) {
          const pageNum = targets[i]
          setProgressMsg(`Creating page ${i + 1} of ${targets.length}...`)
          try {
            const bytes = await extractPagesToBytes(srcPdfDoc, [pageNum - 1])
            outputs.push({ filename: `${baseName}-page-${pageNum}.pdf`, bytes })
          } catch (err) {
            warnings.push(`Skipped page ${pageNum}: ${err.message}`)
          }
          setProgressPct(Math.round(((i + 1) / targets.length) * 100))
        }
      } else if (splitMode === 'ranges' || splitMode === 'equal') {
        const ranges = outputPlan.ranges
        for (let i = 0; i < ranges.length; i++) {
          const { start, end } = ranges[i]
          setProgressMsg(`Creating part ${i + 1} of ${ranges.length} (pages ${start}-${end})...`)
          const indices = []
          for (let p = start; p <= end; p++) indices.push(p - 1)
          try {
            const bytes = await extractPagesToBytes(srcPdfDoc, indices)
            outputs.push({ filename: `${baseName}-part-${i + 1}.pdf`, bytes })
          } catch (err) {
            warnings.push(`Skipped part ${i + 1} (pages ${start}-${end}): ${err.message}`)
          }
          setProgressPct(Math.round(((i + 1) / ranges.length) * 100))
        }
      }

      if (outputs.length === 0) {
        throw new Error('No output PDFs could be created.')
      }

      const finalResults = outputs.map((o) => {
        const blob = new Blob([o.bytes], { type: 'application/pdf' })
        return {
          filename: o.filename,
          blob,
          dataUrl: URL.createObjectURL(blob),
          size: blob.size,
        }
      })

      setResults(finalResults)
      setResultWarnings(warnings)
    } catch (err) {
      console.error('Split error:', err)
      setSplitError(err.message || 'Failed to split the PDF. Please try again.')
    } finally {
      setIsProcessing(false)
      setProgressMsg('')
    }
  }

  const handleDownloadSingle = (item) => {
    const link = document.createElement('a')
    link.href = item.dataUrl
    link.download = item.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadZip = async () => {
    if (!results || results.length < 2) return
    setIsZipping(true)
    try {
      const zipBlob = await createPdfZip(results.map((r) => ({ filename: r.filename, blob: r.blob })))
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${sanitizeBaseName(file.name)}-split.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('ZIP creation error:', err)
      setSplitError('Could not create the ZIP file.')
    } finally {
      setIsZipping(false)
    }
  }

  const clearResults = () => {
    if (results) results.forEach((r) => URL.revokeObjectURL(r.dataUrl))
    setResults(null)
    setResultWarnings([])
    setSplitError(null)
  }

  const resetAll = () => {
    if (stopThumbGenRef.current) stopThumbGenRef.current()
    if (resultsRef.current) resultsRef.current.forEach((r) => URL.revokeObjectURL(r.dataUrl))

    setFile(null)
    setFileError(null)
    setSrcPdfDoc(null)
    setTotalPages(0)
    setPages([])
    setSelectedOrder([])
    setSplitMode('extract')
    setRangesInput('')
    setEqualPartsSize(5)
    setResults(null)
    setResultWarnings([])
    setSplitError(null)
    setIsProcessing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const selectedCount = selectedOrder.length

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-6xl mx-auto font-sans">
      <SEO
        title="Split PDF - Extract, Divide & Remove PDF Pages Online"
        description="Split a PDF by page ranges, extract selected pages, split into equal parts, or remove pages. Preview pages, reorder, and download individually or as a ZIP."
        canonicalUrl="https://imagecompressor.cloud/split-pdf"
      />

      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ✂️ Split PDF
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Extract pages, split by range, break into equal parts, or remove pages — all in your browser.
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {isValidating ? 'Reading PDF...' : isDragOver ? 'Drop your PDF here' : 'Upload a PDF to split'}
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

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">PDF only • 100% processed in your browser</p>
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

            {/* File loaded — split workspace */}
            {file && !results && (
              <div className="space-y-4">
                {/* File info bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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

                {/* Split mode selector */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {SPLIT_MODES.map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleModeChange(mode.id)}
                        title={mode.desc}
                        className={`py-2.5 px-2 rounded-xl border text-center font-bold text-xs transition-all ${
                          splitMode === mode.id
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center">
                    {SPLIT_MODES.find((m) => m.id === splitMode)?.desc}
                  </p>
                </div>

                {/* Mode-specific controls */}
                {splitMode === 'ranges' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Page ranges</label>
                    <input
                      type="text"
                      value={rangesInput}
                      onChange={(e) => setRangesInput(e.target.value)}
                      placeholder="e.g. 1-5, 6-10, 11-20"
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {outputPlan?.error ? (
                      <p className="text-xs text-red-600 dark:text-red-400">{outputPlan.error}</p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{outputPlan?.label}</p>
                    )}
                  </div>
                )}

                {splitMode === 'equal' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Pages per part</label>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={equalPartsSize}
                      onChange={(e) => setEqualPartsSize(parseInt(e.target.value, 10) || 1)}
                      className="w-32 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {outputPlan?.error ? (
                      <p className="text-xs text-red-600 dark:text-red-400">{outputPlan.error}</p>
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">{outputPlan?.label}</p>
                    )}
                  </div>
                )}

                {(splitMode === 'extract' || splitMode === 'every') && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Select pages — {selectedCount}/{totalPages} selected
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllPages}
                          className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-all"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={deselectAllPages}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Deselect All
                        </button>
                      </div>
                    </div>

                    {outputPlan?.error && <p className="text-xs text-red-600 dark:text-red-400">{outputPlan.error}</p>}

                    {splitMode === 'extract' && selectedCount > 1 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Drag selected pages to set the output order.
                      </p>
                    )}

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[30rem] overflow-y-auto p-1">
                      {displayPages.map((page) => {
                        const isSelected = selectedOrder.includes(page.pageNumber)
                        const orderIndex = splitMode === 'extract' ? selectedOrder.indexOf(page.pageNumber) : -1
                        const isDraggable = splitMode === 'extract' && isSelected
                        return (
                          <button
                            type="button"
                            key={page.pageNumber}
                            draggable={isDraggable}
                            onDragStart={isDraggable ? () => handleOrderDragStart(page.pageNumber) : undefined}
                            onDragEnd={isDraggable ? handleOrderDragEnd : undefined}
                            onDragOver={isDraggable ? (e) => handleOrderDragOver(e, page.pageNumber) : undefined}
                            onDrop={isDraggable ? (e) => handleOrderDrop(e, page.pageNumber) : undefined}
                            onClick={() => togglePage(page.pageNumber)}
                            className={`relative flex flex-col rounded-xl overflow-hidden text-left transition-all border-2 ${
                              isDraggable ? 'cursor-move' : ''
                            } ${
                              draggedPage === page.pageNumber
                                ? 'opacity-40 border-emerald-400'
                                : dragOverPage === page.pageNumber
                                ? 'border-emerald-500 border-dashed scale-[1.02]'
                                : isSelected
                                ? 'border-emerald-500 ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                            }`}
                          >
                            <div
                              className={`absolute top-1.5 left-1.5 z-10 min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${
                                isSelected ? 'bg-emerald-600' : 'bg-slate-400/80'
                              }`}
                            >
                              {isSelected && splitMode === 'extract' ? (
                                orderIndex + 1
                              ) : isSelected ? (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                page.pageNumber
                              )}
                            </div>

                            {isDraggable && (
                              <div className="absolute top-1.5 right-1.5 z-10 text-slate-400 dark:text-slate-500">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm4-8h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2z" />
                                </svg>
                              </div>
                            )}

                            <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                              {page.thumbnail ? (
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  draggable={false}
                                  className="w-full h-full object-contain pointer-events-none"
                                />
                              ) : page.error ? (
                                <span className="text-[10px] text-slate-400">No preview</span>
                              ) : (
                                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>

                            <div className="py-1 text-center bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Page {page.pageNumber}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Remove Pages mode: clicking ✕ removes a page from the grid immediately. */}
                {splitMode === 'remove' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Pages remaining — {totalPages - selectedCount}/{totalPages}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={selectAllPages}
                          className="px-3 py-1.5 text-xs font-semibold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900 transition-all"
                        >
                          Remove All
                        </button>
                        <button
                          type="button"
                          onClick={deselectAllPages}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                        >
                          Restore All
                        </button>
                      </div>
                    </div>

                    {outputPlan?.error && <p className="text-xs text-red-600 dark:text-red-400">{outputPlan.error}</p>}

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[30rem] overflow-y-auto p-1">
                      {pages
                        .filter((page) => !selectedOrder.includes(page.pageNumber))
                        .map((page) => (
                          <div
                            key={page.pageNumber}
                            className="group relative flex flex-col rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700"
                          >
                            <button
                              type="button"
                              onClick={() => togglePage(page.pageNumber)}
                              title="Remove this page"
                              className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>

                            <div className="absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-full bg-slate-400/80 flex items-center justify-center text-white text-[10px] font-bold">
                              {page.pageNumber}
                            </div>

                            <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                              {page.thumbnail ? (
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  draggable={false}
                                  className="w-full h-full object-contain pointer-events-none"
                                />
                              ) : page.error ? (
                                <span className="text-[10px] text-slate-400">No preview</span>
                              ) : (
                                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>

                            <div className="py-1 text-center bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                Page {page.pageNumber}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    {selectedCount > 0 && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          Removed ({selectedCount}) — click to restore
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {[...selectedOrder]
                            .sort((a, b) => a - b)
                            .map((pageNumber) => {
                              const page = pages.find((p) => p.pageNumber === pageNumber)
                              return (
                                <button
                                  type="button"
                                  key={pageNumber}
                                  onClick={() => togglePage(pageNumber)}
                                  title="Restore this page"
                                  className="relative w-14 rounded-lg overflow-hidden border-2 border-red-300 dark:border-red-800 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                  <div className="absolute inset-0 z-10 bg-slate-900/40 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                  </div>
                                  <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-950">
                                    {page?.thumbnail && (
                                      <img
                                        src={page.thumbnail}
                                        alt={`Page ${pageNumber}`}
                                        draggable={false}
                                        className="w-full h-full object-contain pointer-events-none"
                                      />
                                    )}
                                  </div>
                                </button>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Ranges/Equal-parts read-only preview grid, color-coded by part */}
                {!isSelectableMode && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Preview — pages grouped by output file</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[30rem] overflow-y-auto p-1">
                      {pages.map((page) => {
                        const partIdx = pagePartIndex(page.pageNumber)
                        const color = partIdx !== null ? PART_COLORS[partIdx % PART_COLORS.length] : null
                        return (
                          <div key={page.pageNumber} className="relative flex flex-col rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                            {color && (
                              <div className={`absolute top-1.5 left-1.5 z-10 px-1.5 py-0.5 rounded text-white text-[9px] font-bold ${color}`}>
                                Part {partIdx + 1}
                              </div>
                            )}
                            <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                              {page.thumbnail ? (
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNumber}`}
                                  draggable={false}
                                  className="w-full h-full object-contain pointer-events-none"
                                />
                              ) : (
                                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                            <div className="py-1 text-center bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Page {page.pageNumber}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {splitError && (
                  <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    {splitError}
                  </div>
                )}

                {/* Processing progress */}
                {isProcessing ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{progressMsg || 'Processing...'}</h3>
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
                    onClick={handleSplit}
                    disabled={!outputPlan || Boolean(outputPlan.error)}
                    className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>
                      {outputPlan && !outputPlan.error ? `Split PDF — ${outputPlan.label}` : 'Split PDF'}
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Results */}
            {results && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">Split Complete! ✨</h3>
                      <p className="text-sm text-emerald-100 mt-1">
                        {results.length} file{results.length !== 1 ? 's' : ''} generated from {file?.name}
                      </p>
                    </div>
                  </div>
                </div>

                {resultWarnings.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-900 space-y-2">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm">
                      {resultWarnings.length} item{resultWarnings.length !== 1 ? 's' : ''} skipped
                    </h4>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                      {resultWarnings.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  {results.length > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadZip}
                      disabled={isZipping}
                      className="px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-60 transition-all text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {isZipping ? 'Creating ZIP...' : 'Download All (ZIP)'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearResults}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                  >
                    Split Again
                  </button>
                  <button
                    type="button"
                    onClick={resetAll}
                    className="px-5 py-2.5 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm"
                  >
                    Upload New File
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {results.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm flex flex-col justify-between"
                    >
                      <div className="h-28 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.filename}>
                          {item.filename}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{formatBytes(item.size)}</p>
                        <button
                          type="button"
                          onClick={() => handleDownloadSingle(item)}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Sidebar */}
          <div className="space-y-4">
            {file && !results && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-900 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">📊 Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Total Pages:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
                  </div>
                  {isSelectableMode && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-300">
                        {splitMode === 'remove' ? 'Removed:' : 'Selected:'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedCount}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Mode:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {SPLIT_MODES.find((m) => m.id === splitMode)?.label}
                    </span>
                  </div>
                  <div className="border-t border-blue-300 dark:border-blue-800 pt-2 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Output:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">
                      {outputPlan?.error ? '—' : outputPlan?.label || '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy note */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                🔒 Privacy
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your files are automatically deleted after processing. Everything runs 100% in your browser — nothing is ever uploaded to a server.
              </p>
            </div>

            {/* Features */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">✨ Features</h4>
              <div className="space-y-2 text-xs">
                {[
                  'Extract, remove, or split by range',
                  'Split into equal-sized parts',
                  'One PDF per page, in one click',
                  'Drag to reorder extracted pages',
                  'Preserves text, images & links',
                  'ZIP download for multiple files',
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
