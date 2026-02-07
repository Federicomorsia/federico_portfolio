'use client';

import dynamic from 'next/dynamic';

const DrawingCanvas = dynamic(() => import('./DrawingCanvas'), {
  ssr: false,
});

const DrawingCanvasWrapper = () => {
  return <DrawingCanvas />;
};

export default DrawingCanvasWrapper;
