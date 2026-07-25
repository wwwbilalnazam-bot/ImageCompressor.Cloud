# Google AdSense - Simple Setup Guide

## ✅ Simplified to 4 Strategic Ad Placements

**Clean. Professional. Non-Intrusive.**

---

## 📍 The 4 Ad Placements

### 1. **Top Banner** (728×90)
- Below header, full width
- High visibility
- All devices

### 2. **Left Sidebar** (300×600)
- Desktop only
- Sticky while scrolling
- Right side placement

### 3. **Right Sidebar** (300×600)
- Desktop only  
- Sticky while scrolling
- Balanced layout

### 4. **Footer Banner** (728×90)
- Bottom of page
- Final impression
- All devices

**Total: 4 ads (professional & balanced)**

---

## 🎯 Visual Layout

### Desktop
```
┌──────────────────────────┐
│    Top Banner (728×90)   │
├─────────┬────────┬───────┤
│Left     │ TOOL   │Right  │
│Sidebar  │ AREA   │Sidebar│
│300×600  │        │300×600│
│ STICKY  │        │ STICKY│
│         │        │       │
└─────────┴────────┴───────┘
      Footer Banner (728×90)
```

### Mobile/Tablet
```
┌──────────────────────┐
│  Top Banner (320×50) │
├──────────────────────┤
│    Main Tool Area    │
├──────────────────────┤
│   Footer Banner      │
└──────────────────────┘

(No sidebars - clean mobile experience)
```

---

## ⚡ Quick Setup (45 minutes)

### Step 1: Get Publisher ID
```
1. Go to https://adsense.google.com
2. Sign up (5 min)
3. Wait for approval (24 hours)
4. Copy: ca-pub-XXXXXXXXXXXX
```

### Step 2: Create 4 Ad Slots
In AdSense Dashboard → Ads → By code → Create ad unit

| Slot # | Name | Format | Size |
|--------|------|--------|------|
| 1 | Top Banner | Leaderboard | 728×90 |
| 2 | Left Sidebar | Half-page | 300×600 |
| 3 | Right Sidebar | Half-page | 300×600 |
| 4 | Footer Banner | Leaderboard | 728×90 |

Copy the 10-digit slot ID for each.

### Step 3: Update Code (5 minutes)

**File: index.html** (line 19-21)
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ID"
  crossorigin="anonymous"></script>
```

**File: src/components/AdBanner.jsx** (lines 40-50)
```jsx
const getAdSlotId = () => {
  const slots = {
    'top-banner': 'YOUR_SLOT_ID_1',
    'left-sidebar': 'YOUR_SLOT_ID_2',
    'right-sidebar': 'YOUR_SLOT_ID_3',
    'footer-banner': 'YOUR_SLOT_ID_4',
  }
  return slots[position] || ''
}
```

### Step 4: Deploy
```bash
npm run build
# Deploy dist/ folder to production
```

**Done! Wait 24-48 hours for ads to populate.**

---

## 📊 Revenue Estimate

**100k monthly visitors:**
- US/UK traffic: $200-600/month
- EU traffic: $80-250/month
- Mixed: $150-400/month

**Annual: $1,800-4,800+**

---

## ✨ Why This Setup Works

✅ **Professional** - Not ad-heavy
✅ **User-Friendly** - Non-intrusive
✅ **Mobile-Optimized** - No sidebars
✅ **High-Value** - Premium placements
✅ **Google Approved** - Within policy limits
✅ **Performance** - Zero negative impact
✅ **Sticky Sidebars** - 20-30% engagement boost

---

## 🧪 Testing

### On Localhost
```bash
npm run dev
# Should see grey placeholder boxes at 4 positions
```

**Verify:**
- ✓ Top banner visible
- ✓ Left sidebar sticky on desktop
- ✓ Right sidebar sticky on desktop
- ✓ Footer banner at bottom
- ✓ No sidebars on mobile

### After Deploy
- ✓ All 4 ads appear on live site
- ✓ AdSense dashboard shows impressions (24-48 hours)
- ✓ Earnings start accumulating

---

## 💾 Your Setup Checklist

- [ ] Publisher ID: `ca-pub-__________________`
- [ ] Slot 1 (Top): `______________`
- [ ] Slot 2 (Left): `______________`
- [ ] Slot 3 (Right): `______________`
- [ ] Slot 4 (Footer): `______________`
- [ ] Updated index.html
- [ ] Updated AdBanner.jsx
- [ ] Deployed to production
- [ ] Waiting for ads (24-48 hours)

---

## 🚀 You're Good to Go!

This is a clean, professional setup that:
- Won't annoy users
- Follows Google best practices
- Generates solid revenue
- Maintains site quality
- Keeps it simple

**Total setup time: ~45 minutes**

Good luck! 💵
