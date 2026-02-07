'use client';

import { ReactNode } from 'react';

interface RotatingHeaderProps {
  children: ReactNode;
}

export const RotatingHeader = ({ children }: RotatingHeaderProps) => {
  return (
    <div
      style={{
        mixBlendMode: 'difference',
      }}
    >
      {children}
    </div>
  );
};
