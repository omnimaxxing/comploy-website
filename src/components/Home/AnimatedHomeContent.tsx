'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meteors } from '@/components/ui/Meteors';
import { Stars } from '@/components/ui/Stars';
import Link from 'next/link';
import type { HomeGlobal } from '@/payload-types';

// This is a placeholder for what will be the actual plugin directory component
// We'll replace this later with the actual plugin directory component
const PluginDirectoryPlaceholder = () => {
  return (
    <div className="min-h-[70vh] w-full backdrop-blur-md bg-black/30 rounded-xl p-8 border border-white/10">
      <h2 className="text-3xl font-bold mb-6">Plugin Directory</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="w-12 h-12 rounded-full bg-white/10 mb-4 flex items-center justify-center">
              <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium mb-2">Plugin {index + 1}</h3>
            <p className="text-white/70 mb-4">A powerful plugin to enhance your Payload CMS setup.</p>
            <div className="flex justify-between items-center">
              <div className="text-sm text-white/50">500+ downloads</div>
              <Link href="#" className="text-white hover:text-white/80">View →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Animation variants for Framer Motion
const contentVariants = {
  expanded: {
    height: '100%',
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.19, 1, 0.22, 1], // Cubic bezier for Apple-like easing
    }
  },
  collapsed: {
    height: '0%',
    opacity: 0,
    y: -50,
    transition: { 
      duration: 0.8, 
      ease: [0.19, 1, 0.22, 1],
    }
  },
};

// Removed heroVariants to keep hero section at consistent height

const overlayVariants = {
  hidden: { 
    opacity: 0,
    transition: { 
      duration: 0.4,
      ease: [0.19, 1, 0.22, 1],
    }
  },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.4,
      ease: [0.19, 1, 0.22, 1],
    }
  },
};

// Component props
interface AnimatedHomeContentProps {
  globalData: HomeGlobal;
}

