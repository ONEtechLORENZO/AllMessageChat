import React from "react";

export default function OrbitingTextRings({
    text = "one tech • ",
    size = 640,
    strokeColor = "#c7b8ff",
    glowColor = "rgba(199, 184, 255, 0.85)",
    className = "",
}) {
    const center = size / 2;
    // 10 concentric rings.
    const ringCount = 10;
    const startRadius = 170;
    const ringGap = 32; // more distance between rings
    const rings = Array.from({ length: ringCount }, (_, i) => startRadius + i * ringGap);

    // Very slow orbiting motion.
    // Bump a bit slower (seconds per full rotation).
    const durations = rings.map((_, i) => 260 + i * 34);

    const repeatToFill = (radius) => {
        const circumference = 2 * Math.PI * radius;
        const averageCharWidth = 11;
        const estimatedCharsNeeded = Math.ceil(circumference / averageCharWidth);
        const repeats = Math.ceil(estimatedCharsNeeded / text.length) + 2;
        return Array.from({ length: repeats }, () => text).join("");
    };

    return (
        <div
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
            aria-hidden="true"
        >
            <svg
                viewBox={`0 0 ${size} ${size}`}
                width={size}
                height={size}
                className="overflow-visible"
                role="img"
                aria-label="Orbiting ONE TECH text rings"
            >
                <defs>
                    {rings.map((radius, index) => (
                        <path
                            key={radius}
                            id={`ai-orbit-path-${index}`}
                            d={[
                                `M ${center}, ${center}`,
                                `m -${radius}, 0`,
                                `a ${radius},${radius} 0 1,1 ${radius * 2},0`,
                                `a ${radius},${radius} 0 1,1 -${radius * 2},0`,
                            ].join(" ")}
                            fill="none"
                        />
                    ))}
                </defs>

                {rings.map((radius, index) => {
                    const rotateClockwise = index % 2 === 0;

                    return (
                        <g
                            key={radius}
                            className={rotateClockwise ? "ai-orbit-cw" : "ai-orbit-ccw"}
                            style={{
                                transformOrigin: `${center}px ${center}px`,
                                animationDuration: `${durations[index]}s`,
                            }}
                        >
                                <text
                                    fill={strokeColor}
                                    fontSize={
                                    radius < 220 ? 18 : radius < 280 ? 17 : radius < 340 ? 16 : 15
                                    }
                                    fontWeight={700}
                                    letterSpacing="3px"
                                    style={{
                                    textTransform: "lowercase",
                                    filter: `drop-shadow(0 0 3px ${glowColor}) drop-shadow(0 0 8px ${glowColor})`,
                                }}
                            >
                                <textPath href={`#ai-orbit-path-${index}`} startOffset="0%">
                                    {repeatToFill(radius)}
                                </textPath>
                            </text>
                        </g>
                    );
                })}
            </svg>

            <style>{`
        .ai-orbit-cw {
          animation-name: ai-orbit-cw;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .ai-orbit-ccw {
          animation-name: ai-orbit-ccw;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes ai-orbit-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes ai-orbit-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
      `}</style>
        </div>
    );
}
