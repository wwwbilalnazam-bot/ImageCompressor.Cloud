import { loadPdfJs } from './pdfConverter'

/**
 * Client-Side PDF Tools Engine
 * Performs Merge, Images-to-PDF, Rotate, Watermark, Page Numbering, Sign PDF & Put Logo 100% in browser.
 * (Compress and Split live in dedicated engines: pdfCompressionEngine.js and pdfSplitEngine.js.)
 *
 * pdf-lib is imported dynamically inside buildMultiPagePdfFromImages(), the one
 * place it is actually used, so it stays out of the initial route bundle.
 */

/**
 * Combine multiple image files into one multi-page PDF Document
 */
export async function imagesToMultiPagePdf(imageFiles) {
  const pageImages = []

  for (const file of imageFiles) {
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

    const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9))
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

    pageImages.push({ width, height, bytes: jpgBytes })
  }

  return buildMultiPagePdfFromImages(pageImages)
}

/**
 * Merge multiple PDF files into one combined PDF Document.
 * Files/pages that fail to parse (corrupted or non-standard PDF structure)
 * are skipped rather than aborting the whole merge; onWarning is called
 * with a human-readable message for each one skipped.
 */
export async function mergePdfs(pdfFiles, onProgress, onWarning) {
  const pdfjsLib = await loadPdfJs()
  const pageImages = []
  let totalProcessed = 0

  for (const file of pdfFiles) {
    let pdfDoc
    try {
      const arrayBuffer = await file.arrayBuffer()
      pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    } catch (err) {
      console.error(`Could not open "${file.name}":`, err)
      if (onWarning) onWarning(`Skipped "${file.name}" — the file appears corrupted or unsupported.`)
      continue
    }

    const numPages = pdfDoc.numPages

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDoc.getPage(i)
        const viewport = page.getViewport({ scale: 2.0 })

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = viewport.width
        canvas.height = viewport.height

        await page.render({ canvasContext: ctx, viewport }).promise

        const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.9))
        const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

        pageImages.push({
          width: Math.round(viewport.width),
          height: Math.round(viewport.height),
          bytes: jpgBytes,
        })
      } catch (err) {
        console.error(`Failed to render page ${i} of "${file.name}":`, err)
        if (onWarning) onWarning(`Skipped page ${i} of "${file.name}" — it could not be read.`)
      }

      totalProcessed++
      if (onProgress) onProgress(totalProcessed)
    }
  }

  if (pageImages.length === 0) {
    throw new Error('None of the selected PDF pages could be read.')
  }

  return buildMultiPagePdfFromImages(pageImages)
}

/**
 * Merge an ordered list of PDF and image files into a single combined PDF Document.
 * Preserves exact user-specified item ordering, avoids blank initial pages,
 * and supports JPG, PNG, WebP, GIF, SVG, BMP, AVIF.
 */
