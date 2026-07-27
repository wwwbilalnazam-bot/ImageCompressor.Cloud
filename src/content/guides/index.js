import jpegVsPngVsWebp from './jpeg-vs-png-vs-webp'
import whyPhotosLookWorseAfterCompressing from './why-photos-look-worse-after-compressing'
import imageSizeForSocialMedia from './image-size-for-social-media'
import passportPhotoSizeByCountry from './passport-photo-size-by-country'
import examFormPhotoSignatureSize from './exam-form-photo-signature-size'
import resumeJobApplicationPhotoSize from './resume-job-application-photo-size'
import lossyVsLosslessCompression from './lossy-vs-lossless-compression'
import whyIsMyPdfSoBig from './why-is-my-pdf-so-big'
import compressPdfForEmail from './compress-pdf-for-email'
import scannedVsTextPdf from './scanned-vs-text-pdf'
import pdfToWordFormattingIssues from './pdf-to-word-formatting-issues'
import exportToPdfVsPrintToPdf from './export-to-pdf-vs-print-to-pdf'
import whatIsPdfa from './what-is-pdfa'
import combineScannedPagesFromPhone from './combine-scanned-pages-from-phone'
import splitPdfByChapter from './split-pdf-by-chapter'
import fixSidewaysScannedPdf from './fix-sideways-scanned-pdf'

/**
 * Maps a guide route's `guideSlug` prop (see src/config/routes.js) to its
 * article content, mirroring src/content/comparisons/index.js.
 */
export const GUIDES_BY_SLUG = {
  'jpeg-vs-png-vs-webp': jpegVsPngVsWebp,
  'why-photos-look-worse-after-compressing': whyPhotosLookWorseAfterCompressing,
  'image-size-for-social-media': imageSizeForSocialMedia,
  'passport-photo-size-by-country': passportPhotoSizeByCountry,
  'exam-form-photo-signature-size': examFormPhotoSignatureSize,
  'resume-job-application-photo-size': resumeJobApplicationPhotoSize,
  'lossy-vs-lossless-compression': lossyVsLosslessCompression,
  'why-is-my-pdf-so-big': whyIsMyPdfSoBig,
  'compress-pdf-for-email': compressPdfForEmail,
  'scanned-vs-text-pdf': scannedVsTextPdf,
  'pdf-to-word-formatting-issues': pdfToWordFormattingIssues,
  'export-to-pdf-vs-print-to-pdf': exportToPdfVsPrintToPdf,
  'what-is-pdfa': whatIsPdfa,
  'combine-scanned-pages-from-phone': combineScannedPagesFromPhone,
  'split-pdf-by-chapter': splitPdfByChapter,
  'fix-sideways-scanned-pdf': fixSidewaysScannedPdf,
}

export function getGuide(slug) {
  return GUIDES_BY_SLUG[slug] || null
}
