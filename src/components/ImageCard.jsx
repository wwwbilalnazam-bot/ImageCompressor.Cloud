import { useState } from 'react'
import BeforeAfterComparison from './BeforeAfterComparison'
import { formatBytes } from '../utils/imageCompression'

export default function ImageCard({ image, quality, onRemove }) {
  const [showComparison, setShowComparison] = useState(true)

  const handleDownload = () => {
    if (image.compressedDataUrl) {
      const link = document.createElement('a')
      link.href = image.compressedDataUrl

      const ext = getFileExtension(image.format)
      const originalName = image.originalFile.name.split('.')[0]
      link.download = `${originalName}-compressed.${ext}`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      const blob = await fetch(image.compressedDataUrl).then(r => r.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      alert('Image copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
      alert('Failed to copy image to clipboard')
    }
  }

  const getFileExtension = (mimeType) => {
    const map = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/avif': 'avif',
    }
    return map[mimeType] || 'jpg'
  }

  const savings = image.compressedSize ? image.originalSize - image.compressedSize : 0

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Image Comparison */}
      <div className="p-4 md:p-6 bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800">
        {showComparison && image.compressedDataUrl ? (
          <BeforeAfterComparison
            before={image.preview}
            after={image.compressedDataUrl}
            alt="Compressed image"
          />
        ) : (
          <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg h-64 md:h-96 overflow-hidden">
            {image.isCompressing ? (
              <div className="text-center">
                <div className="animate-spin text-4xl mb-3">⚙️</div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Compressing...</p>
              </div>
            ) : image.error ? (
              <div className="text-center text-red-600 dark:text-red-400">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="text-sm">{image.error}</p>
              </div>
            ) : image.compressedDataUrl ? (
              <img
                src={image.compressedDataUrl}
                alt="Compressed"
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={image.preview}
                alt="Original"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {image.error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 mx-4 rounded-xl">
          <p className="text-sm font-semibold flex items-center gap-2"><span>⚠️</span>Error: {image.error}</p>
        </div>
      )}

      {/* Info and Actions */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 md:p-6 space-y-5">
        {/* File Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Original</p>
            <p className="font-bold text-lg text-gray-900 dark:text-white">
              {formatBytes(image.originalSize)}
            </p>
          </div>

          {image.compressedSize && (
            <>
              <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">Compressed</p>
                <p className="font-bold text-lg text-gray-900 dark:text-white">
                  {formatBytes(image.compressedSize)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">Saved</p>
                <p className="font-bold text-lg text-green-600 dark:text-green-300">
                  {formatBytes(savings)}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">Reduction</p>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-300">
                  {image.ratio || '0'}%
                </p>
              </div>
            </>
          )}
        </div>

        {/* Compression Details */}
        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs mb-1">Quality Used:</p>
              <p className="font-semibold text-gray-900 dark:text-white">{image.quality}%</p>
            </div>
            <div>
              <p className="text-xs mb-1">Format:</p>
              <p className="font-semibold text-gray-900 dark:text-white">{getFileExtension(image.format).toUpperCase()}</p>
            </div>
          </div>

          {image.scaleFactor && image.scaleFactor < 1 && (
            <div className="bg-yellow-50 dark:bg-yellow-950 rounded p-2 border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>⚠️ Dimensions Scaled:</strong> Reduced to {Math.round(image.scaleFactor * 100)}% to reach target size
              </p>
            </div>
          )}

          {image.originalDimensions && (
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Original Resolution:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{image.originalDimensions}</span>
              </div>
              {image.finalDimensions && image.finalDimensions !== image.originalDimensions && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Final Resolution:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{image.finalDimensions}</span>
                </div>
              )}
            </div>
          )}

          <div className="text-xs mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="truncate">
              File: <span className="font-semibold">{image.originalFile.name}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {!image.error && (
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            {image.compressedDataUrl ? (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 text-sm flex items-center justify-center gap-2"
                  title="Download compressed image"
                >
                  <span>📥</span>Download
                </button>
                {navigator.clipboard && (
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-slate-600 font-semibold rounded-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 text-sm flex items-center justify-center gap-2"
                    title="Copy to clipboard"
                  >
                    <span>📋</span>Copy
                  </button>
                )}
              </>
            ) : (
              <div className="w-full text-center py-2 text-gray-600 dark:text-gray-400 text-sm flex items-center justify-center gap-2">
                <span className="animate-spin">⚙️</span>
                Compressing...
              </div>
            )}

            <button
              onClick={() => onRemove(image.id)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors duration-300 text-sm"
              title="Remove this image"
            >
              ✕
            </button>
          </div>
        )}

        {/* Comparison Toggle */}
        {image.compressedDataUrl && !image.error && (
          <div className="text-center">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
            >
              {showComparison ? 'View compressed only' : 'View before/after'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
