'use client';

import { useEffect, useRef, useState, Children, cloneElement, isValidElement } from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  className?: string;
  gap?: number;
}

export function Marquee({ 
  children, 
  speed = 30, 
  pauseOnHover = true,
  className = '',
  gap = 12
}: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(speed);

  useEffect(() => {
    if (!scrollerRef.current) return;
    
    const scroller = scrollerRef.current;
    
    // Clear any existing clones first
    const originalItems = Array.from(scroller.children).filter(
      child => !child.hasAttribute('data-clone')
    );
    
    // Remove all clones
    Array.from(scroller.children).forEach(child => {
      if (child.hasAttribute('data-clone')) {
        scroller.removeChild(child);
      }
    });
    
    // Clone items multiple times to ensure seamless loop
    const numClones = 3; // Clone 3 times for smooth infinite scroll
    for (let i = 0; i < numClones; i++) {
      originalItems.forEach((item) => {
        const clone = item.cloneNode(true) as HTMLElement;
        clone.setAttribute('data-clone', 'true');
        scroller.appendChild(clone);
      });
    }
    
    // Calculate proper duration based on content width
    const contentWidth = scroller.scrollWidth / (numClones + 1);
    const newDuration = contentWidth / 50; // pixels per second
    setDuration(Math.max(newDuration, 10));
    
    setIsReady(true);
  }, [children]);

  // Convert children to array and add keys
  const items = Children.toArray(children);

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div
        ref={scrollerRef}
        className="flex w-max"
        style={{
          gap: `${gap}px`,
          opacity: isReady ? 1 : 0,
          animation: isReady ? `marquee-scroll ${duration}s linear infinite` : 'none',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {items.map((child, index) => (
          isValidElement(child) ? cloneElement(child, { key: `original-${index}` }) : child
        ))}
      </div>
      <style jsx global>{`
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }
      `}</style>
    </div>
  );
}
