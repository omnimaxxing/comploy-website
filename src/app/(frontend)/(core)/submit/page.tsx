import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cn } from '@/utilities/cn'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Meteors } from '@/components/ui/Meteors'
import { Stars } from '@/components/ui/Stars'
import { noindex } from "@/seo/noindex"
import { Toaster } from '@/components/ui/sonner'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { Button } from '@heroui/react'
import { CosmicBackground } from './components/CosmicBackground'

// Fetch stats for plugins and showcases
async function getCommunityStats() {
  try {
    const payload = await getPayload({ config: configPromise })
    
    // Get plugin count
    const pluginsResult = await payload.find({
      collection: 'plugins',
      where: {
        _status: {
          equals: 'published'
        }
      },
      limit: 0 // Only get count, not actual docs
    })
    
    // Get showcase count
    const showcasesResult = await payload.find({
      collection: 'showcases',
      where: {
        _status: {
          equals: 'published'
        }
      },
      limit: 0 // Only get count, not actual docs
    })
    
    // Calculate plugin views
    const allPlugins = await payload.find({
      collection: 'plugins',
      where: {
        _status: {
          equals: 'published'
        }
      },
      depth: 0
    })
    
    const pluginViews = allPlugins.docs.reduce((sum, plugin) => {
      return sum + (plugin.views || 0)
    }, 0)
    
    // Calculate showcase views
    const allShowcases = await payload.find({
      collection: 'showcases',
      where: {
        _status: {
          equals: 'published'
        }
      },
      depth: 0
    })
    
    const showcaseViews = allShowcases.docs.reduce((sum, showcase) => {
      return sum + (showcase.views || 0)
    }, 0)
    
    // Total views from both collections
    const totalViews = pluginViews + showcaseViews
    
    return {
      totalPlugins: pluginsResult.totalDocs || 0,
      totalShowcases: showcasesResult.totalDocs || 0,
      totalViews
    }
  } catch (error) {
    console.error('Error fetching community stats:', error)
    return {
      totalPlugins: 0,
      totalShowcases: 0,
      totalViews: 0
    }
  }
}

export const metadata = {
  title: "Submit Your Content - PayloadPlugins",
  description: "Add your Payload CMS plugin or showcase your project to our community directory for others to discover and use.",
  robots: noindex,
};

export default async function SubmitPage() {
  try {
    const { totalPlugins, totalShowcases, totalViews } = await getCommunityStats();

    return (
      <main className="relative overflow-hidden min-h-screen">
        <CosmicBackground />
        <Toaster />
        
        {/* Hero section */}
        <section className="relative fl-py-l">
          <div className="u-container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="fl-mb-s fl-text-step-3 text-foreground">Submit Your Content</h1>
              <p className="fl-mb-l fl-text-step-0 text-foreground/80">
                Share your Payload CMS plugin or showcase your project to the community directory in just a minute.
              </p>
              
              {/* Stats Section */}
              <div className="u-grid fl-mb-m">
                <div className="col-span-12 sm:col-span-4 bg-transparent backdrop-blur-sm p-4 flex items-center gap-3">
                  <Icon icon="lucide:puzzle" className="w-6 h-6 text-primary" />
                  <div className="text-left">
                    <div className="fl-text-step-1 font-bold">{totalPlugins}</div>
                    <div className="fl-text-step--1 text-foreground/60">Plugins</div>
                  </div>
                </div>
                
                <div className="col-span-12 sm:col-span-4 bg-transparent backdrop-blur-sm p-4 flex items-center gap-3">
                  <Icon icon="lucide:layout-dashboard" className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <div className="fl-text-step-1 font-bold">{totalShowcases}</div>
                    <div className="fl-text-step--1 text-foreground/60">Projects Showcased</div>
                  </div>
                </div>
                
                <div className="col-span-12 sm:col-span-4 bg-transparent backdrop-blur-sm p-4 flex items-center gap-3">
                  <Icon icon="lucide:eye" className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <div className="fl-text-step-1 font-bold">{totalViews}</div>
                    <div className="fl-text-step--1 text-foreground/60">Total Views</div>
                  </div>
                </div>
              </div>
              
              <div className="inline-flex items-center px-4 py-2 fl-mb-m group relative">
                <span className="fl-text-step--2 text-success-500/80">Blocks, Components, and Paid Content Coming Soon</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute inset-0 border border-success/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Selection section */}
        <section className="relative fl-pb-xl">
          <div className="u-container relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="fl-mb-m">
                <div className="u-grid">
                  {/* Plugin submission option */}
                  <Link
                    href="/submit/plugin"
                    className={cn(
                      "col-span-12 md:col-span-6 group relative flex flex-col p-6 h-full bg-background/5 border-2 border-foreground/10",
                      "hover:border-primary/70 focus:border-primary/70 active:border-primary",
                      "transition-all duration-300 overflow-hidden",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Add hover glow effect */}
                    <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur rounded-lg bg-primary/10 transition-all duration-700 group-hover:duration-500"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-4 fl-mb-m">
                        <div className="p-3 bg-primary/20">
                          <Icon icon="lucide:puzzle" className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="fl-text-step-1 font-medium">Plugin</h3>
                      </div>
                      
                      <p className="fl-text-step-0 text-foreground/80 fl-mb-m flex-grow">
                        Share your Payload CMS plugin with the community. Include installation instructions, documentation, and examples.
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-foreground/10">
                        <div className="flex justify-between items-center">
                          <span className="fl-text-step--1 font-medium text-foreground/60">Submit a plugin</span>
                          <Icon 
                            icon="lucide:chevron-right" 
                            className="w-5 h-5 text-primary transform group-hover:translate-x-1 transition-transform" 
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  {/* Showcase submission option */}
                  <Link
                    href="/submit/showcase"
                    className={cn(
                      "col-span-12 md:col-span-6 group relative flex flex-col p-6 h-full bg-background/5 border-2 border-foreground/10",
                      "hover:border-purple-400/70 focus:border-purple-400/70 active:border-purple-400",
                      "transition-all duration-300 overflow-hidden",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/50"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Add hover glow effect */}
                    <div className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur rounded-lg bg-purple-400/10 transition-all duration-700 group-hover:duration-500"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center gap-4 fl-mb-m">
                        <div className="p-3 bg-purple-400/20">
                          <Icon icon="lucide:layout-dashboard" className="w-7 h-7 text-purple-400" />
                        </div>
                        <h3 className="fl-text-step-1 font-medium">Showcase</h3>
                      </div>
                      
                      <p className="fl-text-step-0 text-foreground/80 fl-mb-m flex-grow">
                        Show off your Payload CMS project. Share screenshots, features, and technologies used to inspire others.
                      </p>
                      
                      <div className="mt-auto pt-4 border-t border-foreground/10">
                        <div className="flex justify-between items-center">
                          <span className="fl-text-step--1 font-medium text-foreground/60">Submit a showcase</span>
                          <Icon 
                            icon="lucide:chevron-right" 
                            className="w-5 h-5 text-purple-400 transform group-hover:translate-x-1 transition-transform" 
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom meteors effect */}
          <div className="pointer-events-none absolute inset-0">
            <Meteors number={6} />
          </div>
        </section>
      </main>
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}