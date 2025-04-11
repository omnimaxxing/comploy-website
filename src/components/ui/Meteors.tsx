import clsx from "clsx";
import React from "react";

export const Meteors = ({ 
  number, 
  className,
  reversed = false 
}: { 
  number?: number, 
  className?: string,
  reversed?: boolean
}) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <div className={clsx("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {meteors.map((el, idx) => {
        // Create depth layers with varying scale and opacity
        const depthLayer = Math.random();
        const isForeground = depthLayer < 0.2; // 20% in foreground (closest)
        const isMidground = depthLayer >= 0.2 && depthLayer < 0.6; // 40% in midground
        const isBackground = depthLayer >= 0.6; // 40% in background (furthest)
        
        // Calculate vertical position for fade-out effect
        const topPosition = Math.floor(Math.random() * 100);
        // Fade out at bottom - meteors at bottom 30% of container will start fading
        const verticalFadeOut = topPosition > 70 ? Math.max(0, 1 - ((topPosition - 70) / 30)) : 1;
        
        // Scale based on depth - smaller for background, larger for foreground
        // Overall reduced scale for subtlety
        const depthScale = isBackground ? 0.25 + (Math.random() * 0.15) : // 0.25-0.4x scale for background (reduced)
                          isMidground ? 0.4 + (Math.random() * 0.2) : // 0.4-0.6x scale for midground (reduced)
                          0.6 + (Math.random() * 0.2); // 0.6-0.8x scale for foreground (reduced)
        
        // Opacity based on depth - further reduced for all meteors
        // Apply vertical fade-out effect
        const baseOpacity = isBackground ? 0.15 + (Math.random() * 0.1) : // 15-25% opacity for background
                            isMidground ? 0.25 + (Math.random() * 0.1) : // 25-35% opacity for midground
                            0.35 + (Math.random() * 0.15); // 35-50% opacity for foreground
        const depthOpacity = baseOpacity * verticalFadeOut;
        
        // Z-index based on depth for proper layering
        const zIndexValue = isBackground ? "z-[2]" : 
                           isMidground ? "z-[12]" : 
                           "z-[32]";
        
        // Randomly determine meteor type with adjusted probabilities
        // Reduce orange fast meteors, increase purple-blue elegant meteors
        const meteorType = Math.random();
        const isSpectacular = meteorType < 0.02; // 2% chance
        const isFastMeteor = meteorType >= 0.02 && meteorType < 0.06; // 4% chance (reduced from 6%)
        const isElegantMeteor = meteorType >= 0.06 && meteorType < 0.56; // 50% chance (increased from 45%)
        const isRegularMeteor = meteorType >= 0.56; // 44% chance (reduced from 47%)
        
        // Determine meteor color with more subtle gradients and glows - further reduced opacity
        const meteorColors = {
          spectacular: "bg-gradient-to-r from-purple-500/70 via-fuchsia-400/60 to-pink-500/50 before:from-pink-500/60 before:via-fuchsia-400/40 before:to-transparent",
          fast: "bg-gradient-to-r from-orange-500/60 to-amber-400/50 before:from-orange-500/50 before:via-amber-400/30 before:to-transparent",
          elegant: "bg-gradient-to-r from-indigo-500/60 via-purple-400/50 to-blue-300/40 before:from-indigo-500/50 before:via-purple-400/40 before:to-transparent",
          regular: "bg-gradient-to-r from-slate-400/50 to-slate-300/40 before:from-slate-400/40 before:via-slate-300/20 before:to-transparent"
        };
        
        // Determine meteor size with even smaller meteor heads
        const meteorSize = isSpectacular 
          ? `h-0.75 w-0.75 before:w-[150px]` // smaller head, longer trail
          : isFastMeteor
            ? `h-[0.25rem] w-[0.25rem] before:w-[100px]` // smaller head
            : isElegantMeteor
              ? `h-[0.2rem] w-[0.2rem] before:w-[130px]` // smaller head, longer trail
              : Math.random() < 0.3 
                ? `h-0.4 w-0.4 before:w-[80px]` // smaller head
                : `h-0.25 w-0.25 before:w-[50px]`; // smaller head
        
        // Determine animation class
        const animationClass = isSpectacular
          ? "animate-meteor-effect-spectacular"
          : isFastMeteor 
            ? "animate-meteor-effect-fast" 
            : isElegantMeteor 
              ? "animate-meteor-effect-elegant" 
              : "animate-meteor-effect";
        
        // Determine trail length, style, and glow effects with reduced intensity
        const trailClass = isSpectacular
          ? "before:h-[1.5px] shadow-sm shadow-pink-500/10" // thinner trail, reduced shadow
          : isFastMeteor 
            ? "before:h-[1.2px] shadow-sm shadow-orange-500/5" // thinner trail, reduced shadow
            : isElegantMeteor
              ? "before:h-[1px] shadow-sm shadow-indigo-500/5" // thinner trail, reduced shadow
              : "before:h-[0.5px]"; // thinner trail
        
        // Enhanced trail effects for curved meteors
        const trailEffects = isElegantMeteor
          ? "before:origin-left before:rotate-[0.15deg]" // more subtle curve
          : "";
        
        // Calculate random rotation for more natural appearance
        // Adjust rotation based on reversed direction
        const baseRotation = reversed ? 325 : 215; // base rotation angle (flipped for reversed)
        const rotationVariation = isRegularMeteor ? Math.random() * 5 - 2.5 : 0; // ±2.5° variation (reduced from ±3°)
        const rotation = baseRotation + rotationVariation;
        
        // Add subtle blur effect for more realistic appearance
        const blurEffect = isBackground 
          ? "blur-[0.5px]" // reduced blur
          : isSpectacular 
            ? "blur-[0.25px]" // reduced blur
            : isFastMeteor 
              ? "blur-[0.1px]" // reduced blur
              : "";
        
        // Animation duration for more natural movement
        // Ensure consistent speed with no slowing/speeding up by using linear easing
        const duration = isSpectacular
          ? 5 + Math.random() * 2 // 5-7s
          : isRegularMeteor 
            ? 6 + Math.random() * 3 // 6-9s
            : isFastMeteor 
              ? 2.5 + Math.random() * 1 // 2.5-3.5s (slightly slower)
              : 7 + Math.random() * 2; // 7-9s
        
        return (
          <span
            key={"meteor" + idx}
            className={clsx(
              animationClass,
              "absolute rounded-[9999px]",
              meteorSize,
              isSpectacular 
                ? meteorColors.spectacular 
                : isFastMeteor 
                  ? meteorColors.fast 
                  : isElegantMeteor 
                    ? meteorColors.elegant 
                    : meteorColors.regular,
              "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:bg-gradient-to-r",
              trailClass,
              trailEffects,
              blurEffect,
              zIndexValue
            )}
            style={{
              top: `${topPosition}%`,
              // Adjust starting position based on direction
              [reversed ? 'right' : 'left']: Math.floor(Math.random() * (400 - -400) + -400) + "px",
              transform: `rotate(${rotation}deg) scale(${depthScale})`,
              opacity: depthOpacity,
              // More varied animation delays for less predictable patterns
              animationDelay: Math.random() * (4 - 0.2) + 0.2 + "s",
              // More consistent animation durations with linear timing
              animationDuration: `${duration}s`,
            }}
          ></span>
        );
      })}
    </div>
  );
};

