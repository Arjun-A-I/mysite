"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import gsap from "gsap";

export interface BlobCursorProps {
  blobType?: "circle" | "square";
  fillColor?: string;
  trailCount?: number;
  sizes?: number[];
  innerSizes?: number[];
  innerColor?: string;
  opacities?: number[];
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  filterId?: string;
  filterStdDeviation?: number;
  filterColorMatrixValues?: string;
  useFilter?: boolean;
  fastDuration?: number;
  slowDuration?: number;
  fastEase?: string;
  slowEase?: string;
  zIndex?: number;
  squeezeTargetClass?: string;
  useInvertEffect?: boolean;
}

export default function BlobCursor({
  blobType = "circle",
  fillColor = "#5227FF",
  trailCount = 3,
  sizes = [60, 125, 75],
  innerSizes = [20, 35, 25],
  innerColor = "rgba(255,255,245,0.8)",
  opacities = [0.6, 0.6, 0.6],
  shadowColor = "rgba(0,0,0,0.75)",
  shadowBlur = 5,
  shadowOffsetX = 10,
  shadowOffsetY = 10,
  filterId = "blob",
  filterStdDeviation = 30,
  filterColorMatrixValues = "1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 35 -10",
  useFilter = true,
  fastDuration = 0.1,
  slowDuration = 0.5,
  fastEase = "power3.out",
  slowEase = "power1.out",
  zIndex = 100,
  squeezeTargetClass = "galaxy-squeeze-target",
  useInvertEffect = false,
}: BlobCursorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const blobsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [isSqueezing, setIsSqueezing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const htmlElement = document.documentElement;
      const hasDarkClass = htmlElement.classList.contains('dark');
      const hasLightClass = htmlElement.classList.contains('light');
      
      // Check if explicitly set to dark/light or follow system preference
      setIsDarkMode(hasDarkClass || (!hasLightClass && darkModeMediaQuery.matches));
    };

    checkDarkMode();

    // Listen for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    darkModeMediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      darkModeMediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  const checkSqueeze = useCallback((x: number, y: number) => {
    // Check if cursor is over an element with the squeeze target class
    const elementsAtPoint = document.elementsFromPoint(x, y);
    const shouldSqueeze = elementsAtPoint.some(el => 
      el.classList.contains(squeezeTargetClass)
    );
    setIsSqueezing(shouldSqueeze);
  }, [squeezeTargetClass]);

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const x = "clientX" in e ? e.clientX : e.touches[0].clientX;
      const y = "clientY" in e ? e.clientY : e.touches[0].clientY;

      // Check if we should squeeze
      checkSqueeze(x, y);

      blobsRef.current.forEach((el, i) => {
        if (!el) return;
        const isLead = i === 0;
        gsap.to(el, {
          x: x,
          y: y,
          duration: isLead ? fastDuration : slowDuration,
          ease: isLead ? fastEase : slowEase,
        });
      });
    },
    [fastDuration, slowDuration, fastEase, slowEase, checkSqueeze]
  );

  useEffect(() => {
    // Apply or remove squeeze effect
    blobsRef.current.forEach((el, i) => {
      if (!el) return;
      
      if (isSqueezing) {
        // Apply squeeze transformation - scale down to smaller circle
        gsap.to(el, {
          scale: 0.45,
          duration: 0.3,
          ease: "power2.inOut",
        });
      } else {
        // Reset to normal
        gsap.to(el, {
          scale: 1,
          duration: 0.3,
          ease: "power2.inOut",
        });
      }
    });
  }, [isSqueezing]);

  useEffect(() => {
    // Add global mouse/touch event listeners
    const handleMouseMove = (e: MouseEvent) => handleMove(e);
    const handleTouchMove = (e: TouchEvent) => handleMove(e);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleMove]);

  // Only apply invert effect in light mode
  const shouldInvert = useInvertEffect && !isDarkMode;

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-screen h-screen pointer-events-none"
      style={{ zIndex }}
    >
      {useFilter && (
        <svg className="absolute w-0 h-0">
          <filter id={filterId}>
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation={filterStdDeviation}
            />
            <feColorMatrix in="blur" values={filterColorMatrixValues} />
          </filter>
        </svg>
      )}

      <div
        className="absolute inset-0 overflow-hidden select-none cursor-default"
        style={{ 
          filter: useFilter ? `url(#${filterId})` : undefined,
          mixBlendMode: shouldInvert ? "difference" : "normal"
        }}
      >
        {Array.from({ length: trailCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => (blobsRef.current[i] = el)}
            className="absolute will-change-transform transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: sizes[i],
              height: sizes[i],
              borderRadius: blobType === "circle" ? "50%" : "0",
              backgroundColor: shouldInvert ? "#000000" : fillColor,
              opacity: opacities[i],
              boxShadow: shouldInvert ? "none" : `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px 0 ${shadowColor}`,
              left: 0,
              top: 0,
              transformOrigin: "center",
            }}
          >
            {!shouldInvert && (
              <div
                className="absolute"
                style={{
                  width: innerSizes[i],
                  height: innerSizes[i],
                  top: (sizes[i] - innerSizes[i]) / 2,
                  left: (sizes[i] - innerSizes[i]) / 2,
                  backgroundColor: innerColor,
                  borderRadius: blobType === "circle" ? "50%" : "0",
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
