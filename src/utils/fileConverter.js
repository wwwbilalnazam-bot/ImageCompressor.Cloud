import { loadPdfJs } from './pdfConverter'
import { DOCX_MIME, XLSX_MIME, PPTX_MIME } from '../config/mimeTypes'
import {
  pdfToWordBackend,
  pdfToExcelBackend,
  pdfToPptxBackend,
  wordToPdfBackend,
  excelToPdfBackend,
  pptxToPdfBackend,
} from '../api/converter'

/**
 * Universal file & document converter.
 *
 * Architecture: only genuine Office-format conversions (PDF <-> Word/Excel/
 * PowerPoint) call the backend, since real fidelity there isn't achievable
 * in a browser. Everything else (images, PDF->image, image/text->PDF) runs
 * entirely client-side via pdf.js/pdf-lib/canvas — faster, private, and no
 * server dependency for the conversions that don't need one.
 *
 * pdf-lib is imported dynamically by the two builders that need it
 * (imageToPdfBlob / textToPdfBlob) instead of at module scope, keeping it out
 * of the initial bundle for the fourteen converter routes.
 *
 * The Office MIME constants now live in `src/config/mimeTypes.js` so route
 * configuration can reference them without importing this whole engine; they
 * are re-exported here to keep existing import sites working.
 */

export { DOCX_MIME, XLSX_MIME, PPTX_MIME }

