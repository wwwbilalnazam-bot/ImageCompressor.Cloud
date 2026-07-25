import Logo from './Logo'

export default function LogoShowcase() {
  return (
    <section className="py-16 bg-white dark:bg-slate-950 border-y border-gray-200 dark:border-slate-800">
      <div className="container max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Our Brand
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Small */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Logo size="small" color="green" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">Small</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">24×24px</p>
          </div>

          {/* Default */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Logo size="default" color="green" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">Default</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">40×40px</p>
          </div>

          {/* Large */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Logo size="large" color="green" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">Large</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">64×64px</p>
          </div>

          {/* XLarge */}
          <div className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
            <Logo size="xlarge" color="green" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-4">XLarge</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">96×96px</p>
          </div>
        </div>

        {/* Color Variants */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-black dark:to-slate-950 rounded-2xl p-12">
          <h3 className="text-xl font-bold text-white mb-8 text-center">
            Color Variants
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Green */}
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 mb-4">
                <Logo size="large" color="green" />
              </div>
              <p className="text-white font-semibold">Green (Primary)</p>
              <p className="text-gray-400 text-sm">#16a34a</p>
            </div>

            {/* White */}
            <div className="flex flex-col items-center">
              <div className="bg-gray-200 dark:bg-slate-700 rounded-lg p-6 mb-4">
                <Logo size="large" color="white" />
              </div>
              <p className="text-white font-semibold">White (Inverse)</p>
              <p className="text-gray-400 text-sm">#ffffff</p>
            </div>

            {/* Gray */}
            <div className="flex flex-col items-center">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-6 mb-4">
                <Logo size="large" color="gray" />
              </div>
              <p className="text-white font-semibold">Gray (Neutral)</p>
              <p className="text-gray-400 text-sm">#1f2937</p>
            </div>
          </div>
        </div>

        {/* Logo Description */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-8">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
            📋 Logo Design
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            The ImageCompress logo features a minimalist image frame with compression arrows,
            symbolizing the core function of the application. The design is clean, scalable,
            and works seamlessly across all sizes and contexts.
          </p>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>✓ SVG-based for crisp rendering at any size</li>
            <li>✓ Works in light and dark modes</li>
            <li>✓ Multiple color variants (green, white, gray)</li>
            <li>✓ Professional and modern aesthetic</li>
            <li>✓ Accessible with proper ARIA labels</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
