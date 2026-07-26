import { notFound } from 'next/navigation'
import Script from 'next/script'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

import '../../styles/globals.css'
import '../../styles/ads.css'

import { routing } from '../../i18n/routing'
import { inter } from '../../lib/fonts'
import { site } from '../../config/site'
import { absoluteUrl, buildHreflangMap, localePath } from '../../lib/seo/metadata'
import { organizationSchema, webSiteSchema } from '../../lib/seo/schema'
import JsonLd from '../../components/JsonLd'
import HeaderClient from '../../components/layout/HeaderClient'
import Footer from '../../components/layout/Footer'

/**
 * Third-party integrations are env-var gated. With no value set they render
 * nothing at all, so the placeholders are completely inert until real IDs are
 * supplied in Vercel — no code change needed at that point.
 */
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

/** Pre-render one static tree per locale. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: site.themeColor,
}

export async function generateMetadata({ params }) {
  const { locale } = await params

  return {
    metadataBase: new URL(site.url),
    title: `${site.name} — Free Image & PDF Tools`,
    description: site.description,
    applicationName: site.name,
    icons: { icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }] },
    alternates: {
      canonical: absoluteUrl(localePath(locale, '')),
      languages: buildHreflangMap(''),
    },
    ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  }
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  return (
    <html lang={locale} className={inter.variable} suppressHydrationWarning>
      <head>
        {/*
          Applies the saved theme before first paint. Without this the page
          renders light, then the header's useEffect adds `.dark` after
          hydration — a visible flash for every returning dark-mode visitor.
        */}
        <script
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans selection:bg-emerald-500 selection:text-white">
        <JsonLd data={[organizationSchema(), webSiteSchema(locale)]} />

        <NextIntlClientProvider>
          <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col">
            <HeaderClient />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </div>
        </NextIntlClientProvider>

        {/* Google Analytics 4 — inert unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
            </Script>
          </>
        )}

        {/* Google AdSense — inert unless NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        {ADSENSE_CLIENT_ID && (
          <Script
            id="adsbygoogle-init"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  )
}
