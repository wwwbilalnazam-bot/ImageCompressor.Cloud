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

  // --- Office -> PDF (backend with browser client-side fallback) ---
  if (isWordInput && targetFormat === 'application/pdf') {
    try {
      onStatus?.('Uploading to conversion service...')
      const pdfBlob = await wordToPdfBackend(file, backendProgress)
      return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
    } catch (backendErr) {
      console.warn('Backend service unreachable, converting Word to PDF in browser:', backendErr)
      onStatus?.('Converting Word to PDF in browser...')
      const pdfBlob = await wordToPdfClient(file, onStatus)
      return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
    }
  }
  if (isExcelInput && targetFormat === 'application/pdf') {
    try {
      onStatus?.('Uploading to conversion service...')
      const pdfBlob = await excelToPdfBackend(file, backendProgress)
      return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
    } catch (backendErr) {
      console.warn('Backend service unreachable, converting Excel to PDF in browser:', backendErr)
      onStatus?.('Converting Excel to PDF in browser...')
      const pdfBlob = await excelToPdfClient(file, onStatus)
      return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
    }
  }
  if (isPptxInput && targetFormat === 'application/pdf') {
    try {
      onStatus?.('Uploading to conversion service...')
      const pdfBlob = await pptxToPdfBackend(file, backendProgress)
      return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
    } catch (backendErr) {
      console.warn('Backend service unreachable, converting PowerPoint to PDF in browser:', backendErr)
      onStatus?.('Converting PowerPoint to PDF in browser...')
      const pdfBlob = await pptxToPdfClient(file, onStatus)
      return singleResult(`${baseName(file.name)}.pdf`, pdfBlob, 'application/pdf')
    }
  }

  // --- PDF -> Office (backend with browser client-side fallback) ---
  if (isPdfInput && targetFormat === DOCX_MIME) {
    try {
      onStatus?.('Uploading to conversion service...')
      const docxBlob = await pdfToWordBackend(file, backendProgress)
      return singleResult(`${baseName(file.name)}.docx`, docxBlob, DOCX_MIME)
    } catch (backendErr) {
      console.warn('Backend service unreachable, converting PDF to Word in browser:', backendErr)
      onStatus?.('Converting PDF to Word in browser...')
      const docxBlob = await pdfToWordClient(file, onStatus)
      return singleResult(`${baseName(file.name)}.docx`, docxBlob, DOCX_MIME)
    }
  }
  if (isPdfInput && targetFormat === XLSX_MIME) {
    try {
      onStatus?.('Uploading to conversion service...')
      const xlsxBlob = await pdfToExcelBackend(file, backendProgress)
      return singleResult(`${baseName(file.name)}.xlsx`, xlsxBlob, XLSX_MIME)
    } catch (backendErr) {
      console.warn('Backend service unreachable, converting PDF to Excel in browser:', backendErr)
      onStatus?.('Converting PDF to Excel in browser...')
      const xlsxBlob = await pdfToExcelClient(file, onStatus)
      return singleResult(`${baseName(file.name)}.xlsx`, xlsxBlob, XLSX_MIME)
    }
  }
  if (isPdfInput && targetFormat === PPTX_MIME) {
    try {
      onStatus?.('Uploading to conversion service...')
      const pptxBlob = await pdfToPptxBackend(file, backendProgress)
      return singleResult(`${baseName(file.name)}.pptx`, pptxBlob, PPTX_MIME)
    } catch (backendErr) {
      console.warn('Backend service unreachable, converting PDF to PowerPoint in browser:', backendErr)
      onStatus?.('Converting PDF to PowerPoint in browser...')
      const pptxBlob = await pdfToPptxClient(file, onStatus)
      return singleResult(`${baseName(file.name)}.pptx`, pptxBlob, PPTX_MIME)
    }
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

/**
 * Client-Side PDF -> PowerPoint (.pptx) conversion engine.
 * Generates a valid OpenXML presentation with full-bleed page slide images.
 */
export async function pdfToPptxClient(file, onStatus) {
  const JSZip = (await import('jszip')).default
  const pdfjsLib = await loadPdfJs()

  onStatus?.('Reading PDF pages...')
  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const zip = new JSZip()

  let contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>`

  for (let i = 1; i <= numPages; i++) {
    contentTypesXml += `\n  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  }
  contentTypesXml += '\n</Types>'
  zip.file('[Content_Types].xml', contentTypesXml)

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  )

  const firstPage = await pdfDoc.getPage(1)
  const firstViewport = firstPage.getViewport({ scale: 1.0 })
  const slideWidthEmu = Math.round((firstViewport.width || 720) * 12700)
  const slideHeightEmu = Math.round((firstViewport.height || 540) * 12700)

  let sldIdLst = ''
  let presRels = ''

  for (let i = 1; i <= numPages; i++) {
    const rId = `rId${i}`
    sldIdLst += `<p:sldId id="${255 + i}" r:id="${rId}"/>`
    presRels += `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>\n`
  }

  const masterRId = `rId${numPages + 1}`
  presRels += `<Relationship Id="${masterRId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`

  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="${masterRId}"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>${sldIdLst}</p:sldIdLst>
  <p:sldSz cx="${slideWidthEmu}" cy="${slideHeightEmu}"/>
  <p:notesSz cx="${slideHeightEmu}" cy="${slideWidthEmu}"/>
