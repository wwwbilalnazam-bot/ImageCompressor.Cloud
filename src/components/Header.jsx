import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="container max-w-5xl mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🖼️</span>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              Image Compressor
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Compress to any size. No signup.
            </p>
          </div>
        </Link>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
          >
            Compressor
          </Link>
          <Link
            to="/compress-image-to-100kb"
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            100KB
          </Link>
          <Link
            to="/jpg-compressor"
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            JPG
          </Link>
          <Link
            to="/png-compressor"
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            PNG
          </Link>
          <Link
            to="/passport-photo-compressor"
            className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Passport
          </Link>
          <details className="group">
            <summary className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer list-none">
              More ↓
            </summary>
            <div className="absolute mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-3 space-y-2 min-w-48">
              <Link to="/compress-image-to-20kb" className="block text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                → Compress to 20KB
              </Link>
              <Link to="/compress-image-to-50kb" className="block text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                → Compress to 50KB
              </Link>
              <Link to="/compress-image-to-200kb" className="block text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                → Compress to 200KB
              </Link>
              <Link to="/compress-image-to-500kb" className="block text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                → Compress to 500KB
              </Link>
              <Link to="/webp-compressor" className="block text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
                → WebP Compressor
              </Link>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
