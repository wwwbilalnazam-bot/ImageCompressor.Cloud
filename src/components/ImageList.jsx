import ImageCard from './ImageCard'
import { formatBytes } from '../utils/imageCompression'

export default function ImageList({ images, quality, onRemoveImage, onClearAll }) {
  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = images.reduce((sum, img) => sum + (img.compressedSize || 0), 0)
  const totalSavings = totalOriginalSize - totalCompressedSize
  const savingsPercent = totalOriginalSize > 0 ? Math.round((totalSavings / totalOriginalSize) * 100) : 0

  const handleDownloadAll = () => {
    images.forEach((img, index) => {
      if (img.compressedDataUrl) {
        const link = document.createElement('a')
        link.href = img.compressedDataUrl

        const ext = getFileExtension(img.format)
        const originalName = img.originalFile.name.split('.')[0]
        link.download = `${originalName}-compressed.${ext}`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
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

  const hasCompressed = images.some(img => img.compressedDataUrl)

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-600 dark:to-primary-800 rounded-xl p-6 text-white shadow-lg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-3xl md:text-4xl font-bold">{images.length}</div>
            <div className="text-primary-100 text-sm">Images</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-bold">{savingsPercent}%</div>
            <div className="text-primary-100 text-sm">Saved</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold">{formatBytes(totalOriginalSize)}</div>
            <div className="text-primary-100 text-sm">Original</div>
          </div>
          <div>
            <div className="text-xl md:text-2xl font-bold">{formatBytes(totalCompressedSize)}</div>
            <div className="text-primary-100 text-sm">Compressed</div>
          </div>
        </div>
      </div>

      {/* Image Cards */}
      <div className="space-y-4">
        {images.map(img => (
          <ImageCard
            key={img.id}
            image={img}
            quality={quality}
            onRemove={onRemoveImage}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleDownloadAll}
          className="btn btn-primary"
          disabled={!hasCompressed}
        >
          📥 Download All
        </button>
        <button
          onClick={onClearAll}
          className="btn btn-secondary"
        >
          🗑️ Clear All
        </button>
      </div>
    </div>
  )
}