</p:presentation>`

  zip.file('ppt/presentation.xml', presentationXml)

  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`
  )

  zip.file(
    'ppt/slideMasters/slideMaster1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>
</p:sldMaster>`
  )

  zip.file(
    'ppt/slideMasters/_rels/slideMaster1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
</Relationships>`
  )

  zip.file(
    'ppt/slideLayouts/slideLayout1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sldLayout>`
  )

  zip.file(
    'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>
</Relationships>`
  )

  for (let i = 1; i <= numPages; i++) {
    onStatus?.(`Rendering slide ${i} of ${numPages}...`)
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: ctx, viewport }).promise

    const pngBlob = await new Promise((res) => canvas.toBlob(res, 'image/png'))
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer())

    zip.file(`ppt/media/image${i}.png`, pngBytes)

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="${i + 1}" name="Slide Image ${i}"/>
          <p:cNvPicPr/>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId2"/>
          <a:stretch><a:fillRect/></a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm><a:off x="0" y="0"/><a:ext cx="${slideWidthEmu}" cy="${slideHeightEmu}"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`

    const slideRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i}.png"/>
</Relationships>`

    zip.file(`ppt/slides/slide${i}.xml`, slideXml)
    zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, slideRels)
  }

  onStatus?.('Generating PowerPoint presentation...')
  return await zip.generateAsync({ type: 'blob', mimeType: PPTX_MIME })
}

/**
 * Client-Side PowerPoint (.pptx) -> PDF conversion engine.
 */
export async function pptxToPdfClient(file, onStatus) {
  const JSZip = (await import('jszip')).default
  const { PDFDocument } = await import('pdf-lib')

  onStatus?.('Reading PowerPoint presentation...')
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  const mediaFiles = Object.keys(zip.files).filter((path) =>
    /^ppt\/media\/image\d+\.(png|jpe?g|webp|gif|bmp)$/i.test(path)
  )

  mediaFiles.sort((a, b) => {
    const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10)
    const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10)
    return numA - numB
  })

  const pdfDoc = await PDFDocument.create()

  if (mediaFiles.length > 0) {
    onStatus?.(`Converting ${mediaFiles.length} slides to PDF...`)
    for (const mediaPath of mediaFiles) {
      try {
        const imageBytes = await zip.files[mediaPath].async('uint8array')
        const isPng = mediaPath.toLowerCase().endsWith('.png')
        let imageEmbed

        if (isPng) {
          imageEmbed = await pdfDoc.embedPng(imageBytes)
        } else {
          imageEmbed = await pdfDoc.embedJpg(imageBytes)
        }

        const { width, height } = imageEmbed
        const page = pdfDoc.addPage([width, height])
        page.drawImage(imageEmbed, { x: 0, y: 0, width, height })
      } catch (err) {
        console.warn(`Could not embed slide image "${mediaPath}":`, err)
      }
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    onStatus?.('Extracting slide text...')
    const slidePaths = Object.keys(zip.files).filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    slidePaths.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0', 10)
      const numB = parseInt(b.match(/\d+/)?.[0] || '0', 10)
      return numA - numB
    })

    const parser = new DOMParser()

    for (let i = 0; i < slidePaths.length; i++) {
      const xmlStr = await zip.files[slidePaths[i]].async('string')
      const xmlDoc = parser.parseFromString(xmlStr, 'text/xml')
      const textNodes = Array.from(xmlDoc.getElementsByTagName('a:t'))
      const slideText = textNodes.map((n) => n.textContent).filter(Boolean).join('\n')

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 1280
      canvas.height = 720

      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#1E293B'
      ctx.font = 'bold 36px sans-serif'
      ctx.fillText(`Slide ${i + 1}`, 60, 80)

      ctx.font = '24px sans-serif'
      ctx.fillStyle = '#334155'
      const lines = slideText.split('\n')
      let y = 140
      for (const line of lines) {
        ctx.fillText(line.slice(0, 80), 60, y)
        y += 40
        if (y > 660) break
      }

      const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
      const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

      const embeddedJpg = await pdfDoc.embedJpg(jpgBytes)
      const page = pdfDoc.addPage([1280, 720])
      page.drawImage(embeddedJpg, { x: 0, y: 0, width: 1280, height: 720 })
    }
  }

  if (pdfDoc.getPageCount() === 0) {
    throw new Error('PowerPoint presentation contains no convertible slides or content.')
  }

  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

/**
 * Client-Side PDF -> Word (.docx) fallback conversion engine.
 */
export async function pdfToWordClient(file, onStatus) {
  const JSZip = (await import('jszip')).default
  onStatus?.('Extracting text from PDF...')
  const rawText = await extractTextFromPdf(file)

  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  )

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  )

  const lines = rawText.split('\n')
  let bodyXml = ''
  for (const line of lines) {
    const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    bodyXml += `<w:p><w:r><w:t>${escaped}</w:t></w:r></w:p>`
  }

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${bodyXml}</w:body>
</w:document>`
  )

  onStatus?.('Building Word document...')
  return await zip.generateAsync({ type: 'blob', mimeType: DOCX_MIME })
}

