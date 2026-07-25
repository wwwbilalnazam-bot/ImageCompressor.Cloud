export default function HeroSection({ onUploadClick }) {
  return (
    <section className="relative pt-8 pb-10 md:pt-12 md:pb-14 bg-slate-50/50 dark:bg-slate-950/50 border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="container max-w-4xl mx-auto px-4 text-center space-y-5">
        {/* Simple Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>100% Free & Private Browser Tool</span>
        </div>

        {/* Clean Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Compress Images to Exact KB Size
        </h1>

        {/* Clear Subtitle */}
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Easily compress JPG, PNG, and WebP images to 20KB, 50KB, 100KB, 200KB, or custom file sizes with high quality.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            ✓ No server uploads
          </span>
          <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            ✓ Instant processing
          </span>
          <span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            ✓ Batch supported
          </span>
        </div>
      </div>
    </section>
  )
}
