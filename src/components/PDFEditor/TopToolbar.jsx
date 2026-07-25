import { useState } from 'react'

export default function TopToolbar({
  pdfDoc,
  fileName,
  currentPageIndex,
  totalPages,
  setCurrentPageIndex,
  edits,
  pdfFile,
  zoomLevel,
  setZoomLevel,
  zoomMode,
  setZoomMode,
}) {
  const [isExporting, setIsExporting] = useState(false)
  const [showPageMenu, setShowPageMenu] = useState(false)
  const [showZoomMenu, setShowZoomMenu] = useState(false)

  const handleAddBlankPage = () => {
    const pages = pdfDoc.getPages()
    const lastPage = pages[pages.length - 1]
    const { width, height } = lastPage.getSize()
    pdfDoc.addPage([width, height])
  }

  const handleDeletePage = () => {
    if (totalPages <= 1) {
      alert('Cannot delete the last page')
      return
    }
    pdfDoc.removePage(currentPageIndex)
    if (currentPageIndex >= totalPages - 1) {
      setCurrentPageIndex(currentPageIndex - 1)
    }
  }

  const handleDuplicatePage = async () => {
    const pages = pdfDoc.getPages()
    const pageToDuplicate = pages[currentPageIndex]
    const { width, height } = pageToDuplicate.getSize()
    pdfDoc.addPage([width, height], currentPageIndex + 1)
  }

  const handleRotatePage = () => {
    const pages = pdfDoc.getPages()
    const page = pages[currentPageIndex]
    const currentRotation = page.getRotation()?.angle || 0
    const newRotation = (currentRotation + 90) % 360
    page.setRotation({ angle: newRotation })
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'edited.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export PDF')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* LEFT: FILE INFO */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950 dark:to-emerald-900">
            <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {fileName || 'Untitled PDF'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Page <span className="font-semibold text-slate-700 dark:text-slate-300">{currentPageIndex + 1}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
            </p>
          </div>
        </div>

        {/* CENTER: PAGE NAVIGATION & ZOOM */}
        <div className="flex items-center gap-4">
          {/* PAGE NAVIGATION */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5">
            <button
              type="button"
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <input
              type="number"
              value={currentPageIndex + 1}
              onChange={(e) => {
                const page = Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1))
                setCurrentPageIndex(page - 1)
              }}
              min="1"
              max={totalPages}
              className="w-14 px-2 py-1.5 text-xs text-center font-semibold border-0 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />

            <button
              type="button"
              onClick={() => setCurrentPageIndex(Math.min(totalPages - 1, currentPageIndex + 1))}
              disabled={currentPageIndex === totalPages - 1}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* ZOOM CONTROLS */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1.5">
            <button
              type="button"
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Zoom out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowZoomMenu(!showZoomMenu)}
                className="px-3 py-1.5 text-xs text-center font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-300 dark:border-slate-700 min-w-16"
              >
                {zoomMode === 'fit-page' ? 'Fit' : zoomMode === 'fit-width' ? 'Width' : `${zoomLevel}%`}
              </button>

              {showZoomMenu && (
                <div className="absolute top-full mt-2 left-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {[
                    { label: 'Fit Page', mode: 'fit-page', level: 100 },
                    { label: 'Fit Width', mode: 'fit-width', level: 100 },
                    { label: '50%', mode: null, level: 50 },
                    { label: '75%', mode: null, level: 75 },
                    { label: '100%', mode: null, level: 100 },
                    { label: '125%', mode: null, level: 125 },
                    { label: '150%', mode: null, level: 150 },
                    { label: '200%', mode: null, level: 200 },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => {
                        if (option.mode) {
                          setZoomMode(option.mode)
                        } else {
                          setZoomMode(null)
                          setZoomLevel(option.level)
                        }
                        setShowZoomMenu(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-all ${
                        (option.mode === zoomMode || (!option.mode && zoomLevel === option.level))
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setZoomLevel(Math.min(300, zoomLevel + 10))}
              className="p-2 rounded-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
              title="Zoom in"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
          </div>
        </div>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* PAGE MENU */}
          <div className="relative flex-1 sm:flex-initial">
            <button
              type="button"
              onClick={() => setShowPageMenu(!showPageMenu)}
              className="w-full sm:w-auto px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all flex items-center justify-center sm:justify-start gap-2 group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
              <span className="hidden sm:inline">Menu</span>
            </button>

            {showPageMenu && (
              <div className="absolute top-full mt-2 right-0 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    handleAddBlankPage()
                    setShowPageMenu(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900 transition-colors">
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Add Blank Page</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Insert new page</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDuplicatePage()
                    setShowPageMenu(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900 transition-colors">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Duplicate Page</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Copy current page</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleRotatePage()
                    setShowPageMenu(false)
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 group-hover:bg-purple-200 dark:group-hover:bg-purple-900 transition-colors">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Rotate 90°</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Rotate clockwise</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleDeletePage()
                    setShowPageMenu(false)
                  }}
                  disabled={totalPages <= 1}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-3 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 group-hover:bg-red-200 dark:group-hover:bg-red-900 transition-colors">
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H4v2h16V7h-3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold">Delete Page</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Remove from PDF</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* EXPORT BUTTON */}
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-initial px-4 py-2 rounded-lg font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-60 transition-all shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 flex items-center justify-center gap-2 group"
          >
            <svg className="w-4 h-4 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-sm">{isExporting ? 'Saving...' : 'Download'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
