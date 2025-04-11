'use client'

import Link from 'next/link'
import type { HomeGlobal } from '@/payload-types'

type FeaturedPluginProps = {
  globalData?: HomeGlobal
}

export default function FeaturedPlugin({ globalData }: FeaturedPluginProps) {
  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6 overflow-hidden shadow-lg relative">
      <div className="absolute top-0 right-0 bg-gradient-to-bl from-accent-500/20 via-accent-600/10 to-transparent w-24 h-24 -mt-8 -mr-8 rounded-full"></div>
      
      <div className="text-xs uppercase tracking-wider text-white/50 fl-mb-xs">Featured Plugin</div>
      
      {globalData?.hero?.featuredPlugin ? (
        <>
          <h3 className="fl-mb-xs">
            {globalData?.hero?.featuredPlugin && typeof globalData.hero.featuredPlugin === 'object' 
              ? globalData.hero.featuredPlugin.name 
              : 'Authentication Plugin'}
          </h3>
          <p className="text-sm text-white/80 fl-mb-s">
            {globalData?.hero?.featuredPlugin && typeof globalData.hero.featuredPlugin === 'object' 
              ? globalData.hero.featuredPlugin.shortDescription 
              : 'Add JWT authentication, social login, and role-based access to your Payload CMS project.'}
          </p>
        </>
      ) : (
        <>
          <h3 className="fl-mb-xs">Authentication Plugin</h3>
          <p className="text-sm text-white/80 fl-mb-s">Add JWT authentication, social login, and role-based access to your Payload CMS project.</p>
        </>
      )}
      
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
        <div className="text-xs text-white/50 ml-3">
          {globalData?.hero?.featuredPlugin && 
          typeof globalData.hero.featuredPlugin === 'object' && 
          globalData.hero.featuredPlugin.githubData ? (
            <>+{globalData.hero.featuredPlugin.githubData.stars || 0} stars</>
          ) : (
            '+2.4k downloads'
          )}
        </div>
      </div>
      
      <Link 
        href={
          globalData?.hero?.featuredPlugin && 
          typeof globalData.hero.featuredPlugin === 'object' && 
          globalData.hero.featuredPlugin.slug
            ? `/plugins/${globalData.hero.featuredPlugin.slug}` 
            : "/plugins/authentication"
        } 
        className="inline-flex h-9 w-full items-center justify-center rounded-md bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-white/15"
      >
        View Plugin
        <svg className="ml-1.5 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Link>
    </div>
  )
} 