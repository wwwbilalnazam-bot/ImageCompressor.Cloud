# Google AdSense Setup - Printable Checklist

## Phase 1: Get AdSense Account ⏱️ ~24 hours

### Step 1: Sign Up
- [ ] Go to https://adsense.google.com
- [ ] Click "Sign Up Now"
- [ ] Sign in with Google account
- [ ] Enter website URL: `imagecompressor.cloud`
- [ ] Select country
- [ ] Accept terms & conditions
- [ ] Click "Create Account"

### Step 2: Wait for Approval
- [ ] Check email for AdSense approval notification
- [ ] Typically takes 24 hours
- [ ] Utility sites usually approved within 24 hours
- [ ] Note: Must wait for approval before continuing

### Step 3: Get Publisher ID
- [ ] Log in to AdSense
- [ ] Go to **Settings → Account**
- [ ] Find **Publisher ID** (format: `ca-pub-XXXXXXXXXXXX`)
- [ ] Copy Publisher ID to clipboard
- [ ] **Save this ID securely**

---

## Phase 2: Configure Code (30 minutes) ⏱️ ~30 mins

### Step 4: Update index.html
File: `index.html` (line 19-21)

```html
FIND THIS:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx"
  crossorigin="anonymous"></script>

REPLACE WITH YOUR PUBLISHER ID:
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ID-HERE"
  crossorigin="anonymous"></script>
```

- [ ] Open `index.html` in editor
- [ ] Find line with `adsbygoogle.js`
- [ ] Replace `ca-pub-xxxxxxxxxxxxxxxx` with your actual Publisher ID
- [ ] Save file
- [ ] Verify: Script tag should now have your real Publisher ID

**Your Publisher ID:** `ca-pub-_____________________`

---

## Phase 3: Create Ad Slots (20 minutes) ⏱️ ~20 mins

### Step 5: Create 9 Ad Units in AdSense Dashboard

For each ad below:
1. Go to **Ads → By code → Create new ad unit**
2. Enter the Slot Name
3. Select the format from Format list
4. Click "Create"
5. Copy the **Ad slot ID** (10-digit number)
6. Paste slot ID in the "Your ID" column below

#### Ad Slot 1: Homepage Top Banner
- [ ] Slot Name: `Homepage Top Banner`
- [ ] Format: `Leaderboard (728x90)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 2: Left Sidebar
- [ ] Slot Name: `Left Sidebar Ad`
- [ ] Format: `Half-page ad (300x600)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 3: Right Sidebar
- [ ] Slot Name: `Right Sidebar Ad`
- [ ] Format: `Half-page ad (300x600)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 4: Mobile Results Separator
- [ ] Slot Name: `Mobile Results Separator`
- [ ] Format: `Mobile banner (320x50)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 5: Post Results Banner
- [ ] Slot Name: `Post Results Banner`
- [ ] Format: `Leaderboard (728x90)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 6: Mobile Features Promo
- [ ] Slot Name: `Mobile Features Promo`
- [ ] Format: `Medium rectangle (300x250)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 7: Pre-FAQ Banner
- [ ] Slot Name: `Pre-FAQ Banner`
- [ ] Format: `Leaderboard (728x90)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 8: Post-FAQ Banner
- [ ] Slot Name: `Post-FAQ Banner`
- [ ] Format: `Leaderboard (728x90)`
- [ ] Your Slot ID: `______________`

#### Ad Slot 9: Footer Banner
- [ ] Slot Name: `Footer Banner`
- [ ] Format: `Leaderboard (728x90)`
- [ ] Your Slot ID: `______________`

**✓ All 9 slots created**

---

## Phase 4: Update Code with Slot IDs (15 minutes) ⏱️ ~15 mins

### Step 6: Update AdBanner.jsx
File: `src/components/AdBanner.jsx` (lines 40-50)

Replace this section:
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
```

With your actual slot IDs:
```jsx
const getAdSlotId = () => {
  const slots = {
    'top-banner': '[Slot 1 ID]',
    'left-sidebar': '[Slot 2 ID]',
    'right-sidebar': '[Slot 3 ID]',
    'results-separator-mobile': '[Slot 4 ID]',
    'post-results-desktop': '[Slot 5 ID]',
    'pre-features-mobile': '[Slot 6 ID]',
    'pre-faq': '[Slot 7 ID]',
    'post-faq': '[Slot 8 ID]',
    'footer-banner': '[Slot 9 ID]',
  }
  return slots[position] || ''
}
```