export const CONVERSION_PRESETS = [
  { id: 'word-to-pdf', from: 'word', accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', to: 'application/pdf', label: 'Word to PDF', backend: true },
  { id: 'pdf-to-word', from: 'pdf', accept: '.pdf,application/pdf', to: DOCX_MIME, label: 'PDF to Word', backend: true },
  { id: 'excel-to-pdf', from: 'excel', accept: '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', to: 'application/pdf', label: 'Excel to PDF', backend: true },
  { id: 'pdf-to-excel', from: 'pdf', accept: '.pdf,application/pdf', to: XLSX_MIME, label: 'PDF to Excel', backend: true },
  { id: 'powerpoint-to-pdf', from: 'powerpoint', accept: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation', to: 'application/pdf', label: 'PowerPoint to PDF', backend: true },
  { id: 'pdf-to-powerpoint', from: 'pdf', accept: '.pdf,application/pdf', to: PPTX_MIME, label: 'PDF to PowerPoint', backend: true },
  { id: 'pdf-to-text', from: 'pdf', accept: '.pdf,application/pdf', to: 'text/plain', label: 'PDF to Text' },
  { id: 'pdf-to-jpg', from: 'pdf', accept: '.pdf,application/pdf', to: 'image/jpeg', label: 'PDF to JPG' },
  { id: 'pdf-to-png', from: 'pdf', accept: '.pdf,application/pdf', to: 'image/png', label: 'PDF to PNG' },
  { id: 'png-to-jpg', from: 'image/png', accept: 'image/png', to: 'image/jpeg', label: 'PNG to JPG' },
  { id: 'jpg-to-png', from: 'image/jpeg', accept: 'image/jpeg,image/jpg', to: 'image/png', label: 'JPG to PNG' },
  { id: 'webp-to-jpg', from: 'image/webp', accept: 'image/webp', to: 'image/jpeg', label: 'WebP to JPG' },
  { id: 'png-to-webp', from: 'image/png', accept: 'image/png', to: 'image/webp', label: 'PNG to WebP' },
  { id: 'image-to-pdf', from: 'image', accept: 'image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png', to: 'application/pdf', label: 'JPG/PNG to PDF' },
  { id: 'txt-to-pdf', from: 'txt', accept: '.txt,text/plain', to: 'application/pdf', label: 'TXT to PDF' },
]

export const SUPPORTED_OUTPUT_FORMATS = [
  { id: 'application/pdf', label: 'PDF Document (.pdf)', ext: 'pdf' },
  { id: DOCX_MIME, label: 'Word Document (.docx)', ext: 'docx' },
  { id: XLSX_MIME, label: 'Excel Spreadsheet (.xlsx)', ext: 'xlsx' },
  { id: PPTX_MIME, label: 'PowerPoint Presentation (.pptx)', ext: 'pptx' },
  { id: 'image/jpeg', label: 'JPG / JPEG Image (.jpg)', ext: 'jpg' },
  { id: 'image/png', label: 'PNG Image (.png)', ext: 'png' },
  { id: 'image/webp', label: 'WebP Image (.webp)', ext: 'webp' },
  { id: 'text/plain', label: 'Text File (.txt)', ext: 'txt' },
]

function baseName(filename) {
  return filename.replace(/\.[^/.]+$/, '')
}

function singleResult(filename, blob, type) {
  return [{ filename, blob, dataUrl: URL.createObjectURL(blob), size: blob.size, type }]
}

/**
 * Convert a single file to the target output format.
 * options.onStatus?: (message: string) => void — human-readable stage updates
 * options.onProgress?: (percent: number) => void — 0-100 where determinable (backend uploads)
 */
export async function convertFile(file, targetFormat, options = {}) {
  const { onStatus, onProgress } = options
  const fileName = file.name.toLowerCase()
  const fileType = file.type || ''

  const isPdfInput = fileType === 'application/pdf' || fileName.endsWith('.pdf')
  const isWordInput = fileName.endsWith('.docx') || fileType === DOCX_MIME
  const isExcelInput = fileName.endsWith('.xlsx') || fileType === XLSX_MIME
  const isPptxInput = fileName.endsWith('.pptx') || fileType === PPTX_MIME
  const isTxtInput = fileName.endsWith('.txt') || fileType === 'text/plain'
  const isImageInput = fileType.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif)$/i.test(fileName)

  const backendProgress = (stage, percent) => {
    if (stage === 'uploading') onStatus?.(percent < 100 ? `Uploading... ${percent}%` : 'Upload complete')
    else onStatus?.('Converting on server...')
    if (stage === 'uploading') onProgress?.(Math.round(percent * 0.6)) // upload = first 60% of the bar
    else onProgress?.(60 + Math.round(percent * 0.4))
  }

  // --- Office -> PDF (backend) ---
  if (isWordInput && targetFormat === 'application/pdf') {
    onStatus?.('Uploading to conversion service...')
    const pdfBlob = await wordToPdfBackend(file, backendProgress)
    return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
  }
  if (isExcelInput && targetFormat === 'application/pdf') {
    onStatus?.('Uploading to conversion service...')
    const pdfBlob = await excelToPdfBackend(file, backendProgress)
    return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
  }
  if (isPptxInput && targetFormat === 'application/pdf') {
    onStatus?.('Uploading to conversion service...')
    const pdfBlob = await pptxToPdfBackend(file, backendProgress)
    return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
  }

  // --- PDF -> Office (backend) ---
  if (isPdfInput && targetFormat === DOCX_MIME) {
    onStatus?.('Uploading to conversion service...')
    const docxBlob = await pdfToWordBackend(file, backendProgress)
    return singleResult(`${baseName(file.name)}.docx`, docxBlob, DOCX_MIME)
  }
  if (isPdfInput && targetFormat === XLSX_MIME) {
    onStatus?.('Uploading to conversion service...')
    const xlsxBlob = await pdfToExcelBackend(file, backendProgress)
    return singleResult(`${baseName(file.name)}.xlsx`, xlsxBlob, XLSX_MIME)
  }
  if (isPdfInput && targetFormat === PPTX_MIME) {
    onStatus?.('Uploading to conversion service...')
    const pptxBlob = await pdfToPptxBackend(file, backendProgress)
    return singleResult(`${baseName(file.name)}.pptx`, pptxBlob, PPTX_MIME)
  }

  // --- PDF -> Text (client-side) ---
  if (isPdfInput && targetFormat === 'text/plain') {
    onStatus?.('Extracting text...')
    const textContent = await extractTextFromPdf(file)
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' })
    return singleResult(`${baseName(file.name)}.txt`, blob, 'text/plain')
  }

  // --- PDF -> Image (client-side) ---
  if (isPdfInput && targetFormat.startsWith('image/')) {
    const pdfjsLib = await loadPdfJs()
    const arrayBuffer = await file.arrayBuffer()
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdfDoc.numPages
    const scale = options.scale || 2.0
    const results = []

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      onStatus?.(`Rendering page ${pageNum} of ${numPages}...`)
      onProgress?.(Math.round((pageNum / numPages) * 100))

      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = viewport.width
      canvas.height = viewport.height
      await page.render({ canvasContext: ctx, viewport }).promise

      const blob = await new Promise((res) => canvas.toBlob(res, targetFormat, options.quality || 0.92))
      const ext = targetFormat.split('/')[1] || 'jpg'
      results.push({
        filename: `${baseName(file.name)}-page-${pageNum}.${ext}`,
        blob,
        dataUrl: URL.createObjectURL(blob),
        size: blob.size,
        type: targetFormat,
      })
    }

    return results
  }

  // --- Image -> Image (client-side) ---
  if (isImageInput && targetFormat.startsWith('image/')) {
    onStatus?.('Converting image...')
    const img = await loadImage(file)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height

    if (targetFormat === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(img, 0, 0)

    const blob = await new Promise((res) => canvas.toBlob(res, targetFormat, options.quality || 0.92))
    const ext = targetFormat.split('/')[1] || 'jpg'
    return singleResult(`${baseName(file.name)}-converted.${ext}`, blob, targetFormat)
  }

  // --- Image -> PDF (client-side, via pdf-lib) ---
  if (isImageInput && targetFormat === 'application/pdf') {
    onStatus?.('Building PDF...')
    const pdfBlob = await imageToPdfBlob(file)
    return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
  }

  // --- Text -> PDF (client-side, via pdf-lib — real selectable vector text) ---
  if (isTxtInput && targetFormat === 'application/pdf') {
    onStatus?.('Building PDF...')
    const rawText = await file.text()
    const pdfBlob = await textToPdfBlob(rawText)
    return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
  }

  throw new Error('Unsupported conversion — please pick a different output format for this file type.')
}

/**
 * Extract text from a PDF, page by page.
 */
async function extractTextFromPdf(file) {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const fullText = []
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const textContent = await page.getTextContent()
    const pageStrings = textContent.items.map((item) => item.str)
    fullText.push(`--- Page ${i} ---\n` + pageStrings.join(' '))
  }
  return fullText.join('\n\n')
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Failed to load image.'))
      img.src = e.target.result
    }
    reader.onerror = () => reject(new Error('Failed to read image file.'))
    reader.readAsDataURL(file)
  })
}