/**
 * Client-Side Word (.docx) -> PDF fallback conversion engine.
 */
export async function wordToPdfClient(file, onStatus) {
  const JSZip = (await import('jszip')).default

  onStatus?.('Reading Word document...')
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  let documentText = ''
  if (zip.files['word/document.xml']) {
    const xmlStr = await zip.files['word/document.xml'].async('string')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml')
    const paragraphs = Array.from(xmlDoc.getElementsByTagName('w:p'))
    documentText = paragraphs
      .map((p) => Array.from(p.getElementsByTagName('w:t')).map((t) => t.textContent).join(''))
      .filter(Boolean)
      .join('\n')
  }

  return await textToPdfBlob(documentText || 'Word document converted to PDF.')
}

/**
 * Client-Side PDF -> Excel (.xlsx) fallback conversion engine.
 */
export async function pdfToExcelClient(file, onStatus) {
  const JSZip = (await import('jszip')).default
  onStatus?.('Extracting text and tables...')
  const rawText = await extractTextFromPdf(file)

  const zip = new JSZip()
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  )

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  )

  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets>
</workbook>`
  )

  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  )

  const lines = rawText.split('\n')
  let sheetData = ''
  lines.forEach((line, rowIdx) => {
    const cells = line.split(/\s{2,}|\t/).filter(Boolean)
    if (cells.length > 0) {
      sheetData += `<row r="${rowIdx + 1}">`
      cells.forEach((cellVal, colIdx) => {
        const colLetter = String.fromCharCode(65 + (colIdx % 26))
        const escaped = cellVal.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        sheetData += `<c r="${colLetter}${rowIdx + 1}" t="inlineStr"><is><t>${escaped}</t></is></c>`
      })
      sheetData += `</row>`
    }
  })

  zip.file(
    'xl/worksheets/sheet1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${sheetData}</sheetData>
</worksheet>`
  )

  onStatus?.('Building Excel spreadsheet...')
  return await zip.generateAsync({ type: 'blob', mimeType: XLSX_MIME })
}

/**
 * Client-Side Excel (.xlsx) -> PDF fallback conversion engine.
 */
export async function excelToPdfClient(file, onStatus) {
  const JSZip = (await import('jszip')).default

  onStatus?.('Reading Excel spreadsheet...')
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  let extractedContent = ''
  if (zip.files['xl/worksheets/sheet1.xml']) {
    const xmlStr = await zip.files['xl/worksheets/sheet1.xml'].async('string')
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlStr, 'text/xml')
    const textNodes = Array.from(xmlDoc.getElementsByTagName('t'))
    extractedContent = textNodes.map((n) => n.textContent).join(' ')
  }

  return await textToPdfBlob(extractedContent || 'Excel spreadsheet converted to PDF.')
}
