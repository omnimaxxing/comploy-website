'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface SharePluginsSectionProps {
  headline: string;
  description: string;
}

export const SharePluginsSection = ({ headline, description }: SharePluginsSectionProps) => {
  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl relative overflow-hidden shadow-xl z-10 p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        viewport={{ once: true }}
        className="relative z-10"
      >
        <h2 className="text-2xl font-bold mb-4">{headline}</h2>
        <p className="mb-6 max-w-xl">{description}</p>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
            Gain visibility
          </div>
          <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
            Help the community
          </div>
          <div className="flex items-center bg-white/10 rounded-full px-3 py-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-purple-400 mr-2"></span>
            Showcase your work
          </div>
        </div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link 
            href="/submit" 
            className="inline-flex h-10 items-center justify-center rounded-md bg-white text-black px-4 py-2 font-medium shadow-md transition-all hover:bg-white/90"
          >
            Submit a Plugin
            <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
      
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/10 via-blue-500/5 to-transparent rounded-full -mr-32 -mt-32 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full -ml-32 -mb-32 blur-2xl"></div>
    </div>
  );
}; 