import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { cn } from '@/utilities/cn'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import Link from 'next/link'
import { Meteors } from '@/components/ui/Meteors'
import { Stars } from '@/components/ui/Stars'
import { noindex } from "@/seo/noindex"
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { ReleasesFilter } from './components/ReleasesFilter'
// Create a cosmic background component for consistency
const CosmicBackground = () => {
  return (
    <>
      {/* Extended cosmic background that fades throughout the page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60 pointer-events-none"></div>
      
      {/* Stars that extend throughout the page with fading effect */}
      <div className="absolute inset-0 pointer-events-none">
        <Stars number={120} className="z-0 opacity-70" />
      </div>
      
      {/* Edge fading gradients - responsive with fluid scaling */}
      <div className="absolute inset-x-0 top-0 h-[5vh] sm:h-[8vh] md:h-[10vh] lg:h-[12vh] bg-gradient-to-b from-black via-black/80 to-transparent z-20"></div>
      <div className="absolute inset-x-0 bottom-0 h-[5vh] sm:h-[8vh] md:h-[10vh] lg:h-[12vh] bg-gradient-to-t from-black via-black/80 to-transparent z-20"></div>
      <div className="absolute inset-y-0 left-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-r from-black via-black/80 to-transparent z-20"></div>
      <div className="absolute inset-y-0 right-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-l from-black via-black/80 to-transparent z-20"></div>
    </>
  );
};

export const metadata = {
  title: "PayloadCMS Releases - Version History and Changelog",
  description: "Browse and filter the complete history of PayloadCMS releases, including bug fixes, features, and breaking changes.",
  robots: noindex,
};

export default async function ReleasesPage() {
  try {
    const { isEnabled: draft } = await draftMode();
    const payload = await getPayload({ config: configPromise });
    
    // Get releases data
    const releasesData = await payload.find({
      collection: 'releases',
      sort: '-releaseDate',
      limit: 100,
    });

    return (
      <main className="relative overflow-hidden min-h-screen">
        <CosmicBackground />
        
        {/* Hero section */}
        <section className="relative pt-20 pb-8">
          <div className="u-container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="fl-mb-s">PayloadCMS Releases</h1>
              <p className="fl-mb-l">
                Browse and filter the complete history of PayloadCMS releases, including bug fixes, features, and breaking changes.
              </p>
            </div>
          </div>
        </section>

        {/* Releases filter and list */}
        <section className="relative pb-24">
          <div className="u-container relative z-10">
            <ReleasesFilter initialReleases={releasesData.docs} />
          </div>
          
          {/* Bottom meteors effect */}
          <div className="pointer-events-none absolute inset-0">
            <Meteors number={10} />
          </div>
        </section>
        
        {draft && <LivePreviewListener />}
      </main>
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
} 