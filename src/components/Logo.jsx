export default function Logo({ size = 'default', className = '' }) {
  const sizeMap = {
    small: 28,
    default: 36,
    large: 56,
  }

  const px = sizeMap[size] || 36

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-sm`}
      role="img"
      aria-label="ImageCompress Cloud Brand Logo"
    >
      <defs>
        <linearGradient id="logoPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        <linearGradient id="logoGlossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>

        <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#059669" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Main Rounded Shield Container */}
      <rect x="10" y="10" width="100" height="100" rx="28" fill="url(#logoPrimaryGrad)" filter="url(#glowEffect)" />

      {/* Gloss Overlay */}
      <rect x="10" y="10" width="100" height="50" rx="28" fill="url(#logoGlossGrad)" />

      {/* Document Icon Frame */}
      <path
        d="M40 32H72C76.4183 32 80 35.5817 80 40V80C80 84.4183 76.4183 88 72 88H40C35.5817 88 32 84.4183 32 80V40C32 35.5817 35.5817 32 40 32Z"
        fill="white"
        fillOpacity="0.18"
        stroke="white"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Central Lightning Compression Bolt Symbol */}
      <path
        d="M64 36L42 64H58L54 84L78 56H60L64 36Z"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}
