/**
 * Showcase Gallery Page
 *
 * This page implements Next.js 15's Partial Prerendering (PPR) to optimize the balance
 * between static and dynamic content. The hero section is rendered statically,
 * while the showcase items are loaded dynamically with Suspense.
 *
 * === PPR Implementation ===
 *
 * 1. Static Content (Prerendered):
 *    - Hero section with title, description, and CTA button
 *    - Page metadata and layout structure
 *
 * 2. Dynamic Content (Loaded with Suspense):
 *    - Showcase items grid (DynamicShowcaseItems component)
 *    - Uses a skeleton loading state for improved UX
 *
 * This approach provides:
 * - Fast initial page loads (static content)
 * - Always fresh showcase items
 * - Improved user experience with skeleton loading
 * - SEO benefits (core content is statically generated)
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';
import { cn } from '@/utilities/cn';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import Link from 'next/link';
import { Meteors } from '@/components/ui/Meteors';
import { Stars } from '@/components/ui/Stars';
import { noindex } from '@/seo/noindex';
import { ShowcaseWrapper } from '@/components/Showcase/ShowcaseWrapper';
import { getCachedShowcases } from '@/utilities/getShowcases';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { Suspense, cache } from 'react';
import { DynamicShowcaseItems } from '@/components/Showcase/DynamicShowcaseItems';
import { SkeletonShowcaseGrid } from '@/components/Showcase/SkeletonShowcaseGrid';

// Enable Partial Prerendering for this route
export const experimental_ppr = true;

// Create a cosmic background component for consistency
const CosmicBackground = () => {
  return (
    <>
      {/* Extended cosmic background that fades throughout the page - responsive for mobile */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_50%,rgba(0,0,0,0.7)_80%)] opacity-60 sm:bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)]"></div>

      {/* Stars that extend throughout the page with fading effect */}
      <div className="pointer-events-none absolute inset-0">
        <Stars number={120} className="z-0 opacity-70" />
      </div>

      {/* Edge fading gradients - responsive sizes for mobile */}
      <div className="absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-black via-black/80 to-transparent md:h-32"></div>
      <div className="absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-black via-black/80 to-transparent md:h-32"></div>
      <div className="absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-black via-black/80 to-transparent sm:w-16 md:w-32"></div>
      <div className="absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-black via-black/80 to-transparent sm:w-16 md:w-32"></div>
    </>
  );
};

export const metadata = {
  title: 'Showcase Gallery - Projects Built with Payload CMS',
  description:
    "Explore websites and applications built with Payload CMS. Get inspired by real-world examples of what's possible with Payload.",
  robots: noindex,
};

// Cache the global data fetch to ensure it's only fetched once per request
const getCachedShowcaseGlobal = cache(async () => {
  const payload = await getPayload({ config: configPromise });
  return await payload.findGlobal({
    slug: 'showcase-global',
  });
});

export default async function ShowcasePage() {
  try {
    const { isEnabled: draft } = await draftMode();

    // Get showcase page content (now cached)
    const showcaseGlobal = await getCachedShowcaseGlobal();

    return (
      <main className="relative min-h-screen overflow-hidden">
        <CosmicBackground />

        {/* Simple hero section - statically rendered */}
        <section className="relative pb-8 pt-20">
          <div className="u-container relative z-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="fl-mb-s">{showcaseGlobal.hero.title}</h1>
              <p className="fl-mb-l">{showcaseGlobal.hero.description}</p>
              <Link
                href={showcaseGlobal.hero.submitButton.url}
                className={cn(
                  'focus-visible:ring-ring inline-flex items-center justify-center rounded-md px-6 py-3 font-medium shadow-md transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-1',
                  {
                    'bg-white text-black hover:bg-white/90':
                      showcaseGlobal.hero.submitButton.variant === 'primary',
                    'bg-black text-white hover:bg-black/90':
                      showcaseGlobal.hero.submitButton.variant === 'secondary',
                    'border border-white text-white hover:bg-white/10':
                      showcaseGlobal.hero.submitButton.variant === 'outline',
                  },
                  {
                    'h-8 text-sm': showcaseGlobal.hero.submitButton.size === 'sm',
                    'h-10': showcaseGlobal.hero.submitButton.size === 'md',
                    'h-12': showcaseGlobal.hero.submitButton.size === 'lg',
                  }
                )}
              >
                {showcaseGlobal.hero.submitButton.label}
              </Link>
            </div>
          </div>
        </section>

        {/* Showcase gallery - dynamically rendered with Suspense */}
        <section className="relative pb-24">
          <div className="u-container relative z-10">
            <Suspense fallback={<SkeletonShowcaseGrid count={12} />}>
              <DynamicShowcaseItems initialLimit={12} />
            </Suspense>
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
