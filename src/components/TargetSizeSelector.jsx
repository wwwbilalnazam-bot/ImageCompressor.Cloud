import { TARGET_SIZES } from '../utils/advancedCompression'

export default function TargetSizeSelector({ selectedSize, onSizeChange, outputFormat, onFormatChange, disabled }) {
  const formats = [
    { id: 'original', label: 'Original Format' },
    { id: 'image/webp', label: 'Convert WebP' },
    { id: 'image/jpeg', label: 'Convert JPG' },
    { id: 'image/png', label: 'Convert PNG' },
  ]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5 max-w-2xl mx-auto">
      {/* Target Size Presets Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          TARGET SIZE:
        </span>
        <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 rounded-lg">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{selectedSize} KB</span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {TARGET_SIZES.map((size) => {
          const isSelected = selectedSize === size.value
          return (
            <button
              key={size.value}
              type="button"
              onClick={() => onSizeChange(size.value)}
              disabled={disabled}
              className={`py-1.5 px-1 rounded-xl font-extrabold text-xs transition-all text-center border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
              } disabled:opacity-50`}
            >
              {size.label}
            </button>
          )
        })}
      </div>

      {/* Custom Size & Format Controls Row */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">Custom KB:</span>
          <div className="relative flex-1">
            <input
              type="number"
              min="10"
              max="20000"
              value={selectedSize}
              onChange={(e) => onSizeChange(Math.max(10, parseInt(e.target.value) || 10))}
              disabled={disabled}
              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">Format:</span>
          <select
            value={outputFormat}
            onChange={(e) => onFormatChange && onFormatChange(e.target.value)}
            disabled={disabled}
            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            {formats.map((fmt) => (
              <option key={fmt.id} value={fmt.id}>
                {fmt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
