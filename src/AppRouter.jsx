import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PremiumHeader from './components/PremiumHeader'
import PremiumFooter from './components/PremiumFooter'
import MainCompressorPremium from './pages/MainCompressorPremium'
import FileConverterPage from './pages/FileConverterPage'
import PDFEditorPage from './pages/PDFEditorPage'
import MergePdfImagesPage from './pages/MergePdfImagesPage'
import SplitPdfPage from './pages/SplitPdfPage'
import CompressPdfPage from './pages/CompressPdfPage'
import { DOCX_MIME, XLSX_MIME, PPTX_MIME } from './utils/fileConverter'

function AppRouterContent() {
  return (
    <div className="h-screen max-h-screen bg-white dark:bg-slate-950 flex flex-col font-sans selection:bg-emerald-500 selection:text-white overflow-hidden justify-between">
      <PremiumHeader />

      <main className="flex-1 flex flex-col justify-between overflow-y-auto">
        <Routes>
          {/* SECTION 1: IMAGE & FILE COMPRESSOR */}
          <Route path="/" element={<MainCompressorPremium defaultTargetSize={100} pageTitle="Compress Files" />} />
          <Route path="/compress-image-to-20kb" element={<MainCompressorPremium defaultTargetSize={20} pageTitle="Compress Image to 20KB" />} />
          <Route path="/compress-image-to-50kb" element={<MainCompressorPremium defaultTargetSize={50} pageTitle="Compress Image to 50KB" />} />
          <Route path="/compress-image-to-100kb" element={<MainCompressorPremium defaultTargetSize={100} pageTitle="Compress Image to 100KB" />} />
          <Route path="/compress-image-to-200kb" element={<MainCompressorPremium defaultTargetSize={200} pageTitle="Compress Image to 200KB" />} />
          <Route path="/compress-image-to-500kb" element={<MainCompressorPremium defaultTargetSize={500} pageTitle="Compress Image to 500KB" />} />
          <Route path="/jpg-compressor" element={<MainCompressorPremium defaultTargetSize={100} initialFormat="image/jpeg" pageTitle="Free JPG Compressor" />} />
          <Route path="/png-compressor" element={<MainCompressorPremium defaultTargetSize={100} initialFormat="image/png" pageTitle="Free PNG Compressor" />} />
          <Route path="/webp-compressor" element={<MainCompressorPremium defaultTargetSize={100} initialFormat="image/webp" pageTitle="Free WebP Compressor" />} />

          {/* SECTION 2: UNIVERSAL FILE & DOCUMENT CONVERTER */}
          <Route path="/converter" element={<FileConverterPage defaultTargetFormat="image/jpeg" />} />
          <Route path="/word-to-pdf" element={<FileConverterPage defaultTargetFormat="application/pdf" />} />
          <Route path="/pdf-to-word" element={<FileConverterPage defaultTargetFormat={DOCX_MIME} />} />
          <Route path="/excel-to-pdf" element={<FileConverterPage defaultTargetFormat="application/pdf" />} />
          <Route path="/pdf-to-excel" element={<FileConverterPage defaultTargetFormat={XLSX_MIME} />} />
          <Route path="/powerpoint-to-pdf" element={<FileConverterPage defaultTargetFormat="application/pdf" />} />
          <Route path="/pdf-to-powerpoint" element={<FileConverterPage defaultTargetFormat={PPTX_MIME} />} />
          <Route path="/pdf-to-text" element={<FileConverterPage defaultTargetFormat="text/plain" />} />
          <Route path="/txt-to-pdf" element={<FileConverterPage defaultTargetFormat="application/pdf" />} />
          <Route path="/pdf-to-jpg" element={<FileConverterPage defaultTargetFormat="image/jpeg" />} />
          <Route path="/pdf-to-png" element={<FileConverterPage defaultTargetFormat="image/png" />} />
          <Route path="/png-to-jpg" element={<FileConverterPage defaultTargetFormat="image/jpeg" />} />
          <Route path="/jpg-to-png" element={<FileConverterPage defaultTargetFormat="image/png" />} />
          <Route path="/webp-to-jpg" element={<FileConverterPage defaultTargetFormat="image/jpeg" />} />

          {/* SECTION 3: PDF SUITE - CORE TOOLS ONLY */}
          <Route path="/merge-pdf" element={<MergePdfImagesPage />} />
          <Route path="/pdf-tools" element={<CompressPdfPage />} />
          <Route path="/compress-pdf" element={<CompressPdfPage />} />
          <Route path="/split-pdf" element={<SplitPdfPage />} />

          {/* FUTURE: Advanced PDF Tools (Currently Disabled) */}
          {/* <Route path="/pdf-editor" element={<PDFEditorPage />} /> */}

          {/* Fallback */}
          <Route path="*" element={<MainCompressorPremium defaultTargetSize={100} pageTitle="Compress Files" />} />
        </Routes>
      </main>

      <PremiumFooter />
    </div>
  )
}

export default function AppRouter() {
  return (
    <Router>
      <AppRouterContent />
    </Router>
  )
}
