// Helper to load pdfjs script dynamically if not already loaded
let pdfjsPromise = null

export function loadPdfJs() {
  if (window.pdfjsLib) {
    return Promise.resolve(window.pdfjsLib)
  }

  if (pdfjsPromise) {
    return pdfjsPromise
  }

  pdfjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      resolve(window.pdfjsLib)
    }
    script.onerror = (err) => {
      pdfjsPromise = null
      reject(new Error('Failed to load PDF processing library.'))
    }
    document.head.appendChild(script)
  })

  return pdfjsPromise
}

/**
 * Convert PDF File to Image Blobs page by page
 * @param {File} file - PDF file
 * @param {Object} options - { format: 'image/jpeg'|'image/png'|'image/webp', scale: 2, quality: 0.9 }
 * @param {Function} onProgress - Progress callback (currentPage, totalPages)
 * @returns {Array<{ pageNumber: number, blob: Blob, dataUrl: string, width: number, height: number }>}
 */
export async function convertPdfToImages(file, options = {}, onProgress) {
  const pdfjsLib = await loadPdfJs()

  const arrayBuffer = await file.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const format = options.format || 'image/jpeg'
  const scale = options.scale || 2.0 // High quality 2x resolution
  const quality = options.quality || 0.92

  const pages = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum)
    const viewport = page.getViewport({ scale })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise

    const blob = await new Promise((res) => canvas.toBlob(res, format, quality))
    const dataUrl = URL.createObjectURL(blob)

    pages.push({
      pageNumber: pageNum,
      blob,
      dataUrl,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      size: blob.size,
    })

    if (onProgress) {
      onProgress(pageNum, numPages)
    }
  }

  return {
    filename: file.name.replace(/\.[^/.]+$/, ''),
    totalPages: numPages,
    pages,
  }
}
