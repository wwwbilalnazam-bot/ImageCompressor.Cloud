export default function ProgressBar({ progress = 0, status = 'processing', error = null }) {
  // Don't show progress bar on page load (progress 0)
  if (progress === 0 && !error) return null

  const isComplete = progress === 100
  const isFailed = !!error

  return (
    <div className="bg-gradient-to-r from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
      {/* Status Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {isFailed ? (
            <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <span>❌</span>
              Compression Error
            </span>
          ) : isComplete ? (
            <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <span>✅</span>
              Compression Complete
            </span>
          ) : (
            <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <span className="animate-spin">⚙️</span>
              {status}
            </span>
          )}
        </span>
        <span className={`text-sm font-bold ${
          isFailed ? 'text-red-600 dark:text-red-400' :
          isComplete ? 'text-green-600 dark:text-green-400' :
          'text-green-600 dark:text-green-400'
        }`}>
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-sm">
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${
            isFailed
              ? 'bg-gradient-to-r from-red-400 to-red-600 shadow-lg shadow-red-500/20'
              : isComplete
              ? 'bg-gradient-to-r from-green-400 to-emerald-600 shadow-lg shadow-green-500/20'
              : 'bg-gradient-to-r from-green-500 to-green-700 shadow-lg shadow-green-500/20'
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Error Message */}
      {isFailed && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-3 flex items-center gap-2">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  )
}
