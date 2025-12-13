'use client';

import { ComponentPropsWithoutRef } from 'react';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface MarqueeProps extends ComponentPropsWithoutRef<'div'> {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
  repeat?: number;
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        'group flex overflow-hidden',
        !vertical && 'flex-row',
        vertical && 'flex-col',
        className
      )}
      style={{ 
        '--duration': '40s', 
        '--gap': '1rem' 
      } as React.CSSProperties}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex shrink-0 gap-4',
              !vertical && 'flex-row',
              vertical && 'flex-col',
              pauseOnHover && 'group-hover:[animation-play-state:paused]',
              reverse && '[animation-direction:reverse]'
            )}
            style={{
              animation: vertical 
                ? 'marquee-vertical var(--duration) linear infinite' 
                : 'marquee var(--duration) linear infinite'
            }}
          >
            {children}
          </div>
        ))}
    </div>
  );
}

