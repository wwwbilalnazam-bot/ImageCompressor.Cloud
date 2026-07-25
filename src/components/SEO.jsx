import { useEffect } from 'react'

export default function SEO({
  title = 'Free Image Compressor - Compress PNG, JPEG, WebP & AVIF Online',
  description = 'Compress images to exact target sizes (20KB, 50KB, 100KB, 200KB, 500KB) with zero quality loss. 100% free, browser-based, secure & private.',
  canonicalUrl = 'https://imagecompressor.cloud',
  keywords = 'compress image, image compressor, compress to 100kb, compress to 50kb, compress jpg, compress png, free image compressor',
  schemaData = null,
}) {
  useEffect(() => {
    // 1. Update Title
    document.title = title

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]')
    if (!metaDescription) {
      metaDescription = document.createElement('meta')
      metaDescription.name = 'description'
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute('content', description)

    // 3. Update Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]')
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta')
      metaKeywords.name = 'keywords'
      document.head.appendChild(metaKeywords)
    }
    metaKeywords.setAttribute('content', keywords)

    // 4. Update OpenGraph Tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:type': 'website',
      'og:site_name': 'ImageCompressor.cloud',
    }

    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector(`meta[property="${property}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute('property', property)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    })

    // 5. Update Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    // 6. Dynamic JSON-LD Schema
    const schemaId = 'dynamic-seo-schema'
    let schemaScript = document.getElementById(schemaId)
    if (schemaScript) {
      schemaScript.remove()
    }

    if (schemaData) {
      schemaScript = document.createElement('script')
      schemaScript.id = schemaId
      schemaScript.type = 'application/ld+json'
      schemaScript.text = JSON.stringify(schemaData)
      document.head.appendChild(schemaScript)
    }

    return () => {
      // Cleanup custom schema on unmount
      const existing = document.getElementById(schemaId)
      if (existing) existing.remove()
    }
  }, [title, description, canonicalUrl, keywords, schemaData])

  return null
}
