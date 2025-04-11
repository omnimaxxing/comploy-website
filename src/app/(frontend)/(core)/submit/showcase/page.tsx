import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cn } from '@/utilities/cn'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Meteors } from '@/components/ui/Meteors'
import { noindex } from "@/seo/noindex"
import { ShowcaseSubmissionForm } from './ShowcaseSubmissionForm'
import { Toaster } from '@/components/ui/sonner'
import Link from 'next/link'
import { Button } from '@heroui/react'
import { Icon } from '@iconify/react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { CosmicBackground } from '../components/CosmicBackground'

// Fetch stats for showcases
async function getShowcaseStats() {
  try {
    const payload = await getPayload({ config: configPromise })
    
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
    
    return {
      totalShowcases: showcasesResult.totalDocs || 0,
      totalViews: showcaseViews
    }
  } catch (error) {
    console.error('Error fetching showcase stats:', error)
    return {
      totalShowcases: 0,
      totalViews: 0
    }
  }
}

export const metadata = {
  title: "Submit a Showcase - PayloadPlugins",
  description: "Show off your Payload CMS project. Share screenshots, features, and technologies used to inspire others.",
  robots: noindex,
};

export default async function ShowcaseSubmitPage() {
  try {
    const { totalShowcases, totalViews } = await getShowcaseStats();

    return (
      <main className="relative overflow-hidden min-h-screen">
        <CosmicBackground />
        <Toaster />
        
        {/* Hero section */}
        <section className="relative fl-py-l">
          <div className="u-container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="fl-mb-s fl-text-step-3 text-foreground">Submit a Showcase</h1>
              <p className="fl-mb-l fl-text-step-0 text-foreground/80">
                Show off your Payload CMS project. Share screenshots, features, and technologies used to inspire others.
              </p>
              
              {/* Stats Section */}
              <div className="u-grid fl-mb-m">
                <div className="col-span-12 sm:col-span-6 bg-transparent backdrop-blur-sm p-4 flex items-center gap-3">
                  <Icon icon="lucide:layout-dashboard" className="w-6 h-6 text-purple-400" />
                  <div className="text-left">
                    <div className="fl-text-step-1 font-bold">{totalShowcases}</div>
                    <div className="fl-text-step--1 text-foreground/60">Projects Showcased</div>
                  </div>
                </div>
                
                <div className="col-span-12 sm:col-span-6 bg-transparent backdrop-blur-sm p-4 flex items-center gap-3">
                  <Icon icon="lucide:eye" className="w-6 h-6 text-blue-400" />
                  <div className="text-left">
                    <div className="fl-text-step-1 font-bold">{totalViews}</div>
                    <div className="fl-text-step--1 text-foreground/60">Total Views</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form section */}
        <section className="relative fl-pb-xl">
          <div className="u-container relative z-10">
            <div className="max-w-3xl mx-auto">
              <ShowcaseSubmissionForm />
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