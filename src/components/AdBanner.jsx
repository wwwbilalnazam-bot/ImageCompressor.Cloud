/**
 * Ad Banner Placeholder for Google AdSense
 * 4 Strategic Placements (Professional, Non-Intrusive)
 * Horizontal: Top banner, Footer banner
 * Vertical: Left sidebar (sticky), Right sidebar (sticky)
 * Responsive design - hides sidebars on mobile
 */

export default function AdBanner({ position = 'top', type = 'horizontal' }) {
  // Determine styling based on position and type
  const getAdDimensions = () => {
    switch(type) {
      case 'vertical-sidebar':
        return 'w-full max-w-[300px] min-h-[600px]'
      case 'horizontal-banner':
        return 'w-full min-h-[90px]'
      case 'medium-rectangle':
        return 'w-full max-w-[300px] min-h-[250px]'
      default:
        return 'w-full min-h-[90px]'
    }
  }

  const getStickyClass = () => {
    if (type === 'vertical-sidebar' && (position === 'left' || position === 'right')) {
      return 'sticky top-24 md:top-28'
    }
    return ''
  }

  const getAdSpacing = () => {
    if (position === 'top-banner' || position === 'footer-banner') {
      return 'my-6 md:my-8'
    }
    if (type === 'vertical-sidebar') {
      return 'my-4'
    }
    return 'my-6 md:my-8'
  }

  const containerClass = `${getAdSpacing()} ${
    type === 'vertical-sidebar' ? 'hidden md:flex md:justify-center' : ''
  }`

  return (
    <div className={containerClass}>
      <div
        className={`${getAdDimensions()} ${getStickyClass()} bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 overflow-hidden`}
        id={`ad-${position}`}
        data-ad-format={type}
        data-ad-position={position}
      >
        {/*
          ============================================
          GOOGLE ADSENSE CODE INSERTION POINT
          Position: {position}
          Format: {type}

          Insert your Google AdSense code below:

          <ins class="adsbygoogle"
            style="display:block"
            data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
            data-ad-slot="xxxxxxxxxx"
            data-ad-format="{type}"
            data-full-width-responsive="true"></ins>
          <script>
            (adsbygoogle = window.adsbygoogle || []).push({});
          </script>

          ============================================
        */}

        {/* Placeholder - Remove when AdSense code is added */}
        <div className="text-xs text-center p-4 pointer-events-none">
          <p className="font-medium text-gray-400">Ad Space</p>
          <p className="text-gray-400 mt-1">{position}</p>
          <p className="text-gray-500 text-[10px] mt-2">{type}</p>
        </div>
      </div>
    </div>
  )
}
