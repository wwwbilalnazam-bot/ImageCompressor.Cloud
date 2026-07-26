/**
 * pdf.js / pdf-lib helpers.
 *
 * SSR note: this module used to do `import * as pdfjsLib from 'pdfjs-dist'`
 * at the top level and then assign `pdfjsLib.GlobalWorkerOptions.workerSrc`
 * as a module-scope side effect. pdf.js probes DOM globals (DOMMatrix, etc.)
 * the moment it is imported, so that made the module impossible to evaluate in
 * a Node/SSR pass — it was the one genuine SSR hazard in the codebase.
 *
 * Both pdf.js and pdf-lib are now pulled in with `await import(...)` inside the
 * functions that need them, memoized so the cost is paid once. That also keeps
 * them out of the initial route bundle.
 */

let pdfjsPromise = null

/**
 * Load pdf.js on demand and point it at the bundled worker.
 *
 * The worker is resolved out of the installed `pdfjs-dist` package rather than
 * a CDN URL, so it is same-origin and always the exact version this app has in
 * node_modules (the old CDN URL interpolated `pdfjsLib.version` into a cdnjs
 * path, which silently breaks whenever cdnjs lacks that build).
 *
 * pdfjs-dist v3 ships `build/pdf.worker.min.js`; v4+ renamed it to
 * `pdf.worker.min.mjs`. Update this path alongside any major version bump.
 */
export function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.js',
        import.meta.url
      ).toString()
      return pdfjsLib
    })()
  }
  return pdfjsPromise
}

let pdfLibPromise = null

function getPdfLib() {
  if (!pdfLibPromise) {
    pdfLibPromise = import('pdf-lib')
  }
  return pdfLibPromise
}

export async function loadPdfFile(file) {
  const pdfjsLib = await getPdfjs()
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  return { pdf, arrayBuffer, fileName: file.name }
}

export async function getPdfPageCount(pdf) {
  return pdf.numPages
}

export async function renderPageToCanvas(pdf, pageNumber, scale = 2) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise

  return { canvas, viewport, width: viewport.width, height: viewport.height }
}

export async function generateThumbnail(pdf, pageNumber, size = 120) {
  const page = await pdf.getPage(pageNumber)
  const viewport = page.getViewport({ scale: size / page.view[3] })

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise

  return canvas.toDataURL('image/png')
}

export async function exportEditedPdf(pdfDoc, edits) {
  const { rgb } = await getPdfLib()
  const pages = pdfDoc.getPages()

  for (const edit of edits) {
    if (!edit.pageIndex || edit.pageIndex >= pages.length) continue

    const page = pages[edit.pageIndex]

    if (edit.type === 'text') {
      page.drawText(edit.content, {
        x: edit.x,
        y: edit.y,
        size: edit.fontSize || 12,
        color: hexToRgb(rgb, edit.color || '#000000'),
        font: edit.font,
      })
    }

    if (edit.type === 'image') {
      const imageBytes = await fetch(edit.imageSrc).then((r) => r.arrayBuffer())
      const img = await pdfDoc.embedPng(imageBytes)
      page.drawImage(img, {
        x: edit.x,
        y: edit.y,
        width: edit.width,
        height: edit.height,
      })
    }

    if (edit.type === 'rectangle') {
      page.drawRectangle({
        x: edit.x,
        y: edit.y,
        width: edit.width,
        height: edit.height,
        borderColor: hexToRgb(rgb, edit.borderColor || '#000000'),
        borderWidth: edit.borderWidth || 1,
        color: edit.fillColor ? hexToRgb(rgb, edit.fillColor) : undefined,
      })
    }

    if (edit.type === 'circle') {
      page.drawCircle({
        x: edit.x,
        y: edit.y,
        size: edit.size,
        borderColor: hexToRgb(rgb, edit.borderColor || '#000000'),
        borderWidth: edit.borderWidth || 1,
        color: edit.fillColor ? hexToRgb(rgb, edit.fillColor) : undefined,
      })
    }

    if (edit.type === 'line') {
      page.drawLine({
        start: { x: edit.x1, y: edit.y1 },
        end: { x: edit.x2, y: edit.y2 },
        thickness: edit.thickness || 1,
        color: hexToRgb(rgb, edit.color || '#000000'),
      })
    }

    if (edit.type === 'signature') {
      const sigBytes = await fetch(edit.signatureImage).then((r) => r.arrayBuffer())
      const sig = await pdfDoc.embedPng(sigBytes)
      page.drawImage(sig, {
        x: edit.x,
        y: edit.y,
        width: edit.width,
        height: edit.height,
      })
    }
  }

  return await pdfDoc.save()
}

/** `rgb` is passed in because pdf-lib is now loaded lazily, not at module scope. */
function hexToRgb(rgb, hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return rgb(0, 0, 0)
  return rgb(parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16))
}

export async function addBlankPage(pdfDoc) {
  const lastPage = pdfDoc.getLastPage()
  const { width, height } = lastPage.getSize()
  pdfDoc.addPage([width, height])
  return pdfDoc
}

export async function deletePage(pdfDoc, pageIndex) {
  pdfDoc.removePage(pageIndex)
  return pdfDoc
}

export async function rotatePage(pdfDoc, pageIndex, degrees_angle) {
  const { degrees } = await getPdfLib()
  const pages = pdfDoc.getPages()
  const page = pages[pageIndex]
  const currentRotation = page.getRotation().angle || 0
  const newRotation = (currentRotation + degrees_angle) % 360
  page.setRotation(degrees(newRotation))
  return pdfDoc
}

export async function extractPages(pdfDoc, pageIndices) {
  const { PDFDocument } = await getPdfLib()
  const newPdf = await PDFDocument.create()
  const pages = pdfDoc.getPages()

  for (const idx of pageIndices) {
    if (idx >= 0 && idx < pages.length) {
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [idx])
      newPdf.addPage(copiedPage)
    }
  }

  return newPdf
}

export async function mergePdfDocuments(pdfDoc1, pdfDoc2) {
  const pages = pdfDoc2.getPages()
  const indices = pages.map((_, i) => i)
  const [copiedPages] = await pdfDoc1.copyPages(pdfDoc2, indices)
  pdfDoc1.addPage(copiedPages)
  return pdfDoc1
}

export async function splitPdf(pdfDoc) {
  const { PDFDocument } = await getPdfLib()
  const pages = pdfDoc.getPages()
  const splitPdfs = []

  for (let i = 0; i < pages.length; i++) {
    const newPdf = await PDFDocument.create()
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
    newPdf.addPage(copiedPage)
    splitPdfs.push(newPdf)
  }

  return splitPdfs
}
