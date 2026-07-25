import { PDFDocument } from 'pdf-lib'
import JSZip from 'jszip'
import { generateThumbnail } from './pdfEditorEngine'
import { validatePdfFile, PdfValidationError, MAX_PDF_SIZE_BYTES } from './pdfValidation'

/**
 * Split PDF Engine — 100% client-side.
 * Pages are copied via pdf-lib's copyPages (real PDF object graph, not a
 * rasterized re-render), so text, images, links, annotations, page
 * orientation and most metadata survive a split untouched.
 */

export { validatePdfFile, PdfValidationError, MAX_PDF_SIZE_BYTES }
export const LARGE_DOCUMENT_PAGE_WARNING = 300 // page count beyond which we warn about browser load

function copyMetadata(srcDoc, newDoc) {
  const copyField = (getter, setter) => {
    try {
      const value = srcDoc[getter]()
      if (value) newDoc[setter](value)
    } catch {
      // Source metadata field missing/malformed — safe to skip.
    }
  }

  copyField('getTitle', 'setTitle')
  copyField('getAuthor', 'setAuthor')
  copyField('getSubject', 'setSubject')
  copyField('getCreator', 'setCreator')

  try {
    newDoc.setProducer('ImageCompressor Cloud - Split PDF')
    newDoc.setModificationDate(new Date())
  } catch {
    // Non-critical.
  }
}

/**
 * Copy a set of 0-indexed pages (in the given order) from srcDoc into a new
 * standalone PDF and return its bytes.
 */
export async function extractPagesToBytes(srcDoc, pageIndices) {
  if (!pageIndices || pageIndices.length === 0) {
    throw new Error('No pages selected.')
  }

  const newDoc = await PDFDocument.create()
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices)
  copiedPages.forEach((page) => newDoc.addPage(page))
  copyMetadata(srcDoc, newDoc)

  return newDoc.save()
}

/**
 * Parse a page-range string like "1-5, 8, 11-20" into an array of
 * { start, end } (1-indexed, inclusive), validated against totalPages.
 */
export function parsePageRanges(input, totalPages) {
  if (!input || !input.trim()) {
    throw new Error('Enter at least one page or range, e.g. 1-5, 8, 11-20.')
  }

  const parts = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  if (parts.length === 0) {
    throw new Error('Enter at least one page or range, e.g. 1-5, 8, 11-20.')
  }

  const ranges = []
  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/)
    const singleMatch = part.match(/^(\d+)$/)

    if (rangeMatch) {
      let start = parseInt(rangeMatch[1], 10)
      let end = parseInt(rangeMatch[2], 10)
      if (start > end) [start, end] = [end, start]
      if (start < 1 || end > totalPages) {
        throw new Error(`Range "${part}" is out of bounds — this PDF has ${totalPages} pages.`)
      }
      ranges.push({ start, end })
    } else if (singleMatch) {
      const page = parseInt(singleMatch[1], 10)
      if (page < 1 || page > totalPages) {
        throw new Error(`Page ${page} is out of bounds — this PDF has ${totalPages} pages.`)
      }
      ranges.push({ start: page, end: page })
    } else {
      throw new Error(`"${part}" isn't a valid page or range. Use formats like 1-5 or 8.`)
    }
  }

  return ranges
}

/**
 * Build equal-sized { start, end } page ranges, e.g. every 10 pages.
 */
export function buildEqualPartRanges(totalPages, pagesPerPart) {
  if (!Number.isInteger(pagesPerPart) || pagesPerPart < 1) {
    throw new Error('Pages per part must be a whole number of 1 or more.')
  }

  const ranges = []
  for (let start = 1; start <= totalPages; start += pagesPerPart) {
    const end = Math.min(start + pagesPerPart - 1, totalPages)
    ranges.push({ start, end })
  }
  return ranges
}

/**
 * Sanitize a filename base — strip extension and unsafe characters.
 */
export function sanitizeBaseName(filename) {
  const withoutExt = filename.replace(/\.[^/.]+$/, '')
  return withoutExt.replace(/[^\w\-. ]+/g, '_').trim() || 'document'
}

/**
 * Bundle multiple output files into a single ZIP blob, preserving exact
 * filenames (no forced extension/renaming).
 */
export async function createPdfZip(items) {
  const zip = new JSZip()
  items.forEach((item) => zip.file(item.filename, item.blob))
  return zip.generateAsync({ type: 'blob' })
}

/**
 * Render page thumbnails progressively with limited concurrency so large
 * documents don't block the UI thread or spike memory all at once.
 * onPageReady(pageNumber, dataUrl, error) fires as each page finishes.
 * Returns a stop() function to cancel remaining work (e.g. on unmount).
 */
export function generatePageThumbnails(pdfjsDoc, totalPages, onPageReady, concurrency = 4) {
  let cancelled = false
  let nextPage = 1

  const worker = async () => {
    while (!cancelled) {
      const pageNum = nextPage++
      if (pageNum > totalPages) return
      try {
        const dataUrl = await generateThumbnail(pdfjsDoc, pageNum, 240)
        if (!cancelled) onPageReady(pageNum, dataUrl, null)
      } catch (err) {
        if (!cancelled) onPageReady(pageNum, null, err)
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, totalPages) }, worker)
  Promise.all(workers)

  return () => {
    cancelled = true
  }
}
