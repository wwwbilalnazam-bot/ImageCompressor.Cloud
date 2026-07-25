# Google AdSense Implementation Checklist

## Quick Start (5 minutes)

### 1. Get Your Publisher ID
- [ ] Sign up at https://adsense.google.com
- [ ] Verify your website
- [ ] Wait for approval (24 hours)
- [ ] Copy your Publisher ID: `ca-pub-XXXXXXXXXXXX`

### 2. Update Publisher ID in index.html
Replace `ca-pub-xxxxxxxxxxxxxxxx` with your actual Publisher ID:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ID-HERE"
  crossorigin="anonymous"></script>
```

### 3. Create Ad Slots in AdSense Dashboard
For each ad placement listed below:
1. Go to **Ads → By code → Create new ad unit**
2. Name it (e.g., "Homepage Top Banner")
3. Select the format from the list below
4. Note the **Ad slot ID** (10-digit number)

### 4. Update src/components/AdBanner.jsx
Replace the AdSense code insertion points with actual ad codes.

---

## Ad Slots Checklist

Create these 9 ad units in your AdSense dashboard:

| Position | Format | Dimensions | Slot Name | Slot ID |
|----------|--------|-----------|-----------|---------|
| top-banner | Horizontal | 728×90 | Homepage Top Banner | __________ |
| left-sidebar | Half-page | 300×600 | Left Sidebar Ad | __________ |
| right-sidebar | Half-page | 300×600 | Right Sidebar Ad | __________ |
| results-separator-mobile | Mobile Banner | 320×50 | Mobile Results Separator | __________ |
| post-results-desktop | Horizontal | 728×90 | Post Results Banner | __________ |
| pre-features-mobile | Medium Rectangle | 300×250 | Mobile Features Promo | __________ |
| pre-faq | Horizontal | 728×90 | Pre-FAQ Banner | __________ |
| post-faq | Horizontal | 728×90 | Post-FAQ Banner | __________ |
| footer-banner | Horizontal | 728×90 | Footer Banner | __________ |

---

## Step-by-Step Implementation

### Step 1: Update AdBanner.jsx

Replace the placeholder comment section in `src/components/AdBanner.jsx`:

**BEFORE:**
```jsx
{/*
  ============================================
  GOOGLE ADSENSE CODE INSERTION POINT
  Position: {position}
  Format: {type}
  ... placeholder comment ...
*/}
```

**AFTER:**
```jsx
{process.env.NODE_ENV === 'production' ? (
  <>
    <ins className="adsbygoogle"
      style={{display: 'block'}}
      data-ad-client="ca-pub-XXXXXXXXXXXX"
      data-ad-slot={getAdSlotId()}
      data-ad-format={getAdFormat()}
      data-full-width-responsive="true"></ins>
    <script>
      {`(adsbygoogle = window.adsbygoogle || []).push({});`}
    </script>
  </>
) : (
  <div className="text-xs text-center p-4 pointer-events-none">
    <p className="font-medium text-gray-400">Ad Space</p>
    <p className="text-gray-400 mt-1">{position}</p>
  </div>
)}
```

### Step 2: Add Helper Functions to AdBanner.jsx

Add these functions inside the component:

```jsx
const getAdSlotId = () => {
  const slots = {
    'top-banner': 'YOUR_TOP_BANNER_SLOT_ID',
    'left-sidebar': 'YOUR_LEFT_SIDEBAR_SLOT_ID',
    'right-sidebar': 'YOUR_RIGHT_SIDEBAR_SLOT_ID',
    'results-separator-mobile': 'YOUR_MOBILE_SEPARATOR_SLOT_ID',
    'post-results-desktop': 'YOUR_POST_RESULTS_SLOT_ID',
    'pre-features-mobile': 'YOUR_PRE_FEATURES_SLOT_ID',
    'pre-faq': 'YOUR_PRE_FAQ_SLOT_ID',
    'post-faq': 'YOUR_POST_FAQ_SLOT_ID',
    'footer-banner': 'YOUR_FOOTER_SLOT_ID',
  }
  return slots[position] || ''
}

const getAdFormat = () => {
  if (type === 'vertical-sidebar') return 'vertical'
  if (type === 'medium-rectangle') return '300x250'
  return 'horizontal'
}
```

### Step 3: Test Locally

1. Set environment variable:
```bash
NODE_ENV=development npm run dev
```
Should see placeholder ads (grey boxes)

2. Build for production:
```bash
npm run build
```

3. Deploy to production

---

## Complete Updated AdBanner.jsx

Here's the complete updated file:

```jsx
/**
 * Ad Banner Placeholder for Google AdSense
 * Supports multiple ad formats: horizontal banners and vertical sidebars
 * Responsive design - hides ads on mobile, sticky sidebars on desktop
 * Shows actual AdSense ads in production, placeholders in development
 */

