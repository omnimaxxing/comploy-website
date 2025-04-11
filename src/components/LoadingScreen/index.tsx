// components/LoadingScreen.js
'use client';

import { useContext } from 'react';
import { LoadingContext } from '@/providers/LoadingContext';
import { VideoMedia } from '../Media/VideoMedia';

export default function LoadingScreen() {
  const { setIsLoading } = useContext(LoadingContext);

  const handleVideoEnd = () => {
    setIsLoading(false);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white z-50"
      aria-hidden="true"
    >
      <div className="w-6/12 max-w-md">
        <div className="relative" style={{ paddingBottom: '56.25%' }}>
          <video
            src="/assets/animations/Loading.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