export async function mergePdfAndImageFiles(items, options = {}, onProgress, onWarning) {
  // Support flexible argument signatures
  if (typeof options === 'function') {
    onWarning = onProgress
    onProgress = options
    options = {}
  }

  const { PDFDocument, degrees, StandardFonts, rgb } = await import('pdf-lib')
  const mainPdf = await PDFDocument.create()

  const {
    pageSize = 'auto',
    pageOrientation = 'auto',
    margin = 'none',
    addPageNumbers = false,
  } = options

  const marginVal = margin === 'small' ? 15 : margin === 'medium' ? 30 : 0
  let processedCount = 0

  for (const item of items) {
    const file = item.file || item
    const isPdf = item.isPdf !== undefined ? item.isPdf : (file.type === 'application/pdf' || file.name?.endsWith('.pdf'))
    const fileName = item.name || file.name || 'File'
    const rotation = item.rotation || 0

    if (isPdf && pageSize === 'auto' && marginVal === 0) {
      let copySuccess = false
      try {
        const arrayBuffer = await file.arrayBuffer()
        const srcPdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true })
        const pageIndices = srcPdf.getPageIndices()
        if (pageIndices.length > 0) {
          const copiedPages = await mainPdf.copyPages(srcPdf, pageIndices)
          copiedPages.forEach((page) => {
            if (rotation !== 0) {
              const currentAngle = page.getRotation().angle || 0
              page.setRotation(degrees((currentAngle + rotation) % 360))
            }
            mainPdf.addPage(page)
          })
          copySuccess = true
        }
      } catch (nativeErr) {
        console.warn(`Native PDF copy failed for "${fileName}", falling back to canvas rendering:`, nativeErr)
      }

      if (copySuccess) {
        processedCount++
        if (onProgress) onProgress(processedCount, items.length)
        continue
      }
    }

    if (isPdf) {
      try {
        const pdfjsLib = await loadPdfJs()
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const numPages = pdfDoc.numPages

        for (let i = 1; i <= numPages; i++) {
          const page = await pdfDoc.getPage(i)
          const viewport = page.getViewport({ scale: 2.0 })
          const srcW = viewport.width
          const srcH = viewport.height

          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')
          tempCanvas.width = srcW
          tempCanvas.height = srcH
          await page.render({ canvasContext: tempCtx, viewport }).promise

          // Apply options & sizing
          let targetW = srcW
          let targetH = srcH
          if (pageSize === 'a4') {
            targetW = 595.28
            targetH = 841.89
          } else if (pageSize === 'letter') {
            targetW = 612
            targetH = 792
          }

          if (pageSize !== 'auto') {
            if (pageOrientation === 'landscape' || (pageOrientation === 'auto' && srcW > srcH)) {
              if (targetW < targetH) [targetW, targetH] = [targetH, targetW]
            } else if (pageOrientation === 'portrait') {
              if (targetW > targetH) [targetW, targetH] = [targetH, targetW]
            }
          }

          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = Math.round(targetW)
          canvas.height = Math.round(targetH)

          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)

          const availW = Math.max(10, canvas.width - marginVal * 2)
          const availH = Math.max(10, canvas.height - marginVal * 2)
          const scale = Math.min(availW / srcW, availH / srcH)
          const drawW = srcW * scale
          const drawH = srcH * scale
          const posX = (canvas.width - drawW) / 2
          const posY = (canvas.height - drawH) / 2

          ctx.drawImage(tempCanvas, posX, posY, drawW, drawH)

          const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
          const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

          const embeddedJpg = await mainPdf.embedJpg(jpgBytes)
          const newPage = mainPdf.addPage([canvas.width, canvas.height])
          if (rotation !== 0) {
            newPage.setRotation(degrees(rotation))
          }
          newPage.drawImage(embeddedJpg, { x: 0, y: 0, width: canvas.width, height: canvas.height })
        }
      } catch (pdfjsErr) {
        console.error(`Could not parse PDF "${fileName}":`, pdfjsErr)
        if (onWarning) onWarning(`Skipped "${fileName}" — file could not be read.`)
      }
    } else {
      try {
        const img = await loadImage(file)
        const srcW = img.naturalWidth || img.width || 800
        const srcH = img.naturalHeight || img.height || 600

        let targetW = srcW
        let targetH = srcH
        if (pageSize === 'a4') {
          targetW = 595.28
          targetH = 841.89
        } else if (pageSize === 'letter') {
          targetW = 612
          targetH = 792
        }

        let effectiveSrcW = srcW
        let effectiveSrcH = srcH
        if (rotation === 90 || rotation === 270) {
          effectiveSrcW = srcH
          effectiveSrcH = srcW
        }

        if (pageSize !== 'auto') {
          if (pageOrientation === 'landscape' || (pageOrientation === 'auto' && effectiveSrcW > effectiveSrcH)) {
            if (targetW < targetH) [targetW, targetH] = [targetH, targetW]
          } else if (pageOrientation === 'portrait') {
            if (targetW > targetH) [targetW, targetH] = [targetH, targetW]
          }
        } else {
          targetW = effectiveSrcW
          targetH = effectiveSrcH
        }

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = Math.round(targetW)
        canvas.height = Math.round(targetH)

        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        const availW = Math.max(10, canvas.width - marginVal * 2)
        const availH = Math.max(10, canvas.height - marginVal * 2)
        const scale = Math.min(availW / effectiveSrcW, availH / effectiveSrcH)
        const drawW = srcW * scale
        const drawH = srcH * scale

        ctx.save()
        ctx.translate(canvas.width / 2, canvas.height / 2)
        if (rotation !== 0) {
          ctx.rotate((rotation * Math.PI) / 180)
        }
        ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)
        ctx.restore()

        const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
        const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

        const embeddedJpg = await mainPdf.embedJpg(jpgBytes)
        const page = mainPdf.addPage([canvas.width, canvas.height])
        page.drawImage(embeddedJpg, { x: 0, y: 0, width: canvas.width, height: canvas.height })
      } catch (err) {
        console.error(`Could not process image "${fileName}":`, err)
        if (onWarning) onWarning(`Skipped "${fileName}" — image could not be loaded.`)
      }
    }

    processedCount++
    if (onProgress) onProgress(processedCount, items.length)
  }

  if (addPageNumbers && mainPdf.getPageCount() > 0) {
    try {
      const font = await mainPdf.embedFont(StandardFonts.Helvetica)
      const pdfPages = mainPdf.getPages()
      const total = pdfPages.length

      pdfPages.forEach((p, idx) => {
        const pSize = p.getSize()
        const text = `Page ${idx + 1} of ${total}`
        const textWidth = font.widthOfTextAtSize(text, 9)
        const x = (pSize.width - textWidth) / 2
        p.drawText(text, {
          x,
          y: 15,
          size: 9,
          font,
          color: rgb(0.35, 0.35, 0.35),
        })
      })
    } catch (fontErr) {
      console.warn('Could not add page numbers:', fontErr)
    }
  }

  const pageCount = mainPdf.getPageCount()
  if (pageCount === 0) {
    throw new Error('None of the selected files could be processed into PDF pages.')
  }

  const pdfBytes = await mainPdf.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  return { blob, pageCount }
}

