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
        'group flex overflow-hidden p-2',
        !vertical && 'flex-row gap-4',
        vertical && 'flex-col gap-4',
        className
      )}
      style={{ '--duration': '30s', '--gap': '1rem' } as React.CSSProperties}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex shrink-0 justify-around gap-4',
              !vertical && 'animate-marquee flex-row',
              vertical && 'animate-marquee-vertical flex-col',
              pauseOnHover && 'group-hover:[animation-play-state:paused]',
              reverse && '[animation-direction:reverse]'
            )}
          >
            {children}
          </div>
        ))}
    </div>
  );
}

