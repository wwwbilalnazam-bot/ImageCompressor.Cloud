/**
 * Ad Layout Wrapper Component
 * Provides professional ad placement structure with sticky sidebars
 * Responsive: hides sidebars on mobile, shows full-width ads instead
 * Maintains Google AdSense best practices for Core Web Vitals
 */

import AdBanner from './AdBanner'

export default function AdLayoutWrapper({ children, showSidebars = true }) {
  return (
    <div className="w-full bg-white dark:bg-slate-950">
      {/* Top Banner Ad - 728x90 or responsive */}
      <AdBanner position="top-banner" type="horizontal-banner" />

      {/* Main Content with Sidebar Ads */}
      <div className="relative">
        <div className="flex justify-center gap-4 lg:gap-6">
          {/* Left Sidebar Ad - Desktop Only */}
          {showSidebars && (
            <div className="hidden lg:block flex-shrink-0 w-[300px]">
              <AdBanner position="left-sidebar" type="vertical-sidebar" />
            </div>
          )}

          {/* Main Content Area */}
          <div className="w-full max-w-5xl px-4 py-8 md:py-12">
            {children}
          </div>

          {/* Right Sidebar Ad - Desktop Only */}
          {showSidebars && (
            <div className="hidden lg:block flex-shrink-0 w-[300px]">
              <AdBanner position="right-sidebar" type="vertical-sidebar" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile-only Banner Ad (between sections) */}
      <div className="lg:hidden">
        <AdBanner position="mobile-banner-1" type="horizontal-banner" />
      </div>
    </div>
  )
}
