import { useState, useRef, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { loadPdfFile, getPdfPageCount } from '../utils/pdfEditorEngine'
import PDFEditorLayout from '../components/PDFEditor/PDFEditorLayout'
import SEO from '../components/SEO'
import AdBanner from '../components/AdBanner'

export default function PDFEditorPage() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfDoc, setPdfDoc] = useState(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)
  const [edits, setEdits] = useState([])

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file')
      return
    }

    setIsLoading(true)
    try {
      const pdfData = await loadPdfFile(file)
      setPdfFile(pdfData)

      const pdfBytes = await file.arrayBuffer()
      const doc = await PDFDocument.load(pdfBytes)
      setPdfDoc(doc)

      const pageCount = await getPdfPageCount(pdfData.pdf)
      setTotalPages(pageCount)
      setCurrentPageIndex(0)
      setEdits([])
    } catch (err) {
      console.error('PDF load error:', err)
      alert('Failed to load PDF. Make sure it is a valid PDF file.')
    } finally {
      setIsLoading(false)
    }
  }

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
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0])
    }
  }

  if (!pdfFile || !pdfDoc) {
    return (
      <div
        className="w-full flex-1 flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <SEO
          title="PDF Editor - Edit PDF Online"
          description="Professional PDF editor with text, images, signatures and more"
          canonicalUrl="https://imagecompressor.cloud/pdf-editor"
        />

        <div className="w-full max-w-2xl space-y-6">
          {/* HEADER */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Edit Your PDF
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Add text, images, signatures, and shapes • No account needed
            </p>
          </div>

          {/* UPLOAD ZONE */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer group ${
              isDragOver
                ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 shadow-lg shadow-emerald-500/20'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleSelectFile}
              className="hidden"
            />

            <div className="space-y-4">
              {/* ANIMATED ICON */}
              <div className="flex justify-center">
                <div
                  className={`p-4 rounded-full transition-all ${
                    isDragOver
                      ? 'bg-emerald-200 dark:bg-emerald-900/70 scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:scale-105'
                  }`}
                >
                  <svg className={`w-16 h-16 transition-colors ${
                    isDragOver
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* TEXT */}
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isDragOver ? '📤 Drop PDF Here' : '🚀 Choose PDF to Edit'}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Drag your PDF here or click to browse
                </p>
              </div>

              {/* BUTTON */}
              <button
                type="button"
                className={`px-8 py-3 rounded-xl font-bold text-white transition-all inline-flex items-center gap-2 shadow-lg ${
                  isDragOver
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 shadow-emerald-600/50 scale-105'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-emerald-600/30 hover:shadow-emerald-600/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isLoading ? 'Loading PDF...' : 'Select PDF File'}</span>
              </button>

              {/* HELP TEXT */}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supports PDF files up to 1GB • All processing is private and secure
              </p>
            </div>
          </div>

          {/* FEATURES */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: '📝', label: 'Add Text' },
              { icon: '🖼️', label: 'Insert Images' },
              { icon: '✍️', label: 'Digital Signatures' },
              { icon: '▭', label: 'Shapes & Lines' },
              { icon: '✏️', label: 'Annotations' },
              { icon: '⚡', label: 'Instant Download' },
            ].map((feature) => (
              <div key={feature.label} className="text-center p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="text-2xl mb-1">{feature.icon}</div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AD BANNER */}
        <div className="w-full mt-12">
          <AdBanner position="bottom" type="horizontal-banner" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      <PDFEditorLayout
        pdfFile={pdfFile}
        pdfDoc={pdfDoc}
        currentPageIndex={currentPageIndex}
        setCurrentPageIndex={setCurrentPageIndex}
        totalPages={totalPages}
        edits={edits}
        setEdits={setEdits}
        isLoading={isLoading}
      />
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-800 p-3">
        <AdBanner position="bottom" type="horizontal-banner" />
      </div>
    </div>
  )
}
