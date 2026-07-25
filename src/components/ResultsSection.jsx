import { useState } from 'react'
import BeforeAfterSlider from './BeforeAfterSlider'
import { formatBytes, createZipArchive } from '../utils/advancedCompression'

export default function ResultsSection({ images, onDownload, onCompressAnother, onClearAll }) {
  const [isZipping, setIsZipping] = useState(false)

  if (!images || images.length === 0) return null

  // Calculate batch metrics
  const totalOriginalSize = images.reduce((acc, img) => acc + (img.originalSize || 0), 0)
  const totalCompressedSize = images.reduce((acc, img) => acc + (img.compressedSize || img.originalSize || 0), 0)
  const totalSavings = Math.max(0, totalOriginalSize - totalCompressedSize)
  const overallRatio = totalOriginalSize > 0 ? Math.round((totalSavings / totalOriginalSize) * 100) : 0

  const handleDownloadZip = async () => {
    try {
      setIsZipping(true)
      const zipBlob = await createZipArchive(images)
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'compressed-files.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('ZIP Error:', err)
    } finally {
      setIsZipping(false)
    }
  }

  return (
    <div className="space-y-4 text-left max-w-3xl mx-auto">
      {/* Clean Success Summary Card */}
      <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
              SUCCESS
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {images.length} {images.length === 1 ? 'File' : 'Files'} Processed
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Saved {formatBytes(totalSavings)}{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-lg sm:text-xl">
              ({overallRatio}% smaller)
            </span>
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Original: <span className="font-semibold">{formatBytes(totalOriginalSize)}</span> → Compressed:{' '}
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatBytes(totalCompressedSize)}</span>
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
          {images.length > 1 && (
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-sm text-xs transition-all flex items-center justify-center gap-1.5"
            >
              {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
            </button>
          )}

          <button
            type="button"
            onClick={onCompressAnother}
            className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Compress More</span>
          </button>
        </div>
      </div>

      {/* Individual Result Cards */}
      <div className="space-y-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs"
          >
            {/* File Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-sm">
                  {img.originalFile?.name || 'Processed File'}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Original: {formatBytes(img.originalSize)}</span>
                  {img.compressedSize && (
                    <>
                      <span>→</span>
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {formatBytes(img.compressedSize)}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        -{img.ratio}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Single Download Button */}
              {img.compressedDataUrl && !img.error && (
                <button
                  type="button"
                  onClick={() => onDownload(img)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs text-xs transition-all flex items-center justify-center gap-1.5 self-start sm:self-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </button>
              )}
            </div>

            {/* Error handling if any */}
            {img.error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold">
                Compression note: {img.error}
              </div>
            )}

            {/* Interactive Visual Comparison Slider for Images */}
            {img.compressedDataUrl && img.preview && !img.error && !img.isPdf && (
              <BeforeAfterSlider
                beforeImage={img.preview}
                afterImage={img.compressedDataUrl}
                beforeLabel={`Original (${formatBytes(img.originalSize)})`}
                afterLabel={`Compressed (${formatBytes(img.compressedSize)})`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
