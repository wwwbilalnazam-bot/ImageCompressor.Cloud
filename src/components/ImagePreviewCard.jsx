import { formatBytes } from '../utils/advancedCompression'

export default function ImagePreviewCard({ image }) {
  if (!image) return null

  return (
    <div className="space-y-6">
      {/* Before & After Comparison */}
      {image.compressedDataUrl && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Original - Left */}
          <div className="bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Image */}
            <div className="bg-gray-100 dark:bg-slate-800 aspect-square flex items-center justify-center">
              <img
                src={image.preview}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Info */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Original</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatBytes(image.originalSize)}
              </p>
            </div>
          </div>

          {/* Compressed - Right */}
          <div className="bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 dark:border-green-700 overflow-hidden shadow-lg">
            {/* Image */}
            <div className="bg-gray-100 dark:bg-slate-800 aspect-square flex items-center justify-center">
              <img
                src={image.compressedDataUrl}
                alt="Compressed"
                className="w-full h-full object-contain"
              />
            </div>
            {/* Info */}
            <div className="p-4 border-t border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-950">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-2">Compressed</p>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {formatBytes(image.compressedSize)}
                </p>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  {Math.round((1 - image.compressedSize / image.originalSize) * 100)}% smaller
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
