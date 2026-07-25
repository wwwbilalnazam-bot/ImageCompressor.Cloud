import { useState } from 'react'
import TopToolbar from './TopToolbar'
import PDFViewer from './PDFViewer'
import ThumbnailSidebar from './ThumbnailSidebar'
import AddContentPanel from './AddContentPanel'
import PropertyPanel from './PropertyPanel'

export default function PDFEditorLayout({
  pdfFile,
  pdfDoc,
  currentPageIndex,
  setCurrentPageIndex,
  totalPages,
  edits,
  setEdits,
  isLoading,
}) {
  const [activePanel, setActivePanel] = useState(null)
  const [selectedTool, setSelectedTool] = useState(null)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [zoomMode, setZoomMode] = useState('fit-page')

  const handleAddEdit = (edit) => {
    const newEdit = {
      ...edit,
      pageIndex: currentPageIndex,
      id: Date.now().toString(),
    }
    setEdits([...edits, newEdit])
  }

  const handleDeleteEdit = (editId) => {
    setEdits(edits.filter((e) => e.id !== editId))
  }

  const handleUpdateEdit = (editId, updates) => {
    setEdits(edits.map((e) => (e.id === editId ? { ...e, ...updates } : e)))
  }

  const getCurrentPageEdits = () => {
    return edits.filter((e) => e.pageIndex === currentPageIndex)
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* TOP TOOLBAR */}
      <TopToolbar
        pdfDoc={pdfDoc}
        fileName={pdfFile?.fileName}
        currentPageIndex={currentPageIndex}
        totalPages={totalPages}
        setCurrentPageIndex={setCurrentPageIndex}
        edits={edits}
        pdfFile={pdfFile}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
        zoomMode={zoomMode}
        setZoomMode={setZoomMode}
      />

      {/* MAIN EDITOR AREA */}
      <div className="flex-1 flex gap-3 overflow-hidden p-3">
        {/* LEFT: THUMBNAILS SIDEBAR */}
        {showThumbnails && (
          <div className="w-36 sm:w-40 flex flex-col gap-3">
            {/* PAGES PANEL */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col max-h-64">
              <div className="px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 shrink-0">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">📄 Pages</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{totalPages} total</p>
              </div>
              <div className="flex-1 overflow-y-auto p-1.5 space-y-1.5">
                <ThumbnailSidebar
                  pdfFile={pdfFile}
                  totalPages={totalPages}
                  currentPageIndex={currentPageIndex}
                  setCurrentPageIndex={setCurrentPageIndex}
                />
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">⚡ Quick Tools</p>
              <div className="space-y-2">
                <button
                  onClick={() => setActivePanel(activePanel === 'add' ? null : 'add')}
                  className={`w-full py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    activePanel === 'add'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  }`}
                >
                  <span>➕</span> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CENTER: PDF VIEWER - BETTER PROPORTIONED */}
        <div className="flex-1 flex flex-col overflow-hidden gap-2">
          {/* VIEWER CONTAINER */}
          <div className="flex-1 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 overflow-auto flex items-center justify-center rounded-xl shadow-lg border border-slate-300 dark:border-slate-700 p-4">
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl overflow-hidden flex-1 flex items-center justify-center">
              <PDFViewer
                pdfFile={pdfFile}
                pageIndex={currentPageIndex}
                edits={getCurrentPageEdits()}
                onAddEdit={handleAddEdit}
                onDeleteEdit={handleDeleteEdit}
                onUpdateEdit={handleUpdateEdit}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                zoomMode={zoomMode}
                setZoomMode={setZoomMode}
              />
            </div>
          </div>

          {/* DRAWING TOOLBAR */}
          <div className="hidden lg:flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Drawing Mode:</span>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors"
            >
              ✏️ Draw
            </button>
          </div>
        </div>

        {/* RIGHT: PROPERTIES PANEL */}
        <div className="w-80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-hidden shadow-sm">
          {activePanel === 'add' ? (
            <AddContentPanel
              onAddEdit={handleAddEdit}
              onClose={() => setActivePanel(null)}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
            />
          ) : (
            <PropertyPanel
              edits={getCurrentPageEdits()}
              onDeleteEdit={handleDeleteEdit}
              onUpdateEdit={handleUpdateEdit}
              onAddToolClick={() => setActivePanel('add')}
            />
          )}
        </div>

        {/* TOGGLE THUMBNAILS BUTTON */}
        <button
          type="button"
          onClick={() => setShowThumbnails(!showThumbnails)}
          className="absolute left-3 bottom-3 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-all shadow-sm lg:hidden"
          title={showThumbnails ? 'Hide thumbnails' : 'Show thumbnails'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