Steps:
- [ ] Open `src/components/AdBanner.jsx`
- [ ] Find the `getAdSlotId` function
- [ ] Replace each `YOUR_*_SLOT_ID` with actual 10-digit slot IDs
- [ ] Make sure each slot ID matches the one from AdSense
- [ ] Save file

**Verification:**
- [ ] All 9 slot IDs added
- [ ] No `YOUR_` prefixes remaining
- [ ] All IDs are 10-digit numbers
- [ ] File saved

---

## Phase 5: Test Locally (15 minutes) ⏱️ ~15 mins

### Step 7: Test Development Build

- [ ] Open terminal in project directory
- [ ] Run: `npm run dev`
- [ ] Wait for server to start (localhost:5173)
- [ ] Open browser and go to dev site

### Step 8: Verify Ad Placements (Development Mode)

On localhost, you should see grey placeholder boxes for:

**Homepage (desktop):**
- [ ] Top banner (728×90) - below header
- [ ] Left sidebar (300×600) - left side, sticky
- [ ] Right sidebar (300×600) - right side, sticky
- [ ] Pre-FAQ banner - above FAQ
- [ ] Post-FAQ banner - below FAQ
- [ ] Footer banner - at bottom

**Homepage (mobile - resize to 375px):**
- [ ] Top banner - below header
- [ ] Results separator - when you compress an image
- [ ] Pre-features rectangle (300×250) - before features
- [ ] Pre-FAQ banner - above FAQ
- [ ] Post-FAQ banner - below FAQ
- [ ] Footer banner - at bottom
- [ ] NO sidebars visible

**Test Tool Functionality:**
- [ ] Upload image works
- [ ] Compression works
- [ ] Download works (not blocked by ads)
- [ ] All buttons clickable
- [ ] No console errors (F12 → Console tab)

---

## Phase 6: Deploy to Production (30 minutes) ⏱️ ~30 mins

### Step 9: Build for Production

- [ ] Stop development server (Ctrl+C)
- [ ] Run: `npm run build`
- [ ] Wait for build to complete
- [ ] Should see "dist/" folder created

### Step 10: Deploy

Depending on your hosting:

**Vercel:**
- [ ] Push to GitHub
- [ ] Vercel auto-deploys
- [ ] Verify live site loads

**Netlify:**
- [ ] Push to GitHub
- [ ] Netlify auto-deploys
- [ ] Verify live site loads

**Manual hosting:**
- [ ] Upload `dist/` folder to server
- [ ] Set web root to `dist/`
- [ ] Verify live site loads

### Step 11: Verify Production Deployment

- [ ] Visit your production URL
- [ ] Confirm ads load (may show AdSense placeholders at first)
- [ ] Test all 9 placements visible
- [ ] Check responsive (mobile/tablet/desktop)
- [ ] No console errors

---

## Phase 7: Monitor & Verify (Ongoing) 📊

### Step 12: Wait for Ad Population (24-48 hours)

- [ ] Keep track of time deployed
- [ ] Google needs 24-48 hours to populate ads
- [ ] Ads will gradually appear during this period
- [ ] Some placements may get ads before others

### Step 13: Check AdSense Dashboard

After 24-48 hours:
- [ ] Log into AdSense
- [ ] Go to **Home**
- [ ] Check for impressions and earnings
- [ ] Should see numbers increasing

### Step 14: Monitor Performance

Daily:
- [ ] Check earnings in AdSense dashboard
- [ ] Verify all ads displaying
- [ ] Monitor for policy violations (if any)

Weekly:
- [ ] Review earnings trend
- [ ] Check Core Web Vitals score
- [ ] Monitor site performance

---

## Quality Assurance Checklist

### Desktop (1920px width)
- [ ] Top banner visible
- [ ] Left sidebar visible and sticky
- [ ] Right sidebar visible and sticky
- [ ] Results section loads
- [ ] Post-results banner appears
- [ ] FAQ section visible
- [ ] Pre-FAQ banner visible
- [ ] Post-FAQ banner visible
- [ ] Footer banner visible
- [ ] Page scrolls smoothly
- [ ] No layout shifts