/**
 * Rotate PDF document pages by degrees (90, 180, 270)
 */
export async function rotatePdfFile(pdfFile, degrees = 90) {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const pageImages = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const baseViewport = page.getViewport({ scale: 2.0 })

    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = baseViewport.width
    tempCanvas.height = baseViewport.height
    await page.render({ canvasContext: tempCtx, viewport: baseViewport }).promise

    const rotatedCanvas = document.createElement('canvas')
    const rCtx = rotatedCanvas.getContext('2d')

    if (degrees === 90 || degrees === 270) {
      rotatedCanvas.width = baseViewport.height
      rotatedCanvas.height = baseViewport.width
    } else {
      rotatedCanvas.width = baseViewport.width
      rotatedCanvas.height = baseViewport.height
    }

    rCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2)
    rCtx.rotate((degrees * Math.PI) / 180)
    rCtx.drawImage(tempCanvas, -baseViewport.width / 2, -baseViewport.height / 2)

    const jpgBlob = await new Promise((res) => rotatedCanvas.toBlob(res, 'image/jpeg', 0.92))
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

    pageImages.push({
      width: Math.round(rotatedCanvas.width),
      height: Math.round(rotatedCanvas.height),
      bytes: jpgBytes,
    })
  }

  return buildMultiPagePdfFromImages(pageImages)
}

/**
 * Add Text Watermark to PDF document
 */
