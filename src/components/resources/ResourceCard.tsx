"use client";

import { Icon } from '@iconify/react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/utilities/cn';
import { format } from 'date-fns';
import type { Resource } from '@/payload-types';

interface ResourceCardProps {
  resource: Resource;
  className?: string;
}

// Map resource types to their respective icons and colors
const resourceTypeConfig = {
  tutorial: {
    icon: 'heroicons:book-open',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
  },
  blog: {
    icon: 'heroicons:document-text',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
  },
  video: {
    icon: 'heroicons:play-circle',
    color: 'rose',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    borderColor: 'border-rose-500/20',
  },
  tool: {
    icon: 'heroicons:wrench-screwdriver',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/20',
  },
};

// Map source platforms to their icons
const platformIcons = {
  youtube: 'simple-icons:youtube',
  medium: 'simple-icons:medium',
  github: 'simple-icons:github',
  dev: 'simple-icons:devdotto',
  other: 'heroicons:globe-alt',
};

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, className = '' }) => {
  const {
    title,
    description,
    resourceType = 'tutorial',
    source,
    externalLink,
    slug,
    publishedDate,
    sourcePlatform,
    image,
    difficulty,
  } = resource;

  // Get configuration for this resource type
  const config = resourceTypeConfig[resourceType as keyof typeof resourceTypeConfig] || resourceTypeConfig.tutorial;
  
  // Determine the link destination
  const sanitizeSlug = (slug: string | null | undefined): string => {
    if (!slug) return '';
    // Make sure slug is a string
    const slugStr = String(slug);
    // Sanitize slug - only allow alphanumeric characters, hyphens, and underscores
    return slugStr.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-+/g, '-');
  };

  const linkHref = source === 'external' && externalLink 
    ? externalLink 
    : `/resources/${resourceType}/${sanitizeSlug(slug)}`;
  
  // External link indicator
  const isExternal = source === 'external';
  
  // Format date
  const formattedDate = publishedDate 
    ? format(new Date(publishedDate), 'MMM d, yyyy')
    : '';

  return (
    <Link
      href={linkHref}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group flex flex-col h-full overflow-hidden rounded-lg border transition-all duration-300",
        config.borderColor,
        "hover:shadow-md hover:shadow-slate-200/20 hover:border-white/30",
        "bg-white/5 backdrop-blur-sm",
        className
      )}
    >
      {/* Image section */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {image && typeof image === 'object' && image.url ? (
          <Image
            src={image.url}
            alt={title || 'Resource image'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          // Placeholder with icon if no image
          <div className={cn("flex items-center justify-center w-full h-full", config.bgColor)}>
            <Icon icon={config.icon} className={cn("w-12 h-12", config.textColor)} />
          </div>
        )}
        
        {/* Resource type badge */}
        <div className={cn(
          "absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium",
          config.bgColor, 
          config.textColor
        )}>
          <div className="flex items-center gap-1">
            <Icon icon={config.icon} className="w-3.5 h-3.5" />
            <span className="capitalize">{resourceType}</span>
          </div>
        </div>
        
        {/* External source badge */}
        {isExternal && sourcePlatform && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
            <div className="flex items-center gap-1">
              <Icon 
                icon={platformIcons[sourcePlatform as keyof typeof platformIcons] || platformIcons.other} 
                className="w-3.5 h-3.5" 
              />
              <span className="capitalize">{sourcePlatform}</span>
            </div>
          </div>
        )}
        
        {/* Difficulty badge if available */}
        {difficulty && (
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-xs">
            <div className="flex items-center gap-1">
              {difficulty === 'beginner' && <Icon icon="heroicons:sparkles" className="w-3.5 h-3.5" />}
              {difficulty === 'intermediate' && <Icon icon="heroicons:adjustments-horizontal" className="w-3.5 h-3.5" />}
              {difficulty === 'advanced' && <Icon icon="heroicons:academic-cap" className="w-3.5 h-3.5" />}
              <span className="capitalize">{difficulty}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="flex flex-col flex-grow p-4">
        <h3 className="font-medium fl-text-step-0 line-clamp-2 mb-2 group-hover:text-white transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-white/70 line-clamp-2 mb-4 flex-grow">
          {description}
        </p>
        
        {/* Footer with date and action */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
          {formattedDate && (
            <span className="text-xs text-white/60">
              {formattedDate}
            </span>
          )}
          
          <div className={cn(
            "inline-flex items-center text-xs font-medium",
            config.textColor,
            "transition-all group-hover:translate-x-0.5"
          )}>
            {isExternal ? (
              <>
                View Resource
                <Icon icon="heroicons:arrow-top-right-on-square" className="ml-1 w-3.5 h-3.5" />
              </>
            ) : (
              <>
                Read More
                <Icon icon="heroicons:arrow-right" className="ml-1 w-3.5 h-3.5" />
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}; 