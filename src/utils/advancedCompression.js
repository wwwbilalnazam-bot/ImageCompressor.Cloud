import JSZip from 'jszip'

/**
 * Advanced image compression with intelligent binary search algorithm
 * Achieves target file sizes with maximum quality preservation
 */

const TARGET_TOLERANCE_KB = 2 // ±2KB tolerance
const MIN_QUALITY = 0.05
const MAX_QUALITY = 0.98

/**
 * Helper to wrap canvas.toBlob in a Promise
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      mimeType,
      Math.max(0.01, Math.min(0.99, quality))
    )
  })
}

/**
 * Compress image with specific quality and dimensions using canvas
 */
async function compressCanvasWithSettings(img, width, height, mimeType, quality) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d', { alpha: mimeType !== 'image/jpeg' })
  if (!ctx) throw new Error('Could not get canvas context')

  // Smooth rendering settings
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }

  ctx.drawImage(img, 0, 0, width, height)

  const blob = await canvasToBlob(canvas, mimeType, quality)
  return {
    blob,
    size: blob ? blob.size : Infinity,
  }
}

/**
 * Binary search for optimal quality without resizing
 */
async function findBestQualityWithoutResize(img, width, height, mimeType, targetBytes) {
  let bestResult = null
  let minDiff = Infinity

  // Try max quality first
  const maxResult = await compressCanvasWithSettings(img, width, height, mimeType, MAX_QUALITY)
  if (maxResult.size <= targetBytes) {
    return {
      blob: maxResult.blob,
      compressedSize: maxResult.size,
      quality: Math.round(MAX_QUALITY * 100),
      scaleFactor: 1.0,
      finalWidth: width,
      finalHeight: height,
    }
  }

  // Binary search quality range [5%, 95%]
  let low = 5
  let high = 95
  let iterations = 0
  const maxIterations = 14

  while (low <= high && iterations < maxIterations) {
    const mid = Math.floor((low + high) / 2)
    const qFloat = mid / 100
    const res = await compressCanvasWithSettings(img, width, height, mimeType, qFloat)

    const diff = Math.abs(res.size - targetBytes)

    if (diff < minDiff || (res.size <= targetBytes && res.size > (bestResult?.compressedSize || 0))) {
      minDiff = diff
      bestResult = {
        blob: res.blob,
        compressedSize: res.size,
        quality: mid,
        scaleFactor: 1.0,
        finalWidth: width,
        finalHeight: height,
      }
    }

    if (diff <= TARGET_TOLERANCE_KB * 1024) {
      break
    }

    // Fixed Binary Search Direction Logic:
    if (res.size > targetBytes) {
      // File is too big -> reduce quality
      high = mid - 1
    } else {
      // File is under target size -> try higher quality
      low = mid + 1
    }

    iterations++
  }

  return bestResult
}

/**
 * Binary search for optimal quality AND dimension scaling
 */
async function findBestQualityWithResize(img, originalWidth, originalHeight, mimeType, targetBytes, qualityOnlyResult) {
  let bestResult = qualityOnlyResult || null
  let minDiff = bestResult ? Math.abs(bestResult.compressedSize - targetBytes) : Infinity

  // Scale factors descending from 95% down to 30%
  const scaleFactors = [0.95, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.50, 0.40, 0.30]

  for (const scale of scaleFactors) {
    const newWidth = Math.max(16, Math.round(originalWidth * scale))
    const newHeight = Math.max(16, Math.round(originalHeight * scale))

    let low = 10
    let high = 95
    let iterations = 0
    const maxIterations = 10

    while (low <= high && iterations < maxIterations) {
      const mid = Math.floor((low + high) / 2)
      const qFloat = mid / 100
      const res = await compressCanvasWithSettings(img, newWidth, newHeight, mimeType, qFloat)

      const diff = Math.abs(res.size - targetBytes)

      if (diff < minDiff) {
        minDiff = diff
        bestResult = {
          blob: res.blob,
          compressedSize: res.size,
          quality: mid,
          scaleFactor: scale,
          finalWidth: newWidth,
          finalHeight: newHeight,
        }
      }

      if (diff <= TARGET_TOLERANCE_KB * 1024) {
        return bestResult
      }

      if (res.size > targetBytes) {
        high = mid - 1
      } else {
        low = mid + 1
      }

      iterations++
    }

    // If we reached target size within tolerance, stop scaling down
    if (bestResult && Math.abs(bestResult.compressedSize - targetBytes) <= TARGET_TOLERANCE_KB * 1024) {
      break
    }
  }

  return bestResult
}

