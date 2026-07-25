import { useState, useEffect, useRef } from 'react'
import { renderPageToCanvas } from '../../utils/pdfEditorEngine'
import { DrawingCanvas } from '../../utils/drawingCanvas'

export default function PDFViewer({
  pdfFile,
  pageIndex,
  edits,
  onAddEdit,
  onDeleteEdit,
  onUpdateEdit,
  zoomLevel = 100,
  setZoomLevel,
  zoomMode = 'fit-page',
  setZoomMode,
}) {
  const [renderedPage, setRenderedPage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedEdit, setSelectedEdit] = useState(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [drawingTool, setDrawingTool] = useState('pen')
  const [drawingColor, setDrawingColor] = useState('#000000')
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const overlayCanvasRef = useRef(null)
  const drawingCanvasRef = useRef(null)
  const drawingInstanceRef = useRef(null)

  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateContainerSize()
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [])

  useEffect(() => {
    const renderPage = async () => {
      setIsLoading(true)
      try {
        const rendered = await renderPageToCanvas(pdfFile.pdf, pageIndex + 1, 2)
        setRenderedPage(rendered)
      } catch (err) {
        console.error('Page render error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (pdfFile) {
      renderPage()
    }
  }, [pdfFile, pageIndex])

  useEffect(() => {
    if (renderedPage && canvasRef.current) {
      canvasRef.current.width = renderedPage.width
      canvasRef.current.height = renderedPage.height
      const ctx = canvasRef.current.getContext('2d')
      ctx.drawImage(renderedPage.canvas, 0, 0)

      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = renderedPage.width
        overlayCanvasRef.current.height = renderedPage.height
        redrawEdits()
      }

      if (drawingCanvasRef.current && drawingMode) {
        drawingCanvasRef.current.width = renderedPage.width
        drawingCanvasRef.current.height = renderedPage.height
      }
    }
  }, [renderedPage, drawingMode])

  const redrawEdits = () => {
    if (!overlayCanvasRef.current || !renderedPage) return

    const ctx = overlayCanvasRef.current.getContext('2d')
    ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height)

    edits.forEach((edit) => {
      if (edit.type === 'text') {
        ctx.font = `${edit.bold ? 'bold' : ''} ${edit.italic ? 'italic' : ''} ${edit.fontSize || 14}px ${edit.font || 'Arial'}`
        ctx.fillStyle = edit.color || '#000000'
        ctx.fillText(edit.content, edit.x, edit.y)
      } else if (edit.type === 'highlight') {
        ctx.fillStyle = `rgba(255, 255, 0, 0.3)`
        ctx.fillRect(edit.x, edit.y, edit.width, edit.height)
      } else if (edit.type === 'image') {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, edit.x, edit.y, edit.width, edit.height)
        }
        img.src = edit.imageSrc
      }
    })
  }

  useEffect(() => {
    redrawEdits()
  }, [edits])

  const handleCanvasClick = (e) => {
    if (drawingMode) return

    const rect = overlayCanvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) * (renderedPage.width / rect.width)
    const y = (e.clientY - rect.top) * (renderedPage.height / rect.height)

    const clickedEdit = edits.find((edit) => {
      if (edit.type === 'text') {
        return x >= edit.x && x <= edit.x + 200 && y >= edit.y - 15 && y <= edit.y + 5
      } else if (edit.type === 'image') {
        return x >= edit.x && x <= edit.x + edit.width && y >= edit.y && y <= edit.y + edit.height
      }
      return false
    })

    if (clickedEdit) {
      setSelectedEdit(clickedEdit.id)
    }
  }

  const calculateDimensions = () => {
    if (!renderedPage || containerSize.width === 0) {
      return { width: 800, height: 600 }
    }

    const padding = 40
    const maxWidth = containerSize.width - padding
    const maxHeight = containerSize.height - padding

    let scale = 1

    if (zoomMode === 'fit-page') {
      const scaleX = maxWidth / renderedPage.width
      const scaleY = maxHeight / renderedPage.height
      scale = Math.min(scaleX, scaleY)
    } else if (zoomMode === 'fit-width') {
      scale = maxWidth / renderedPage.width
    } else {
      scale = zoomLevel / 100
    }

    return {
      width: renderedPage.width * scale,
      height: renderedPage.height * scale,
      scale,
    }
  }

  const dimensions = calculateDimensions()

  const handleToggleDrawing = () => {
    setDrawingMode(!drawingMode)
    if (drawingMode && drawingInstanceRef.current) {
      const drawingData = drawingInstanceRef.current.getImageData()
      onAddEdit({
        type: 'drawing',
        content: drawingData,
        x: 0,
        y: 0,
      })
    }
  }

  const handleStartDrawing = () => {
    if (drawingMode && drawingCanvasRef.current) {
      drawingInstanceRef.current = new DrawingCanvas(drawingCanvasRef.current)
      drawingInstanceRef.current.setColor(drawingColor)
      drawingInstanceRef.current.setTool(drawingTool)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-600 dark:text-slate-300 font-medium">Loading page...</p>
      </div>
    )
  }

  if (!renderedPage) {
    return (
      <div className="flex items-center justify-center text-slate-500 dark:text-slate-400">
        No page to display
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative bg-slate-200 dark:bg-slate-800 w-full h-full overflow-auto flex items-center justify-center"
    >
      <div className="p-6 flex items-center justify-center">
        <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden" style={{ width: dimensions.width, height: dimensions.height }}>
          {/* PDF Canvas */}
          <canvas
            ref={canvasRef}
            className="block w-full h-full"
          />

          {/* Edits Overlay */}
          <canvas
            ref={overlayCanvasRef}
            onClick={handleCanvasClick}
            className="absolute inset-0 cursor-pointer"
            style={{
              opacity: drawingMode ? 0.3 : 1,
            }}
          />

          {/* Drawing Canvas */}
          {drawingMode && (
            <canvas
              ref={drawingCanvasRef}
              onMouseEnter={handleStartDrawing}
              className="absolute inset-0 border-2 border-emerald-500 cursor-crosshair"
              style={{
                backgroundColor: 'transparent',
              }}
            />
          )}

          {/* Drawing Controls */}
          {drawingMode && (
            <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 z-50 flex flex-col gap-2 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Color:</label>
                <input
                  type="color"
                  value={drawingColor}
                  onChange={(e) => {
                    setDrawingColor(e.target.value)
                    if (drawingInstanceRef.current) {
                      drawingInstanceRef.current.setColor(e.target.value)
                    }
                  }}
                  className="w-8 h-8 rounded cursor-pointer border border-slate-300 dark:border-slate-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tool:</label>
                <select
                  value={drawingTool}
                  onChange={(e) => {
                    setDrawingTool(e.target.value)
                    if (drawingInstanceRef.current) {
                      drawingInstanceRef.current.setTool(e.target.value)
                    }
                  }}
                  className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="pen">Pen</option>
                  <option value="line">Line</option>
                  <option value="rectangle">Rectangle</option>
                  <option value="circle">Circle</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleToggleDrawing}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Done Drawing
              </button>
            </div>
          )}

          {/* Selected Edit Highlight */}
          {selectedEdit && (
            <div className="absolute top-3 right-3 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 z-50 border border-emerald-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Selected Edit
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onDeleteEdit(selectedEdit)
                    setSelectedEdit(null)
                  }}
                  className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Drawing Toggle Button */}
      {!drawingMode && (
        <button
          type="button"
          onClick={handleToggleDrawing}
          className="absolute bottom-6 right-6 p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-colors z-40"
          title="Draw on PDF"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </div>
  )
}
