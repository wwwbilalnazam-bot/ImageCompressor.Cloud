# Google AdSense Implementation Guide

## Overview
This document explains the complete AdSense ad placement strategy for the Image Compressor tool. The layout follows Google's best practices for user experience and Core Web Vitals compliance.

---

## Ad Placement Strategy

### Desktop Layout (8-10 ad slots)

#### 1. **Top Banner Ad** (`top-banner`)
- **Format:** 728x90 horizontal banner (leaderboard)
- **Location:** Below header, above main content
- **Position:** Full-width, responsive
- **Spacing:** 24px vertical margin
- **Component:** `AdBanner` position="top-banner" type="horizontal-banner"
- **Best for:** High visibility, announcement-style ads

#### 2. **Left Sidebar Ad** (`left-sidebar`)
- **Format:** 300x600 vertical sidebar (half-page)
- **Location:** Left side of main content (desktop only)
- **Behavior:** Sticky while scrolling (sticky top-24)
- **Hidden:** On tablets and mobile (hidden via `lg:` breakpoint)
- **Spacing:** Maintains 16-24px gap from content
- **Component:** `AdBanner` position="left-sidebar" type="vertical-sidebar"
- **Best for:** Building trust, brand awareness

#### 3. **Right Sidebar Ad** (`right-sidebar`)
- **Format:** 300x600 vertical sidebar (half-page)
- **Location:** Right side of main content (desktop only)
- **Behavior:** Sticky while scrolling (sticky top-24)
- **Hidden:** On tablets and mobile (hidden via `lg:` breakpoint)
- **Spacing:** Maintains 16-24px gap from content
- **Component:** `AdBanner` position="right-sidebar" type="vertical-sidebar"
- **Best for:** Balanced layout, dual monetization

#### 4. **Results Separator Mobile Ad** (`results-separator-mobile`)
- **Format:** 320x50 mobile banner
- **Location:** Between upload section and results (mobile only)
- **Visibility:** Only when results are shown
- **Class:** `lg:hidden` - shown only on mobile/tablet
- **Purpose:** Natural break point in user flow
- **Component:** `AdBanner` position="results-separator-mobile" type="horizontal-banner"

#### 5. **Post-Results Desktop Ad** (`post-results-desktop`)
- **Format:** 728x90 horizontal banner
- **Location:** Below results section
- **Visibility:** Only when results are shown, only on desktop
- **Class:** `hidden lg:block` - desktop only
- **Purpose:** Capture user attention after viewing results
- **Component:** `AdBanner` position="post-results-desktop" type="horizontal-banner"

#### 6. **Pre-Features Mobile Ad** (`pre-features-mobile`)
- **Format:** 300x250 medium rectangle (MPU)
- **Location:** Before features section
- **Visibility:** Mobile and tablet only
- **Class:** `lg:hidden` - mobile/tablet only
- **Purpose:** Bridge between tool and marketing content
- **Component:** `AdBanner` position="pre-features-mobile" type="medium-rectangle"

#### 7. **Pre-FAQ Ad** (`pre-faq`)
- **Format:** 728x90 horizontal banner
- **Location:** Immediately before FAQ section
- **Visibility:** All devices
- **Spacing:** 24-32px vertical padding
- **Purpose:** High engagement before FAQ (common user question area)
- **Component:** `AdBanner` position="pre-faq" type="horizontal-banner"

#### 8. **Post-FAQ Ad** (`post-faq`)
- **Format:** 728x90 horizontal banner
- **Location:** Immediately after FAQ section
- **Visibility:** All devices
- **Spacing:** 24-32px vertical padding
- **Purpose:** Capture attention of satisfied users
- **Component:** `AdBanner` position="post-faq" type="horizontal-banner"

#### 9. **Footer Banner Ad** (`footer-banner`)
- **Format:** 728x90 horizontal banner
- **Location:** Bottom of page, before footer
- **Visibility:** All devices
- **Spacing:** 24px vertical margin
- **Purpose:** Last impression before leaving site
- **Component:** `AdBanner` position="footer-banner" type="horizontal-banner"

