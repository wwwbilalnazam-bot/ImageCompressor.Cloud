import { ImageResponse } from 'next/og'
import { routing } from '../../i18n/routing'
import { site } from '../../config/site'

/**
 * Social share image, generated at build time.
 *
 * The old SPA emitted no og:image at all, so every link shared to Slack,
 * X, LinkedIn or Facebook rendered as a bare text card. Generating it here
 * rather than committing a PNG keeps it in sync with the brand colours and
 * needs no binary asset or external font fetch.
 */
export const alt = `${site.name} — free image and PDF tools`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
          color: 'white',
          padding: '80px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 78, fontWeight: 800, letterSpacing: '-0.03em', display: 'flex' }}>
          ImageCompress Cloud
        </div>
        <div style={{ fontSize: 36, marginTop: 28, opacity: 0.92, display: 'flex' }}>
          Compress · Convert · Merge · Split
        </div>
        <div style={{ fontSize: 28, marginTop: 40, opacity: 0.85, display: 'flex' }}>
          Free, unlimited, and processed in your browser
        </div>
      </div>
    ),
    size
  )
}
