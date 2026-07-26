'use client'

import { useState, useRef, useEffect } from 'react'
import { convertFile, CONVERSION_PRESETS, SUPPORTED_OUTPUT_FORMATS } from '../../utils/fileConverter'
import { DOCX_MIME, XLSX_MIME, PPTX_MIME } from '../../config/mimeTypes'
import { checkBackendHealth } from '../../api/converter'
import { createZipArchive, formatBytes } from '../../utils/advancedCompression'
import { converterFaq } from '../../content/faq/converter'
import AdBanner from '../AdBanner'
import FaqList from '../FaqList'

const FILE_TYPE_META = {
  'application/pdf': { label: 'PDF Document', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  [DOCX_MIME]: { label: 'Word Document', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  [XLSX_MIME]: { label: 'Excel Spreadsheet', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  [PPTX_MIME]: {
    label: 'PowerPoint Presentation',
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  'text/plain': { label: 'Text File', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800' },
}

/**
 * File & document converter — ported from pages/FileConverterPage.jsx.
 *
 * Bug fix carried in from the route config: the active preset is now passed in
 * explicitly as `initialPresetId` instead of being inferred by searching
 * CONVERSION_PRESETS for one whose output MIME matches `defaultTargetFormat`.
 * That search picked the FIRST preset with a matching output type, so every
 * route sharing an output MIME with an earlier preset silently opened on the
 * wrong tool: /excel-to-pdf, /powerpoint-to-pdf and /txt-to-pdf all landed on
 * "Word to PDF" (four presets output application/pdf), /png-to-jpg and
 * /webp-to-jpg landed on "PDF to JPG", and /jpg-to-png landed on "PDF to PNG".
 *
 * The `<SEO>` element is gone — page titles, descriptions and canonicals now
 * come from each route's `generateMetadata`, which is what stops all fourteen
 * converter URLs from claiming the single canonical `/converter`.
 */
export default function FileConverterClient({ defaultTargetFormat = 'image/jpeg', initialPresetId = 'word-to-pdf' }) {
  const [selectedPresetId, setSelectedPresetId] = useState(initialPresetId)
  const [outputFormat, setOutputFormat] = useState(defaultTargetFormat)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressLabel, setProgressLabel] = useState('')
  const [progressPct, setProgressPct] = useState(0)
  const [convertedFiles, setConvertedFiles] = useState([])
  const [isZipping, setIsZipping] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [backendAvailable, setBackendAvailable] = useState(null) // null = checking

  const fileInputRef = useRef(null)

  const activePreset = CONVERSION_PRESETS.find((p) => p.id === selectedPresetId) || CONVERSION_PRESETS[0]

  useEffect(() => {
    setOutputFormat(defaultTargetFormat)
    setSelectedPresetId(initialPresetId)
  }, [defaultTargetFormat, initialPresetId])

  useEffect(() => {
    checkBackendHealth().then(setBackendAvailable)
  }, [])

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return
    setIsProcessing(true)

    const fileList = Array.from(files)
    const newConverted = []

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      const filePrefix = fileList.length > 1 ? `File ${i + 1} of ${fileList.length}: ` : ''
      setProgressPct(0)
      setProgressLabel(`${filePrefix}Starting...`)

      try {
        const results = await convertFile(file, outputFormat, {
          onStatus: (msg) => setProgressLabel(`${filePrefix}${msg}`),
          onProgress: (pct) => setProgressPct(pct),
        })
        newConverted.push(...results)
      } catch (err) {
        console.error('Conversion failed for file:', file.name, err)
        alert(`Failed to convert "${file.name}": ${err.message || 'Unsupported file format'}`)
      }
    }

    setConvertedFiles((prev) => [...prev, ...newConverted])
    setIsProcessing(false)
    setProgressLabel('')
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
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
    if (convertedFiles.length === 0) return
    setIsZipping(true)
    try {
      const itemsToZip = convertedFiles.map((item) => ({
        blob: item.blob,
        originalFile: { name: item.filename },
      }))
      const zipBlob = await createZipArchive(itemsToZip)
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'converted-files.zip'
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

  const handleClearAll = () => {
    convertedFiles.forEach((item) => URL.revokeObjectURL(item.dataUrl))
    setConvertedFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePresetSelect = (preset) => {
    setSelectedPresetId(preset.id)
    setOutputFormat(preset.to)
  }

  const handleOutputFormatChange = (formatId) => {
    setOutputFormat(formatId)
    // Keep the preset grid/accept-attribute in sync with the dropdown —
    // previously these two controls could disagree about the source format.
    const match = CONVERSION_PRESETS.find((p) => p.to === formatId)
    if (match) setSelectedPresetId(match.id)
  }

  const backendUnavailableForPreset = activePreset.backend && backendAvailable === false

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-5xl mx-auto font-sans">
      <div className="space-y-4 my-auto">
        <div className="space-y-1 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            File & Document Converter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Convert PDFs, Word, Excel, PowerPoint, images and text — formatting preserved.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Preset Buttons */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Output Format:
                </span>
                <select
                  value={outputFormat}
                  onChange={(e) => handleOutputFormatChange(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {SUPPORTED_OUTPUT_FORMATS.map((fmt) => (
                    <option key={fmt.id} value={fmt.id}>
                      {fmt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CONVERSION_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`py-2 px-2 rounded-xl font-bold text-xs transition-all border relative ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {preset.label}
                    </button>
                  )
                })}
              </div>

              {backendUnavailableForPreset && (
                <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                  Office document conversion requires our conversion service, which appears to be offline right now.
                  Image and text conversions on this page are unaffected.
                </div>
              )}
            </div>

            {/* Upload Dropzone */}
            {!convertedFiles.length && !isProcessing && (
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all border-2 border-dashed ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept={activePreset.accept}
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center space-y-3">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  </div>

                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                      {isDragOver ? 'Release files to start' : `Select files for ${activePreset.label}`}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Drag and drop, or click to browse</p>
                  </div>

                  <button
                    type="button"
                    className="mt-1 px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Select Files</span>
                  </button>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Supports batch conversion of multiple files
                  </p>
                </div>
              </div>
            )}

            {/* Processing state */}
            {isProcessing && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{progressLabel || 'Converting...'}</h3>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 transition-all duration-200" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            )}

            {/* Results */}
            {convertedFiles.length > 0 && (
              <div className="space-y-4">
                <div className="bg-emerald-600 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
                  <h3 className="text-lg font-bold">
                    Converted {convertedFiles.length} {convertedFiles.length === 1 ? 'File' : 'Files'}
                  </h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {convertedFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDownloadZip}
                        disabled={isZipping}
                        className="px-4 py-2 bg-white text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 shadow-sm flex-1 sm:flex-initial"
                      >
                        {isZipping ? 'Creating ZIP...' : 'Download All (ZIP)'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-all"
                    >
                      Convert Another
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {convertedFiles.map((item, idx) => {
                    const meta = FILE_TYPE_META[item.type]
                    const isRenderableImage = item.type.startsWith('image/')
                    return (
                      <div
                        key={idx}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2 shadow-sm flex flex-col justify-between"
                      >
                        <div
                          className={`h-32 rounded-xl flex items-center justify-center overflow-hidden p-2 ${
                            meta ? meta.bg : 'bg-slate-100 dark:bg-slate-950'
                          }`}
                        >
                          {isRenderableImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.dataUrl} alt={item.filename} className="max-h-28 w-auto object-contain rounded" />
                          ) : (
                            <div className="text-center space-y-1">
                              <svg
                                className={`w-10 h-10 mx-auto ${meta ? meta.color : 'text-slate-500'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span
                                className={`text-[11px] font-bold block ${
                                  meta ? meta.color : 'text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {meta ? meta.label : 'File'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.filename}>
                            {item.filename}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Size: {formatBytes(item.size)}</p>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(item)}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900 space-y-2">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">🔒 Privacy</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your files are automatically deleted after processing. Image, PDF-preview and text conversions run
                entirely in your browser; only Office-document conversions are sent to our conversion service, and never
                stored afterward.
              </p>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">✨ Features</h2>
              <div className="space-y-2 text-xs">
                {[
                  'Real formatting: fonts, tables, images',
                  'PDF ↔ Word, Excel & PowerPoint',
                  'Images ↔ JPG, PNG, WebP',
                  'Batch conversion, ZIP download',
                  'Clear errors, no silent failures',
                ].map((f) => (
                  <div key={f} className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                    <span className="text-slate-600 dark:text-slate-300">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Same array that feeds this page's FAQPage JSON-LD */}
            <FaqList items={converterFaq} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">About file conversion</h2>
          <p>
            Converting between PDF and Office formats is notoriously hard to get right — fonts, tables, page layout and
            images all need to survive the round trip. PDF↔Word and PDF↔Excel here go through real document
            reconstruction rather than dumping plain text, so tables stay tables and paragraphs keep their structure.
            Image and text conversions run entirely in your browser for speed and privacy, with no upload required.
          </p>
        </div>
      </div>

      <div className="pt-4 shrink-0">
        <AdBanner position="bottom" type="horizontal-banner" />
      </div>
    </div>
  )
}