/**
 * Compress image to target size using async binary search algorithm
 */
export async function compressToTargetSize(file, targetSizeKB = 100, outputFormat = 'original') {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof Blob)) {
      reject(new Error('Invalid file provided'))
      return
    }

    const targetBytes = targetSizeKB * 1024
    const reader = new FileReader()

    reader.onload = async (e) => {
      const img = new Image()

      img.onload = async () => {
        try {
          const originalWidth = img.naturalWidth || img.width
          const originalHeight = img.naturalHeight || img.height

          // Determine target MIME type
          let targetMime = file.type || 'image/jpeg'
          if (outputFormat && outputFormat !== 'original') {
            targetMime = outputFormat
          }

          // Step 1: Quality search at 100% dimensions — but skip it entirely
          // when the size gap is so large that quality reduction alone could
          // never realistically get there (needing >8x reduction almost
          // always needs downscaling too). Without this, a large photo with
          // a small target size wastes up to ~15 full-resolution re-encodes
          // on a search that was always going to fail, before falling
          // through to the resize search that actually succeeds — this was
          // the dominant cost of a "slow" compression, not the resize
          // search itself.
          const qualityOnlyIsPlausible = file.size <= targetBytes * 8
          let result = qualityOnlyIsPlausible
            ? await findBestQualityWithoutResize(img, originalWidth, originalHeight, targetMime, targetBytes)
            : null

          // Step 2: Dimension scaling search if still over target
          if (!result || result.compressedSize > targetBytes + TARGET_TOLERANCE_KB * 1024) {
            result = await findBestQualityWithResize(
              img,
              originalWidth,
              originalHeight,
              targetMime,
              targetBytes,
              result
            )
          }

          const originalSize = file.size
          let compressedSize = result ? result.compressedSize : originalSize

          // Ensure output is valid Blob
          let finalBlob = result ? result.blob : file
          if (compressedSize > originalSize && outputFormat === 'original') {
            compressedSize = originalSize
            finalBlob = file
          }

          const ratio = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100))
          const targetAchieved = Math.abs(compressedSize - targetBytes) <= TARGET_TOLERANCE_KB * 1024

          resolve({
            blob: finalBlob,
            originalSize,
            compressedSize,
            ratio,
            quality: result ? result.quality : 85,
            scaleFactor: result ? result.scaleFactor : 1.0,
            originalDimensions: `${originalWidth}x${originalHeight}`,
            finalDimensions: result ? `${result.finalWidth}x${result.finalHeight}` : `${originalWidth}x${originalHeight}`,
            targetSize: targetSizeKB,
            achieved: targetAchieved,
            mimeType: targetMime,
          })
        } catch (err) {
          reject(err)
        }
      }

      img.onerror = () => reject(new Error('Failed to load image element'))
      img.src = e.target.result
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Generate a ZIP archive containing all compressed images for batch download
 */
export async function createZipArchive(compressedImages) {
  const zip = new JSZip()
  const folder = zip.folder('compressed-images')

  compressedImages.forEach((img, idx) => {
    if (img.blob) {
      const ext = getMimeExtension(img.mimeType || img.format || 'image/jpeg')
      const baseName = img.originalFile?.name ? img.originalFile.name.replace(/\.[^/.]+$/, '') : `image-${idx + 1}`
      const filename = `${baseName}-compressed.${ext}`
      folder.file(filename, img.blob)
    }
  })

  return await zip.generateAsync({ type: 'blob' })
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file extension from MIME type
 */
export function getMimeExtension(mimeType) {
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'application/pdf': 'pdf',
  }
  return map[mimeType] || 'jpg'
}

/**
 * Target size presets
 */
export const TARGET_SIZES = [
  { value: 20, label: '20 KB', description: 'Tiny - Great for web forms & documents' },
  { value: 50, label: '50 KB', description: 'Small - Passport & ID photos' },
  { value: 100, label: '100 KB', description: 'Optimal - Web & email attachments' },
  { value: 200, label: '200 KB', description: 'Medium - Blog posts & social media' },
  { value: 500, label: '500 KB', description: 'High Quality - High res displays' },
]
