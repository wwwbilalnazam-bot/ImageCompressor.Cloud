import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import TargetSizeSelector from './TargetSizeSelector'

export default function Uploader({
  onImagesAdded,
  targetSize,
  onTargetSizeChange,
  outputFormat,
  onFormatChange,
  isProcessing,
}) {
  const t = useTranslations('compressor')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImagesAdded(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onImagesAdded(e.target.files)
    }
  }

  return (
    <div className="space-y-3">
      {/* Target Size & Settings Bar */}
      <TargetSizeSelector
        selectedSize={targetSize}
        onSizeChange={onTargetSizeChange}
        outputFormat={outputFormat}
        onFormatChange={onFormatChange}
        disabled={isProcessing}
      />

      {/* Upload Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`rounded-2xl p-5 sm:p-7 text-center cursor-pointer transition-all border-2 border-dashed ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,application/pdf,image/jpeg,image/png,image/webp,image/avif,image/gif"
          onChange={handleFileSelect}
          disabled={isProcessing}
          className="hidden"
        />

        <div className="flex flex-col items-center space-y-2.5">
          <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            <svg className="w-7 h-7 sm:w-9 sm:h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {isDragOver ? t('dropzone.releaseToCompress') : t('dropzone.dragDrop')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{t('dropzone.subtitle')}</p>
          </div>

          <button
            type="button"
            disabled={isProcessing}
            className={`mt-1 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
              isProcessing
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
            }`}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{t('dropzone.compressing')}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>{t('dropzone.selectFiles')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
