import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const pages = [
    { path: '/', label: 'Free Compressor' },
    { path: '/compress-image-to-20kb', label: 'Compress to 20KB' },
    { path: '/compress-image-to-50kb', label: 'Compress to 50KB' },
    { path: '/compress-image-to-100kb', label: 'Compress to 100KB' },
    { path: '/compress-image-to-200kb', label: 'Compress to 200KB' },
    { path: '/compress-image-to-500kb', label: 'Compress to 500KB' },
    { path: '/jpg-compressor', label: 'JPG Compressor' },
    { path: '/png-compressor', label: 'PNG Compressor' },
    { path: '/webp-compressor', label: 'WebP Compressor' },
    { path: '/passport-photo-compressor', label: 'Passport Photo' },
  ]

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-12">
      <div className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
        {/* Tools Grid */}
        <div className="mb-12">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">
            All Compression Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {pages.map(page => (
              <Link
                key={page.path}
                to={page.path}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-600 dark:hover:border-primary-400 transition-all"
              >
                {page.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-t border-gray-200 dark:border-gray-800 pt-8">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Free, fast, and privacy-first image compression. Compress PNG, JPEG, WebP, and AVIF formats directly in your browser. No signup required.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Features</h3>
            <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
              <li>✓ Target size compression</li>
              <li>✓ Browser-based processing</li>
              <li>✓ Batch compression</li>
              <li>✓ 100% private & secure</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Legal</h3>
            <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
              <li>
                <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 dark:hover:text-primary-400"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <div className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
            <p>© {currentYear} Image Compressor. All rights reserved.</p>
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-gray-500">
            <p>
              Free online image compression tool. Compress images to any size.
              <br />
              No signup. No tracking. No stored data. 100% private.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
