import { useState, useRef } from 'react'
import { PDFDocument, rgb } from 'pdf-lib'
import { mergePdfs } from '../utils/pdfTools'
import { loadPdfFile, generateThumbnail } from '../utils/pdfEditorEngine'
import SEO from '../components/SEO'
import AdBanner from '../components/AdBanner'
import { formatBytes } from '../utils/advancedCompression'

const readImageAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

export default function MergePdfImagesPage() {
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [result, setResult] = useState(null)
  const [draggedId, setDraggedId] = useState(null)
  const [dragOverId, setDragOverId] = useState(null)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files) {
      handleFilesSelect(e.dataTransfer.files)
    }
  }

  const handleFilesSelect = async (fileList) => {
    const newFiles = Array.from(fileList).filter((file) => {
      const isPdf = file.type === 'application/pdf'
      const isImage = file.type.startsWith('image/')
      return isPdf || isImage
    })

    const filesWithPreview = await Promise.all(
      newFiles.map(async (file, index) => {
        const isPdf = file.type === 'application/pdf'
        let preview = null
        let pageCount = null

        try {
          if (isPdf) {
            const { pdf } = await loadPdfFile(file)
            pageCount = pdf.numPages
            preview = await generateThumbnail(pdf, 1, 260)
          } else {
            preview = await readImageAsDataURL(file)
          }
        } catch (err) {
          console.error('Error generating preview:', err)
        }

        return {
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2)}`,
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          preview,
          pageCount,
          isPdf,
        }
      })
    )

    setFiles((prev) => [...prev, ...filesWithPreview])
  }

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFilesSelect(e.target.files)
    }
  }

  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id))
  }

  const moveFile = (id, direction) => {
    const index = files.findIndex((f) => f.id === id)
    if (direction === 'up' && index > 0) {
      const newFiles = [...files]
      ;[newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]]
      setFiles(newFiles)
    } else if (direction === 'down' && index < files.length - 1) {
      const newFiles = [...files]
      ;[newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]]
      setFiles(newFiles)
    }
  }

  const handleFileReorderDragStart = (id) => {
    setDraggedId(id)
  }

  const handleFileReorderDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleFileReorderDragOver = (e, id) => {
    e.preventDefault()
    setDragOverId(id)
  }

  const handleFileReorderDragLeave = () => {
    setDragOverId(null)
  }

  const handleFileReorderDrop = (e, targetId) => {
    e.preventDefault()
    setDragOverId(null)

    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const draggedIndex = files.findIndex((f) => f.id === draggedId)
    const targetIndex = files.findIndex((f) => f.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedId(null)
      return
    }

    const newFiles = [...files]
    const draggedFile = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(targetIndex, 0, draggedFile)

    setFiles(newFiles)
    setDraggedId(null)
  }

  const convertImagesToPdf = async (images) => {
    const pdfDoc = await PDFDocument.create()

    for (const imageFile of images) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer()
        let imageEmbed

        if (imageFile.type === 'image/jpeg') {
          imageEmbed = await pdfDoc.embedJpg(arrayBuffer)
        } else if (imageFile.type === 'image/png') {
          imageEmbed = await pdfDoc.embedPng(arrayBuffer)
        } else if (imageFile.type === 'image/webp') {
          imageEmbed = await pdfDoc.embedPng(arrayBuffer)
        } else {
          continue
        }

        const { width, height } = imageEmbed
        const page = pdfDoc.addPage([width, height])
        page.drawImage(imageEmbed, {
          x: 0,
          y: 0,
          width,
          height,
        })
      } catch (err) {
        console.error('Error converting image:', err)
      }
    }

    return await pdfDoc.save()
  }

  const handleMerge = async () => {
    if (files.length === 0) {
      alert('Please add at least one file to merge')
      return
    }

    setIsProcessing(true)
    setProgressMsg('Preparing files for merge...')
    setResult(null)

    try {
      // Separate PDFs and images
      const pdfFiles = files.filter((f) => f.isPdf).map((f) => f.file)
      const imageFiles = files.filter((f) => !f.isPdf).map((f) => f.file)

      // Create main PDF document
      let mainPdfBytes
      const warnings = []

      if (pdfFiles.length > 0) {
        setProgressMsg(`Merging ${pdfFiles.length} PDF files...`)
        const mergedBlob = await mergePdfs(
          pdfFiles,
          (count) => {
            setProgressMsg(`Processing page ${count}...`)
          },
          (warning) => warnings.push(warning)
        )
        mainPdfBytes = await mergedBlob.arrayBuffer()
      } else {
        const pdfDoc = await PDFDocument.create()
        mainPdfBytes = await pdfDoc.save()
      }

      // Load main PDF
      const mainPdf = await PDFDocument.load(mainPdfBytes)

      // Add images to PDF
      if (imageFiles.length > 0) {
        setProgressMsg(`Adding ${imageFiles.length} images to PDF...`)
        const imagesPdf = await convertImagesToPdf(imageFiles)
        const imagePdfDoc = await PDFDocument.load(imagesPdf)
        const copiedPages = await mainPdf.copyPages(imagePdfDoc, imagePdfDoc.getPageIndices())

        copiedPages.forEach((page) => {
          mainPdf.addPage(page)
        })
      }

      const mergedPdfBytes = await mainPdf.save()
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      setResult({
        filename: 'merged-document.pdf',
        blob,
        dataUrl: url,
        size: blob.size,
        totalFiles: files.length,
        totalPages: mainPdf.getPageCount(),
        warnings,
      })
    } catch (err) {
      console.error('Merge error:', err)
      alert('Error merging files: ' + (err.message || 'Unknown error'))
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

  const handleNewMerge = () => {
    setFiles([])
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-5xl mx-auto font-sans">
      <SEO
        title="Merge PDF & Images - Combine PDFs and Images Online"
        description="Merge multiple PDFs and images into a single document. Reorder files, preview, and download instantly."
        canonicalUrl="https://imagecompressor.cloud/merge-pdf"
      />

      {/* HERO SECTION */}
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            🔗 Merge PDFs & Images
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Combine multiple PDF files and images into a single document. Reorder, preview, and download in seconds.
          </p>
        </div>

        {/* Main Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upload Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upload Zone */}
            {!result && (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
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
                  multiple
                  accept=".pdf,application/pdf,image/*"
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
                      {isDragOver ? 'Drop files here' : 'Add PDF & Images'}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Drag and drop PDFs or images, or click to browse
                    </p>
                  </div>

                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 mt-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Select Files</span>
                  </button>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Supports PDF, JPG, PNG, WebP • Max file size: 50MB per file
                  </p>
                </div>
              </div>
            )}

            {/* Files List */}
            {files.length > 0 && !result && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    📂 Files to Merge ({files.length})
                  </h3>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-all"
                  >
                    + Add More
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[36rem] overflow-y-auto p-1">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      draggable
                      onDragStart={() => handleFileReorderDragStart(file.id)}
                      onDragEnd={handleFileReorderDragEnd}
                      onDragOver={(e) => handleFileReorderDragOver(e, file.id)}
                      onDragLeave={handleFileReorderDragLeave}
                      onDrop={(e) => handleFileReorderDrop(e, file.id)}
                      className={`relative flex flex-col rounded-xl overflow-hidden cursor-move group transition-all border-2 ${
                        draggedId === file.id
                          ? 'opacity-40 border-emerald-400 dark:border-emerald-600'
                          : dragOverId === file.id
                          ? 'border-emerald-500 border-dashed scale-[1.02]'
                          : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500'
                      }`}
                    >
                      {/* Order Badge */}
                      <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-slate-900/80 text-white text-xs font-bold flex items-center justify-center shadow">
                        {index + 1}
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow"
                        title="Remove"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Full Preview */}
                      <div className="aspect-[3/4] w-full bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                        {file.preview ? (
                          <img
                            src={file.preview}
                            alt={file.name}
                            draggable={false}
                            className="w-full h-full object-contain pointer-events-none"
                          />
                        ) : (
                          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>

                      {/* PDF Badge */}
                      {file.isPdf && (
                        <div className="absolute bottom-[3.1rem] left-2 px-1.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold shadow">
                          PDF{file.pageCount ? ` · ${file.pageCount}p` : ''}
                        </div>
                      )}

                      {/* File Info + Move Controls */}
                      <div className="flex items-center gap-1 p-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{formatBytes(file.size)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => moveFile(file.id, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          title="Move up"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => moveFile(file.id, 'down')}
                          disabled={index === files.length - 1}
                          className="p-1 rounded text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                          title="Move down"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-60 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{isProcessing ? 'Merging...' : `Merge ${files.length} File${files.length !== 1 ? 's' : ''}`}</span>
                </button>
              </div>
            )}

            {/* Processing State */}
            {isProcessing && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {progressMsg || 'Merging files...'}
                </h3>
              </div>
            )}

            {/* Result */}
            {result && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-2xl p-6 shadow-lg space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold">Merge Complete! ✨</h3>
                      <p className="text-sm text-emerald-100 mt-1">
                        {files.length} files combined into {result.totalPages} pages
                      </p>
                    </div>
                  </div>
                </div>

                {result.warnings && result.warnings.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200 dark:border-amber-900 space-y-2">
                    <h4 className="font-bold text-amber-800 dark:text-amber-400 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {result.warnings.length} item{result.warnings.length !== 1 ? 's' : ''} skipped
                    </h4>
                    <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                      {result.warnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                  <div className="h-40 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <svg className="w-12 h-12 text-emerald-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
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
                      onClick={handleNewMerge}
                      className="py-3 px-4 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Merge Again
                    </button>

                    <button
                      type="button"
                      onClick={handleDownload}
                      className="py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 transition-all text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            {/* Summary */}
            {files.length > 0 && !result && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-200 dark:border-blue-900 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">📊 Summary</h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Total Files:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{files.length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">PDFs:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{files.filter((f) => f.isPdf).length}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Images:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{files.filter((f) => !f.isPdf).length}</span>
                  </div>

                  <div className="border-t border-blue-300 dark:border-blue-800 pt-2 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300">Total Size:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatBytes(totalSize)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-900 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">✨ Features</h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="text-slate-600 dark:text-slate-300">Merge multiple PDFs</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="text-slate-600 dark:text-slate-300">Add images to PDF</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="text-slate-600 dark:text-slate-300">Reorder files before merge</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="text-slate-600 dark:text-slate-300">Preview & remove files</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="text-slate-600 dark:text-slate-300">100% browser processing</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">✓</span>
                  <span className="text-slate-600 dark:text-slate-300">No uploads, completely private</span>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">❓ How It Works</h4>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <p>
                  <span className="font-bold">1.</span> Add PDFs & images by dragging or clicking
                </p>
                <p>
                  <span className="font-bold">2.</span> Reorder files using arrow buttons
                </p>
                <p>
                  <span className="font-bold">3.</span> Click "Merge" to combine all files
                </p>
                <p>
                  <span className="font-bold">4.</span> Download your merged PDF instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="pt-6 shrink-0">
        <AdBanner position="bottom" type="horizontal-banner" />
      </div>
    </div>
  )
}