### Tablet (768px width)
- [ ] Top banner visible
- [ ] NO left sidebar
- [ ] NO right sidebar
- [ ] Mobile results separator visible
- [ ] Pre-features rectangle visible
- [ ] All horizontal banners responsive
- [ ] Page scrolls smoothly

### Mobile (375px width)
- [ ] Top banner visible and responsive
- [ ] Results separator visible
- [ ] Pre-features rectangle visible
- [ ] No sidebars present
- [ ] All ads responsive width
- [ ] Text readable
- [ ] Download button accessible
- [ ] No horizontal scroll needed

### Dark Mode
- [ ] All ads visible in dark mode
- [ ] Colors blend properly
- [ ] Text readable

### Functionality
- [ ] Upload works
- [ ] Compression works
- [ ] Download not blocked
- [ ] No console errors
- [ ] Images display correctly
- [ ] Links work

---

## Troubleshooting Checklist

### Ads Not Showing?
- [ ] Publisher ID correct in index.html?
- [ ] Slot IDs correct in AdBanner.jsx?
- [ ] AdSense account approved?
- [ ] All 9 slots created in dashboard?
- [ ] Waiting 24-48 hours?
- [ ] Check browser console (F12) for errors

### Slow Loading?
- [ ] AdSense script is async (already done)
- [ ] Check Network tab (F12) for slow requests
- [ ] Verify Core Web Vitals not affected

### Layout Shifts?
- [ ] CSS file imported (ads.css)?
- [ ] All ad dimensions specified?
- [ ] No CSS conflicts?

### Other Issues?
- [ ] Rebuild: `npm run build`
- [ ] Clear cache: Ctrl+Shift+Delete
- [ ] Redeploy application
- [ ] Check Google AdSense Help Center

---

## Success Criteria

✅ **Task Complete When:**

- [ ] Publisher ID added to index.html
- [ ] All 9 slot IDs added to AdBanner.jsx
- [ ] Code deployed to production
- [ ] All 9 ads visible on live site
- [ ] AdSense dashboard shows impressions
- [ ] No policy violations

✅ **Revenue Generation When:**

- [ ] 24-48 hours after deployment
- [ ] Ads start serving
- [ ] Earnings appear in AdSense dashboard
- [ ] Revenue accumulates based on traffic

---

## Quick Reference: Your Credentials

**Publisher ID:**
```
ca-pub-_____________________
```

**Slot IDs:**
```
top-banner:                 ______________
left-sidebar:              ______________
right-sidebar:             ______________
results-separator-mobile:  ______________
post-results-desktop:      ______________
pre-features-mobile:       ______________
pre-faq:                   ______________
post-faq:                  ______________
footer-banner:             ______________
```

---

## Time Summary

| Phase | Task | Time | Status |
|---|---|---|---|
| 1 | AdSense Signup | 5 min | ⏳ Waiting 24h |
| 1 | Wait for Approval | 24 hours | ⏳ In Progress |
| 2 | Update index.html | 5 min | ⏳ Ready |
| 3 | Create Ad Slots | 20 min | ⏳ Ready |
| 4 | Update AdBanner.jsx | 10 min | ⏳ Ready |
| 5 | Test Locally | 15 min | ⏳ Ready |
| 6 | Deploy | 15 min | ⏳ Ready |
| 7 | Wait for Ads | 24-48 hours | ⏳ Ready |
| 7 | Monitor & Verify | Ongoing | ✅ Done |

**Total Setup Time:** ~2 hours (plus 24-48 hour wait for ads)

---

## Support Resources

- **This Checklist:** Use to track progress
- **ADSENSE_QUICK_REFERENCE.md:** Quick guide
- **ADSENSE_IMPLEMENTATION.md:** Detailed steps
- **ADSENSE_GUIDE.md:** Complete documentation
- **Code Comments:** In AdBanner.jsx
- **AdSense Help:** https://support.google.com/adsense

---

## Sign-Off Checklist

After completing all steps:

- [ ] All tasks completed
- [ ] Site deployed to production
- [ ] Ads visible on live site
- [ ] AdSense dashboard shows impressions
- [ ] Ready to start earning revenue

**Date Completed:** _______________

**Publisher ID Saved:** ☐ Yes ☐ No

**Notes:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

---

✨ **You're all set! Ads are now live on your site.** ✨

Monitor your earnings at https://adsense.google.com
