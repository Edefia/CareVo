interface HeroLinePatternProps {
  className?: string
}

/**
 * HeroLinePattern
 * Renders an elegant, high-precision SVG line art composition designed for the
 * dark forest hero banner. Features concentric diagnostic arcs, flowing bio-waves,
 * and slight professional CSS animations (slow ambient rotation, gentle breathing,
 * and a smooth dash flow stream) evoking clinical precision and life vitality.
 */
export function HeroLinePattern({ className = '' }: HeroLinePatternProps) {
  return (
    <div
      className={`absolute top-0 right-0 w-full sm:w-[85%] md:w-[72%] lg:w-[65%] h-full pointer-events-none overflow-hidden select-none z-0 ${className}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes heroSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes heroSpinReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes heroBreathe {
          0% {
            transform: scale(1);
            opacity: 0.82;
          }
          50% {
            transform: scale(1.02);
            opacity: 0.98;
          }
          100% {
            transform: scale(1);
            opacity: 0.82;
          }
        }

        @keyframes heroDashFlow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -200;
          }
        }

        @keyframes heroTwinkle {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
          }
        }

        .hero-breathe-layer {
          transform-origin: 620px 40px;
          animation: heroBreathe 10s ease-in-out infinite;
        }

        .hero-spin-layer {
          transform-origin: 620px 40px;
          animation: heroSpin 70s linear infinite;
        }

        .hero-spin-reverse-layer {
          transform-origin: 620px 40px;
          animation: heroSpinReverse 90s linear infinite;
        }

        .hero-flow-stream-1 {
          animation: heroDashFlow 24s linear infinite;
        }

        .hero-flow-stream-2 {
          animation: heroDashFlow 36s linear infinite reverse;
        }

        .hero-twinkle-a {
          transform-origin: 430px 185px;
          animation: heroTwinkle 4s ease-in-out infinite;
        }

        .hero-twinkle-b {
          transform-origin: 310px 290px;
          animation: heroTwinkle 5s ease-in-out infinite 1.5s;
        }

        .hero-twinkle-c {
          transform-origin: 520px 260px;
          animation: heroTwinkle 4.5s ease-in-out infinite 2.5s;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-breathe-layer,
          .hero-spin-layer,
          .hero-spin-reverse-layer,
          .hero-flow-stream-1,
          .hero-flow-stream-2,
          .hero-twinkle-a,
          .hero-twinkle-b,
          .hero-twinkle-c {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 700 450"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMaxYMid slice"
        className="w-full h-full transform translate-x-4 -translate-y-4"
      >
        <defs>
          {/* Primary linear gradient: CareVo Lime -> Mint -> Soft Cyan -> Fade */}
          <linearGradient
            id="hero-grad-primary"
            x1="650"
            y1="20"
            x2="80"
            y2="420"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B6F076" stopOpacity="0.55" />
            <stop offset="35%" stopColor="#34D399" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1B4D3E" stopOpacity="0.0" />
          </linearGradient>

          {/* Electric lime highlight gradient */}
          <linearGradient
            id="hero-grad-lime"
            x1="620"
            y1="40"
            x2="220"
            y2="360"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B6F076" stopOpacity="0.65" />
            <stop offset="45%" stopColor="#B6F076" stopOpacity="0.28" />
            <stop offset="85%" stopColor="#B6F076" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#B6F076" stopOpacity="0.0" />
          </linearGradient>

          {/* Mint green contour gradient */}
          <linearGradient
            id="hero-grad-mint"
            x1="620"
            y1="40"
            x2="150"
            y2="420"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="0.22" />
            <stop offset="90%" stopColor="#34D399" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.0" />
          </linearGradient>

          {/* Subtle radial ray gradient */}
          <linearGradient
            id="hero-grad-ray"
            x1="620"
            y1="40"
            x2="100"
            y2="280"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B6F076" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#34D399" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1B4D3E" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* ── LAYER 1: Ambient Breathing Linework ── */}
        <g className="hero-breathe-layer">
          {/* Static precision arcs */}
          <circle cx="620" cy="40" r="45" stroke="url(#hero-grad-lime)" strokeWidth="1" />
          <circle cx="620" cy="40" r="95" stroke="url(#hero-grad-primary)" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="620" cy="40" r="160" stroke="url(#hero-grad-mint)" strokeWidth="1.1" />
          <circle cx="620" cy="40" r="235" stroke="url(#hero-grad-lime)" strokeWidth="1.2" strokeDasharray="5 4" />
          <circle cx="620" cy="40" r="320" stroke="url(#hero-grad-primary)" strokeWidth="1.2" />
          <circle cx="620" cy="40" r="410" stroke="url(#hero-grad-mint)" strokeWidth="1.2" strokeDasharray="4 6" />
          <circle cx="620" cy="40" r="510" stroke="url(#hero-grad-primary)" strokeWidth="1" strokeDasharray="2 4" />
          <circle cx="620" cy="40" r="620" stroke="url(#hero-grad-mint)" strokeWidth="1" />

          {/* Elegant organic biological contour waves */}
          <path
            d="M 700 70 C 550 90 470 190 330 280 C 220 350 120 400 0 430"
            stroke="url(#hero-grad-mint)"
            strokeWidth="1.1"
            strokeDasharray="3 3"
          />
          <path
            d="M 700 135 C 585 160 510 245 385 330 C 290 390 190 430 60 450"
            stroke="url(#hero-grad-primary)"
            strokeWidth="1.3"
          />
          <path
            d="M 700 200 C 615 235 550 310 435 385 C 345 435 250 450 150 450"
            stroke="url(#hero-grad-mint)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path
            d="M 660 0 C 510 65 430 145 290 235 C 190 300 95 350 0 380"
            stroke="url(#hero-grad-lime)"
            strokeWidth="1.2"
          />

          {/* Delicate architectural rays */}
          <line x1="620" y1="40" x2="60" y2="400" stroke="url(#hero-grad-ray)" strokeWidth="0.8" strokeDasharray="4 5" />
          <line x1="620" y1="40" x2="160" y2="445" stroke="url(#hero-grad-ray)" strokeWidth="0.75" />
          <line x1="620" y1="40" x2="20" y2="270" stroke="url(#hero-grad-ray)" strokeWidth="0.75" strokeDasharray="2 4" />
          <line x1="620" y1="40" x2="280" y2="450" stroke="url(#hero-grad-ray)" strokeWidth="0.75" />
        </g>

        {/* ── LAYER 2: Slow Smooth Clockwise Orbital Ring (70s) ── */}
        <g className="hero-spin-layer">
          <circle
            cx="620"
            cy="40"
            r="125"
            stroke="url(#hero-grad-lime)"
            strokeWidth="1"
            strokeDasharray="6 8"
          />
          <circle
            cx="620"
            cy="40"
            r="275"
            stroke="url(#hero-grad-primary)"
            strokeWidth="1.2"
            strokeDasharray="10 12"
          />
          <circle
            cx="620"
            cy="40"
            r="460"
            stroke="url(#hero-grad-mint)"
            strokeWidth="1.2"
            strokeDasharray="16 16"
          />

          {/* Small orbital accent satellite dots */}
          <circle cx="745" cy="40" r="2.5" fill="#B6F076" fillOpacity="0.55" />
          <circle cx="345" cy="40" r="2.5" fill="#34D399" fillOpacity="0.5" />
          <circle cx="620" cy="315" r="3" fill="#B6F076" fillOpacity="0.6" />
          <circle cx="620" cy="500" r="2.5" fill="#60A5FA" fillOpacity="0.45" />

          {/* Micro coordinate crosshairs */}
          <path d="M 616 165 L 624 165 M 620 161 L 620 169" stroke="#B6F076" strokeWidth="1" strokeOpacity="0.4" />
          <path d="M 616 315 L 624 315 M 620 311 L 620 319" stroke="#34D399" strokeWidth="1" strokeOpacity="0.4" />
        </g>

        {/* ── LAYER 3: Slow Smooth Counter-Clockwise Orbital Ring (90s) ── */}
        <g className="hero-spin-reverse-layer">
          <circle
            cx="620"
            cy="40"
            r="195"
            stroke="url(#hero-grad-lime)"
            strokeWidth="1.2"
            strokeDasharray="4 10"
          />
          <circle
            cx="620"
            cy="40"
            r="365"
            stroke="url(#hero-grad-primary)"
            strokeWidth="1"
            strokeDasharray="8 14"
          />

          {/* Radial tick marks on the 195r orbit */}
          <line x1="815" y1="40" x2="825" y2="40" stroke="#B6F076" strokeWidth="1.2" strokeOpacity="0.45" />
          <line x1="425" y1="40" x2="415" y2="40" stroke="#B6F076" strokeWidth="1.2" strokeOpacity="0.45" />
          <line x1="620" y1="235" x2="620" y2="245" stroke="#B6F076" strokeWidth="1.2" strokeOpacity="0.45" />
          <line x1="620" y1="-155" x2="620" y2="-165" stroke="#B6F076" strokeWidth="1.2" strokeOpacity="0.45" />
        </g>

        {/* ── LAYER 4: Continuous Smooth Bio-Current Flow Streams ── */}
        <path
          className="hero-flow-stream-1"
          d="M 700 100 C 560 120 480 215 350 305 C 245 370 145 415 20 440"
          stroke="url(#hero-grad-lime)"
          strokeWidth="1.5"
          strokeDasharray="14 10"
        />
        <path
          className="hero-flow-stream-2"
          d="M 640 0 C 500 55 410 135 270 225 C 175 285 85 335 0 365"
          stroke="url(#hero-grad-mint)"
          strokeWidth="1.2"
          strokeDasharray="10 12"
        />

        {/* ── LAYER 5: Twinkling Clinical Nodes & Targets ── */}
        <g className="hero-twinkle-a">
          <circle cx="430" cy="185" r="3.5" fill="#B6F076" fillOpacity="0.65" />
          <circle cx="430" cy="185" r="7" stroke="#B6F076" strokeWidth="0.8" strokeOpacity="0.3" />
        </g>

        <g className="hero-twinkle-b">
          <circle cx="310" cy="290" r="3" fill="#34D399" fillOpacity="0.6" />
          <circle cx="310" cy="290" r="6" stroke="#34D399" strokeWidth="0.8" strokeOpacity="0.3" />
        </g>

        <g className="hero-twinkle-c">
          <circle cx="520" cy="260" r="2.5" fill="#6EE7B7" fillOpacity="0.55" />
          <circle cx="520" cy="260" r="5" stroke="#6EE7B7" strokeWidth="0.75" strokeOpacity="0.25" />
        </g>

        {/* Precision Crosshair Target */}
        <path
          d="M 474 150 L 486 150 M 480 144 L 480 156"
          stroke="#B6F076"
          strokeWidth="1.2"
          strokeOpacity="0.45"
        />
        <circle cx="480" cy="150" r="1.5" fill="#B6F076" fillOpacity="0.8" />

        <path
          d="M 374 245 L 386 245 M 380 239 L 380 251"
          stroke="#34D399"
          strokeWidth="1.2"
          strokeOpacity="0.35"
        />
        <circle cx="380" cy="245" r="1.5" fill="#34D399" fillOpacity="0.7" />
      </svg>
    </div>
  )
}
