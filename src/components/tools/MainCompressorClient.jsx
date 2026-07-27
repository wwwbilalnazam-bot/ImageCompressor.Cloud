'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { compressToTargetSize } from '../../utils/advancedCompression'
import { validatePdfFile, compressPdf, getAutomaticLevel } from '../../utils/pdfCompressionEngine'
import { isAnimatedGif } from '../../utils/gifUtils'
import Uploader from '../Uploader'
import ResultsSection from '../ResultsSection'
import AdBanner from '../AdBanner'

/**
 * Image/PDF compressor tool — ported from pages/MainCompressorPremium.jsx.
 *
 * Two things were removed rather than carried over:
 *  - the `<SEO>` element (metadata now comes from each route's
 *    `generateMetadata`, so it exists in the server-rendered HTML), and
 *  - the `window.location.pathname`-derived canonical URL, which could not run
 *    during SSR and is now a static value in the page's metadata.
 * Everything else is unchanged.
 */
export default function MainCompressorClient({
  defaultTargetSize = 100,
  pageTitle = 'Compress Files',
  // Optional: a translation key under the `compressor` namespace for the H1.
  // Only the home route sets this today (the "one tool localized end-to-end"
  // proof of pattern) — other routes keep the plain English `pageTitle` prop
  // until they get the same treatment, which is a routes.js-only change once
  // this pattern is proven out.
  titleKey = null,
  initialFormat = 'original',
}) {
  const t = useTranslations('compressor')
  const resolvedTitle = titleKey ? t(titleKey) : pageTitle
  const [images, setImages] = useState([])
  const [targetSize, setTargetSize] = useState(defaultTargetSize)
  const [outputFormat, setOutputFormat] = useState(initialFormat)
  const [isProcessing, setIsProcessing] = useState(false)
  const uploaderRef = useRef(null)

  useEffect(() => {
    setImages([])
    setTargetSize(defaultTargetSize)
    setOutputFormat(initialFormat)
    setIsProcessing(false)
  }, [defaultTargetSize, initialFormat])

  const handleAddImages = useCallback(
    async (files) => {
      if (!files || files.length === 0) return
      setIsProcessing(true)

      const fileArray = Array.from(files)
      const supportedImageFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

      const newItems = []
      for (const file of fileArray) {
        const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf')
        const isImage = supportedImageFormats.includes(file.type) || /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name)

        if (!isPdf && !isImage) {
          continue
        }

        const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name)
        // Canvas can decode a GIF but has never been able to encode one in any
        // browser, so compressing a GIF here always re-encodes it as another
        // format — which flattens animation to one frame. Detected up front
        // (not assumed) so the UI can say so rather than silently dropping it.
        const animated = isGif ? isAnimatedGif(await file.arrayBuffer()) : false

        const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        const previewUrl = isPdf ? null : URL.createObjectURL(file)

        newItems.push({
          id: fileId,
          originalFile: file,
          originalSize: file.size,
          preview: previewUrl,
          isCompressing: true,
          progressPct: 0,
          progressLabel: 'Waiting...',
          compressedSize: null,
          compressedDataUrl: null,
          blob: null,
          format: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          error: null,
          ratio: 0,
          targetSize: targetSize,
          isPdf: isPdf,
          isAnimatedGif: animated,
        })
      }

      if (newItems.length === 0) {
        setIsProcessing(false)
        return
      }

      setImages((prev) => [...prev, ...newItems])

      for (const item of newItems) {
        try {
          if (item.isPdf) {
            setImages((prev) =>
              prev.map((img) =>
                img.id === item.id ? { ...img, progressLabel: 'Reading PDF...', progressPct: 0 } : img
              )
            )

            const { pdfDoc } = await validatePdfFile(item.originalFile)
            const level = getAutomaticLevel(item.originalFile.size)
            const { bytes } = await compressPdf(
              pdfDoc,
              { quality: level.quality, maxDimension: level.maxDimension, grayscale: false, removeMetadata: false },
              (current, total) => {
                setImages((prev) =>
                  prev.map((img) =>
                    img.id === item.id
                      ? {
                          ...img,
                          progressLabel: total
                            ? `Optimizing image ${current} of ${total}...`
                            : 'Optimizing document...',
                          progressPct: total ? Math.round((current / total) * 100) : 100,
                        }
                      : img
                  )
                )
              }
            )

            let pdfBlob = new Blob([bytes], { type: 'application/pdf' })
            // Never ship a "compressed" file that's actually bigger than the original.
            if (pdfBlob.size >= item.originalSize) pdfBlob = item.originalFile

            const compressedUrl = URL.createObjectURL(pdfBlob)
            const ratio = Math.max(0, Math.round(((item.originalSize - pdfBlob.size) / item.originalSize) * 100))

            setImages((prev) =>
              prev.map((img) =>
                img.id === item.id
                  ? {
                      ...img,
                      isCompressing: false,
                      compressedSize: pdfBlob.size,
                      compressedDataUrl: compressedUrl,
                      blob: pdfBlob,
                      ratio: ratio,
                      mimeType: 'application/pdf',
                      error: null,
                    }
                  : img
              )
            )
          } else {
            setImages((prev) =>
              prev.map((img) =>
                img.id === item.id ? { ...img, progressLabel: 'Compressing image...', progressPct: 50 } : img
              )
            )
            // Canvas has no GIF encoder in any browser, so "original format"
            // can't mean "stay GIF" the way it does for JPG/PNG/WebP — resolve
            // it to PNG explicitly instead of letting canvas.toBlob receive an
            // unsupported 'image/gif' target it was never going to honor.
            const isGifItem = item.format === 'image/gif' || /\.gif$/i.test(item.originalFile.name)
            const effectiveFormat = isGifItem && outputFormat === 'original' ? 'image/png' : outputFormat
            const result = await compressToTargetSize(item.originalFile, targetSize, effectiveFormat)
            const compressedUrl = URL.createObjectURL(result.blob)

            setImages((prev) =>
              prev.map((img) =>
                img.id === item.id
                  ? {
                      ...img,
                      isCompressing: false,
                      compressedSize: result.compressedSize,
                      compressedDataUrl: compressedUrl,
                      blob: result.blob,
                      ratio: result.ratio,
                      originalDimensions: result.originalDimensions,
                      finalDimensions: result.finalDimensions,
                      mimeType: result.mimeType,
                      error: null,
                    }
                  : img
              )
            )
          }
        } catch (err) {
          console.error('Compression failed:', err)
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id
                ? {
                    ...img,
                    isCompressing: false,
                    error: err.message || 'Compression failed',
                  }
                : img
            )
          )
        }
      }

      setIsProcessing(false)
    },
    [targetSize, outputFormat]
  )

  const handleDownloadSingle = (image) => {
    if (!image.compressedDataUrl) return
    const link = document.createElement('a')
    link.href = image.compressedDataUrl
    const isPdf = image.isPdf || image.mimeType === 'application/pdf'
    const ext = isPdf ? 'pdf' : image.mimeType ? image.mimeType.split('/')[1] : 'jpg'
    const originalName = image.originalFile?.name ? image.originalFile.name.replace(/\.[^/.]+$/, '') : 'file'
    link.download = isPdf ? `${originalName}-compressed.pdf` : `${originalName}-${targetSize}kb.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClearAll = () => {
    images.forEach((img) => {
      if (img.preview) URL.revokeObjectURL(img.preview)
      if (img.compressedDataUrl) URL.revokeObjectURL(img.compressedDataUrl)
    })
    setImages([])
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between py-4 sm:py-6 px-4 container max-w-4xl mx-auto font-sans">
      {/* CENTERED HERO SECTION */}
      <div className="space-y-4 text-center my-auto">
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {resolvedTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">{t('subtitle')}</p>
        </div>

        {/* MAIN TOOL WORKSPACE */}
        <div ref={uploaderRef} className="pt-1">
          {images.length === 0 ? (
            <Uploader
              onImagesAdded={handleAddImages}
              targetSize={targetSize}
              onTargetSizeChange={setTargetSize}
              outputFormat={outputFormat}
              onFormatChange={setOutputFormat}
              isProcessing={isProcessing}
            />
          ) : (
            <ResultsSection
              images={images}
              onDownload={handleDownloadSingle}
              onCompressAnother={handleClearAll}
              onClearAll={handleClearAll}
            />
          )}
        </div>
      </div>

      {/* STRICTLY 1 SINGLE AD BANNER AT BOTTOM */}
      <div className="pt-4 shrink-0">
        <AdBanner position="bottom" type="horizontal-banner" />
      </div>
    </div>
  )
}