export async function watermarkPdfFile(pdfFile, watermarkText = 'CONFIDENTIAL') {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const pageImages = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: ctx, viewport }).promise

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(-Math.PI / 4)

    const fontSize = Math.round(canvas.width / 10)
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillStyle = 'rgba(220, 38, 38, 0.25)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(watermarkText, 0, 0)
    ctx.restore()

    const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

    pageImages.push({
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      bytes: jpgBytes,
    })
  }

  return buildMultiPagePdfFromImages(pageImages)
}

/**
 * Add Page Numbers to PDF document
 */
export async function numberPdfPages(pdfFile) {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const pageImages = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: ctx, viewport }).promise

    const fontPx = Math.round(viewport.width / 45)
    ctx.font = `bold ${fontPx}px sans-serif`
    ctx.fillStyle = '#334155'
    ctx.textAlign = 'center'
    ctx.fillText(`Page ${i} of ${numPages}`, canvas.width / 2, canvas.height - fontPx * 1.5)

    const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

    pageImages.push({
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      bytes: jpgBytes,
    })
  }

  return buildMultiPagePdfFromImages(pageImages)
}

/**
 * ADVANCED: Sign PDF Online (Overlay drawn/uploaded signature)
 */
export async function signPdfFile(pdfFile, signatureDataUrl, position = 'bottom-right') {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const sigImg = await new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = signatureDataUrl
  })

  const pageImages = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: ctx, viewport }).promise

    // Draw signature on the last page or selected page
    if (i === numPages) {
      const sigWidth = canvas.width * 0.3
      const sigHeight = (sigImg.height / sigImg.width) * sigWidth

      let posX = canvas.width - sigWidth - 40
      let posY = canvas.height - sigHeight - 50

      if (position === 'bottom-left') posX = 40
      if (position === 'center') {
        posX = (canvas.width - sigWidth) / 2
        posY = (canvas.height - sigHeight) / 2
      }

      ctx.drawImage(sigImg, posX, posY, sigWidth, sigHeight)
    }

    const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

    pageImages.push({
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      bytes: jpgBytes,
    })
  }

  return buildMultiPagePdfFromImages(pageImages)
}

/**
 * ADVANCED: Put Company Logo / Stamp on PDF
 */
export async function putLogoOnPdf(pdfFile, logoFile, position = 'top-right') {
  const pdfjsLib = await loadPdfJs()
  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const numPages = pdfDoc.numPages

  const logoImg = await loadImage(logoFile)

  const pageImages = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 2.0 })

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = viewport.width
    canvas.height = viewport.height

    await page.render({ canvasContext: ctx, viewport }).promise

    // Overlay logo on top right or top left
    const logoWidth = canvas.width * 0.2
    const logoHeight = (logoImg.height / logoImg.width) * logoWidth

    let posX = canvas.width - logoWidth - 40
    let posY = 40

    if (position === 'top-left') posX = 40
    if (position === 'bottom-right') {
      posX = canvas.width - logoWidth - 40
      posY = canvas.height - logoHeight - 40
    }
    if (position === 'bottom-left') {
      posX = 40
      posY = canvas.height - logoHeight - 40
    }

    ctx.drawImage(logoImg, posX, posY, logoWidth, logoHeight)

    const jpgBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92))
    const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer())

    pageImages.push({
      width: Math.round(viewport.width),
      height: Math.round(viewport.height),
      bytes: jpgBytes,
    })
  }

  return buildMultiPagePdfFromImages(pageImages)
}

/**
 * Build a multi-page PDF from rendered JPEG page images.
 */
async function buildMultiPagePdfFromImages(pageImages) {
  const { PDFDocument } = await import('pdf-lib')
  const pdfDoc = await PDFDocument.create()

  for (const page of pageImages) {
    const jpgImage = await pdfDoc.embedJpg(page.bytes)
    const pdfPage = pdfDoc.addPage([page.width, page.height])
    pdfPage.drawImage(jpgImage, { x: 0, y: 0, width: page.width, height: page.height })
  }

  const bytes = await pdfDoc.save()
  return new Blob([bytes], { type: 'application/pdf' })
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
