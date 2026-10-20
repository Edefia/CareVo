interface HeroCornerHealthPatternProps {
  className?: string
}

/**
 * HeroCornerHealthPattern
 * A seamless clinical health art component that blends directly into the dark forest
 * hero banner background at the top-right corner.
 * Features a glowing dual-contour heart with a calm resting physiological heartbeat (~60 BPM),
 * expanding acoustic vital resonance ripples, and an ECG rhythm trace with a streaming pulse.
 * 100% containerless — no boxes, no popup cards, pure integrated vector art.
 */
export function HeroCornerHealthPattern({ className = '' }: HeroCornerHealthPatternProps) {
  return (
    <div
      className={`absolute top-0 right-0 w-[270px] h-[230px] sm:w-[320px] sm:h-[270px] md:w-[360px] md:h-[300px] pointer-events-none select-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <style>{`
        /* Slow physiological heartbeat (~60 BPM human resting pulse) */
        @keyframes heroHeartbeat {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 6px rgba(182, 240, 118, 0.25));
          }
          14% {
            transform: scale(1.07);
            filter: drop-shadow(0 0 14px rgba(182, 240, 118, 0.55));
          }
          28% {
            transform: scale(1.02);
            filter: drop-shadow(0 0 8px rgba(182, 240, 118, 0.3));
          }
          42% {
            transform: scale(1.09);
            filter: drop-shadow(0 0 16px rgba(182, 240, 118, 0.6));
          }
          65% {
            transform: scale(1);
            filter: drop-shadow(0 0 6px rgba(182, 240, 118, 0.25));
          }
        }

        /* Subtle respiratory breathing of acoustic vital ripples */
        @keyframes heroRippleBreathe {
          0%, 100% {
            transform: scale(1);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.035);
            opacity: 0.85;
          }
        }

        /* Continuous slow ECG vital pulse flow */
        @keyframes heroEcgPulseFlow {
          0% {
            stroke-dashoffset: 420;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }

        /* Glowing node twinkle */
        @keyframes heroNodeTwinkle {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.3);
          }
        }

        .hero-health-heart {
          transform-origin: 230px 105px;
          animation: heroHeartbeat 3.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .hero-health-ripples {
          transform-origin: 230px 105px;
          animation: heroRippleBreathe 5.5s ease-in-out infinite;
        }

        .hero-health-ecg-stream {
          stroke-dasharray: 180 180;
          animation: heroEcgPulseFlow 8s linear infinite;
        }

        .hero-health-twinkle {
          transform-origin: 236px 138px;
          animation: heroNodeTwinkle 3.6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-health-heart,
          .hero-health-ripples,
          .hero-health-ecg-stream,
          .hero-health-twinkle {
            animation: none !important;
          }
        }
      `}</style>

      <svg
        viewBox="0 0 360 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform translate-x-2 -translate-y-2"
      >
        <defs>
          {/* Radial aura inside the beating heart */}
          <radialGradient
            id="hero-heart-aura"
            cx="230"
            cy="105"
            r="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B6F076" stopOpacity="0.32" />
            <stop offset="60%" stopColor="#34D399" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1B4D3E" stopOpacity="0.0" />
          </radialGradient>

          {/* Ripple resonance gradient fading outwards and leftwards */}
          <radialGradient
            id="hero-ripple-grad"
            cx="230"
            cy="105"
            r="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B6F076" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#34D399" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#6EE7B7" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#1B4D3E" stopOpacity="0.0" />
          </radialGradient>

          {/* ECG rhythm line gradient fading cleanly to 0 on the left */}
          <linearGradient
            id="hero-ecg-grad"
            x1="360"
            y1="175"
            x2="20"
            y2="175"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B6F076" stopOpacity="0.65" />
            <stop offset="30%" stopColor="#B6F076" stopOpacity="0.75" />
            <stop offset="60%" stopColor="#34D399" stopOpacity="0.4" />
            <stop offset="90%" stopColor="#34D399" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#1B4D3E" stopOpacity="0.0" />
          </linearGradient>

          {/* Heart stroke gradient */}
          <linearGradient
            id="hero-heart-stroke"
            x1="200"
            y1="60"
            x2="250"
            y2="140"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#B6F076" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#6EE7B7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#34D399" stopOpacity="0.55" />
          </linearGradient>

          {/* Glowing node filter */}
          <filter id="hero-node-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── LAYER 1: Acoustic Vital Resonance Ripples ── */}
        <g className="hero-health-ripples">
          <circle cx="230" cy="105" r="48" stroke="url(#hero-ripple-grad)" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="230" cy="105" r="78" stroke="url(#hero-ripple-grad)" strokeWidth="1.2" />
          <circle cx="230" cy="105" r="115" stroke="url(#hero-ripple-grad)" strokeWidth="1" strokeDasharray="4 5" />
          <circle cx="230" cy="105" r="160" stroke="url(#hero-ripple-grad)" strokeWidth="1.1" />
          <circle cx="230" cy="105" r="215" stroke="url(#hero-ripple-grad)" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="230" cy="105" r="280" stroke="url(#hero-ripple-grad)" strokeWidth="0.75" />
        </g>

        {/* ── LAYER 2: Luminous Beating Vital Heart ── */}
        <g className="hero-health-heart">
          {/* Internal soft radiant heart aura */}
          <ellipse cx="230" cy="100" rx="34" ry="28" fill="url(#hero-heart-aura)" />

          {/* Outer elegant contour heart */}
          <path
            d="M 230 132 C 190 105, 175 75, 202 62 C 218 55, 227 67, 230 78 C 233 67, 242 55, 258 62 C 285 75, 270 105, 230 132 Z"
            stroke="url(#hero-heart-stroke)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner nested contour heart (holographic medical depth) */}
          <path
            d="M 230 122 C 200 102, 190 78, 209 68 C 221 62, 228 72, 230 84 C 232 72, 239 62, 251 68 C 270 78, 260 102, 230 122 Z"
            stroke="#B6F076"
            strokeWidth="1"
            strokeDasharray="2 3"
            strokeOpacity="0.45"
          />

          {/* Central vital spark core */}
          <circle cx="230" cy="96" r="3.5" fill="#B6F076" fillOpacity="0.8" />
          <circle cx="230" cy="96" r="7" stroke="#B6F076" strokeWidth="0.75" strokeOpacity="0.35" />
        </g>

        {/* ── LAYER 3: Cardiac ECG Telemetry Waveform ── */}
        {/* Static ECG baseline and cardiac beats */}
        <path
          d="M 360 175 L 275 175 C 268 170, 260 170, 253 175 L 246 179 L 236 138 L 226 195 L 218 175 C 206 166, 194 166, 182 175 L 145 175 C 138 171, 132 171, 126 175 L 115 150 L 106 188 L 98 175 C 88 168, 78 168, 68 175 L 20 175"
          stroke="url(#hero-ecg-grad)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />

        {/* Streaming vital ECG pulse (animated glow along trace) */}
        <path
          className="hero-health-ecg-stream"
          d="M 360 175 L 275 175 C 268 170, 260 170, 253 175 L 246 179 L 236 138 L 226 195 L 218 175 C 206 166, 194 166, 182 175 L 145 175 C 138 171, 132 171, 126 175 L 115 150 L 106 188 L 98 175 C 88 168, 78 168, 68 175 L 20 175"
          stroke="url(#hero-ecg-grad)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#hero-node-glow)"
        />

        {/* Peak R-wave spark node */}
        <g className="hero-health-twinkle">
          <circle cx="236" cy="138" r="3" fill="#B6F076" fillOpacity="0.9" />
          <circle cx="236" cy="138" r="6" stroke="#B6F076" strokeWidth="0.8" strokeOpacity="0.4" />
        </g>

        {/* Second beat R-wave spark node */}
        <circle cx="115" cy="150" r="2.2" fill="#34D399" fillOpacity="0.8" />

        {/* ── LAYER 4: Clinical Crosses & Subtle Biomarker Nodes ── */}
        {/* Subtle Clinical Cross Marker (Top-Right) */}
        <g transform="translate(295, 45)">
          <path d="M -5 0 L 5 0 M 0 -5 L 0 5" stroke="#B6F076" strokeWidth="1.4" strokeLinecap="round" strokeOpacity="0.5" />
          <circle cx="0" cy="0" r="8" stroke="#B6F076" strokeWidth="0.6" strokeDasharray="2 2" strokeOpacity="0.25" />
        </g>

        {/* Secondary Clinical Cross Marker (Lower-Left coordination) */}
        <g transform="translate(165, 140)">
          <path d="M -3.5 0 L 3.5 0 M 0 -3.5 L 0 3.5" stroke="#34D399" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.35" />
        </g>

        {/* Subtle Floating Vital Nodes */}
        <circle cx="275" cy="85" r="1.5" fill="#6EE7B7" fillOpacity="0.45" />
        <circle cx="178" cy="88" r="1.5" fill="#B6F076" fillOpacity="0.4" />
        <circle cx="258" cy="148" r="1.5" fill="#34D399" fillOpacity="0.35" />
        <circle cx="138" cy="132" r="1.25" fill="#6EE7B7" fillOpacity="0.3" />
      </svg>
    </div>
  )
}
