'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface Stroke {
  points: { x: number; y: number }[];
  alpha: number;
}

const DrawingCanvas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const strokes: Stroke[] = [];
      let currentStroke: Stroke | null = null;
      let lastInputTime = 0; // Timestamp dell'ultimo input
      let globalAlpha = 255; // Alpha globale per tutti i tratti
      const fadeDelay = 5000; // Aspetta 5 secondi di inattività prima di svanire
      const fadeDuration = 1000; // Durata dello svanimento

      p.setup = () => {
        const canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.style('position', 'fixed');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '9998');
        canvas.style('pointer-events', 'none');
        p.clear();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      p.draw = () => {
        p.clear();
        
        const currentTime = Date.now();
        
        // Calcola l'alpha globale basato sull'ultimo input
        if (lastInputTime > 0 && strokes.length > 0) {
          const timeSinceLastInput = currentTime - lastInputTime;
          
          if (timeSinceLastInput > fadeDelay) {
            // Inizia a svanire
            const fadeProgress = (timeSinceLastInput - fadeDelay) / fadeDuration;
            globalAlpha = Math.max(0, 255 * (1 - fadeProgress));
            
            // Se completamente svanito, pulisci tutto
            if (globalAlpha <= 0) {
              strokes.length = 0;
              lastInputTime = 0;
              globalAlpha = 255;
            }
          } else {
            globalAlpha = 255;
          }
        }
        
        // Disegna tutti i tratti con l'alpha globale
        for (const stroke of strokes) {
          if (stroke.points.length > 1) {
            p.stroke(187, 218, 247, globalAlpha); // #BBDAF7 - primary color
            p.strokeWeight(16);
            p.noFill();
            p.beginShape();
            for (const point of stroke.points) {
              p.vertex(point.x, point.y);
            }
            p.endShape();
          }
        }
        
        // Disegna il tratto corrente (sempre pieno)
        if (currentStroke && currentStroke.points.length > 1) {
          p.stroke(187, 218, 247, 255); // #BBDAF7 - primary color
          p.strokeWeight(16);
          p.noFill();
          p.beginShape();
          for (const point of currentStroke.points) {
            p.vertex(point.x, point.y);
          }
          p.endShape();
        }
      };

      // Gestione eventi mouse tramite window per catturare anche sopra altri elementi
      const handleMouseDown = (e: MouseEvent) => {
        if (e.button === 0) { // Solo click sinistro
          lastInputTime = Date.now();
          globalAlpha = 255; // Reset alpha quando si inizia a disegnare
          currentStroke = {
            points: [{ x: e.clientX, y: e.clientY }],
            alpha: 255
          };
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (currentStroke && e.buttons === 1) {
          currentStroke.points.push({ x: e.clientX, y: e.clientY });
          lastInputTime = Date.now(); // Aggiorna timestamp mentre si disegna
        }
      };

      const handleMouseUp = () => {
        if (currentStroke && currentStroke.points.length > 1) {
          lastInputTime = Date.now();
          strokes.push(currentStroke);
        }
        currentStroke = null;
      };

      // Gestione touch per mobile
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          lastInputTime = Date.now();
          globalAlpha = 255; // Reset alpha quando si inizia a disegnare
          currentStroke = {
            points: [{ x: touch.clientX, y: touch.clientY }],
            alpha: 255
          };
          e.preventDefault(); // Previene lo scroll mentre si disegna
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (currentStroke && e.touches.length === 1) {
          const touch = e.touches[0];
          currentStroke.points.push({ x: touch.clientX, y: touch.clientY });
          lastInputTime = Date.now();
          e.preventDefault(); // Previene lo scroll mentre si disegna
        }
      };

      const handleTouchEnd = () => {
        if (currentStroke && currentStroke.points.length > 1) {
          lastInputTime = Date.now();
          strokes.push(currentStroke);
        }
        currentStroke = null;
      };

      window.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

      // Cleanup function
      (p as p5 & { cleanup?: () => void }).cleanup = () => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    };

    p5InstanceRef.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5InstanceRef.current) {
        const instance = p5InstanceRef.current as p5 & { cleanup?: () => void };
        if (instance.cleanup) {
          instance.cleanup();
        }
        instance.remove();
      }
    };
  }, []);

  return <div ref={containerRef} />;
};

export default DrawingCanvas;
