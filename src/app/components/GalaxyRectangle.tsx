'use client';

import { useEffect, useRef, useState } from 'react';

// Vector class for particle positioning
class Vector {
  x: number;
  y: number;
  z: number;

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v: Vector) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
  }
  
  scale(n: number) {
    this.x *= n;
    this.y *= n;
    this.z *= n;
  }
}

// Particle class for galaxy effect
class Particle {
  pos: Vector;
  vel: Vector;
  fill: string;
  stroke: string;
  baseVel: Vector;

  constructor(x: number, y: number, z: number, zSpeed: number, isDarkMode: boolean) {
    this.pos = new Vector(x, y, z);
    const X_VEL = 0, Y_VEL = 0, Z_VEL = -zSpeed;
    this.vel = new Vector(X_VEL, Y_VEL, Z_VEL);
    this.vel.scale(0.005);
    // Store base velocity for speed modifications
    this.baseVel = new Vector(this.vel.x, this.vel.y, this.vel.z);
    // In dark mode: particles are black, in light mode: particles are white
    this.fill = isDarkMode ? "rgba(8,23,23,0.3)" : "rgba(255,255,255,0.3)";
    this.stroke = this.fill;
  }

  update() {
    this.pos.add(this.vel);
  }

  setSpeedMultiplier(multiplier: number) {
    this.vel.x = this.baseVel.x * multiplier;
    this.vel.y = this.baseVel.y * multiplier;
    this.vel.z = this.baseVel.z * multiplier;
  }

  render(ctx: CanvasRenderingContext2D, w: number, h: number, xo: number, yo: number, maxZ: number, maxR: number) {
    const to2d = (v: Vector) => {
      const X_COORD = v.x - xo;
      const Y_COORD = v.y - yo;
      const PX = X_COORD / v.z;
      const PY = Y_COORD / v.z;
      return [PX + xo, PY + yo];
    };

    const PIXEL = to2d(this.pos);
    const X = PIXEL[0];
    const Y = PIXEL[1];
    const R = (maxZ - this.pos.z) / maxZ * maxR;

    // Reset particle position when it goes out of bounds with some margin
    if (X < -R || X > w + R || Y < -R || Y > h + R) this.pos.z = maxZ;

    this.update();
    ctx.beginPath();
    ctx.fillStyle = this.fill;
    ctx.strokeStyle = this.stroke;
    ctx.arc(X, Y, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }
}

interface GalaxyRectangleProps {
  className?: string;
  particleCount?: number;
}

export default function GalaxyRectangle({ 
  className = "mt-8 w-64 h-10 sm:w-80 sm:h-10 md:w-96 md:h-10",
  particleCount = 400 
}: GalaxyRectangleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const isHoveredRef = useRef(false);
  const [, forceUpdate] = useState({});

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the parent container dimensions
    const container = canvas.parentElement;
    if (!container) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    updateCanvasSize();

    const W = canvas.width;
    const H = canvas.height;
    const XO = W / 2;
    const YO = H / 2;
    const MAX_Z = 2;
    const MAX_R = 1;
    const Z_SPD = 1;
    const PARTICLES: Particle[] = [];

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      const X = Math.random() * W;
      const Y = Math.random() * H;
      const Z = Math.random() * MAX_Z;
      PARTICLES.push(new Particle(X, Y, Z, Z_SPD, isDarkMode));
    }

    let animationId: number;

    const render = () => {
      // Apply speed multiplier based on hover state
      const speedMultiplier = isHoveredRef.current ? 3 : 1;
      for (let i = 0; i < PARTICLES.length; i++) {
        PARTICLES[i].setSpeedMultiplier(speedMultiplier);
        PARTICLES[i].render(ctx, W, H, XO, YO, MAX_Z, MAX_R);
      }
    };

    const loop = () => {
      animationId = requestAnimationFrame(loop);
      // In dark mode: background is light color, in light mode: background is dark
      ctx.fillStyle = isDarkMode ? "rgba(255,255,245,0.15)" : "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, W, H);
      render();
    };

    loop();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    }); 
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [particleCount, isDarkMode]);

  return (
    <div 
      className="relative inline-block group"
      onMouseEnter={() => isHoveredRef.current = true}
      onMouseLeave={() => isHoveredRef.current = false}
    >
      {/* Main galaxy container */}
      <div 
        className={`${className} galaxy-squeeze-target bg-foreground/10 border-2 border-foreground/20 relative transition-transform duration-300 ease-in-out group-hover:scale-[0.85]`} 
        style={{
          borderRadius: '3rem'
        }}
      >
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ borderRadius: '3rem' }}
        />
      </div>
      
      {/* First outer border ring */}
      <div 
        className="absolute inset-0 -m-1 border-1 border-foreground/30 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-[0.88]"
        style={{ 
          borderRadius: '3.25rem',
          transform: 'scale(1.05)',
          transformOrigin: 'center'
        }}
      />
      
      {/* Second outer border ring with more spacing */}
      <div 
        className="absolute inset-0 -m-2.5 border border-foreground/15 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-[0.91]"
        style={{ 
          borderRadius: '3.5rem',
          transform: 'scale(1.1)',
          transformOrigin: 'center'
        }}
      />
      
      {/* Third outer border ring with even more spacing */}
      <div 
        className="absolute inset-0 -m-4 border border-foreground/7.5 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-[0.94]"
        style={{ 
          borderRadius: '3.75rem',
          transform: 'scale(1.15)',
          transformOrigin: 'center'
        }}
      />
      
    </div>
  );
} 