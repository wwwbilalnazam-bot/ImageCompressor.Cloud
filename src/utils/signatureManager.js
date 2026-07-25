const STORAGE_KEY = 'pdf_editor_signatures'

export class SignatureManager {
  static generateSignatureDataUrl(text, style = 'default') {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 150
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (style === 'default') {
      ctx.font = 'italic bold 36px cursive, sans-serif'
      ctx.fillStyle = '#0f172a'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text || 'Signed', 200, 75)

      ctx.beginPath()
      ctx.moveTo(50, 105)
      ctx.lineTo(350, 105)
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 3
      ctx.stroke()
    } else if (style === 'formal') {
      ctx.font = 'bold 32px Georgia, serif'
      ctx.fillStyle = '#1a1a1a'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text || 'Signed', 200, 75)

      ctx.beginPath()
      ctx.moveTo(50, 100)
      ctx.lineTo(350, 100)
      ctx.strokeStyle = '#1a1a1a'
      ctx.lineWidth = 2
      ctx.stroke()
    } else if (style === 'initials') {
      ctx.font = 'bold 40px Arial, sans-serif'
      ctx.fillStyle = '#000000'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text || 'JD', 200, 75)
    }

    return canvas.toDataURL('image/png')
  }

  static drawSignature(canvasElement, color = '#000000', width = 2) {
    return new Promise((resolve) => {
      let isDrawing = false
      const ctx = canvasElement.getContext('2d')
      const points = []

      const handleStart = (e) => {
        isDrawing = true
        points.length = 0
        const rect = canvasElement.getBoundingClientRect()
        const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left
        const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top
        ctx.beginPath()
        ctx.moveTo(x, y)
        points.push({ x, y })
      }

      const handleMove = (e) => {
        if (!isDrawing) return
        const rect = canvasElement.getBoundingClientRect()
        const x = e.touches ? e.touches[0].clientX - rect.left : e.clientX - rect.left
        const y = e.touches ? e.touches[0].clientY - rect.top : e.clientY - rect.top

        ctx.strokeStyle = color
        ctx.lineWidth = width
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineTo(x, y)
        ctx.stroke()
        points.push({ x, y })

        e.preventDefault()
      }

      const handleEnd = (e) => {
        if (!isDrawing) return
        isDrawing = false
        ctx.closePath()
        resolve({
          dataUrl: canvasElement.toDataURL('image/png'),
          points,
        })
      }

      canvasElement.addEventListener('mousedown', handleStart)
      canvasElement.addEventListener('mousemove', handleMove)
      canvasElement.addEventListener('mouseup', handleEnd)
      canvasElement.addEventListener('mouseout', handleEnd)

      canvasElement.addEventListener('touchstart', handleStart)
      canvasElement.addEventListener('touchmove', handleMove)
      canvasElement.addEventListener('touchend', handleEnd)

      return () => {
        canvasElement.removeEventListener('mousedown', handleStart)
        canvasElement.removeEventListener('mousemove', handleMove)
        canvasElement.removeEventListener('mouseup', handleEnd)
        canvasElement.removeEventListener('mouseout', handleEnd)
        canvasElement.removeEventListener('touchstart', handleStart)
        canvasElement.removeEventListener('touchmove', handleMove)
        canvasElement.removeEventListener('touchend', handleEnd)
      }
    })
  }

  static saveSignature(name, dataUrl) {
    const signatures = this.getSignatures()
    signatures.push({
      id: Date.now().toString(),
      name,
      dataUrl,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signatures))
  }

  static getSignatures() {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch {
      return []
    }
  }

  static deleteSignature(id) {
    const signatures = this.getSignatures()
    const filtered = signatures.filter((sig) => sig.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  }

  static getSignatureById(id) {
    const signatures = this.getSignatures()
    return signatures.find((sig) => sig.id === id)
  }
}
