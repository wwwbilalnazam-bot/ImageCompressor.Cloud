import { useState, useRef, useCallback, useEffect } from 'react'

export default function BeforeAfterSlider({ beforeImage, afterImage, beforeLabel = 'Original', afterLabel = 'Compressed' }) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState('split') // 'split' | 'side-by-side'
  const containerRef = useRef(null)

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    handleMove(e.clientX)
  }

  const handleTouchStart = (e) => {
    setIsDragging(true)
    if (e.touches && e.touches[0]) {
      handleMove(e.touches[0].clientX)
    }
  }

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleMove(e.clientX)
      }
    }
    const handleTouchMove = (e) => {
      if (isDragging && e.touches && e.touches[0]) {
        handleMove(e.touches[0].clientX)
      }
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove)
      window.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMove])

  return (
    <div className="space-y-4">
      {/* Header controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
            VS
          </span>
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Quality Comparison
          </span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Split Slider
          </button>
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Side by Side
          </button>
        </div>
      </div>

      {/* Render selected view mode */}
      {viewMode === 'side-by-side' ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col items-center">
            <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800/50 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={beforeImage} alt={beforeLabel} className="max-h-full max-w-full object-contain" />
            </div>
            <span className="mt-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{beforeLabel}</span>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl p-3 border border-emerald-200 dark:border-emerald-900/50 flex flex-col items-center">
            <div className="w-full aspect-square bg-slate-200 dark:bg-slate-800/50 rounded-xl overflow-hidden flex items-center justify-center">
              <img src={afterImage} alt={afterLabel} className="max-h-full max-w-full object-contain" />
            </div>
            <span className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">{afterLabel}</span>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="relative w-full bg-slate-900 rounded-2xl overflow-hidden cursor-col-resize select-none border border-slate-200 dark:border-slate-800 shadow-lg group"
          style={{ aspectRatio: '16/9', maxHeight: '440px', minHeight: '260px' }}
        >
          {/* Background image (Compressed - After) */}
          <img
            src={afterImage}
            alt={afterLabel}
            className="absolute inset-0 w-full h-full object-contain bg-slate-950"
          />

          {/* Foreground clipped image (Original - Before) */}
          <div
            className="absolute top-0 left-0 bottom-0 overflow-hidden bg-slate-950 border-r-2 border-emerald-500"
            style={{ width: `${sliderPosition}%` }}
          >
            {/* 
              Inner img container forced to 100% parent container width 
              so it aligns perfectly with the background image 
            */}
            <div
              className="absolute inset-0 h-full"
              style={{
                width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
              }}
            >
              <img
                src={beforeImage}
                alt={beforeLabel}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Interactive Handle Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 via-emerald-500 to-teal-400 shadow-xl pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Center Knob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-900 rounded-full border-2 border-emerald-500 shadow-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 9l-3 3m0 0l3 3m-3-3h14M16 9l3 3m0 0l-3 3" />
              </svg>
            </div>
          </div>

          {/* Overlay Labels */}
          <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-xs font-semibold text-white pointer-events-none shadow-md">
            {beforeLabel}
          </div>
          <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur-md px-3 py-1 rounded-lg border border-emerald-500 text-xs font-semibold text-white pointer-events-none shadow-md">
            {afterLabel}
          </div>

          {/* Percentage badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-800 text-[11px] font-mono text-emerald-400 pointer-events-none">
            {Math.round(sliderPosition)}% Original Visible
          </div>
        </div>
      )}
    </div>
  )
}
