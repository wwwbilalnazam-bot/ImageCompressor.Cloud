import { useState, useEffect } from 'react'
import { generateThumbnail } from '../../utils/pdfEditorEngine'

export default function ThumbnailSidebar({
  pdfFile,
  totalPages,
  currentPageIndex,
  setCurrentPageIndex,
}) {
  const [thumbnails, setThumbnails] = useState([])
  const [isGenerating, setIsGenerating] = useState(true)

  useEffect(() => {
    const generateThumbnails = async () => {
      setIsGenerating(true)
      try {
        const thumbs = []
        for (let i = 1; i <= totalPages; i++) {
          const thumb = await generateThumbnail(pdfFile.pdf, i, 100)
          thumbs.push({ pageNumber: i, dataUrl: thumb })
        }
        setThumbnails(thumbs)
      } catch (err) {
        console.error('Thumbnail generation error:', err)
      } finally {
        setIsGenerating(false)
      }
    }

    if (pdfFile && totalPages > 0) {
      generateThumbnails()
    }
  }, [pdfFile, totalPages])

  return (
    <div className="space-y-1.5">
      {thumbnails.map((thumb, index) => (
        <button
          key={thumb.pageNumber}
          type="button"
          onClick={() => setCurrentPageIndex(thumb.pageNumber - 1)}
          className={`w-full aspect-[8.5/11] rounded-lg overflow-hidden transition-all cursor-pointer group relative shadow-sm hover:shadow-md ${
            currentPageIndex === thumb.pageNumber - 1
              ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900 scale-105'
              : 'border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500'
          }`}
        >
          <img
            src={thumb.dataUrl}
            alt={`Page ${thumb.pageNumber}`}
            className={`w-full h-full object-cover transition-all ${
              currentPageIndex === thumb.pageNumber - 1 ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'
            }`}
          />

          {/* PAGE NUMBER BADGE */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {currentPageIndex === thumb.pageNumber - 1 && (
              <div className="bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                {thumb.pageNumber}
              </div>
            )}
          </div>

          {/* HOVER LABEL */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-2 group-hover:from-black/80 transition-all">
            <span className="text-[10px] text-white font-semibold">{thumb.pageNumber}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
