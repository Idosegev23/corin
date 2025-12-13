'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = true,
  children,
}: MarqueeProps) {
  const [isPaused, setIsPaused] = useState(false);
  
  return (
    <div
      className={cn('flex overflow-hidden', className)}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        className="flex shrink-0 flex-row"
        style={{
          width: 'max-content',
          gap: '12px',
          animation: `marquee-seamless var(--duration, 40s) linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
          animationPlayState: isPaused ? 'paused' : 'running',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* First set */}
        <div className="flex shrink-0" style={{ gap: '12px' }}>
          {children}
        </div>
        {/* Second set */}
        <div className="flex shrink-0" style={{ gap: '12px' }}>
          {children}
        </div>
        {/* Third set */}
        <div className="flex shrink-0" style={{ gap: '12px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