/**
 * Build a real, valid PDF from an image via pdf-lib (replaces a previous
 * hand-rolled raw-PDF-byte writer). Draws through a canvas first so any
 * browser-decodable input format works, then embeds as PNG — a genuine
 * PDF image XObject, not assembled by hand.
 */
async function imageToPdfBlob(file) {
  const img = await loadImage(file)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = img.naturalWidth || img.width
  const height = img.naturalHeight || img.height
  canvas.width = width
  canvas.height = height
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0)

  const pngBlob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer())

  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()
  const pngImage = await pdfDoc.embedPng(pngBytes)
  const page = pdfDoc.addPage([width, height])
  page.drawImage(pngImage, { x: 0, y: 0, width, height })

  const outBytes = await pdfDoc.save()
  return new Blob([outBytes], { type: 'application/pdf' })
}

// pdf-lib's standard fonts only support WinAnsi (Latin-script) encoding;
// anything outside that range is replaced rather than throwing a hard
// error. Full Unicode (CJK/Arabic/Cyrillic) would need embedding a custom
// TTF font, which is out of scope here.
function sanitizeForStandardFont(text) {
  return text.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '?')
}

function wrapTextLine(line, font, fontSize, maxWidth) {
  if (line.trim() === '') return []
  const words = line.split(/\s+/).filter(Boolean)
  const result = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && current) {
      result.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) result.push(current)
  return result
}

/**
 * Build a real, selectable-text PDF from plain text via pdf-lib (replaces
 * a previous approach that rasterized text onto a canvas as a JPEG image
 * per page — this produces genuine vector text instead).
 */
async function textToPdfBlob(rawText) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const text = sanitizeForStandardFont(rawText)
  const pdfDoc = await PDFDocument.create()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const fontSize = 11
  const lineHeight = fontSize * 1.4
  const pageWidth = 612 // US Letter, points
  const pageHeight = 792
  const margin = 54
  const maxWidth = pageWidth - margin * 2

  let page = pdfDoc.addPage([pageWidth, pageHeight])
  let y = pageHeight - margin

  const ensureRoom = () => {
    if (y < margin) {
      page = pdfDoc.addPage([pageWidth, pageHeight])
      y = pageHeight - margin
    }
  }

  for (const rawLine of text.split('\n')) {
    const wrapped = wrapTextLine(rawLine, font, fontSize, maxWidth)
    if (wrapped.length === 0) {
      ensureRoom()
      y -= lineHeight
      continue
    }
    for (const line of wrapped) {
      ensureRoom()
      page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0, 0, 0) })
      y -= lineHeight
    }
  }

  const bytes = await pdfDoc.save()
  return new Blob([bytes], { type: 'application/pdf' })
}
