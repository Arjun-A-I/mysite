'use client';

import { useEffect, useRef, useState } from 'react';
import GalaxyRectangle from './components/GalaxyRectangle';
import BlobCursor from './BlobCursor';

export default function Home() {
  const text = "Arjun A I ";
  const textItalic = "here.";
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  const getBlurAmount = (index: number, isItalic: boolean = false) => {
    if (!isHovering) return 0;
    
    const letterElement = document.getElementById(`letter-${isItalic ? 'italic-' : ''}${index}`);
    if (!letterElement) return 0;

    const rect = letterElement.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return 0;

    const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
    const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

    const distance = Math.sqrt(
      Math.pow(mousePos.x - letterCenterX, 2) + 
      Math.pow(mousePos.y - letterCenterY, 2)
    );

    const maxDistance = 150; // Radius of the blur circle
    const maxBlur = 3; // Maximum blur in pixels
    
    if (distance > maxDistance) return 0;
    
    // Calculate blur based on distance (closer = more blur)
    return maxBlur * (1 - distance / maxDistance);
  };

  return (
    <div className="flex flex-col min-h-screen px-4">

<BlobCursor
  blobType="circle"
  fillColor="#FFFFFF"
  trailCount={3}
  sizes={[60, 125, 75]}
  opacities={[0.8, 0.8, 0.8]}
  useFilter={true}
  filterStdDeviation={30}
  filterColorMatrixValues="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10"
  fastDuration={0.1}
  slowDuration={0.5}
  zIndex={100}
  useInvertEffect={true}
/>
      {/* Top section - full height */}
      <div className="flex-1"></div>
      
      {/* Middle section - text content */}
      <div className="flex flex-col items-center gap-8">
        <div 
          ref={containerRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="relative"
        >
          <h1 className="text-[3rem] sm:text-[5rem] md:text-[6rem] lg:text-[8rem] leading-[0.9] font-editorial font-light text-center cursor-default">
            {text.split('').map((letter, index) => (
              <span 
                key={index} 
                id={`letter-${index}`}
                className="inline-block transition-all duration-200 ease-out"
                style={{
                  filter: `blur(${getBlurAmount(index)}px)`,
                }}
              >
                {letter === ' ' ? '\u00A0' : letter}
              </span>
            ))}
            <span className="italic">
              {textItalic.split('').map((letter, index) => (
                <span 
                  key={`italic-${index}`} 
                  id={`letter-italic-${index}`}
                  className="inline-block transition-all duration-200 ease-out"
                  style={{
                    filter: `blur(${getBlurAmount(index, true)}px)`,
                  }}
                >
                  {letter}
                </span>
              ))}
            </span>
          </h1>
        </div>
      </div>
      
      {/* Bottom section - full height */}
      <div className="flex-1 flex items-center justify-center">
        <GalaxyRectangle 
          className="w-32 h-8 xs:w-40 xs:h-10 sm:w-48 sm:h-12 md:w-60 md:h-14 lg:w-72 lg:h-16" 
          particleCount={100}
        />
      </div>
    </div>
  );
}
