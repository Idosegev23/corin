'use client';

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
  return (
    <div
      className={cn(
        'group flex overflow-hidden p-2 [--duration:40s] [--gap:0.75rem]',
        className
      )}
    >
      <div
        className={cn(
          'flex shrink-0 animate-marquee-seamless flex-row',
          reverse && 'animate-marquee-seamless-reverse',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        style={{
          width: 'max-content',
          gap: 'var(--gap)',
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
    </div>
  );
}
