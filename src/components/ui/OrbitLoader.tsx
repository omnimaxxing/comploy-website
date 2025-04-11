"use client";

import { useEffect, useRef } from 'react';
import { orbit } from 'ldrs';

// Register the orbit component
if (typeof window !== 'undefined') {
  orbit.register();
}

export interface OrbitLoaderProps {
  size?: number;
  speed?: number;
  color?: string;
}

export const OrbitLoader = ({ size = 24, speed = 1.5, color = 'white' }: OrbitLoaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Clear any previous content
      containerRef.current.innerHTML = '';
      
      // Create the orbit element
      const orbitElement = document.createElement('l-orbit');
      orbitElement.setAttribute('size', size.toString());
      orbitElement.setAttribute('speed', speed.toString());
      orbitElement.setAttribute('color', color);
      
      // Append to container
      containerRef.current.appendChild(orbitElement);
    }
  }, [size, speed, color]);

  return <div ref={containerRef} className="w-full h-full flex items-center justify-center" />;
}; 