export default function AdBanner({ position = 'top', type = 'horizontal' }) {
  // Ad slot IDs from your AdSense dashboard
  const getAdSlotId = () => {
    const slots = {
      'top-banner': 'YOUR_TOP_BANNER_SLOT_ID',
      'left-sidebar': 'YOUR_LEFT_SIDEBAR_SLOT_ID',
      'right-sidebar': 'YOUR_RIGHT_SIDEBAR_SLOT_ID',
      'results-separator-mobile': 'YOUR_MOBILE_SEPARATOR_SLOT_ID',
      'post-results-desktop': 'YOUR_POST_RESULTS_SLOT_ID',
      'pre-features-mobile': 'YOUR_PRE_FEATURES_SLOT_ID',
      'pre-faq': 'YOUR_PRE_FAQ_SLOT_ID',
      'post-faq': 'YOUR_POST_FAQ_SLOT_ID',
      'footer-banner': 'YOUR_FOOTER_SLOT_ID',
    }
    return slots[position] || ''
  }

  // Determine ad format for AdSense
  const getAdFormat = () => {
    if (type === 'vertical-sidebar') return 'vertical'
    if (type === 'medium-rectangle') return '300x250'
    return 'horizontal'
  }

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
        {process.env.NODE_ENV === 'production' ? (
          // Production: Show actual AdSense ads
          <>
            <ins className="adsbygoogle"
              style={{display: 'block'}}
              data-ad-client="ca-pub-XXXXXXXXXXXX"
              data-ad-slot={getAdSlotId()}
              data-ad-format={getAdFormat()}
              data-full-width-responsive="true"></ins>
            <script>
              {`(adsbygoogle = window.adsbygoogle || []).push({});`}
            </script>
          </>
        ) : (
          // Development: Show placeholders
          <div className="text-xs text-center p-4 pointer-events-none">
            <p className="font-medium text-gray-400">Ad Space</p>
            <p className="text-gray-400 mt-1">{position}</p>
            <p className="text-gray-500 text-[10px] mt-2">{type}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## Verification Checklist

After implementation, verify:

- [ ] AdSense script tag added to index.html with Publisher ID
- [ ] AdBanner.jsx updated with all 9 slot IDs
- [ ] Ad slots created in AdSense dashboard
- [ ] Development build shows placeholder ads
- [ ] Production build shows actual AdSense code
- [ ] Top banner appears below header
- [ ] Left sidebar sticky on desktop (hidden on mobile)
- [ ] Right sidebar sticky on desktop (hidden on mobile)
- [ ] Mobile banner appears on results separator
- [ ] Post-results banner appears after compression
- [ ] Pre-features ad appears before features section
- [ ] Pre-FAQ ad appears before FAQ section
- [ ] Post-FAQ ad appears after FAQ section
- [ ] Footer banner appears at page bottom
- [ ] No layout shifts (CLS = 0)
- [ ] Page loads quickly (LCP < 2.5s)
- [ ] Sidebar ads stick while scrolling
- [ ] Sidebar ads hide on mobile
- [ ] Ads display in dark mode
- [ ] No console errors related to ads

---

## Troubleshooting

### Ads Not Displaying?

1. **Check Publisher ID**
   - Verify `ca-pub-XXXXXXXXXXXX` is in index.html
   - Verify it matches your AdSense account

2. **Check Slot IDs**
   - Verify 10-digit slot IDs in AdBanner.jsx
   - Verify slots exist in AdSense dashboard
   - Verify format matches slot type

3. **Check Environment**
   - Local development: should show grey placeholders
   - Production build: should show actual ads
   - Wait 24-48 hours for ads to populate

4. **Check Console**
   - Run `npm run dev` or `npm run build`
   - Open browser DevTools (F12)
   - Look for JavaScript errors
   - Check Network tab for adsbygoogle requests

### Ads Show Slowly?

1. Enable lazy loading in ads.css:
```css
.adsbygoogle {
  loading: lazy;
}
```

2. Verify AdSense script is async in index.html

3. Check Network Performance tab for ad loading time

### Layout Shifts (CLS)?

1. Ensure all ad containers have fixed dimensions
2. Verify ads.css is imported in main.jsx
3. Check that CSS contain property is applied

---

## Performance Tips

### Core Web Vitals

- **LCP**: Ads below fold, don't affect LCP ✅
- **FID**: AdSense script async, non-blocking ✅
- **CLS**: Fixed dimensions prevent shifts ✅

### Optimization

1. AdSense script loaded async:
```html
<script async src="...adsbygoogle.js..."></script>
```

2. Fixed ad dimensions prevent layout shifts

3. CSS containment prevents layout recalculations:
```css
.adsbygoogle { contain: layout style paint; }
```

4. Sidebar ads use sticky positioning (GPU accelerated)

---

## Revenue Optimization

### Best Practices

1. **Placement**: Above-the-fold and sticky ads earn more
2. **Format**: Sidebar ads typically have higher CTR
3. **Content**: Niche content (image compression) attracts quality ads
4. **Traffic**: US/UK traffic pays 2-3x more than other regions
5. **Freshness**: New content gets better ads

### Expected Revenue

- Top-tier traffic (US/UK): $5-15 CPM
- Mid-tier traffic (EU): $2-5 CPM
- Low-tier traffic (Rest of World): $0.50-2 CPM

With 100k monthly visitors:
- Conservative: $200-500/month
- Moderate: $500-1500/month
- Optimized: $1500-3000/month

---

## Support & Resources

- **AdSense Help**: https://support.google.com/adsense
- **Ad Formats**: https://support.google.com/adsense/answer/6307124
- **Responsive Ads**: https://support.google.com/adsense/answer/3213689
- **Core Web Vitals**: https://support.google.com/adsense/answer/11367051
- **Policy**: https://support.google.com/adsense/answer/48182

---

## Questions?

Refer to:
1. `ADSENSE_GUIDE.md` - Complete documentation
2. `src/components/AdBanner.jsx` - Source code with comments
3. `src/styles/ads.css` - Styling and responsive design
4. Google AdSense Help Center - Official support