---

## Responsive Breakpoints

### Desktop (1024px and up)
- ✅ Left sidebar ad (sticky)
- ✅ Right sidebar ad (sticky)
- ✅ All horizontal banners
- ✅ No mobile-specific ads

### Tablet (768px - 1023px)
- ❌ Sidebar ads (hidden)
- ✅ All horizontal banners (responsive)
- ✅ Mobile-specific ads

### Mobile (< 768px)
- ❌ Sidebar ads (hidden)
- ✅ Horizontal banners (responsive)
- ✅ Medium rectangles (responsive)

---

## How to Add AdSense Code

### Step 1: Enable AdSense on Your Google Account
1. Go to [Google AdSense](https://adsense.google.com)
2. Sign up for an AdSense account
3. Add your website
4. Wait for approval (typically 24 hours)

### Step 2: Get Your Publisher ID
1. After approval, go to **Settings → Account**
2. Copy your **Publisher ID** (format: `ca-pub-xxxxxxxxxxxxxxxx`)

### Step 3: Create Ad Slots
1. Go to **Ads → By code → Create new ad unit**
2. Create ad units for each slot you need:
   - Leaderboard (728x90)
   - Half-page ad (300x600)
   - Medium rectangle (300x250)
   - Mobile banner (320x50)
3. Copy the **Ad slot ID** (format: `xxxxxxxxxx`)

### Step 4: Add AdSense Script Tag to HTML Head

In your `index.html` (in the `<head>` section), add:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
  crossorigin="anonymous"></script>
```

Replace `ca-pub-xxxxxxxxxxxxxxxx` with your Publisher ID.

### Step 5: Update AdBanner Component

Edit `src/components/AdBanner.jsx` and replace the comment section with actual AdSense code:

```jsx
<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
  data-ad-slot="1234567890"
  data-ad-format="auto"
  data-full-width-responsive="true"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

Or use conditional rendering to only show ads in production:

```jsx
{process.env.NODE_ENV === 'production' && (
  <>
    <ins className="adsbygoogle" ... />
    <script>{(adsbygoogle = window.adsbygoogle || []).push({});}</script>
  </>
)}
```

### Example for One Ad Slot

Update the AdBanner component with actual slot IDs:

```jsx
const getAdSlotId = () => {
  const slots = {
    'top-banner': '1234567890',
    'left-sidebar': '1234567891',
    'right-sidebar': '1234567892',
    'results-separator-mobile': '1234567893',
    'post-results-desktop': '1234567894',
    'pre-features-mobile': '1234567895',
    'pre-faq': '1234567896',
    'post-faq': '1234567897',
    'footer-banner': '1234567898',
  }
  return slots[position]
}

return (
  <div className={...}>
    {process.env.NODE_ENV === 'production' && (
      <>
        <ins className="adsbygoogle"
          style={{display: 'block'}}
          data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
          data-ad-slot={getAdSlotId()}
          data-ad-format={getAdFormat()}
          data-full-width-responsive="true"></ins>
        <script>
          {`(adsbygoogle = window.adsbygoogle || []).push({});`}
        </script>
      </>
    )}
    {/* Placeholder for development */}
    {process.env.NODE_ENV !== 'production' && (
      <div className="...">Placeholder - {position}</div>
    )}
  </div>
)
```

---

## Core Web Vitals Optimization

### Largest Contentful Paint (LCP)
- ✅ Ads are below the fold (except top banner)
- ✅ Ad elements don't affect main content LCP
- ✅ Lazy loading enabled for below-fold ads

### Cumulative Layout Shift (CLS)
- ✅ Fixed ad dimensions prevent layout shifts
- ✅ Sidebar ads use sticky positioning (no shift)
- ✅ Proper spacing with margin classes

### First Input Delay (FID)
- ✅ Ads don't block main thread
- ✅ AdSense script loaded asynchronously
- ✅ Ad rendering non-blocking

### Implementation Tips:
1. Use `async` attribute on AdSense script
2. Specify fixed dimensions for all ads
3. Use CSS containment: `contain: layout style paint`
4. Monitor Core Web Vitals in Google Search Console

---

## Best Practices & Google AdSense Policies

### ✅ Do:
1. ✅ Space ads properly (at least 16px minimum)
2. ✅ Use natural ad placements (not disruptive)
3. ✅ Maintain high-quality content around ads
4. ✅ Avoid blinking or animated ads
5. ✅ Test ads on mobile and desktop
6. ✅ Monitor performance regularly
7. ✅ Update ads for relevance
8. ✅ Use responsive ad formats

### ❌ Don't:
1. ❌ Place ads above the fold excessively
2. ❌ Use clickbait-style CTAs
3. ❌ Place ads too close to buttons/CTAs
4. ❌ Mislead users about ad content
5. ❌ Block important functionality with ads
6. ❌ Use adult or violent content near ads
7. ❌ Implement auto-playing sounds
8. ❌ Use confusing ad styling

---

## File Structure

```
src/
├── components/
│   ├── AdBanner.jsx          ← Main ad component (update with ad codes)
│   ├── AdLayoutWrapper.jsx   ← Optional layout wrapper
│   └── ...
├── pages/
│   ├── MainCompressorPremium.jsx    ← Main tool with ads
│   ├── CompressTo20KB.jsx           ← Variant pages (apply same pattern)
│   └── ...
└── ...
```

---

## Testing Checklist

### Before Production:
- [ ] Test all 9 ad slots appear correctly
- [ ] Verify responsive behavior on mobile (375px)
- [ ] Verify responsive behavior on tablet (768px)
- [ ] Verify responsive behavior on desktop (1920px)
- [ ] Ensure sidebar ads are sticky
- [ ] Confirm mobile ads hidden on desktop
- [ ] Test download functionality still works
- [ ] Check for layout shifts (CLS)
- [ ] Verify Core Web Vitals scores
- [ ] Test on multiple browsers
- [ ] Validate HTML/CSS for errors

### After AdSense Approval:
- [ ] Add Publisher ID to index.html
- [ ] Create all ad slots in AdSense dashboard
- [ ] Update AdBanner component with slot IDs
- [ ] Deploy to production
- [ ] Monitor earnings dashboard
- [ ] Check for policy violations
- [ ] Monitor performance metrics

---

## Monetization Estimate

With proper placement and quality traffic:
- **Top Banner**: High CPM (Cost Per Mille) - 500k+ impressions
- **Sidebar Ads**: Medium-High CPM - 200k+ impressions each
- **Mid-page Ads**: Medium CPM - 300k+ impressions
- **Footer Ad**: Low CPM - 150k+ impressions

**Typical Revenue**: $5-15 CPM (depending on traffic quality and geography)

---

## Troubleshooting

### Ads Not Showing?
1. Verify Publisher ID is correct
2. Check browser console for errors
3. Verify slot IDs match AdSense dashboard
4. Wait 24-48 hours for ads to populate
5. Check AdSense account status

### Layout Shifts?
1. Ensure fixed dimensions on all ads
2. Check for missing `display: block`
3. Verify margin/padding values
4. Test with CSS containment

### Slow Page Load?
1. Verify AdSense script is async
2. Check for multiple script tags
3. Verify ad sizes aren't too large
4. Consider lazy loading below-fold ads

---

## Additional Resources

- [Google AdSense Help Center](https://support.google.com/adsense)
- [Ad Formats Guide](https://support.google.com/adsense/answer/6307124)
- [Responsive Ads Guide](https://support.google.com/adsense/answer/3213689)
- [Core Web Vitals Guide](https://support.google.com/adsense/answer/11367051)
- [Policy Compliance](https://support.google.com/adsense/answer/48182)

---

## Support

For questions about this implementation, refer to the code comments in:
- `src/components/AdBanner.jsx` - Main ad component
- `src/pages/MainCompressorPremium.jsx` - Page integration example

Each ad placement has inline comments marking the ad space location and format.
