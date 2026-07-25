import { useState } from 'react'

export default function PropertyPanel({
  edits,
  onDeleteEdit,
  onUpdateEdit,
  onAddToolClick,
}) {
  const [expandedEditId, setExpandedEditId] = useState(null)

  const getEditIcon = (type) => {
    const icons = {
      text: '📝',
      image: '🖼️',
      rectangle: '▭',
      circle: '●',
      line: '╱',
      signature: '✍️',
      highlight: '🎨',
    }
    return icons[type] || '●'
  }

  const getEditDisplayName = (edit) => {
    switch (edit.type) {
      case 'text':
        return `Text: "${edit.content.substring(0, 25)}${edit.content.length > 25 ? '...' : ''}"`
      case 'image':
        return 'Image / Logo'
      case 'rectangle':
        return 'Rectangle'
      case 'circle':
        return 'Circle'
      case 'line':
        return 'Line'
      case 'signature':
        return 'Signature'
      case 'highlight':
        return 'Highlight'
      default:
        return edit.type
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* HEADER */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-3">Layers & Properties</h3>
        <button
          type="button"
          onClick={onAddToolClick}
          className="w-full py-2.5 px-4 text-sm font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg transition-all shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 group"
        >
          <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Content</span>
        </button>
      </div>

      {/* EDITS LIST */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {edits.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
              <svg className="w-8 h-8 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">No edits yet</p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Add text, images, shapes, or signatures using the button above
            </p>
          </div>
        ) : (
          edits.map((edit, index) => (
            <div
              key={edit.id}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-800 overflow-hidden hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              <button
                type="button"
                onClick={() => setExpandedEditId(expandedEditId === edit.id ? null : edit.id)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-lg shrink-0">{getEditIcon(edit.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {getEditDisplayName(edit)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Layer {index + 1} • ({Math.round(edit.x)}, {Math.round(edit.y)})
                    </p>
                  </div>
                </div>
                <svg
                  className={`w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform group-hover:text-slate-600 ${
                    expandedEditId === edit.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                </svg>
              </button>

              {expandedEditId === edit.id && (
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 space-y-3">
                  {edit.type === 'text' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            X Position
                          </label>
                          <input
                            type="number"
                            value={Math.round(edit.x)}
                            onChange={(e) => onUpdateEdit(edit.id, { x: parseInt(e.target.value) })}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Y Position
                          </label>
                          <input
                            type="number"
                            value={Math.round(edit.y)}
                            onChange={(e) => onUpdateEdit(edit.id, { y: parseInt(e.target.value) })}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Font Size
                          </label>
                          <input
                            type="number"
                            value={edit.fontSize}
                            onChange={(e) => onUpdateEdit(edit.id, { fontSize: parseInt(e.target.value) })}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Color
                          </label>
                          <input
                            type="color"
                            value={edit.color}
                            onChange={(e) => onUpdateEdit(edit.id, { color: e.target.value })}
                            className="w-full h-9 rounded-lg cursor-pointer border-2 border-slate-300 dark:border-slate-600 hover:border-emerald-500 transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {edit.type === 'image' && (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Width
                          </label>
                          <input
                            type="number"
                            value={Math.round(edit.width)}
                            onChange={(e) => onUpdateEdit(edit.id, { width: parseInt(e.target.value) })}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            Height
                          </label>
                          <input
                            type="number"
                            value={Math.round(edit.height)}
                            onChange={(e) => onUpdateEdit(edit.id, { height: parseInt(e.target.value) })}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteEdit(edit.id)}
                    className="w-full py-2.5 px-3 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-800/50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3H4v2h16V7h-3z" />
                    </svg>
                    Remove Layer
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
