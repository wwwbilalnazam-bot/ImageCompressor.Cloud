'use client'

import { useState, useCallback, useRef } from 'react'
import { formatBytes } from '../../utils/advancedCompression'
import AdBanner from '../AdBanner'

/**
 * Optimize SVG — new tool, new dependency (svgo, MIT-licensed, confirmed
 * during the Month 2-3 format-support spike as the cleanest of the four gaps
 * researched: no browser-support ambiguity, no licensing question, unlike
 * AVIF/HEIC). Unlike every other tool on this site, SVG optimization isn't
 * raster re-encoding — svgo parses and minifies the XML itself, so there's no
 * canvas/pdf-lib pipeline to reuse here.
 *
 * svgo is loaded via a dynamic import inside the function that uses it, same
 * lazy-loading pattern as pdf-lib/pdfjs-dist elsewhere in this app, so it
 * never lands in this route's initial bundle.
 */
export default function OptimizeSvgClient() {
  const [items, setItems] = useState([]) // [{ id, file, originalSize, originalText, optimizedText, optimizedSize, error }]
  const [isDragOver, setIsDragOver] = useState(false)
  const [isZipping, setIsZipping] = useState(false)
  const fileInputRef = useRef(null)

  const handleFilesSelect = useCallback(async (fileList) => {
    const files = Array.from(fileList).filter(
      (f) => f.type === 'image/svg+xml' || /\.svg$/i.test(f.name)
    )
    if (files.length === 0) return

    const { optimize } = await import('svgo/browser')

    const newItems = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      originalSize: file.size,
      originalText: null,
      optimizedText: null,
      optimizedSize: null,
      error: null,
    }))
    setItems((prev) => [...prev, ...newItems])

    for (const item of newItems) {
      try {
        const text = await item.file.text()
        const result = optimize(text, { multipass: true })
        const optimizedSize = new Blob([result.data]).size

        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, originalText: text, optimizedText: result.data, optimizedSize, error: null }
              : it
          )
        )
      } catch (err) {
        console.error('SVG optimize error:', err)
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, error: err.message || 'Could not optimize this SVG.' } : it
          )
        )
      }
    }
  }, [])

  const handleFileSelect = (e) => {
    if (e.target.files) handleFilesSelect(e.target.files)
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) handleFilesSelect(e.dataTransfer.files)
  }

  const handleDownload = (item) => {
    if (!item.optimizedText) return
    const blob = new Blob([item.optimizedText], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = item.file.name.replace(/\.svg$/i, '') + '-optimized.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadAll = async () => {
    const ready = items.filter((it) => it.optimizedText)
    if (ready.length < 2) return
    setIsZipping(true)
    try {
      const { default: JSZip } = await import('jszip')
      const zip = new JSZip()
      const folder = zip.folder('optimized-svgs')
      ready.forEach((it) => {
        folder.file(it.file.name.replace(/\.svg$/i, '') + '-optimized.svg', it.optimizedText)
      })
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'optimized-svgs.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('ZIP creation error:', err)
    } finally {
      setIsZipping(false)
    }
  }

  const handleClearAll = () => setItems([])

  const readyCount = items.filter((it) => it.optimizedText).length

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-4xl mx-auto font-sans">
      <div className="space-y-4 text-center my-auto">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🧹 Optimize SVG
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Strip unnecessary XML, comments and precision from SVG files — 100% browser privacy.
          </p>
        </div>

        <div className="pt-1">
          {items.length === 0 ? (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl p-8 text-center cursor-pointer transition-all border-2 border-dashed max-w-md mx-auto ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".svg,image/svg+xml"
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
                    {isDragOver ? 'Drop SVGs here' : 'Add SVG files'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Drag and drop, or click to browse — batch supported
                  </p>
                </div>
                <button
                  type="button"
                  className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 mt-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Select SVGs</span>
                </button>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  SVG only • 100% processed in your browser
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">{items.length} file{items.length !== 1 ? 's' : ''}</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-all"
                  >
                    + Add More
                  </button>
                  {readyCount > 1 && (
                    <button
                      type="button"
                      onClick={handleDownloadAll}
                      disabled={isZipping}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-lg transition-all"
                    >
                      {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Clear All
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".svg,image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((item) => {
                  const reduction =
                    item.optimizedSize != null && item.originalSize > 0
                      ? Math.max(0, Math.round((1 - item.optimizedSize / item.originalSize) * 100))
                      : null
                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2"
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.file.name}>
                        {item.file.name}
                      </p>

                      {item.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{item.error}</p>
                      )}

                      {!item.error && item.optimizedSize == null && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          Optimizing...
                        </div>
                      )}

                      {item.optimizedSize != null && (
                        <>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 dark:text-slate-500 line-through">
                              {formatBytes(item.originalSize)}
                            </span>
                            <span>→</span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {formatBytes(item.optimizedSize)}
                            </span>
                            {reduction != null && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                -{reduction}%
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownload(item)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all"
                          >
                            Download
                          </button>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 shrink-0">
        <AdBanner position="bottom" type="horizontal-banner" />
      </div>
    </div>
  )
}
