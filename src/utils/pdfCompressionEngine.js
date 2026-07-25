import { PDFDocument, PDFName, PDFArray, PDFRawStream, PDFNumber } from 'pdf-lib'
import { validatePdfFile, PdfValidationError, MAX_PDF_SIZE_BYTES } from './pdfValidation'

/**
 * PDF Compression Engine — 100% client-side.
 * Recompresses JPEG-encoded (/DCTDecode) images embedded in a PDF in place,
 * via pdf-lib's low-level object model, leaving vector text, fonts and page
 * structure untouched. Other image encodings (raw/Flate bitmaps, CCITT fax,
 * JPEG2000) are left as-is rather than risking a corrupted or visually wrong
 * output from hand-decoding less common pixel formats.
 */

export { validatePdfFile, PdfValidationError, MAX_PDF_SIZE_BYTES }

export const COMPRESSION_LEVELS = {
  low: { id: 'low', label: 'Low', desc: 'Better quality, smaller size reduction', quality: 0.85, maxDimension: 2000 },
  medium: { id: 'medium', label: 'Medium', desc: 'Balanced quality and size', quality: 0.7, maxDimension: 1500 },
  high: { id: 'high', label: 'High', desc: 'Maximum size reduction', quality: 0.5, maxDimension: 1100 },
}

export const DPI_PRESETS = [
  { id: 'screen', label: '72 DPI (Screen)', maxDimension: 800 },
  { id: 'web', label: '150 DPI (Web, recommended)', maxDimension: 1500 },
  { id: 'print', label: '300 DPI (Print)', maxDimension: 3000 },
  { id: 'none', label: 'No limit', maxDimension: null },
]

/**
 * Pick a sensible preset tier for "Automatic" based on the original file
 * size — small files get gentler treatment, large files get more aggressive
 * treatment, since aggressive recompression on an already-small PDF rarely
 * helps and risks visible quality loss for no real benefit.
 */
export function getAutomaticLevel(fileSizeBytes) {
  const mb = fileSizeBytes / (1024 * 1024)
  if (mb < 2) return COMPRESSION_LEVELS.low
  if (mb < 15) return COMPRESSION_LEVELS.medium
  return COMPRESSION_LEVELS.high
}

function isDCTDecode(filter) {
  if (!filter) return false
  if (filter instanceof PDFName) return filter.asString() === '/DCTDecode'
  if (filter instanceof PDFArray) {
    for (let i = 0; i < filter.size(); i++) {
      const f = filter.get(i)
      if (f instanceof PDFName && f.asString() === '/DCTDecode') return true
    }
  }
  return false
}

/**
 * Recompress a single JPEG image's bytes: decode, optionally downscale and
 * grayscale, then re-encode at the target quality. Returns null if the
 * browser can't decode it (left untouched by the caller in that case).
 */
async function recompressJpegBytes(jpegBytes, { quality, maxDimension, grayscale }) {
  const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
  let bitmap
  try {
    bitmap = await createImageBitmap(blob)
  } catch {
    return null
  }

  let { width, height } = bitmap
  if (maxDimension && Math.max(width, height) > maxDimension) {
    const scale = maxDimension / Math.max(width, height)
    width = Math.max(1, Math.round(width * scale))
    height = Math.max(1, Math.round(height * scale))
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (grayscale) ctx.filter = 'grayscale(1)'
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close?.()

  const outBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
  if (!outBlob) return null

  const bytes = new Uint8Array(await outBlob.arrayBuffer())
  return { bytes, width, height }
}

/**
 * Find every unique JPEG (/DCTDecode) Image XObject in the document,
 * including ones nested inside Form XObjects/annotations — enumerating all
 * indirect objects finds them all in one pass without walking each page's
 * Resources dict by hand, and naturally dedupes images shared across pages
 * (each is only recompressed once, since it's a single underlying object).
 */
function findCompressibleImageStreams(pdfDoc) {
  const streams = []
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue
    const subtype = obj.dict.lookup(PDFName.of('Subtype'))
    if (!(subtype instanceof PDFName) || subtype.asString() !== '/Image') continue
    const filter = obj.dict.lookup(PDFName.of('Filter'))
    if (!isDCTDecode(filter)) continue
    streams.push(obj)
  }
  return streams
}

/**
 * Parse a fresh PDFDocument from the original bytes. compressPdf() mutates
 * the document it's given in place, so callers who want to try multiple
 * compression passes on the same upload (e.g. Low, then High) must reparse
 * from the pristine original bytes each time rather than reusing/mutating
 * one long-lived document — otherwise a second pass would recompress
 * already-recompressed images, compounding quality loss unexpectedly.
 */
export async function loadFreshDocument(arrayBuffer) {
  return PDFDocument.load(arrayBuffer.slice(0), { updateMetadata: false })
}

/**
 * Compress a loaded PDFDocument in place and return the saved bytes.
 *
 * options: { quality: 0-1, maxDimension: px|null, grayscale: bool, removeMetadata: bool }
 * onProgress(current, total) fires as each image finishes.
 */
export async function compressPdf(pdfDoc, options, onProgress) {
  const { quality, maxDimension, grayscale, removeMetadata } = options

  const imageStreams = findCompressibleImageStreams(pdfDoc)
  let imagesRecompressed = 0

  for (let i = 0; i < imageStreams.length; i++) {
    const stream = imageStreams[i]
    try {
      const originalBytes = stream.getContents()
      const result = await recompressJpegBytes(originalBytes, { quality, maxDimension, grayscale })
      // Only keep the recompressed version if it's actually smaller —
      // never let compression make a single image bigger.
      if (result && result.bytes.length < originalBytes.length) {
        stream.dict.set(PDFName.of('Width'), PDFNumber.of(result.width))
        stream.dict.set(PDFName.of('Height'), PDFNumber.of(result.height))
        stream.dict.delete(PDFName.of('DecodeParms'))
        stream.dict.delete(PDFName.of('Decode'))
        stream.contents = result.bytes
        imagesRecompressed++
      }
    } catch (err) {
      console.error('Skipping an image during compression:', err)
      // Leave this image untouched — one bad image must never break the file.
    }
    onProgress?.(i + 1, imageStreams.length)
  }

  if (removeMetadata) {
    const info = pdfDoc.getInfoDict()
    info.keys().forEach((key) => info.delete(key))
    // pdf-lib unconditionally re-stamps Producer/ModDate inside save(); this
    // is a plain instance method (not private/sealed), so neutralizing it
    // here keeps the document genuinely metadata-free.
    pdfDoc.updateInfoDict = () => {}
  }

  const bytes = await pdfDoc.save()

  return {
    bytes,
    totalImages: imageStreams.length,
    imagesRecompressed,
  }
}
