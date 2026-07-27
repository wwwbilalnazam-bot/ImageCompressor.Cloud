/**
 * Minimal GIF89a block parser used for exactly one question: does this file
 * have more than one image frame? Canvas can decode a GIF (any browser) but
 * cannot encode one — `canvas.toBlob` has never supported `image/gif` as an
 * output format in any browser — so compressing a GIF here always means
 * re-encoding it as PNG/JPEG/WebP, which flattens animation to one frame.
 * That's a legitimate "static GIF compression" feature, but silently
 * flattening an animated GIF without telling the user would be misleading,
 * hence this check.
 *
 * No library needed: counting Image Descriptor (0x2C) blocks is enough,
 * walking the block structure correctly so extension sub-blocks and color
 * tables don't get misread as descriptors.
 */
export function isAnimatedGif(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer)
  if (bytes.length < 13 || bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) {
    return false // not a GIF (missing "GIF" signature)
  }

  let pos = 6 // past "GIF87a"/"GIF89a"
  const screenPacked = bytes[pos + 4]
  pos += 7 // Logical Screen Descriptor: width(2) height(2) packed(1) bgIndex(1) aspect(1)

  if (screenPacked & 0x80) {
    const globalColorTableSize = 2 << (screenPacked & 0x07)
    pos += globalColorTableSize * 3
  }

  let frameCount = 0

  while (pos < bytes.length) {
    const blockType = bytes[pos]

    if (blockType === 0x21) {
      // Extension block: introducer + label, then length-prefixed sub-blocks until a 0-length block
      pos += 2
      while (pos < bytes.length) {
        const size = bytes[pos]
        pos += 1
        if (size === 0) break
        pos += size
      }
    } else if (blockType === 0x2c) {
      frameCount += 1
      if (frameCount > 1) return true

      pos += 1 // past the Image Descriptor introducer
      if (pos + 9 > bytes.length) break
      const localPacked = bytes[pos + 8]
      pos += 9 // left(2) top(2) width(2) height(2) packed(1)

      if (localPacked & 0x80) {
        const localColorTableSize = 2 << (localPacked & 0x07)
        pos += localColorTableSize * 3
      }

      pos += 1 // LZW minimum code size
      while (pos < bytes.length) {
        const size = bytes[pos]
        pos += 1
        if (size === 0) break
        pos += size
      }
    } else if (blockType === 0x3b) {
      break // Trailer — end of GIF data stream
    } else {
      break // Unrecognized byte — corrupt or unexpected structure, stop rather than guess
    }
  }

  return frameCount > 1
}
