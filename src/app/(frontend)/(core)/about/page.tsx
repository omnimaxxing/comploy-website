import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { cn } from '@/utilities/cn'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Link } from '@heroui/react'
import { Meteors } from '@/components/ui/Meteors'
import { Stars } from '@/components/ui/Stars'
import { noindex } from "@/seo/noindex"
import { getCachedGlobal } from '@/utilities/getGlobals'
import type { AboutGlobal } from '@/payload-types'
import { Button } from '@heroui/react'
import RichText from '@/components/RichText'

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
      <div className="absolute inset-x-0 bottom-0 h-[4vh] sm:h-[6vh] md:h-[8vh] lg:h-[10vh] bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
      <div className="absolute inset-y-0 left-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-r from-black via-black/80 to-transparent z-20"></div>
      <div className="absolute inset-y-0 right-0 w-[5vw] sm:w-[4vw] md:w-[5vw] lg:w-[6vw] bg-gradient-to-l from-black via-black/80 to-transparent z-20"></div>
    </>
  );
};

export const metadata = {
  title: "About PayloadPlugins - The Home for All Things Payload CMS",
  description: "Learn about our mission to create a centralized resource for Payload CMS developers, plugins, tutorials, and examples.",
  robots: noindex,
};

export default async function AboutPage() {
  try {
    const { isEnabled: draft } = await draftMode();
    const aboutData = await getCachedGlobal('about-global', 4)() as AboutGlobal;

    if (!aboutData) {
      return notFound();
    }

    return (
      <main className="relative overflow-hidden min-h-screen">
        <CosmicBackground />
        
        {/* Hero section */}
        <section className="relative py-20">
          <div className="u-container relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="fl-mb-s">{aboutData.hero?.title || 'Our Mission'}</h1>
              <p className="fl-mb-m">
                {aboutData.hero?.subtitle || 'Building a better ecosystem for the Payload CMS community'}
              </p>
            </div>
          </div>
        </section>

        {/* Main content section */}
        <section className="relative pb-32">
          <div className="u-container relative z-10">
            <div className="max-w-3xl mx-auto prose prose-invert prose-lg">
              {aboutData.mainContent ? (
                <RichText content={aboutData.mainContent} />
              ) : (
                <p>Content coming soon...</p>
              )}
              
              {aboutData.footer && (
                <div className="mt-16 border-t border-white/20 pt-8 pb-16 text-center relative z-30">
                  {aboutData.footer.quote && (
                    <p className="italic text-white/70">
                      {aboutData.footer.quote}
                    </p>
                  )}
                  
                  {aboutData.footer.button && (
                    <Button 
                      as={Link}
                      variant='solid'
                      size='lg'
                      href={aboutData.footer.button.link || '/submit'}
                      className="rounded-none bg-foreground text-background relative z-30"
                    >
                      {aboutData.footer.button.text || 'Join Our Mission'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom meteors effect - reversed direction */}
          <div className="pointer-events-none absolute inset-0">
            <Meteors number={6} reversed />
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