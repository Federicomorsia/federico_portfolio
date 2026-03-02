'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getStroke } from 'perfect-freehand';

type Point = [number, number, number]; // x, y, pressure

interface Stroke {
  points: Point[];
}

// Converte i punti del stroke in un path SVG
function getSvgPathFromStroke(points: number[][], closed = true): string {
  const len = points.length;

  if (len < 4) {
    return '';
  }

  let a = points[0];
  let b = points[1];
  const c = points[2];

  let result = `M${a[0].toFixed(2)},${a[1].toFixed(2)} Q${b[0].toFixed(2)},${b[1].toFixed(2)} ${((b[0] + c[0]) / 2).toFixed(2)},${((b[1] + c[1]) / 2).toFixed(2)} T`;

  for (let i = 2, max = len - 1; i < max; i++) {
    a = points[i];
    b = points[i + 1];
    result += `${((a[0] + b[0]) / 2).toFixed(2)},${((a[1] + b[1]) / 2).toFixed(2)} `;
  }

  if (closed) {
    result += 'Z';
  }

  return result;
}

// Opzioni per perfect-freehand
const strokeOptions = {
  size: 20,
  thinning: 0,
  smoothing: 0.75,
  streamline: 0.99,
  simulatePressure: false,
  start: {
    cap: true,
    taper: 0,
  },
  end: {
    cap: true,
    taper: 0,
  },
};

const DrawingCanvas = () => {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [opacity, setOpacity] = useState(1);
  const lastInputTimeRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const fadeDelay = 5000; // 5 secondi prima di svanire
  const fadeDuration = 1000; // Durata dello svanimento

  // Gestione del fade
  useEffect(() => {
    const animate = () => {
      const currentTime = Date.now();
      
      if (lastInputTimeRef.current > 0 && strokes.length > 0) {
        const timeSinceLastInput = currentTime - lastInputTimeRef.current;
        
        if (timeSinceLastInput > fadeDelay) {
          const fadeProgress = (timeSinceLastInput - fadeDelay) / fadeDuration;
          const newOpacity = Math.max(0, 1 - fadeProgress);
          setOpacity(newOpacity);
          
          if (newOpacity <= 0) {
            setStrokes([]);
            lastInputTimeRef.current = 0;
            setOpacity(1);
          }
        } else {
          setOpacity(1);
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [strokes.length]);

  // Gestione eventi
  const handlePointerDown = useCallback((e: PointerEvent) => {
    if (e.button !== 0) return; // Solo click sinistro
    
    lastInputTimeRef.current = Date.now();
    setOpacity(1);
    setCurrentStroke({
      points: [[e.clientX, e.clientY, e.pressure || 0.5]],
    });
  }, []);

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (e.buttons !== 1) return;
    
    setCurrentStroke((prev) => {
      if (!prev) return null;
      lastInputTimeRef.current = Date.now();
      return {
        points: [...prev.points, [e.clientX, e.clientY, e.pressure || 0.5]],
      };
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    setCurrentStroke((prev) => {
      if (prev && prev.points.length > 1) {
        lastInputTimeRef.current = Date.now();
        setStrokes((strokes) => [...strokes, prev]);
      }
      return null;
    });
  }, []);

  // Event listeners
  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // Genera i path SVG per tutti gli stroke salvati
  const strokePaths = strokes.map((stroke, index) => {
    const outlinePoints = getStroke(stroke.points, { ...strokeOptions, last: true });
    const pathData = getSvgPathFromStroke(outlinePoints);
    return <path key={index} d={pathData} fill="#02f713" />;
  });

  // Genera il path per lo stroke corrente
  let currentPath = null;
  if (currentStroke && currentStroke.points.length > 1) {
    const outlinePoints = getStroke(currentStroke.points, { ...strokeOptions, last: false });
    const pathData = getSvgPathFromStroke(outlinePoints);
    currentPath = <path d={pathData} fill="#02f713" />;
  }

  return (
    <svg
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9998,
        pointerEvents: 'none',
        opacity: currentStroke ? 1 : opacity,
        mixBlendMode: 'difference',
      }}
    >
      <g style={{ opacity: opacity }}>
        {strokePaths}
      </g>
      {currentPath}
    </svg>
  );
};

export default DrawingCanvas;
