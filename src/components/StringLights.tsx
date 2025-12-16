import React from "react";

interface StringLightsProps {
  position: "top" | "bottom" | "left" | "right";
  count?: number;
}

const colors = ['#ef4444', '#22c55e', '#eab308'];

export function StringLights({ position, count = 8 }: StringLightsProps) {
  const isHorizontal = position === "top" || position === "bottom";
  const bulbCount = count;
  
  if (isHorizontal) {
    return (
      <div 
        className={`absolute ${position}-0 left-0 right-0 h-6 sm:h-7 pointer-events-none`}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 400 28" 
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Drooping wire */}
          <path
            d={`M 0 4 Q 50 12, 100 6 Q 150 0, 200 8 Q 250 16, 300 6 Q 350 -2, 400 4`}
            fill="none"
            stroke="#4a4a4a"
            strokeWidth="1.5"
            className="opacity-70"
          />
          {/* Bulbs */}
          {[...Array(bulbCount)].map((_, i) => {
            const x = (400 / (bulbCount + 1)) * (i + 1);
            // Calculate y position based on droop curve
            const t = x / 400;
            const y = 4 + Math.sin(t * Math.PI * 2) * 4 + (position === "bottom" ? 2 : 6);
            const color = colors[i % 3];
            const delay = i * 0.2;
            
            return (
              <g key={i}>
                {/* Wire to bulb */}
                <line
                  x1={x}
                  y1={y - 2}
                  x2={x}
                  y2={y + 2}
                  stroke="#4a4a4a"
                  strokeWidth="1"
                />
                {/* Teardrop bulb */}
                <ellipse
                  cx={x}
                  cy={y + 6}
                  rx="4"
                  ry="6"
                  fill={color}
                  className="animate-twinkle"
                  style={{ 
                    animationDelay: `${delay}s`,
                    filter: `drop-shadow(0 0 6px ${color})`
                  }}
                />
                {/* Bulb highlight */}
                <ellipse
                  cx={x - 1}
                  cy={y + 4}
                  rx="1.5"
                  ry="2"
                  fill="white"
                  opacity="0.3"
                />
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
  
  // Vertical (left/right)
  const verticalCount = Math.max(3, Math.floor(count / 2));
  
  return (
    <div 
      className={`absolute top-0 bottom-0 ${position}-0 w-6 sm:w-7 pointer-events-none`}
    >
      <svg 
        width="100%" 
        height="100%" 
        viewBox="0 0 28 200" 
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Drooping wire */}
        <path
          d={position === "left" 
            ? `M 4 0 Q 12 50, 6 100 Q 0 150, 4 200`
            : `M 24 0 Q 16 50, 22 100 Q 28 150, 24 200`
          }
          fill="none"
          stroke="#4a4a4a"
          strokeWidth="1.5"
          className="opacity-70"
        />
        {/* Bulbs */}
        {[...Array(verticalCount)].map((_, i) => {
          const y = (200 / (verticalCount + 1)) * (i + 1);
          const t = y / 200;
          const xBase = position === "left" ? 4 : 24;
          const x = xBase + Math.sin(t * Math.PI) * (position === "left" ? 4 : -4);
          const color = colors[i % 3];
          const delay = i * 0.25 + 0.1;
          
          return (
            <g key={i}>
              {/* Wire to bulb */}
              <line
                x1={x}
                y1={y}
                x2={position === "left" ? x + 4 : x - 4}
                y2={y}
                stroke="#4a4a4a"
                strokeWidth="1"
              />
              {/* Teardrop bulb */}
              <ellipse
                cx={position === "left" ? x + 8 : x - 8}
                cy={y}
                rx="4"
                ry="6"
                fill={color}
                className="animate-twinkle"
                style={{ 
                  animationDelay: `${delay}s`,
                  filter: `drop-shadow(0 0 6px ${color})`
                }}
              />
              {/* Bulb highlight */}
              <ellipse
                cx={position === "left" ? x + 7 : x - 9}
                cy={y - 2}
                rx="1.5"
                ry="2"
                fill="white"
                opacity="0.3"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function StringLightsBorder({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute -inset-3 sm:-inset-4 rounded-2xl pointer-events-none ${className}`}>
      <StringLights position="top" count={8} />
      <StringLights position="bottom" count={8} />
      <StringLights position="left" count={4} />
      <StringLights position="right" count={4} />
    </div>
  );
}
