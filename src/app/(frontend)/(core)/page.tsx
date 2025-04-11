import { notFound } from 'next/navigation';
import { generateGlobalMetadata } from '@/utilities/mergeOpenGraph';
import type { Metadata } from 'next';
import { getCachedGlobal } from '@/utilities/getGlobals';
import type { HomeGlobal } from '@/payload-types';
import { draftMode } from 'next/headers';
import { Button, cn, Card, Badge, Link, Divider, CardFooter, CardHeader } from '@heroui/react';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import { Meteors } from '@/components/ui/Meteors';
import { Stars } from '@/components/ui/Stars';
import Image from 'next/image';
import { PoweredBySection } from '@/components/Home/PoweredBySection';
import FeaturedPlugin from '@/components/Home/FeaturedPlugin';
import { CosmicOrbits } from '@/components/ui/CosmicOrbits';
import { Icon } from '@iconify/react';
import { HeroSearchBar } from './components/HeroSearchBar';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
  const page = (await getCachedGlobal('home-global', 4)()) as HomeGlobal;
  return generateGlobalMetadata(
    {
      seo: {
        title: page?.seo?.title || 'Home | Omnipixel',
        description:
          page?.seo?.description ||
          "Get in touch with Omnipixel for your software development needs. We're here to help bring your vision to life.",
        keywords: page?.seo?.keywords || undefined,
        ogImage: page?.seo?.ogImage || undefined,
        canonicalUrl: page?.seo?.canonicalUrl || undefined,
      },
    },
    'website'
  );
};

