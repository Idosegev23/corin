'use client';

import { useEffect, useRef, useState } from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
}

export function Marquee({ 
  children, 
  speed = 30, 
  pauseOnHover = true,
  className = ''
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    
    const scroller = scrollerRef.current;
    const scrollerContent = Array.from(scroller.children);
    
    // Duplicate items for seamless loop
    scrollerContent.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;
      scroller.appendChild(clone);
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        ref={scrollerRef}
        className="flex gap-4 w-max"
        style={{
          animation: `scroll ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {children}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

