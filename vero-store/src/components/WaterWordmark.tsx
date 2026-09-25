type WaterWordmarkProps = {
  className?: string;
  /** Larger hero treatment */
  size?: "nav" | "hero";
};

export function WaterWordmark({
  className = "",
  size = "nav",
}: WaterWordmarkProps) {
  const id = size === "hero" ? "vero-water-hero" : "vero-water-nav";
  const height = size === "hero" ? 92 : 36;
  const width = size === "hero" ? 320 : 120;

  return (
    <svg
      className={`water-wordmark water-wordmark--${size} ${className}`.trim()}
      viewBox="0 0 320 92"
      width={width}
      height={height}
      role="img"
      aria-label="VÉRO"
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f3e6c8">
            <animate
              attributeName="stop-color"
              values="#f3e6c8;#d4b56a;#f7efd8;#c9a45a;#f3e6c8"
              dur="7s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="45%" stopColor="#c9a45a">
            <animate
              attributeName="stop-color"
              values="#c9a45a;#f0dfb0;#a88945;#e8d4a0;#c9a45a"
              dur="9s"
              repeatCount="indefinite"
            />
          </stop>
          <stop offset="100%" stopColor="#8f7340">
            <animate
              attributeName="stop-color"
              values="#8f7340;#c9a45a;#6e582f;#b8955a;#8f7340"
              dur="8s"
              repeatCount="indefinite"
            />
          </stop>
          <animate
            attributeName="x1"
            values="0%;40%;0%"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="100%;60%;100%"
            dur="10s"
            repeatCount="indefinite"
          />
        </linearGradient>

        <filter id={`${id}-ripple`} x="-20%" y="-40%" width="140%" height="180%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.04"
            numOctaves="2"
            seed="3"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="11s"
              values="0.014 0.03;0.028 0.055;0.016 0.035;0.014 0.03"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={size === "hero" ? 10 : 5}
            xChannelSelector="R"
            yChannelSelector="G"
          >
            <animate
              attributeName="scale"
              dur="8s"
              values={size === "hero" ? "7;14;9;7" : "3;7;4;3"}
              repeatCount="indefinite"
            />
          </feDisplacementMap>
        </filter>
      </defs>

      <g filter={`url(#${id}-ripple)`} className="water-wordmark__wave">
        <text
          x="160"
          y="66"
          textAnchor="middle"
          className="water-wordmark__text"
          fill={`url(#${id}-metal)`}
        >
          VÉRO
        </text>
      </g>
    </svg>
  );
}
