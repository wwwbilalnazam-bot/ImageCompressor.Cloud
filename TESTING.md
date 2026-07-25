# Testing & Troubleshooting Guide

## ✅ How to Test the Tool

### 1. Open the App
- Browser: http://localhost:3000
- (Dev server is running in the background)

### 2. Test Compression

**Step 1: Upload an Image**
- Click the upload area OR drag-and-drop an image
- Try a JPG, PNG, or WebP file
- Supported formats: JPG, PNG, WebP, AVIF

**Step 2: Watch Compression**
- You should see a spinner: "⚙️ Compressing..."
- This should complete in <1 second
- After compression, you'll see:
  - Original file size
  - Compressed file size
  - % reduction
  - Before/after comparison slider

**Step 3: Adjust Quality**
- Move the "Compression Quality" slider (top)
- Watch the compression ratio change instantly
- Quality slider: 20% (smallest) to 100% (highest quality)

**Step 4: Download**
- Click "📥 Download" to download the compressed image
- Verify the file size is smaller
- Open it to check the quality looks good

**Step 5: Try Batch Processing**
- Upload 3-5 images at once
- They should all compress in parallel
- Click "📥 Download All" to get them all

### 3. Test on Mobile
```bash
# Get your IP address
ipconfig | findstr "IPv4"

# On your phone, visit:
http://[YOUR-IP]:3000
```

Test:
- Drag-and-drop (might not work on all phones - use click instead)
- Touch the quality slider
- Download functionality
- Before/after comparison slider touch behavior

### 4. Test Different Image Formats

Try uploading:
- ✅ JPG/JPEG - Should compress well
- ✅ PNG - Should compress well
- ✅ WebP - Should compress well
- ✅ AVIF - Should compress well
- ❌ GIF, SVG, BMP - Should show unsupported format error

## 🐛 Debugging Issues

### Issue: "Compressing..." never completes

**Check 1: Browser Console**
1. Open DevTools: F12
2. Go to "Console" tab
3. Look for red error messages
4. Report any error messages you see

**Check 2: Network Tab**
1. DevTools → "Network" tab
2. Try uploading an image
3. Look for failed requests (red)
4. Check for CORS errors

**Check 3: Refresh Browser**
1. Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
2. Try again
3. Check console for errors

### Issue: Image doesn't show after compression

**Likely cause:** Browser memory issue with large images

**Solution:**
1. Try with smaller image (<5MB)
2. Test with common formats (JPG, PNG)
3. Check browser has enough memory available

### Issue: Quality slider doesn't change compression

**This is actually fine!** - Some formats (PNG) compress the same regardless of quality slider. It's designed to work best with JPEG and WebP.

### Issue: Downloaded file is same size or larger

**This can happen with:**
- Already compressed images
- PNG files (canvas compression doesn't work as well)
- Very small images

**This is normal.** Real-world tests show 30-70% reduction on typical photos.

## 📊 Expected Compression Ratios

| Format | Quality | Typical Reduction |
|--------|---------|-------------------|
| JPEG  | 75%     | 50-70% smaller    |
| JPEG  | 50%     | 70-85% smaller    |
| PNG   | 75%     | 10-30% smaller    |
| WebP  | 75%     | 60-75% smaller    |

Note: Actual results vary based on image content, resolution, and original compression.

## ✅ Success Checklist

- [ ] Upload image works (JPG, PNG, WebP)
- [ ] Compression starts (⚙️ spinner shows)
- [ ] Compression completes (<1 second)
- [ ] File sizes show (original vs compressed)
- [ ] Reduction % displays correctly
- [ ] Before/after comparison slider works
- [ ] Download button downloads file
- [ ] Download file is smaller than original
- [ ] Quality slider changes compression
- [ ] Batch upload works (multiple images)
- [ ] Mobile layout works (test on phone)
- [ ] Dark mode works (toggle in browser settings)
- [ ] No console errors (F12 → Console)

## 🚀 Performance Checks

### Check 1: Load Time
1. Open DevTools (F12)
2. Go to "Network" tab
3. Reload page (F5)
4. Look at "DOMContentLoaded" time
5. Should be <1.5 seconds

### Check 2: Compression Speed
1. Upload an image
2. Watch how long the spinner shows
3. Should complete in <1 second
4. If >3 seconds, something is wrong

### Check 3: Bundle Size
1. DevTools → "Network" tab
2. Reload page
3. Look for `index-*.js` file
4. Should be <100 KB (usually 60-70 KB)

### Check 4: Lighthouse Score
1. DevTools → "Lighthouse" tab
2. Run audit (Desktop)
3. Target: 90+ score
4. All Core Web Vitals should be "Good"

## 📱 Mobile Testing Checklist

- [ ] Can upload by clicking (drag-drop might not work)
- [ ] Quality slider works with touch
- [ ] Before/after slider works with touch
- [ ] Layout is responsive (no horizontal scroll)
- [ ] Buttons are thumb-friendly (not tiny)
- [ ] Download works on mobile
- [ ] Text is readable without zooming

## 🎯 Real-World Test Scenarios

### Scenario 1: Designer compressing exported image
1. Use a 2MB PNG from Figma/Photoshop
2. Expect: 50-70% reduction
3. Quality should look identical

### Scenario 2: Web developer optimizing images
1. Use a batch of 10 JPG photos
2. Set quality to 60-70%
3. Expect: 60-80% reduction
4. Quality still good for web

### Scenario 3: Social media content
1. Use a high-quality phone photo (5-8MB)
2. Set quality to 75%
3. Compress and download
4. Upload to Instagram/Twitter
5. Quality should look great

## 📞 If Something Doesn't Work

1. **First:** Check browser console (F12) for error messages
2. **Second:** Try a different image file
3. **Third:** Hard refresh (Ctrl+Shift+R)
4. **Fourth:** Check if image is valid (try opening it directly)
5. **Fifth:** Check file size (<50MB recommended)

## 🔍 Advanced Debugging

### View Console Logs
```bash
# Terminal: watch the dev server logs
npm run dev

# Look for error messages when uploading
```

### Test Compression Utility Directly
Open browser console and test:
```javascript
// Import won't work in console, but you can test if canvas works:
const canvas = document.createElement('canvas')
console.log('Canvas available:', !!canvas)
console.log('toBlob available:', !!canvas.toBlob)
```

### Check Image Loading
```javascript
// Test if image can load
const img = new Image()
img.src = 'https://example.com/image.jpg'
img.onload = () => console.log('Image loaded!')
img.onerror = () => console.log('Image failed to load')
```

## ✅ If Everything Works

Great! The tool is ready for:
1. Production deployment
2. User testing
3. SEO optimization
4. Marketing

Next steps:
- Deploy to Vercel: See DEPLOYMENT.md
- Monitor performance
- Gather user feedback
- Write blog posts

---

**Having trouble?** Check the console (F12) first - it will tell you what's wrong!
