export class DrawingCanvas {
  constructor(canvasElement) {
    this.canvas = canvasElement
    this.ctx = canvasElement.getContext('2d')
    this.isDrawing = false
    this.startX = 0
    this.startY = 0
    this.points = []
    this.color = '#000000'
    this.lineWidth = 2
    this.tool = 'pen'
    this.opacity = 1

    this.setupEventListeners()
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e))
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e))
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e))
    this.canvas.addEventListener('mouseout', (e) => this.handleMouseUp(e))

    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e))
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e))
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e))
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect()
    this.startX = e.clientX - rect.left
    this.startY = e.clientY - rect.top
    this.isDrawing = true
    this.points = [{ x: this.startX, y: this.startY }]

    if (this.tool === 'pen' || this.tool === 'highlighter') {
      this.ctx.beginPath()
      this.ctx.moveTo(this.startX, this.startY)
    }
  }

  handleMouseMove(e) {
    if (!this.isDrawing) return

    const rect = this.canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (this.tool === 'pen' || this.tool === 'highlighter') {
      this.drawLine(x, y)
    } else if (this.tool === 'line' || this.tool === 'rectangle' || this.tool === 'circle') {
      this.redrawPreview(x, y)
    }
  }

  handleMouseUp(e) {
    if (!this.isDrawing) return
    this.isDrawing = false

    if (this.tool === 'pen') {
      this.ctx.stroke()
    }
  }

  handleTouchStart(e) {
    const rect = this.canvas.getBoundingClientRect()
    const touch = e.touches[0]
    this.startX = touch.clientX - rect.left
    this.startY = touch.clientY - rect.top
    this.isDrawing = true
    this.points = [{ x: this.startX, y: this.startY }]

    if (this.tool === 'pen' || this.tool === 'highlighter') {
      this.ctx.beginPath()
      this.ctx.moveTo(this.startX, this.startY)
    }

    e.preventDefault()
  }

  handleTouchMove(e) {
    if (!this.isDrawing) return

    const rect = this.canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top

    if (this.tool === 'pen' || this.tool === 'highlighter') {
      this.drawLine(x, y)
    }

    e.preventDefault()
  }

  handleTouchEnd(e) {
    this.isDrawing = false
    if (this.tool === 'pen') {
      this.ctx.stroke()
    }
    e.preventDefault()
  }

  drawLine(x, y) {
    this.ctx.globalAlpha = this.opacity
    this.ctx.strokeStyle = this.color
    this.ctx.lineWidth = this.lineWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.lineTo(x, y)
    this.ctx.stroke()
    this.points.push({ x, y })
  }

  redrawPreview(x, y) {
    const tempCanvas = this.canvas.cloneNode()
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.drawImage(this.canvas, 0, 0)

    if (this.tool === 'line') {
      tempCtx.strokeStyle = this.color
      tempCtx.lineWidth = this.lineWidth
      tempCtx.beginPath()
      tempCtx.moveTo(this.startX, this.startY)
      tempCtx.lineTo(x, y)
      tempCtx.stroke()
    } else if (this.tool === 'rectangle') {
      const width = x - this.startX
      const height = y - this.startY
      tempCtx.strokeStyle = this.color
      tempCtx.lineWidth = this.lineWidth
      tempCtx.strokeRect(this.startX, this.startY, width, height)
    } else if (this.tool === 'circle') {
      const radius = Math.sqrt((x - this.startX) ** 2 + (y - this.startY) ** 2)
      tempCtx.strokeStyle = this.color
      tempCtx.lineWidth = this.lineWidth
      tempCtx.beginPath()
      tempCtx.arc(this.startX, this.startY, radius, 0, 2 * Math.PI)
      tempCtx.stroke()
    }

    this.ctx.drawImage(tempCanvas, 0, 0)
  }

  setTool(tool) {
    this.tool = tool
  }

  setColor(color) {
    this.color = color
  }

  setLineWidth(width) {
    this.lineWidth = width
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity))
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  getImageData() {
    return this.canvas.toDataURL('image/png')
  }

  undo() {
    this.clear()
  }
}

export function createHighlight(startX, startY, endX, endY, color = '#FFFF00', opacity = 0.3) {
  return {
    type: 'highlight',
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
    color,
    opacity,
  }
}

export function createUnderline(startX, startY, endX, endY, color = '#000000', width = 2) {
  return {
    type: 'underline',
    x: Math.min(startX, endX),
    y: Math.max(startY, endY),
    width: Math.abs(endX - startX),
    color,
    lineWidth: width,
  }
}

export function createStrikethrough(startX, startY, endX, endY, color = '#000000', width = 2) {
  return {
    type: 'strikethrough',
    x: Math.min(startX, endX),
    y: (Math.min(startY, endY) + Math.max(startY, endY)) / 2,
    width: Math.abs(endX - startX),
    color,
    lineWidth: width,
  }
}
