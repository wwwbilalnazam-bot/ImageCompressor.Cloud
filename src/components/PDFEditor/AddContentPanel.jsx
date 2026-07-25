import { useState, useRef } from 'react'
import { SignatureManager } from '../../utils/signatureManager'

export default function AddContentPanel({
  onAddEdit,
  onClose,
  selectedTool,
  setSelectedTool,
}) {
  const [textContent, setTextContent] = useState('')
  const [fontSize, setFontSize] = useState(14)
  const [textColor, setTextColor] = useState('#000000')
  const [fontFamily, setFontFamily] = useState('Arial')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [showSignatureOptions, setShowSignatureOptions] = useState(false)
  const [savedSignatures, setSavedSignatures] = useState(SignatureManager.getSignatures())
  const fileInputRef = useRef(null)
  const signatureCanvasRef = useRef(null)
  const [isDrawingSignature, setIsDrawingSignature] = useState(false)

  const tools = [
    { id: 'text', name: 'Text', icon: '📝', color: 'from-blue-500 to-blue-600' },
    { id: 'image', name: 'Image', icon: '🖼️', color: 'from-purple-500 to-purple-600' },
    { id: 'shapes', name: 'Shapes', icon: '▭', color: 'from-pink-500 to-pink-600' },
    { id: 'annotation', name: 'Annotate', icon: '✏️', color: 'from-amber-500 to-amber-600' },
    { id: 'signature', name: 'Sign', icon: '✍️', color: 'from-green-500 to-green-600' },
  ]

  const handleAddText = () => {
    if (!textContent.trim()) {
      alert('Please enter text')
      return
    }

    onAddEdit({
      type: 'text',
      content: textContent,
      x: 50,
      y: 50,
      fontSize,
      color: textColor,
      font: fontFamily,
      bold: isBold,
      italic: isItalic,
    })

    setTextContent('')
    setSelectedTool(null)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      onAddEdit({
        type: 'image',
        imageSrc: event.target.result,
        x: 50,
        y: 50,
        width: 150,
        height: 100,
      })
      setSelectedTool(null)
    }
    reader.readAsDataURL(file)
  }

  const handleAddShape = (shapeType) => {
    const shapes = {
      rectangle: { type: 'rectangle', width: 200, height: 100 },
      circle: { type: 'circle', size: 100 },
      line: { type: 'line', x2: 200, y2: 100 },
    }

    onAddEdit({
      ...shapes[shapeType],
      x: 50,
      y: 50,
      x1: 50,
      y1: 50,
      borderColor: '#000000',
      fillColor: '#ffffff',
      borderWidth: 2,
    })

    setSelectedTool(null)
  }

  const handleAddAnnotation = (type) => {
    onAddEdit({
      type: `annotation_${type}`,
      x: 50,
      y: 50,
      width: 200,
      height: 20,
      color: type === 'highlight' ? '#FFFF00' : '#000000',
    })

    setSelectedTool(null)
  }

  const handleDrawSignature = async () => {
    if (!signatureCanvasRef.current) return

    setIsDrawingSignature(true)
    const canvas = signatureCanvasRef.current
    const ctx = canvas.getContext('2d')
    let isDrawing = false

    const startDraw = (e) => {
      isDrawing = true
      const rect = canvas.getBoundingClientRect()
      ctx.beginPath()
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
    }

    const draw = (e) => {
      if (!isDrawing) return
      const rect = canvas.getBoundingClientRect()
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
      ctx.stroke()
    }

    const stopDraw = () => {
      isDrawing = false
      ctx.closePath()
    }

    canvas.addEventListener('mousedown', startDraw)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', stopDraw)
    canvas.addEventListener('mouseleave', stopDraw)

    await new Promise((resolve) => {
      setTimeout(() => {
        canvas.removeEventListener('mousedown', startDraw)
        canvas.removeEventListener('mousemove', draw)
        canvas.removeEventListener('mouseup', stopDraw)
        canvas.removeEventListener('mouseleave', stopDraw)

        const dataUrl = canvas.toDataURL('image/png')
        if (signatureName) {
          SignatureManager.saveSignature(signatureName, dataUrl)
          setSavedSignatures(SignatureManager.getSignatures())
        }

        onAddEdit({
          type: 'signature',
          signatureImage: dataUrl,
          x: 50,
          y: 50,
          width: 150,
          height: 50,
        })

        setIsDrawingSignature(false)
        setSelectedTool(null)
        setSignatureName('')
        canvas.width = canvas.offsetWidth
        canvas.height = canvas.offsetHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        resolve()
      }, 100)
    })
  }

  const handleUseSavedSignature = (signature) => {
    onAddEdit({
      type: 'signature',
      signatureImage: signature.dataUrl,
      x: 50,
      y: 50,
      width: 150,
      height: 50,
    })
    setSelectedTool(null)
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add Content</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Choose what to insert</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* TOOLS GRID */}
      <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 space-y-3">
        <div className="grid grid-cols-5 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all transform hover:scale-105 ${
                selectedTool === tool.id
                  ? `bg-gradient-to-br ${tool.color} text-white shadow-lg ring-2 ring-offset-2 ring-white dark:ring-offset-slate-900`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={tool.name}
            >
              <span className="text-2xl">{tool.icon}</span>
              <span className="text-[10px] font-bold mt-1 text-center leading-tight">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT PANEL */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* TEXT TOOL */}
        {selectedTool === 'text' && (
          <div className="space-y-4 pb-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                📝 Text Content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full px-3.5 py-2.5 text-sm border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Font Size
                </label>
                <input
                  type="range"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  min="8"
                  max="72"
                  className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center font-semibold">
                  {fontSize}px
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 transition-colors"
                  />
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{textColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Font Family
              </label>
              <select
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier">Courier New</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsBold(!isBold)}
                className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                  isBold
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => setIsItalic(!isItalic)}
                className={`flex-1 py-2.5 rounded-lg font-bold italic transition-all ${
                  isItalic
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <em>I</em>
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddText}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Text to PDF
            </button>
          </div>
        )}

        {/* IMAGE TOOL */}
        {selectedTool === 'image' && (
          <div className="space-y-4 pb-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-purple-50 dark:bg-purple-950/30 p-3 rounded-lg">
              ✨ Upload images, logos, watermarks, or any pictures to add to your PDF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 px-4 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 transition-all flex flex-col items-center gap-3 text-center group bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40"
            >
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Click to upload image</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">or drag and drop (PNG, JPG, WebP)</p>
              </div>
            </button>
          </div>
        )}

        {/* SHAPES TOOL */}
        {selectedTool === 'shapes' && (
          <div className="space-y-3 pb-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-pink-50 dark:bg-pink-950/30 p-3 rounded-lg">
              ✨ Add geometric shapes to highlight, outline, or annotate content
            </p>
            {[
              { name: 'Rectangle', icon: '▭', action: () => handleAddShape('rectangle'), color: 'from-pink-500 to-pink-600' },
              { name: 'Circle', icon: '●', action: () => handleAddShape('circle'), color: 'from-rose-500 to-rose-600' },
              { name: 'Line', icon: '╱', action: () => handleAddShape('line'), color: 'from-fuchsia-500 to-fuchsia-600' },
            ].map((shape) => (
              <button
                key={shape.name}
                type="button"
                onClick={shape.action}
                className={`w-full py-3 px-4 bg-gradient-to-r ${shape.color} text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{shape.icon}</span>
                <span>Add {shape.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* ANNOTATION TOOL */}
        {selectedTool === 'annotation' && (
          <div className="space-y-3 pb-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
              ✨ Highlight, underline, or strike through text for emphasis
            </p>
            {[
              { name: 'Highlight', type: 'highlight', icon: '🎨', color: 'from-yellow-400 to-amber-600' },
              { name: 'Underline', type: 'underline', icon: '╱', color: 'from-amber-500 to-orange-600' },
              { name: 'Strikethrough', type: 'strikethrough', icon: '✂️', color: 'from-red-500 to-rose-600' },
            ].map((ann) => (
              <button
                key={ann.type}
                type="button"
                onClick={() => handleAddAnnotation(ann.type)}
                className={`w-full py-3 px-4 bg-gradient-to-r ${ann.color} text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group`}
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{ann.icon}</span>
                <span>Add {ann.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* SIGNATURE TOOL */}
        {selectedTool === 'signature' && (
          <div className="space-y-3 pb-4">
            {!isDrawingSignature && (
              <>
                <p className="text-xs text-slate-600 dark:text-slate-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg">
                  ✨ Add your signature or use a saved one
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowSignatureOptions(!showSignatureOptions)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-600/30 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Draw New Signature
                  </button>
                </div>

                {showSignatureOptions && (
                  <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-green-300 dark:border-green-700 space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                        Name / Initials (Optional)
                      </label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder="Your name or initials"
                        className="w-full px-3 py-2 text-sm border-2 border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDrawingSignature(true)}
                      className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Start Drawing
                    </button>
                  </div>
                )}

                {savedSignatures.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2.5">
                      💾 Saved Signatures
                    </p>
                    <div className="space-y-2">
                      {savedSignatures.map((sig) => (
                        <button
                          key={sig.id}
                          type="button"
                          onClick={() => handleUseSavedSignature(sig)}
                          className="w-full text-left py-2.5 px-3.5 text-sm font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-green-100 dark:hover:bg-green-950/40 rounded-lg transition-all border border-slate-300 dark:border-slate-700 hover:border-green-500 flex items-center justify-between group"
                        >
                          <span>{sig.name}</span>
                          <svg className="w-4 h-4 text-slate-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {isDrawingSignature && (
              <div className="space-y-3 pb-4">
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-3 rounded-lg border-2 border-green-300 dark:border-green-700">
                  <p className="text-xs font-semibold text-green-900 dark:text-green-100">
                    ✍️ Draw your signature in the box below
                  </p>
                </div>
                <canvas
                  ref={signatureCanvasRef}
                  width={280}
                  height={140}
                  className="w-full border-2 border-green-500 rounded-lg bg-white dark:bg-slate-800 cursor-crosshair shadow-lg"
                  style={{ touchAction: 'none' }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDrawingSignature(false)
                      if (signatureCanvasRef.current) {
                        const ctx = signatureCanvasRef.current.getContext('2d')
                        ctx.clearRect(0, 0, signatureCanvasRef.current.width, signatureCanvasRef.current.height)
                      }
                    }}
                    className="flex-1 py-2.5 px-3 text-sm font-bold bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDrawSignature}
                    className="flex-1 py-2.5 px-3 text-sm font-bold bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all shadow-lg shadow-green-600/30"
                  >
                    Save & Add
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
