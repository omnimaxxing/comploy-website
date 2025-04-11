"use client";

import { useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/utilities/cn';
import { ResourceCard } from './ResourceCard';
import { Resource } from '@/payload-types';


// Tab category configuration type
export type ResourceCategory = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  borderColor: string;
  animationDelay: string;
  href?: string; // Optional href property
};

interface ResourcesTabProps {
  category: ResourceCategory;
  resources: Resource[];
  isActive: boolean;
  onToggle: () => void;
  className?: string;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({
  category,
  resources,
  isActive,
  onToggle,
  className = '',
}) => {
  return (
    <div className={cn(
      "w-full border border-white/20 rounded-md transition-colors",
      isActive ? "border-white/30" : "hover:border-white/30",
      className
    )}>
      {/* Tab header - always visible */}
      <button
        onClick={onToggle}
        className={cn(
          "relative w-full p-4 flex items-center justify-between text-left overflow-hidden rounded-md",
          isActive ? "rounded-b-none" : ""
        )}
        aria-expanded={isActive}
      >
        {/* Subtle color accent - animated gradient border */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-r",
          category.gradientFrom,
          category.gradientTo,
          "rounded-md"
        )}></div>
        
        {/* Glowing accent in one corner */}
        <div className={cn(
          "absolute -top-6 -right-6 w-12 h-12 rounded-full blur-xl",
          `bg-${category.glowColor}`,
          "opacity-0 group-hover:opacity-70 transition-opacity duration-500"
        )}></div>
        
        {/* Animated moving border */}
        <div className="absolute inset-0 rounded-md overflow-hidden pointer-events-none">
          {/* Top border */}
          <div 
            className={cn(
              "absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-transparent to-transparent",
              `group-hover:via-${category.borderColor}`,
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "animate-moveGradientX"
            )}
            style={{
              width: '100%',
              animationDelay: category.animationDelay
            }}
          ></div>
          
          {/* Right border */}
          <div 
            className={cn(
              "absolute top-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-transparent to-transparent",
              `group-hover:via-${category.borderColor}`,
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "animate-moveGradientY"
            )}
            style={{
              height: '100%',
              animationDelay: `calc(${category.animationDelay} + 2s)`
            }}
          ></div>
          
          {/* Bottom border */}
          <div 
            className={cn(
              "absolute bottom-0 right-0 h-[1px] bg-gradient-to-l from-transparent via-transparent to-transparent",
              `group-hover:via-${category.borderColor}`,
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "animate-moveGradientX"
            )}
            style={{
              width: '100%',
              animationDelay: `calc(${category.animationDelay} + 4s)`
            }}
          ></div>
          
          {/* Left border */}
          <div 
            className={cn(
              "absolute bottom-0 left-0 w-[1px] bg-gradient-to-t from-transparent via-transparent to-transparent",
              `group-hover:via-${category.borderColor}`,
              "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "animate-moveGradientY"
            )}
            style={{
              height: '100%',
              animationDelay: `calc(${category.animationDelay} + 6s)`
            }}
          ></div>
        </div>
        
        {/* Left side with icon and content */}
        <div className="flex items-center gap-4 relative z-10">
          {/* Icon container with centered icon and subtle color */}
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            "bg-white/5 group-hover:bg-white/10 transition-colors",
            `text-${category.color}-400`
          )}>
            <Icon icon={category.icon} className="text-white/80 w-6 h-6 transition-colors" />
          </div>
          
          {/* Title and description */}
          <div>
            <h2 className={cn(
              "text-lg font-medium transition-colors",
              `text-${category.color}-300`
            )}>
              {category.title}
            </h2>
            <p className="text-sm text-white/70">
              {category.description}
            </p>
          </div>
        </div>
        
        {/* Right side with expand/collapse icon */}
        <div className="pr-2 transition-transform duration-300" style={{ transform: isActive ? 'rotate(90deg)' : 'none' }}>
          <Icon icon="heroicons:chevron-right" className="text-white/60 w-5 h-5" />
        </div>
      </button>
      
      {/* Expandable content area - only visible when active */}
      {isActive && (
        <div className="border-t border-white/20 p-6 animate-in fade-in-0 slide-in-from-top duration-300">
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource as Resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon icon="heroicons:document-magnifying-glass" className="w-12 h-12 mx-auto text-white/20 mb-4" />
              <h3 className="text-lg font-medium mb-2">No resources available</h3>
              <p className="text-white/60">
                Check back soon for {category.title.toLowerCase()} resources.
              </p>
            </div>
          )}
          
          {resources.length >= 6 && (
            <div className="mt-8 text-center">
              <a 
                href={`/resources/${category.id}`}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all",
                  `bg-${category.color}-500/20 text-${category.color}-300 hover:bg-${category.color}-500/30`
                )}
              >
                View all {category.title}
                <Icon icon="heroicons:arrow-right" className="ml-2 w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 