"use client"

import Link from 'next/link'
import Logo from '@/graphics/Logo'
import { cn } from '@/utilities/cn'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

// Types for the footer data
type FooterData = {
  copyrightText: string
  officialLinks: {
    discord?: string
    github?: string
    website?: string
    discordIcon?: string
    githubIcon?: string
    websiteIcon?: string
  }
  linkColumns: Array<{
    heading: string
    links: Array<{ 
      label: string
      url: string
      id?: string 
    }>
    id?: string
  }>
  legalLinks: Array<{ 
    document?: { 
      slug?: string
    }
    customUrl?: string
    label: string
    id?: string 
  }>
  tagline?: string
}

// Constellation line component
const ConstellationLine = ({ 
  startX, 
  startY, 
  endX, 
  endY, 
  delay = 0,
  duration = 2
}: { 
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number,
  delay?: number,
  duration?: number
}) => {
  const width = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
  
  return (
    <div 
      className="absolute h-px bg-white/10 origin-left animate-draw-line"
      style={{
        top: `${startY}%`,
        left: `${startX}%`,
        width: `${width}%`,
        transform: `rotate(${angle}deg)`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        opacity: 0,
      }}
    />
  )
}

// Official Link Icon component
const OfficialLinkIcon = ({ 
  type, 
  url, 
  iconName 
}: { 
  type: string, 
  url: string,
  iconName?: string 
}) => {
  // Default icons if custom ones aren't provided
  const defaultIcons = {
    discord: 'mdi:discord',
    github: 'mdi:github',
    website: 'heroicons:globe-alt'
  }

  const icon = iconName || defaultIcons[type as keyof typeof defaultIcons] || 'heroicons:puzzle-piece'

  return (
    <Link 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="relative group"
      aria-label={`Visit Payload CMS ${type}`}
    >
      <div className="flex items-center justify-center h-10 w-10 rounded-full transition-transform duration-300 group-hover:scale-110">
        <Icon 
          icon={icon} 
          className="h-6 w-6 text-white/70 group-hover:text-white transition-all duration-300" 
        />
      </div>
    </Link>
  )
}

// Footer link component with hover animation
const FooterLink = ({ label, url }: { label: string, url: string }) => {
  return (
    <Link 
      href={url} 
      className="group relative inline-block overflow-hidden"
    >
      <span className="relative z-10 text-white/70 group-hover:text-white transition-colors duration-300 font-normal tracking-[-0.003em] fl-text-step--1">
        {label}
      </span>
      <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-primary/60 to-primary/30 group-hover:w-full transition-all duration-300 ease-out"></span>
    </Link>
  )
}

