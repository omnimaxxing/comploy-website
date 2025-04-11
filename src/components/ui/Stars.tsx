import clsx from "clsx";
import React from "react";

export const Stars = ({ number = 100, className }: { number?: number, className?: string }) => {
  const stars = new Array(number).fill(true);
  
  return (
    <div className={clsx("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {stars.map((_, idx) => {
        // Create depth layers with varying scale and opacity
        const depthLayer = Math.random();
        const isForeground = depthLayer < 0.2; // 20% in foreground (closest)
        const isMidground = depthLayer >= 0.2 && depthLayer < 0.6; // 40% in midground
        const isBackground = depthLayer >= 0.6; // 40% in background (furthest)
        
        // Calculate position - used for vertical fading
        const topPosition = Math.random() * 100;
        
        // Size based on depth - smaller for background, larger for foreground
        // Overall sizes reduced by ~30% for more subtle effect
        const size = isBackground 
          ? 0.5 + Math.random() * 0.7 // 0.5-1.2px for background (was 1-2px)
          : isMidground 
            ? 1 + Math.random() * 1 // 1-2px for midground (was 1.5-3px)
            : 1.5 + Math.random() * 1 // 1.5-2.5px for foreground (was 2-4px)
        
        // Vertical fade effect - stars fade out as they appear lower on the page
        // Calculate fade factor based on vertical position
        const verticalFade = Math.max(0, 1 - (topPosition / 80)); // Stars below 80% of the page height start to fade out
        
        // Opacity based on depth and vertical position
        const baseOpacity = isBackground 
          ? 0.2 + Math.random() * 0.2 // 20-40% for background (was 30-60%)
          : isMidground 
            ? 0.4 + Math.random() * 0.2 // 40-60% for midground (was 50-80%)
            : 0.5 + Math.random() * 0.3; // 50-80% for foreground (was 70-100%)
        
        // Apply vertical fading factor
        const opacity = baseOpacity * verticalFade;
        
        // Z-index based on depth
        const zIndex = isBackground ? "z-0" : isMidground ? "z-5" : "z-10";
        
        // Determine if star should twinkle (reduce twinkling stars for subtlety)
        const shouldTwinkle = Math.random() < 0.4; // Was 0.6
        
        // Determine star color (mostly white/blue with occasional other colors)
        const colorRoll = Math.random();
        const starColor = colorRoll < 0.7 
          ? "bg-white" // 70% white
          : colorRoll < 0.9 
            ? "bg-blue-200/80" // 20% light blue with reduced opacity
            : colorRoll < 0.95 
              ? "bg-yellow-100/70" // 5% yellow-white with reduced opacity
              : colorRoll < 0.98
                ? "bg-red-200/70" // 3% light red with reduced opacity
                : "bg-purple-200/70"; // 2% light purple with reduced opacity
        
        // Blur effect based on depth
        const blurEffect = isBackground 
          ? "blur-[0.4px]" 
          : isMidground 
            ? "blur-[0.2px]" 
            : "";
        
        // Animation delay
        const animationDelay = Math.random() * 5 + "s";
        
        // Slower animation duration for more subtle effect
        const animationDuration = 4 + Math.random() * 4 + "s";
        
        return (
          <div
            key={`star-${idx}`}
            className={clsx(
              "absolute rounded-full",
              starColor,
              shouldTwinkle && "animate-twinkle-star",
              blurEffect,
              zIndex
            )}
            style={{
              top: `${topPosition}%`,
              left: `${Math.random() * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
              animationDelay,
              animationDuration, // Custom duration
              boxShadow: size > 1.5 ? `0 0 ${size*0.8}px ${size/3}px rgba(255,255,255,0.${Math.floor(opacity * 7)})` : 'none' // Reduced glow
            }}
          />
        );
      })}
    </div>
  );
}; 