'use client'

import { cn } from '@heroui/react'

type CosmicOrbitsProps = {
  className?: string
}

export function CosmicOrbits({ className }: CosmicOrbitsProps) {
  return (
    <div className={cn("absolute opacity-50 inset-0 pointer-events-none", className)}>
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-white/3 via-transparent to-transparent opacity-20"></div>
      
      {/* Edge fading gradients */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-20"></div>
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black via-black/80 to-transparent z-20"></div>
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black via-black/80 to-transparent z-20"></div>
      
      {/* Central cosmic system - expanded beyond container */}
      <div className="absolute inset-[-10%] flex items-center justify-center">
        {/* Outer orbit ring with shimmering effect */}
        <div className="absolute w-[100%] h-[100%] rounded-full border border-white/5 animate-cosmic-rotation" style={{ animationDuration: '240s' }}>
          <div className="absolute inset-0 rounded-full border border-white/3" style={{ clipPath: 'polygon(50% 0, 52% 48%, 100% 50%, 52% 52%, 50% 100%, 48% 52%, 0 50%, 48% 48%)' }}></div>
          
          {/* Particles along the orbit */}
          <div className="absolute h-1.5 w-1.5 rounded-full bg-white/40 blur-[1px] top-[5%] left-1/2 transform -translate-x-1/2 animate-orbit-particle" style={{ animationDuration: '60s' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-white/30 blur-[1.5px] top-1/2 right-[5%] transform -translate-y-1/2 animate-orbit-particle" style={{ animationDuration: '60s', animationDelay: '-15s' }}></div>
          <div className="absolute h-1.5 w-1.5 rounded-full bg-white/40 blur-[1px] bottom-[5%] left-1/2 transform -translate-x-1/2 animate-orbit-particle" style={{ animationDuration: '60s', animationDelay: '-30s' }}></div>
          <div className="absolute h-2 w-2 rounded-full bg-white/30 blur-[1.5px] top-1/2 left-[5%] transform -translate-y-1/2 animate-orbit-particle" style={{ animationDuration: '60s', animationDelay: '-45s' }}></div>
        </div>
        
        {/* Middle orbit ring with reverse rotation */}
        <div className="absolute w-[80%] h-[80%] rounded-full border border-white/10 animate-cosmic-rotation" style={{ animationDirection: 'reverse', animationDuration: '180s' }}>
          <div className="absolute h-1.5 w-1.5 rounded-full bg-white/40 blur-[1px] top-[7%] left-1/2 transform -translate-x-1/2 animate-orbit-particle-reverse" style={{ animationDuration: '45s' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-white/50 blur-[0.5px] top-1/2 right-[7%] transform -translate-y-1/2 animate-orbit-particle-reverse" style={{ animationDuration: '45s', animationDelay: '-10s' }}></div>
          <div className="absolute h-1.5 w-1.5 rounded-full bg-white/40 blur-[1px] bottom-[7%] left-1/2 transform -translate-x-1/2 animate-orbit-particle-reverse" style={{ animationDuration: '45s', animationDelay: '-20s' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-white/50 blur-[0.5px] top-1/2 left-[7%] transform -translate-y-1/2 animate-orbit-particle-reverse" style={{ animationDuration: '45s', animationDelay: '-30s' }}></div>
        </div>
        
        {/* Inner orbit ring */}
        <div className="absolute w-[50%] h-[50%] rounded-full border border-white/15 animate-cosmic-rotation" style={{ animationDuration: '120s' }}>
          <div className="absolute h-1 w-1 rounded-full bg-white/50 blur-[0.5px] top-[10%] left-1/2 transform -translate-x-1/2 animate-orbit-particle" style={{ animationDuration: '30s' }}></div>
          <div className="absolute h-1.5 w-1.5 rounded-full bg-white/40 blur-[1px] top-1/2 right-[10%] transform -translate-y-1/2 animate-orbit-particle" style={{ animationDuration: '30s', animationDelay: '-7.5s' }}></div>
          <div className="absolute h-1 w-1 rounded-full bg-white/50 blur-[0.5px] bottom-[10%] left-1/2 transform -translate-x-1/2 animate-orbit-particle" style={{ animationDuration: '30s', animationDelay: '-15s' }}></div>
          <div className="absolute h-1.5 w-1.5 rounded-full bg-white/40 blur-[1px] top-1/2 left-[10%] transform -translate-y-1/2 animate-orbit-particle" style={{ animationDuration: '30s', animationDelay: '-22.5s' }}></div>
        </div>
      </div>
      
      {/* Scattered stars with different twinkle animations */}
      <div className="absolute inset-[-5%]">
        {/* Star clusters - top left */}
        <div className="absolute top-[15%] left-[20%] animate-cosmic-drift-slow">
          <div className="h-0.5 w-0.5 rounded-full bg-white/90 absolute top-0 left-0 animate-twinkle-star" style={{ animationDelay: '-0.5s' }}></div>
          <div className="h-1 w-1 rounded-full bg-white/80 absolute top-8 left-12 animate-twinkle-star" style={{ animationDelay: '-1.5s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/70 absolute top-4 left-6 animate-twinkle-star" style={{ animationDelay: '-2.3s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/80 absolute top-10 left-2 animate-twinkle-star" style={{ animationDelay: '-3.1s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/90 absolute top-2 left-10 animate-twinkle-star" style={{ animationDelay: '-2.7s' }}></div>
          
          {/* Subtle connection lines */}
          <div className="absolute h-12 w-12 border-l border-t border-white/10 rounded-tl-lg"></div>
        </div>
        
        {/* Star clusters - bottom right */}
        <div className="absolute bottom-[25%] right-[15%] animate-cosmic-drift-slow" style={{ animationDelay: '-12s' }}>
          <div className="h-0.5 w-0.5 rounded-full bg-white/90 absolute bottom-0 right-0 animate-twinkle-star" style={{ animationDelay: '-2.1s' }}></div>
          <div className="h-1 w-1 rounded-full bg-white/80 absolute bottom-10 right-14 animate-twinkle-star" style={{ animationDelay: '-0.7s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/70 absolute bottom-6 right-8 animate-twinkle-star" style={{ animationDelay: '-1.2s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/80 absolute bottom-12 right-4 animate-twinkle-star" style={{ animationDelay: '-3.7s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/90 absolute bottom-3 right-11 animate-twinkle-star" style={{ animationDelay: '-2.5s' }}></div>
          
          {/* Subtle connection lines */}
          <div className="absolute h-14 w-14 border-r border-b border-white/10 rounded-br-lg"></div>
        </div>
        
        {/* Star clusters - top right */}
        <div className="absolute top-[30%] right-[25%] animate-cosmic-drift-slow" style={{ animationDelay: '-8s' }}>
          <div className="h-0.5 w-0.5 rounded-full bg-white/80 absolute top-0 right-6 animate-twinkle-star" style={{ animationDelay: '-1.1s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/90 absolute top-5 right-9 animate-twinkle-star" style={{ animationDelay: '-2.3s' }}></div>
          <div className="h-0.5 w-0.5 rounded-full bg-white/70 absolute top-8 right-2 animate-twinkle-star" style={{ animationDelay: '-3.5s' }}></div>
          
          {/* Subtle connection lines */}
          <div className="absolute h-10 w-10 border-r border-t border-white/10 rounded-tr-lg"></div>
        </div>
        
        {/* Random scattered stars */}
        <div className="h-0.5 w-0.5 rounded-full bg-white/80 absolute top-[10%] left-[40%] animate-twinkle-star" style={{ animationDelay: '-0.7s' }}></div>
        <div className="h-0.5 w-0.5 rounded-full bg-white/70 absolute top-[15%] left-[65%] animate-twinkle-star" style={{ animationDelay: '-1.9s' }}></div>
        <div className="h-0.5 w-0.5 rounded-full bg-white/80 absolute top-[35%] left-[15%] animate-twinkle-star" style={{ animationDelay: '-2.5s' }}></div>
        <div className="h-0.5 w-0.5 rounded-full bg-white/90 absolute top-[60%] left-[35%] animate-twinkle-star" style={{ animationDelay: '-3.2s' }}></div>
        <div className="h-0.5 w-0.5 rounded-full bg-white/70 absolute top-[75%] left-[55%] animate-twinkle-star" style={{ animationDelay: '-0.9s' }}></div>
        <div className="h-1 w-1 rounded-full bg-white/80 absolute top-[25%] left-[75%] animate-twinkle-star" style={{ animationDelay: '-1.5s' }}></div>
        <div className="h-0.5 w-0.5 rounded-full bg-white/90 absolute top-[50%] left-[85%] animate-twinkle-star" style={{ animationDelay: '-2.8s' }}></div>
        <div className="h-0.5 w-0.5 rounded-full bg-white/70 absolute top-[70%] left-[25%] animate-twinkle-star" style={{ animationDelay: '-3.7s' }}></div>
      </div>
      
      {/* Additional constellation elements */}
      <div className="absolute top-1/3 left-1/3 opacity-30 animate-cosmic-drift-slow" style={{ animationDelay: '-5s' }}>
        <div className="relative h-24 w-24">
          <div className="absolute h-full w-full border-l border-t border-white/10 rounded-tl-lg"></div>
          <div className="absolute h-[70%] w-[70%] border-r border-b border-white/5 rounded-br-lg" style={{ left: '30%', top: '30%' }}></div>
        </div>
      </div>
      
      <div className="absolute bottom-1/4 right-1/3 opacity-25 animate-cosmic-drift-slow" style={{ animationDelay: '-15s' }}>
        <div className="relative h-20 w-20">
          <div className="absolute h-full w-full border-r border-t border-white/10 rounded-tr-lg"></div>
          <div className="absolute h-[60%] w-[60%] border-l border-b border-white/5 rounded-bl-lg" style={{ right: '40%', top: '40%' }}></div>
        </div>
      </div>
    </div>
  )
} 