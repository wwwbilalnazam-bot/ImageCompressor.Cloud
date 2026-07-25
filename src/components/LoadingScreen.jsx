import { useEffect, useState } from 'react'
import Logo from './Logo'

export default function LoadingScreen({ isLoading }) {
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (!isLoading) {
      // Fade out effect
      const timer = setTimeout(() => setOpacity(0), 300)
      return () => clearTimeout(timer)
    }
    setOpacity(1)
  }, [isLoading])

  if (!isLoading && opacity === 0) return null

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br from-green-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center z-50 transition-opacity duration-300 ${
        opacity === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Logo with animation */}
      <div className="mb-8 animate-bounce">
        <Logo size="xlarge" color="green" />
      </div>

      {/* Loading text */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Image Compressor
      </h2>

      {/* Animated progress bar */}
      <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full animate-pulse"
             style={{
               animation: 'slideInfinite 2s infinite',
             }}
        />
      </div>

      {/* Loading text animation */}
      <p className="text-gray-600 dark:text-gray-400 mt-6 text-sm font-medium">
        Loading<span className="inline-block animate-bounce ml-1" style={{animationDelay: '0s'}}>.</span>
        <span className="inline-block animate-bounce ml-0.5" style={{animationDelay: '0.1s'}}>.</span>
        <span className="inline-block animate-bounce ml-0.5" style={{animationDelay: '0.2s'}}>.</span>
      </p>

      {/* Additional info */}
      <p className="text-gray-500 dark:text-gray-500 mt-6 text-xs max-w-xs text-center">
        Fast, secure image compression powered by advanced algorithms
      </p>

      <style>{`
        @keyframes slideInfinite {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  )
}
