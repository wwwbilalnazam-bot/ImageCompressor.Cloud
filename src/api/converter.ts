// Client for the document-conversion backend. Only Office-format
// conversions (PDF <-> Word/Excel/PowerPoint) go through this — every
// other conversion on the site runs entirely client-side, since real
// Office-format fidelity isn't achievable in a browser but everything
// else (images, PDF<->images, text->PDF) works fine without a server.
// NEXT_PUBLIC_ prefix is required for the value to be inlined into the client
// bundle (this module only ever runs in the browser). Set it in Vercel for
// Production and Preview — it replaces the old Vite-era VITE_API_URL.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export type ProgressCallback = (stage: 'uploading' | 'converting', percent: number) => void

/**
 * Upload a file and stream back the converted result, reporting real
 * upload-progress percentages via XHR (fetch has no upload-progress event).
 * Once the upload completes, we can't observe server-side conversion
 * progress (it's a single request/response), so onProgress reports
 * 'converting' at 100% for that phase until the response arrives.
 */
function postFile(endpoint: string, file: File, onProgress?: ProgressCallback): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${API_BASE}/convert/${endpoint}`)
    xhr.responseType = 'blob'

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress('uploading', Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.upload.onload = () => onProgress?.('converting', 0)

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.('converting', 100)
        resolve(xhr.response as Blob)
        return
      }

      // Error responses are JSON, not the blob type we requested — read
      // them back out as text to surface the server's actual message.
      const reader = new FileReader()
      reader.onload = () => {
        let message = `Conversion failed (${xhr.status})`
        try {
          const body = JSON.parse(reader.result as string)
          if (body?.error) message = body.error
        } catch {
          // Not JSON — keep the generic message.
        }
        reject(new Error(message))
      }
      reader.onerror = () => reject(new Error(`Conversion failed (${xhr.status})`))
      reader.readAsText(xhr.response)
    }

    xhr.onerror = () => reject(new Error('Could not reach the conversion service. Please try again shortly.'))
    xhr.ontimeout = () => reject(new Error('Conversion timed out. The file may be too large or complex.'))
    xhr.timeout = 180000

    const formData = new FormData()
    formData.append('file', file)
    xhr.send(formData)
  })
}

export function pdfToWordBackend(file: File, onProgress?: ProgressCallback): Promise<Blob> {
  return postFile('pdf-to-word', file, onProgress)
}

export function pdfToExcelBackend(file: File, onProgress?: ProgressCallback): Promise<Blob> {
  return postFile('pdf-to-excel', file, onProgress)
}

export function pdfToPptxBackend(file: File, onProgress?: ProgressCallback): Promise<Blob> {
  return postFile('pdf-to-pptx', file, onProgress)
}

export function wordToPdfBackend(file: File, onProgress?: ProgressCallback): Promise<Blob> {
  return postFile('word-to-pdf', file, onProgress)
}

export function excelToPdfBackend(file: File, onProgress?: ProgressCallback): Promise<Blob> {
  return postFile('excel-to-pdf', file, onProgress)
}

export function pptxToPdfBackend(file: File, onProgress?: ProgressCallback): Promise<Blob> {
  return postFile('pptx-to-pdf', file, onProgress)
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) })
    return response.ok
  } catch {
    return false
  }
}