export default async function HomePage() {
  try {
    const { isEnabled: draft } = await draftMode();
    const globalData = (await getCachedGlobal('home-global', 4)()) as HomeGlobal;

    if (!globalData) {
      return notFound();
    }

    return (
      <main className="relative overflow-hidden">
        {/* Extended cosmic background that fades throughout the page */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60"></div>

        {/* Stars that extend throughout the page with fading effect */}
        <div className="pointer-events-none absolute inset-0">
          <Stars number={120} className="z-0 opacity-70" />
        </div>

        {/* Hero Section with responsive height */}
        <section className="relative flex min-h-[60vh] flex-col justify-center overflow-hidden pb-16 pt-24 md:pb-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.7)_80%)] opacity-60"></div>
          <div className="pointer-events-none absolute inset-0">
            <Stars number={120} className="z-0 opacity-70" />
          </div>

          {/* Meteor layers */}
          <Meteors number={15} className="z-5 opacity-40" />
          <Meteors number={10} className="z-10 opacity-50" />

          <div className="u-container relative z-20">
            <div className="u-grid items-center">
              {/* Hero content - left aligned and fixed position */}
              <div className="col-span-12 mb-10 text-left lg:col-span-8 lg:mb-0">
                {/* Headline */}
                <h1 className="relative fl-mb-m">
                  <span className="relative">
                    {globalData?.hero?.headline || 'Discover & Share Plugins for Payload CMS'}
                    <span className="absolute bottom-0 left-0 h-1 w-1/3 bg-gradient-to-r from-accent-500/70 to-purple-500/50"></span>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="relative max-w-[520px] text-left text-foreground/90 fl-mb-m">
                  {globalData?.hero?.subtitle ||
                    'Extend your headless CMS with community-built plugins, components, and code examples.'}
                </p>

                {/* Search Bar */}
                <div className="mb-8 max-w-[520px]">
                  <Suspense
                    fallback={
                      <div className="flex h-14 w-full items-center rounded-lg border border-white/20 bg-background/30 px-5 pl-12 text-white backdrop-blur-sm">
                        <Icon
                          icon="heroicons:magnifying-glass"
                          className="mr-3 h-5 w-5 text-white/70"
                        />
                        <span className="text-white/50">Loading search...</span>
                      </div>
                    }
                  >
                    <HeroSearchBar />
                  </Suspense>
                </div>

                {/* Button group */}
                <div className="relative flex flex-wrap gap-4 fl-mb-xl">
                  {/* Explore button */}
                  <Button
                    size="lg"
                    variant="solid"
                    as={Link}
                    href={globalData?.hero?.exploreButton?.url || '/plugins'}
                    className="group rounded-none shadow-lg transition-all duration-300 hover:bg-foreground hover:text-background"
                  >
                    {globalData?.hero?.exploreButton?.label || 'Explore Plugins'}
                  </Button>

                  {/* Submit button */}
                  <Button
                    size="lg"
                    as={Link}
                    className="rounded-none transition-all duration-300 hover:border-foreground"
                    variant="bordered"
                    href={globalData?.hero?.submitButton?.url || '/submit'}
                  >
                    {globalData?.hero?.submitButton?.label || 'Submit Your Plugin'}
                  </Button>
                </div>
              </div>

              {/* Featured content box - right side */}
              <div className="relative z-[25] col-span-12 mb-8 lg:col-span-4 lg:mb-0">
                <FeaturedPlugin globalData={globalData} />
              </div>
            </div>
          </div>

          {/* Foreground layer of meteors */}
          <Meteors number={8} className="z-[30] opacity-70" />
        </section>

        <Divider className="opacity-30" />

        <section className="u-container relative py-8 fl-my-l">
          <div className="space-y-16">
            {/* About section */}
            <div className="u-grid relative z-10 gap-x-10 lg:gap-x-16">
              <div className="col-span-12 mb-8 lg:col-span-5 lg:mb-0">
                <div className="h-full shadow-xl">
                  <h2 className="relative mb-6 border-b border-foreground/10 pb-4">
                    {globalData?.aboutSection?.title || 'About Payload Plugins'}
                    <span className="absolute bottom-0 left-0 h-0.5 w-16 bg-accent-500/60"></span>
                  </h2>
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="mb-4 fl-text-step--1">
                      {typeof globalData?.aboutSection?.content === 'object' &&
                      Array.isArray(globalData?.aboutSection?.content)
                        ? globalData?.aboutSection?.content[0]?.children?.[0]?.text ||
                          'Welcome to the community-driven hub for Payload CMS plugins, components, and code examples. Our mission is to help developers build better websites and applications by sharing quality extensions for Payload CMS.'
                        : 'Welcome to the community-driven hub for Payload CMS plugins, components, and code examples. Our mission is to help developers build better websites and applications by sharing quality extensions for Payload CMS.'}
                    </p>
                    <p className="mb-4 fl-text-step--1">
                      {typeof globalData?.aboutSection?.content === 'object' &&
                      Array.isArray(globalData?.aboutSection?.content)
                        ? globalData?.aboutSection?.content[1]?.children?.[0]?.text ||
                          "Whether you're looking for ready-to-use plugins, inspiration for your next project, or want to contribute your own creations, you've come to the right place."
                        : "Whether you're looking for ready-to-use plugins, inspiration for your next project, or want to contribute your own creations, you've come to the right place."}
                    </p>
                    <p className="mb-4 fl-text-step--1">
                      {typeof globalData?.aboutSection?.content === 'object' &&
                      Array.isArray(globalData?.aboutSection?.content)
                        ? globalData?.aboutSection?.content[2]?.children?.[0]?.text ||
                          'Payload Plugins is curated by the community and offers a central repository of high-quality, well-documented extensions that solve common challenges and expand the capabilities of your Payload CMS projects.'
                        : 'Payload Plugins is curated by the community and offers a central repository of high-quality, well-documented extensions that solve common challenges and expand the capabilities of your Payload CMS projects.'}
                    </p>

                    <div className="not-prose mt-6">
                      <Button
                        size="md"
                        variant="bordered"
                        as={Link}
                        endContent={
                          <svg
                            className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                        }
                        href={globalData?.aboutSection?.learnMoreButton?.url || '/about'}
                        className="group rounded-none transition-all duration-300 hover:border-foreground"
                      >
                        {globalData?.aboutSection?.learnMoreButton?.label || 'Learn More'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 lg:col-span-6 lg:col-start-7">
                <div className="u-grid gap-5">
                  {/* Dynamically render Explore Cards */}
                  {globalData?.exploreCards &&
                  Array.isArray(globalData.exploreCards) &&
                  globalData.exploreCards.length > 0 ? (
                    globalData.exploreCards.map((card, index) => (
                      <div key={`explore-card-${index}`} className="group col-span-6">
                        {card.comingSoon ? (
                          <div
                            className={`relative flex h-full flex-col rounded-xl border border-foreground/10 bg-background p-6 shadow-lg transition-all`}
                          >
                            {card.comingSoon && (
                              <div className="absolute right-0 top-0 -translate-y-2 translate-x-2 transform">
                                <div className="flex items-center rounded-full border border-foreground/20 bg-foreground/10 px-2 py-1 text-xs text-foreground/90 backdrop-blur-sm">
                                  <div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500"></div>
                                  Coming Soon
                                </div>
                              </div>
                            )}
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="fl-mb-0">{card.title || `Card ${index + 1}`}</h3>
                              <svg
                                className="h-5 w-5 text-foreground/30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                            <p className="mb-4 text-sm text-foreground/70">
                              {card.description || ''}
                            </p>
                            <div className="mt-auto flex items-center text-xs text-foreground/40">
                              <svg
                                className="mr-1 h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M4 6h16M4 12h16M4 18h7"
                                />
                              </svg>
                              {card.linkText || 'View more'}
                            </div>
                            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-foreground/0 via-foreground/0 to-foreground/5 backdrop-blur-[1px]"></div>
                          </div>
                        ) : (
                          <Link href={card.linkUrl || '#'} className="block">
                            <div className="flex h-full flex-col rounded-xl border border-foreground/10 bg-background p-6 shadow-lg transition-all hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl">
                              <div className="mb-2 flex items-center justify-between">
                                <h3 className="fl-mb-0">{card.title || `Card ${index + 1}`}</h3>
                                <svg
                                  className="h-5 w-5 text-foreground/50 transition-transform group-hover:translate-x-1"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <p className="mb-4 text-sm text-foreground/70">
                                {card.description || ''}
                              </p>
                              <div className="mt-auto flex items-center text-xs text-foreground/50">
                                <svg
                                  className="mr-1 h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 6h16M4 12h16M4 18h7"
                                  />
                                </svg>
                                {card.linkText || 'View more'}
                              </div>
                            </div>
                          </Link>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-12">
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        {/* Explore Plugins card */}
                        <div className="group col-span-1">
                          <Link href="/plugins" className="block">
                            <div className="flex h-full flex-col rounded-xl border border-foreground/10 bg-background p-6 shadow-lg transition-all hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl">
                              <div className="mb-2 flex items-center justify-between">
                                <h3 className="fl-mb-0">Explore Plugins</h3>
                                <svg
                                  className="h-5 w-5 text-accent-500/80 transition-transform group-hover:translate-x-1"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                              <p className="mb-4 text-sm text-foreground/70">
                                Discover plugins to enhance your Payload CMS setup
                              </p>
                              <div className="mt-auto flex items-center text-xs text-foreground/50">
                                <svg
                                  className="mr-1 h-4 w-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4 6h16M4 12h16M4 18h7"
                                  />
                                </svg>
                                Browse Collection
                              </div>
                            </div>
                          </Link>
                        </div>

                        {/* Resources card with Coming Soon tag */}
                        <div className="group col-span-1">
                          <div className="relative flex h-full flex-col rounded-xl border border-foreground/10 bg-background p-6 shadow-lg transition-all">
                            <div className="absolute right-0 top-0 -translate-y-2 translate-x-2 transform">
                              <div className="flex items-center rounded-full border border-foreground/20 bg-foreground/10 px-2 py-1 text-xs text-foreground/90 backdrop-blur-sm">
                                <div className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-accent-500"></div>
                                Coming Soon
                              </div>
                            </div>
                            <div className="mb-2 flex items-center justify-between">
                              <h3 className="fl-mb-0">Resources</h3>
                              <svg
                                className="h-5 w-5 text-foreground/30"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                            <p className="mb-4 text-sm text-foreground/70">
                              Tutorials, videos, and blog posts about Payload CMS
                            </p>
                            <div className="mt-auto flex items-center text-xs text-foreground/40">
                              <svg
                                className="mr-1 h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                              Access Learning Materials
                            </div>
                            <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-foreground/0 via-foreground/0 to-foreground/5 backdrop-blur-[1px]"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <PoweredBySection data={globalData.poweredBySection} />

        <div>
          <CosmicOrbits className="z-0" />
          {/* Share Your Plugins Section with new CosmicOrbits animation */}
          <section className="relative overflow-hidden fl-py-xl">
            <div className="u-container relative">
              <div className="u-grid items-center">
                <div className="lg:fl-mb-0 col-span-12 fl-mb-l lg:col-span-7">
                  <div className="mb-4 flex items-center">
                    <h2 className="fl-mb-0">
                      {globalData?.shareSection?.title || 'Share your Content'}
                    </h2>
                  </div>

                  <p className="max-w-3xl text-foreground/80 fl-mb-m">
                    {globalData?.shareSection?.description ||
                      'Built a plugin for Payload CMS or created a website or application using Payload? Share your work with the community to inspire others and showcase your expertise.'}
                  </p>

                  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="group rounded-lg border border-foreground/10 bg-background p-6 shadow-lg transition-all duration-300 ease-out hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl">
                      <div className="flex items-start space-y-0">
                        <div className="mr-4 mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500/10 group-hover:shadow-lg">
                          <Icon
                            icon="heroicons:check"
                            className="h-5 w-5 text-white transition-all duration-300 group-hover:text-white"
                          />
                        </div>
                        <div>
                          <h3 className="mb-2 text-base font-medium transition-colors duration-300 group-hover:text-accent-400">
                            {globalData?.shareSection?.benefits?.[0]?.title || 'Recognition'}
                          </h3>
                          <p className="text-sm leading-relaxed text-foreground/70">
                            {globalData?.shareSection?.benefits?.[0]?.description ||
                              'Gain visibility in the Payload CMS community and establish yourself as a contributor.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="group rounded-lg border border-foreground/10 bg-background p-6 shadow-lg transition-all duration-300 ease-out hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl">
                      <div className="flex items-start space-y-0">
                        <div className="mr-4 mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500/10 group-hover:shadow-lg">
                          <Icon
                            icon="heroicons:users"
                            className="h-5 w-5 text-white transition-all duration-300 group-hover:text-white"
                          />
                        </div>
                        <div>
                          <h3 className="mb-2 text-base font-medium transition-colors duration-300 group-hover:text-accent-400">
                            {globalData?.shareSection?.benefits?.[1]?.title || 'Inspire Others'}
                          </h3>
                          <p className="text-sm leading-relaxed text-foreground/70">
                            {globalData?.shareSection?.benefits?.[1]?.description ||
                              'Help developers build better applications and websites with your contributions.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="group rounded-lg border border-foreground/10 bg-background p-6 shadow-lg transition-all duration-300 ease-out hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl">
                      <div className="flex items-start space-y-0">
                        <div className="mr-4 mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500/10 group-hover:shadow-lg">
                          <Icon
                            icon="heroicons:code-bracket"
                            className="h-5 w-5 text-white transition-all duration-300 group-hover:text-white"
                          />
                        </div>
                        <div>
                          <h3 className="mb-2 text-base font-medium transition-colors duration-300 group-hover:text-accent-400">
                            {globalData?.shareSection?.benefits?.[2]?.title || 'Showcase Work'}
                          </h3>
                          <p className="text-sm leading-relaxed text-foreground/70">
                            {globalData?.shareSection?.benefits?.[2]?.description ||
                              'Demonstrate your development expertise through plugins or beautifully designed websites.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="group rounded-lg border border-foreground/10 bg-background p-6 shadow-lg transition-all duration-300 ease-out hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl">
                      <div className="flex items-start space-y-0">
                        <div className="mr-4 mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-500/10 group-hover:shadow-lg">
                          <Icon
                            icon="heroicons:bolt"
                            className="h-5 w-5 text-white transition-all duration-300 group-hover:text-white"
                          />
                        </div>
                        <div>
                          <h3 className="mb-2 text-base font-medium transition-colors duration-300 group-hover:text-accent-400">
                            {globalData?.shareSection?.benefits?.[3]?.title || 'Community Growth'}{' '}
                          </h3>
                          <p className="text-sm leading-relaxed text-foreground/70">
                            {globalData?.shareSection?.benefits?.[3]?.description ||
                              'Contribute to the growing ecosystem of Payload CMS extensions and implementations.'}{' '}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Button
                      as={Link}
                      href={globalData?.shareSection?.submitButton?.url || '/submit'}
                      size="lg"
                      variant="bordered"
                      className="group transform rounded-none transition-all duration-300 ease-out hover:translate-y-[-1px] hover:border-accent-500/50 hover:bg-accent-500/5"
                      endContent={
                        <svg
                          className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      }
                    >
                      {globalData?.shareSection?.submitButton?.label || 'Submit a Plugin'}
                    </Button>
                    <Button
                      as={Link}
                      href={globalData?.shareSection?.showcaseButton?.url || '/showcase/submit'}
                      size="lg"
                      className="group ml-4 transform rounded-none transition-all duration-300 ease-out hover:translate-y-[-1px] hover:border-accent-500/50 hover:bg-accent-500/5"
                      endContent={
                        <svg
                          className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      }
                    >
                      {globalData?.shareSection?.showcaseButton?.label || 'Add to Showcase'}
                    </Button>
                  </div>
                </div>

                <div className="col-span-12 flex justify-center lg:col-span-5 lg:justify-end">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-radial from-accent-500/20 via-purple-500/10 to-transparent opacity-70"></div>

                    <div className="transform-style-3d relative z-10 flex items-center justify-center">
                      <div className="relative">
                        <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full border border-foreground/10 bg-background shadow-[0_0_30px_10px_rgba(125,90,255,0.1)]">
                          <div className="absolute inset-0 rounded-full border border-foreground/10"></div>
                          <div
                            className="absolute inset-0 rounded-full border border-foreground/5"
                            style={{ transform: 'scale(1.1)' }}
                          ></div>
                          <div
                            className="absolute inset-0 rounded-full border border-accent-500/10"
                            style={{ transform: 'scale(1.2)' }}
                          ></div>

                          <div className="flex flex-col items-center justify-center">
                            <Image
                              src="/assets/icons/pluggy.svg"
                              alt="Payload Plugin Icon"
                              width={100}
                              height={100}
                              className="animate-float"
                            />
                            <p className="mt-3 max-w-[140px] text-center font-light text-foreground/70 fl-text-step--2">
                              Make Pluggy happy and plug your plugin
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Community Section - CTA to join Payload community */}
          <section className="relative overflow-hidden fl-py-xl">
            <div className="u-container">
              <div className="relative z-10 overflow-hidden rounded-xl">
                <div className="relative z-10 p-8 md:p-12">
                  <div className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center">
                    <h2 className="fl-mb-s">
                      {globalData?.communitySection?.title || 'Join the Payload CMS Community'}
                    </h2>

                    <p className="mx-auto max-w-2xl text-foreground/80 fl-mb-l">
                      {globalData?.communitySection?.description ||
                        'Payload Plugins is an independent directory that works alongside the official Payload CMS community. Connect with Payload developers, get help, and stay updated with the latest news.'}
                    </p>

                    <div className="mb-8 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
                      <Card
                        as={Link}
                        href={
                          globalData?.communitySection?.communityLinks?.[0]?.buttonUrl ||
                          'https://discord.com/invite/payload'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-visible border border-foreground/10 bg-background/30 backdrop-blur-sm transition-all duration-300 ease-out hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl"
                        shadow="none"
                        radius="lg"
                      >
                        <div className="flex flex-col items-center p-6">
                          {' '}
                          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_0_15px_5px_rgba(125,90,255,0.15)]">
                            <Icon
                              icon="heroicons:chat-bubble-left-right"
                              className="h-7 w-7 text-white"
                            />
                          </div>
                          <h3 className="mb-3 text-lg font-medium">
                            {globalData?.communitySection?.communityLinks?.[0]?.title || 'Discord'}
                          </h3>
                          <p className="mb-6 flex-grow text-center text-sm text-foreground/70">
                            {globalData?.communitySection?.communityLinks?.[0]?.description ||
                              'Join discussions, get help, and connect with the community.'}
                          </p>
                          <CardFooter>
                            <div className="flex w-full items-center justify-center text-sm font-medium text-foreground">
                              {globalData?.communitySection?.communityLinks?.[0]?.buttonLabel ||
                                'Join Discord'}
                              <svg
                                className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                              </svg>
                            </div>
                          </CardFooter>
                        </div>
                      </Card>

                      <Card
                        as={Link}
                        href={
                          globalData?.communitySection?.communityLinks?.[1]?.buttonUrl ||
                          'https://github.com/payloadcms/payload'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-visible border border-foreground/10 bg-background/30 backdrop-blur-sm transition-all duration-300 ease-out hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl"
                        shadow="none"
                        radius="lg"
                      >
                        <div className="flex flex-col items-center p-6">
                          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_0_15px_5px_rgba(125,90,255,0.15)]">
                            <Icon
                              icon="heroicons:code-bracket-square"
                              className="h-7 w-7 text-white"
                            />
                          </div>
                          <h3 className="mb-3 text-lg font-medium">
                            {globalData?.communitySection?.communityLinks?.[1]?.title || 'GitHub'}
                          </h3>
                          <p className="mb-6 flex-grow text-center text-sm text-foreground/70">
                            {globalData?.communitySection?.communityLinks?.[1]?.description ||
                              'Access the source code, contribute, and report issues.'}
                          </p>
                          <CardFooter>
                            <div className="flex w-full items-center justify-center text-sm font-medium text-foreground">
                              {globalData?.communitySection?.communityLinks?.[1]?.buttonLabel ||
                                'Visit GitHub'}
                              <svg
                                className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                              </svg>
                            </div>{' '}
                          </CardFooter>
                        </div>
                      </Card>

                      <Card
                        as={Link}
                        href={
                          globalData?.communitySection?.communityLinks?.[2]?.buttonUrl ||
                          'https://payloadcms.com'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group overflow-visible border border-foreground/10 bg-background/30 backdrop-blur-sm transition-all duration-300 ease-out hover:translate-y-[-2px] hover:border-foreground/20 hover:bg-foreground/5 hover:shadow-xl"
                        shadow="none"
                        radius="lg"
                      >
                        <div className="flex flex-col items-center p-6">
                          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-foreground/10 transition-all duration-300 ease-out group-hover:scale-110 group-hover:shadow-[0_0_15px_5px_rgba(125,90,255,0.15)]">
                            <Icon icon="heroicons:globe-alt" className="h-7 w-7 text-white" />
                          </div>
                          <h3 className="mb-3 text-lg font-medium">
                            {globalData?.communitySection?.communityLinks?.[2]?.title ||
                              'Official Site'}
                          </h3>
                          <p className="mb-6 flex-grow text-center text-sm text-foreground/70">
                            {globalData?.communitySection?.communityLinks?.[2]?.description ||
                              'Visit the official Payload CMS website for resources and docs.'}
                          </p>
                          <CardFooter>
                            <div className="flex w-full items-center justify-center text-sm font-medium text-foreground">
                              {globalData?.communitySection?.communityLinks?.[2]?.buttonLabel ||
                                'Visit Website'}
                              <svg
                                className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                                />
                              </svg>
                            </div>
                          </CardFooter>
                        </div>
                      </Card>
                    </div>

                    <div className="mt-2 inline-block border-t border-accent-500/20 px-6 py-4">
                      <p className="flex items-center text-sm text-foreground/90">
                        <span>
                          {globalData?.communitySection?.creditSection?.text ||
                            'Payload Plugins created by'}
                        </span>
                        <Link
                          href={
                            globalData?.communitySection?.creditSection?.linkUrl ||
                            'https://omnipixel.io'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group ml-2 inline-flex items-center text-accent-500 transition-colors hover:text-accent-400"
                        >
                          {globalData?.communitySection?.creditSection?.linkText || 'Omnipixel'}
                          <svg
                            className="ml-1.5 h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {draft && <LivePreviewListener />}
      </main>
    );
  } catch (error) {
    console.error(error);
    return notFound();
  }
}