export function FooterClient({ footerData }: { footerData: FooterData }) {
  const {
    copyrightText,
    officialLinks,
    linkColumns,
    legalLinks,
    tagline
  } = footerData;
  
  // Add state to track client-side rendering
  const [isMounted, setIsMounted] = useState(false);
  
  // Set mounted state after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Generate random positions for particles only on client side
  const [particles, setParticles] = useState<Array<{top: string, left: string, delay: string}>>([]);
  const [reverseParticles, setReverseParticles] = useState<Array<{top: string, left: string, delay: string}>>([]);
  
  useEffect(() => {
    if (isMounted) {
      // Generate random positions for particles
      const newParticles = Array.from({ length: 5 }).map(() => ({
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
        delay: `${Math.random() * 5}s`
      }));
      
      const newReverseParticles = Array.from({ length: 5 }).map(() => ({
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`,
        delay: `${Math.random() * 5}s`
      }));
      
      setParticles(newParticles);
      setReverseParticles(newReverseParticles);
    }
  }, [isMounted]);
  
  return (
    <footer className="relative overflow-hidden">
      
      {/* Constellation effect */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <ConstellationLine startX={10} startY={30} endX={25} endY={20} delay={0.5} />
      
        <ConstellationLine startX={60} startY={25} endX={75} endY={40} delay={2.0} />
        <ConstellationLine startX={75} startY={40} endX={90} endY={30} delay={2.5} />
        
        <ConstellationLine startX={15} startY={70} endX={30} endY={80} delay={1.2} />
     
        <ConstellationLine startX={70} startY={85} endX={85} endY={70} delay={2.7} />
      </div>
      
      {/* Extra floating particles - Only render on client side */}
      {isMounted && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle, i) => (
            <div 
              key={`particle-${i}`} 
              className="absolute w-[3px] h-[3px] rounded-full bg-purple-300/30 animate-float-slow"
              style={{
                top: particle.top,
                left: particle.left,
                animationDelay: particle.delay,
              }}
            />
          ))}
          {reverseParticles.map((particle, i) => (
            <div 
              key={`reverse-particle-${i}`} 
              className="absolute w-[2px] h-[2px] rounded-full bg-blue-300/20 animate-float-reverse-slow"
              style={{
                top: particle.top,
                left: particle.left,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>
      )}
      
      <div className="relative z-10 u-container py-16 md:py-24">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          {/* Brand section */}
          <div className="md:col-span-4 space-y-6">
            <div className="space-y-4">
              <Link href="/" className="inline-flex items-center space-x-3 group">
                <div className="w-10 h-10 relative z-10 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-colors duration-300">
                  <Logo />
                </div>
                <span className="font-medium tracking-[-0.01em] fl-text-step-0 text-white group-hover:text-primary-400 transition-colors duration-300">
                  Payload Plugins
                </span>
              </Link>
              
              <p className="text-white/60 max-w-xs font-normal leading-relaxed tracking-[-0.003em] fl-text-step--1">
                {tagline || 'Discover and share plugins for Payload CMS. Extend your headless CMS with community-built solutions.'}
              </p>
            </div>
            
            {/* Official Payload links */}
            <div className="flex flex-wrap gap-3">
              {officialLinks.discord && 
                <OfficialLinkIcon 
                  type="discord" 
                  url={officialLinks.discord} 
                  iconName={officialLinks.discordIcon} 
                />
              }
              {officialLinks.github && 
                <OfficialLinkIcon 
                  type="github" 
                  url={officialLinks.github} 
                  iconName={officialLinks.githubIcon} 
                />
              }
              {officialLinks.website && 
                <OfficialLinkIcon 
                  type="website" 
                  url={officialLinks.website} 
                  iconName={officialLinks.websiteIcon} 
                />
              }
            </div>
          </div>
          
          {/* Links section */}
          <div className="md:col-span-8">
            {linkColumns && linkColumns.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {linkColumns.map((column, index) => (
                  <div key={column.id || index} className="space-y-6">
                    <h3 className="text-white font-medium tracking-wide fl-text-step-0">
                      {column.heading}
                    </h3>
                    <ul className="space-y-3">
                      {column.links && column.links.map((link, linkIndex) => (
                        <li key={link.id || linkIndex}>
                          <FooterLink label={link.label} url={link.url} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom section with animated border */}
        <div className="mt-16 pt-8 relative">
          {/* Animated gradient border */}
          <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
            <div 
              className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse"
            ></div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-white/50 font-normal tracking-[-0.003em] fl-text-step--2 text-center md:text-left"
              dangerouslySetInnerHTML={{ __html: copyrightText }}
            />
            
            {/* Dynamic Legal Links */}
            {legalLinks && legalLinks.length > 0 && (
              <div className="flex items-center space-x-6">
                {legalLinks
                  .filter(link => link.document?.slug || link.customUrl) // Filter valid links
                  .map((link, index) => {
                    const href = link.document?.slug 
                      ? `/legal/${link.document.slug}`
                      : link.customUrl || '#'
                    
                    return (
                      <Link 
                        key={link.id || index}
                        href={href}
                        className="text-white/50 hover:text-white transition-colors duration-300 font-normal tracking-[-0.003em] fl-text-step--2"
                      >
                        {link.label}
                      </Link>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
} 