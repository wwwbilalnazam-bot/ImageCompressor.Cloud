# Deployment Guide

## Quick Deploy to Vercel (Recommended)

Vercel is the fastest, easiest way to deploy. Free tier includes:
- Automatic deployment on every git push
- Zero-config Next.js/Vite support
- Global CDN
- Unlimited bandwidth

### Steps:

1. **Sign up** at https://vercel.com (free, GitHub login)
2. **Connect your repository** to Vercel
3. **Import project** - Vercel auto-detects Vite
4. **Configure domain** - Point `imagecompressor.cloud` to Vercel
5. **Deploy** - Automatic on every push

**That's it.** Your site is live globally.

### Environment Variables (if needed)

No env vars needed for MVP. Add later if using APIs for analytics, etc.

## Manual Deployment

### Build locally first:

```bash
npm run build
```

This creates optimized files in `dist/` folder (~50 KB total).

### Option A: Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Option B: Deploy to GitHub Pages

```bash
# Add to package.json
"deploy": "npm run build && gh-pages -d dist"

# Deploy
npm run deploy
```

### Option C: Static Hosting (AWS S3 + CloudFront)

1. Create S3 bucket
2. Upload `dist/` folder
3. Set up CloudFront for CDN
4. Cost: ~$5/month for millions of requests

## Production Checklist

- [ ] Domain configured (DNS pointing to CDN)
- [ ] HTTPS enabled (automatic with Vercel/Netlify)
- [ ] Build passes Lighthouse 90+
- [ ] All Core Web Vitals are "Good"
- [ ] Mobile rendering tested (iOS + Android)
- [ ] 404 page configured
- [ ] Sitemap.xml generated
- [ ] Google Search Console set up
- [ ] Analytics configured
- [ ] Privacy policy page live
- [ ] No console errors in production build

## Monitoring Production

### Check These Weekly:

1. **Google Search Console**
   - Impressions for target keywords
   - Click-through rate (CTR)
   - Average position in search results

2. **Lighthouse**
   - Run monthly in Google PageSpeed Insights
   - Monitor Core Web Vitals

3. **Vercel Analytics** (if using)
   - Page load times
   - Edge cache hit rate
   - Bandwidth usage

### Monitor Traffic

- Plausible Analytics dashboard
- See: top pages, referrers, devices, countries

## Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Vercel  | $0-20 | Free tier generous, pay only if >150GB/month |
| Domain  | $12  | Yearly via Namecheap or Google Domains |
| Analytics | $25 | Plausible Analytics (privacy-focused) |
| **Total** | **~$40-50/month** | Or $0-20 if analytics free tier |

## Scaling (When Traffic Grows)

At 100K+ monthly users:
- Vercel Pro ($20/mo) for higher limits
- Consider Plausible paid plan ($20/mo)
- Potentially add CDN cache headers

Still under $100/month, while competitors spend $1000s.

## CI/CD Pipeline (Optional)

Set up GitHub Actions to run tests on every commit:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run build
      - run: npm run lint
```

## Troubleshooting

### Build fails locally but works on Vercel?
- Check Node version: `node --version` (should be 18+)
- Clear cache: `npm cache clean --force`
- Reinstall: `rm -rf node_modules && npm install`

### Site shows 404 after deployment?
- Check `dist/index.html` exists
- Vercel settings: make sure output directory is `dist`

### Slow load times?
- Check Lighthouse scores (target 90+)
- Ensure images in UI are optimized
- Check CDN cache is working (should be 100ms edge latency)

## Next: Content & SEO

After deployment, focus on:
1. Write 2-3 blog posts targeting long-tail keywords
2. Set up Google Search Console
3. Submit sitemap.xml
4. Monitor rankings weekly
5. Adjust content based on search data

See `SEO_STRATEGY.md` for detailed keyword research and content calendar.
