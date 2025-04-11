'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ScrollingBanner from '../ui/scrolling-banner';
import type { HomeGlobal } from '@/payload-types';

type TechLogo = {
  key: string;
  name: string;
  href: string;
  logoUrl: string;
  style: 'white' | 'dark';
};

type PoweredBySectionProps = {
  data?: HomeGlobal['poweredBySection'];
};

// Fallback default logos in case no data is provided
const defaultTechLogos: TechLogo[] = [
  { 
    key: 'nextjs', 
    name: 'Next.js', 
    logoUrl: '/logos/nextjs.png',
    href: 'https://nextjs.org/',
    style: 'white'
  },
  { 
    key: 'payload', 
    name: 'Payload CMS', 
    logoUrl: '/logos/payload.png',
    href: 'https://payloadcms.com/',
    style: 'dark'
  },
  { 
    key: 'vercel', 
    name: 'Vercel', 
    logoUrl: '/logos/vercel.png',
    href: 'https://vercel.com/',
    style: 'white'
  },
  { 
    key: 'groq', 
    name: 'GROQ', 
    logoUrl: '/logos/groq.png',
    href: 'https://groq.com/',
    style: 'dark'
  },
  { 
    key: 'react', 
    name: 'React', 
    logoUrl: '/logos/react2.png',
    href: 'https://react.dev/',
    style: 'white'
  },
  { 
    key: 'tailwind', 
    name: 'Tailwind CSS', 
    logoUrl: '/logos/tailwind.png',
    href: 'https://tailwindcss.com/',
    style: 'white'
  },
  { 
    key: 'omnipixel', 
    name: 'Omnipixel', 
    logoUrl: '/logos/omnipixel.png',
    href: 'https://omnipixel.io/',
    style: 'dark'
  },
];

export const PoweredBySection: React.FC<PoweredBySectionProps> = ({ data }) => {
  // Use data from Payload if available, otherwise use defaults
  const sectionTitle = data?.title || 'This site is powered by';
  const scrollDuration = data?.scrollDuration || 30;
  const gapSize = data?.gapSize || '60px';
  
  // Process tech logos from CMS data
  let techLogos: TechLogo[] = defaultTechLogos;
  
  if (data?.techLogos && data.techLogos.length > 0) {
    techLogos = data.techLogos.map(logo => {
      if (!logo || typeof logo === 'string' || !logo.logoImage) {
        return null;
      }
      
      // Handle the media relationship
      let logoUrl = '';
      if (typeof logo.logoImage === 'object' && logo.logoImage.url) {
        logoUrl = logo.logoImage.url;
      }
      
      return {
        key: logo.key || 'unknown',
        name: logo.name || 'Unknown Technology',
        logoUrl, 
        href: logo.href || '#',
        style: (logo.style === 'white' ? 'white' : 'dark') as 'white' | 'dark'
      };
    }).filter(Boolean) as TechLogo[];
  }

  // Triple the logos to ensure smooth infinite scrolling
  const allLogos = [...techLogos, ...techLogos, ...techLogos];

  return (
    <div className="relative fl-py-l">
      <div className="u-container">
        <p className="text-center text-xs uppercase tracking-widest text-white/40 fl-mb-m">{sectionTitle}</p>
        
        <ScrollingBanner 
          shouldPauseOnHover 
          gap={gapSize} 
          duration={scrollDuration} 
          className="w-full py-6"
        >
          {allLogos.map((logo, index) => (
            <div key={`${logo.key}-${index}`} className="flex items-center justify-center text-foreground">
              <Link 
                href={logo.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-16 w-32 relative mx-4 transition-all duration-300 hover:scale-110 group cursor-pointer"
                aria-label={`Visit ${logo.name} website`}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={logo.logoUrl}
                    alt={`${logo.name} logo`}
                    fill
                    sizes="128px"
                    className={`object-contain h-full w-full ${
                      // Different styling based on the logo type
                      logo.style === 'white'
                        ? 'brightness-[2.5] group-hover:brightness-[3]' // For already white logos
                        : 'invert brightness-[2.5] group-hover:brightness-[3]' // For dark logos
                    } transition-all duration-300`}
                    unoptimized
                  />
                </div>
                
                {/* Hidden tooltip that appears on hover */}
                <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-white/80 whitespace-nowrap bg-background/80 px-2 py-1 rounded-md backdrop-blur-sm">
                  {logo.name}
                </span>
              </Link>
            </div>
          ))}
        </ScrollingBanner>
      </div>
    </div>
  );
}; 