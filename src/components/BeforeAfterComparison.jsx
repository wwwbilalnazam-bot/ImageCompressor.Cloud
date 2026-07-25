import { useState, useRef, useEffect } from 'react'

export default function BeforeAfterComparison({ before, after, alt }) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef(null)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, newPosition)))
  }

  const handleTouchMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const newPosition = ((touch.clientX - rect.left) / rect.width) * 100
    setPosition(Math.max(0, Math.min(100, newPosition)))
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 md:h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-col-resize select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {}}
      onTouchMove={handleTouchMove}
    >
      {/* After (Compressed) Image */}
      <img
        src={after}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain"
      />

      {/* Before (Original) Image - Clipped */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img
          src={before}
          alt={`${alt} - Original`}
          className="absolute inset-0 w-full h-full object-contain"
          style={{ width: `${(100 / position) * 100}%` }}
        />
      </div>

      {/* Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-white dark:bg-gray-300 shadow-lg"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg">
          <svg className="w-4 h-4 text-gray-800 dark:text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM8.5 15a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM14.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM14.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM14.5 15a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
        Original
      </div>
      <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded text-sm font-medium">
        Compressed
      </div>
    </div>
  )
}