export const AnimatedHomeContent = ({ globalData }: AnimatedHomeContentProps) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPlugins, setShowPlugins] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handler for the "Browse Plugins" button
  const handleBrowsePlugins = () => {
    setIsExpanded(false);
    
    // After the hero collapses, show the plugin directory
    setTimeout(() => {
      setShowPlugins(true);
    }, 600); // Slightly less than the animation duration
  };

  // Handler for the "Back to Home" action (closing the plugin directory)
  const handleBackToHome = () => {
    setShowPlugins(false);
    
    // After hiding plugins, expand the hero
    setTimeout(() => {
      setIsExpanded(true);
    }, 400);
  };

  return (
    <>
      {/* Hero Section with fixed height (no animation) */}
      <section className="flex flex-col justify-center overflow-hidden relative h-[60vh]">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 via-blue-500/3 to-transparent opacity-80 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60 pointer-events-none"></div>
        <div className="absolute inset-0 pointer-events-none">
          <Stars number={120} className="z-0 opacity-70" />
        </div>
        
        {/* Meteor layers */}
        <Meteors number={15} className="z-5 opacity-40" />
        <Meteors number={10} className="z-10 opacity-50" />
        
        <div className="u-container relative z-20">
          <div className="u-grid items-center">
            {/* Hero content - left aligned and fixed position */}
            <div className="col-span-12 lg:col-span-8 text-left">
              {/* Headline */}
              <h1 className="relative fl-mb-m">
                {globalData?.hero?.headline || 'Discover & Share Plugins for Payload CMS'}
              </h1>
              
              {/* Subtitle */}
              <p className="max-w-[520px] relative fl-mb-l text-left">
                {globalData?.hero?.subtitle || 'Extend your headless CMS with community-built plugins, components, and code examples.'}
              </p>
              
              {/* Button group */}
              <div className="flex flex-wrap gap-4 relative fl-mb-xl">
                {/* Explore button */}
                <button 
                  onClick={handleBrowsePlugins}
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white text-black px-6 py-3 font-medium shadow-md transition-all hover:bg-white/90 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {globalData?.hero?.adminButton?.label || 'Explore Plugins'}
                </button>
                
                {/* Submit button */}
                <Link 
                  href="/submit" 
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-white/15 hover:scale-105 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Submit Your Plugin
                </Link>
              </div>
            </div>
            
            {/* Featured content box - right side */}
            <motion.div 
              className="col-span-12 lg:col-span-4 relative z-[25] mt-8 lg:mt-0"
              animate={{ 
                opacity: isExpanded ? 1 : 0,
                x: isExpanded ? 0 : 50,
                display: isExpanded ? 'block' : 'none',
              }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
            >
              <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 overflow-hidden shadow-lg relative">
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-accent-500/20 via-accent-600/10 to-transparent w-24 h-24 -mt-8 -mr-8 rounded-full"></div>
                
                <div className="text-xs uppercase tracking-wider text-white/50 fl-mb-xs">Featured Plugin</div>
                <h3 className="fl-mb-xs">Authentication Plugin</h3>
                <p className="text-sm text-white/80 fl-mb-s">Add JWT authentication, social login, and role-based access to your Payload CMS project.</p>
                
                <div className="flex items-center fl-mb-s">
                  <div className="flex -space-x-2">
                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13a1 1 0 112 0v5.586l2.293 2.293a1 1 0 01-1.414 1.414L11.58 14a1 1 0 01-.293-.707V7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414a1 1 0 00-.293-.707l-3.414-3.414A1 1 0 0011.586 3H6zm0 1h5.586L15 6.414V16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1z" clipRule="evenodd" />
                        <path d="M7 12a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                      </svg>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="h-3 w-3 text-white/70" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-white/50 ml-3">+2.4k downloads</div>
                </div>
                
                <Link 
                  href="/plugins/authentication" 
                  className="inline-flex h-9 w-full items-center justify-center rounded-md bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-white/15"
                >
                  View Plugin
                  <svg className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Foreground layer of meteors */}
        <Meteors number={8} className="z-[30] opacity-70" />
      </section>

      {/* Animated content section - this will fold up */}
      <motion.div
        ref={contentRef}
        variants={contentVariants}
        initial="expanded"
        animate={isExpanded ? 'expanded' : 'collapsed'}
        className="overflow-hidden relative"
      >
        {/* This is the content that will fold up/disappear */}
        <div className="u-container relative py-8">
          <div className="space-y-16">
            {/* About section */}
            <div className="u-grid relative z-10">
              <div className="col-span-12 lg:col-span-6 mb-8 lg:mb-0">
                <div className="bg-background border border-white/10 rounded-xl p-8 h-full shadow-xl">
                  <h2 className="border-b border-white/10 pb-4 mb-6">About Payload Plugins</h2>
                  <div>
                    <p className="mb-4">
                      Welcome to the community-driven hub for Payload CMS plugins, components, and code examples. Our mission is to help developers build better websites and applications by sharing quality extensions for Payload CMS.
                    </p>
                    <p className="mb-4">
                      Whether you're looking for ready-to-use plugins, inspiration for your next project, or want to contribute your own creations, you've come to the right place.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-span-12 lg:col-span-6">
                <div className="u-grid gap-5">
                  {/* Some cards here */}
                  <div className="col-span-6 group">
                    <div className="bg-background border border-white/10 rounded-xl p-6 h-full shadow-lg">
                      <h3 className="fl-mb-xs">Explore Plugins</h3>
                      <p className="text-sm text-white/70">Discover plugins to enhance your Payload CMS setup</p>
                    </div>
                  </div>
                  <div className="col-span-6 group">
                    <Link href="/showcase" className="block">
                      <div className="bg-background border border-white/10 rounded-xl p-6 h-full shadow-lg hover:bg-white/5 transition-colors">
                        <h3 className="fl-mb-xs">Showcase Gallery</h3>
                        <p className="text-sm text-white/70">View websites and apps built with Payload CMS</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Plugin Directory Section - moved directly below hero with no gap */}
      <AnimatePresence>
        {showPlugins && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            className="u-container relative"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Plugin Directory</h2>
              <button 
                onClick={handleBackToHome}
                className="inline-flex items-center justify-center rounded-md bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-white/15"
              >
                <svg className="mr-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </button>
            </div>
            
            <PluginDirectoryPlaceholder />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AnimatedHomeContent; 