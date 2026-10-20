interface CardCornerPatternProps {
  /** Unique identifier to prevent SVG gradient id collisions */
  patternId?: string
  /** Accent color for the line pattern (defaults to CareVo brand forest green) */
  color?: string
  /** Additional custom classes for positioning or sizing */
  className?: string
}

/**
 * CardCornerPattern
 * Renders a delicate, high-precision SVG line pattern in the top-right corner of cards.
 * Designed with concentric geometric arcs, organic contour waves, precision rays,
 * and a subtle radial gradient fade that seamlessly dissolves into the card surface.
 */
export function CardCornerPattern({
  patternId,
  color,
  className = '',
}: CardCornerPatternProps) {
  const strokeColor = color && color.startsWith('#') ? color : '#1B4D3E'
  const idPrefix = `card-pattern-${String(patternId || 'default').replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <div
      className={`absolute top-0 right-0 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none overflow-hidden rounded-tr-[var(--radius-xl)] z-0 select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform translate-x-1 -translate-y-1 opacity-75 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ease-out"
      >
        <defs>
          {/* Primary linear gradient fading lines toward the card interior */}
          <linearGradient
            id={`${idPrefix}-fade`}
            x1="160"
            y1="0"
            x2="10"
            y2="150"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.45" />
            <stop offset="40%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="75%" stopColor={strokeColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Accent gradient for precision rays & highlights */}
          <linearGradient
            id={`${idPrefix}-accent`}
            x1="160"
            y1="0"
            x2="30"
            y2="130"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.55" />
            <stop offset="50%" stopColor={strokeColor} stopOpacity="0.20" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Concentric curved precision arcs originating from the top-right corner */}
        <circle cx="160" cy="0" r="24" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1" />
        <circle cx="160" cy="0" r="42" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="160" cy="0" r="62" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1.2" />
        <circle cx="160" cy="0" r="84" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1" strokeDasharray="5 3" />
        <circle cx="160" cy="0" r="106" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1.2" />
        <circle cx="160" cy="0" r="128" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="160" cy="0" r="150" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1.2" />
        <circle cx="160" cy="0" r="172" stroke={`url(#${idPrefix}-fade)`} strokeWidth="1" strokeDasharray="2 3" />

        {/* Elegant flowing contour waves */}
        <path
          d="M 160 36 C 122 44 102 76 72 106 C 48 130 22 148 0 160"
          stroke={`url(#${idPrefix}-fade)`}
          strokeWidth="0.85"
          strokeDasharray="2 2"
        />
        <path
          d="M 160 80 C 132 86 114 114 88 138 C 66 154 36 158 10 160"
          stroke={`url(#${idPrefix}-fade)`}
          strokeWidth="1.1"
        />

        {/* Delicate radial precision rays */}
        <line
          x1="160"
          y1="0"
          x2="25"
          y2="135"
          stroke={`url(#${idPrefix}-accent)`}
          strokeWidth="0.75"
          strokeDasharray="3 4"
        />
        <line
          x1="160"
          y1="0"
          x2="70"
          y2="155"
          stroke={`url(#${idPrefix}-accent)`}
          strokeWidth="0.75"
        />
        <line
          x1="160"
          y1="0"
          x2="15"
          y2="80"
          stroke={`url(#${idPrefix}-accent)`}
          strokeWidth="0.75"
        />

        {/* Micro clinical precision marks (crosshairs and nodes) */}
        <path
          d="M 98 62 L 104 62 M 101 59 L 101 65"
          stroke={strokeColor}
          strokeWidth="1"
          strokeOpacity="0.35"
        />
        <path
          d="M 60 104 L 66 104 M 63 101 L 63 107"
          stroke={strokeColor}
          strokeWidth="1"
          strokeOpacity="0.25"
        />
        <circle cx="124" cy="38" r="1.5" fill={strokeColor} fillOpacity="0.4" />
        <circle cx="82" cy="82" r="1.5" fill={strokeColor} fillOpacity="0.35" />
        <circle cx="42" cy="122" r="1.25" fill={strokeColor} fillOpacity="0.25" />
      </svg>
    </div>
  )
}
