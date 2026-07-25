import { PDFDocument, EncryptedPDFError } from 'pdf-lib'

/**
 * Shared PDF upload validation — used by every client-side PDF tool
 * (Split, Merge, Compress). Parses the file into a pdf-lib document so
 * callers get a ready-to-use PDFDocument instead of re-parsing.
 */

export const MAX_PDF_SIZE_BYTES = 300 * 1024 * 1024 // 300MB — client memory safety cap

export class PdfValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'PdfValidationError'
  }
}

/**
 * Validate an uploaded file and parse it into a pdf-lib document.
 * Throws PdfValidationError with a user-facing message on any failure.
 */
export async function validatePdfFile(file) {
  if (!file) throw new PdfValidationError('No file provided.')

  const looksLikePdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
  if (!looksLikePdf) {
    throw new PdfValidationError(`"${file.name}" is not a PDF file.`)
  }

  if (file.size === 0) {
    throw new PdfValidationError(`"${file.name}" is empty.`)
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new PdfValidationError(
      `"${file.name}" is too large for browser-based processing (max ${Math.round(MAX_PDF_SIZE_BYTES / (1024 * 1024))}MB).`
    )
  }

  const arrayBuffer = await file.arrayBuffer()

  const headerBytes = new Uint8Array(arrayBuffer.slice(0, 5))
  const header = String.fromCharCode(...headerBytes)
  if (header !== '%PDF-') {
    throw new PdfValidationError(`"${file.name}" doesn't look like a valid PDF file.`)
  }

  let pdfDoc
  let pageCount
  try {
    // getPageCount() is included here, not just load(): pdf-lib parses the
    // raw object graph eagerly but computes the page tree lazily, so some
    // malformed PDFs only throw once pages are actually accessed.
    pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false })
    pageCount = pdfDoc.getPageCount()
  } catch (err) {
    if (err instanceof EncryptedPDFError) {
      throw new PdfValidationError(`"${file.name}" is password-protected. Remove the password and try again.`)
    }
    throw new PdfValidationError(`"${file.name}" appears to be corrupted or is not a supported PDF.`)
  }
  if (pageCount === 0) {
    throw new PdfValidationError(`"${file.name}" has no pages.`)
  }

  return { arrayBuffer, pdfDoc, pageCount }
}
