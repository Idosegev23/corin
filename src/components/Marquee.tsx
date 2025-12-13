'use client';

import { useState } from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  duration?: number;
}

export function Marquee({
  children,
  className = '',
  reverse = false,
  pauseOnHover = true,
  duration = 40,
}: MarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        className="flex w-max"
        style={{
          animation: `marquee-seamless ${duration}s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: isPaused ? 'paused' : 'running',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* First set */}
        <div className="flex shrink-0 gap-3">
          {children}
        </div>
        {/* Second set */}
        <div className="flex shrink-0 gap-3">
          {children}
        </div>
        {/* Third set */}
        <div className="flex shrink-0 gap-3">
          {children}
        </div>
      </div>
      <style jsx global>{`
        @keyframes marquee-seamless {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}
