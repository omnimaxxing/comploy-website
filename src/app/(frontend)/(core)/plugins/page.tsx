/**
 * Unified Plugins Directory Page
 *
 * This page provides a streamlined plugin browsing experience:
 * - Consistent layout with sidebar filters and main content area
 * - Category and tag filtering in the sidebar
 * - Sorting and view options in the main content
 * - Implemented with PPR (Partial Prerendering) for optimal performance
 */

import { notFound } from 'next/navigation';
import { generateGlobalMetadata } from '@/utilities/mergeOpenGraph';
import type { Metadata } from 'next';
import { getCachedGlobal } from '@/utilities/getGlobals';
import type { Plugin, PluginsGlobal } from '@/payload-types';
import { draftMode } from 'next/headers';
import { cn, Divider, Button, Spinner } from '@heroui/react';
import { LivePreviewListener } from '@/components/LivePreviewListener';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { HeroAnimation } from '@/components/ui/HeroAnimation';
import { cache, Suspense } from 'react';
import { getCachedCategories } from '@/utilities/getCategories';
import FilterSidebar from '@/components/plugins/FilterSidebar';
import SearchBox from '@/components/plugins/SearchBox';
import { DynamicTrendingPlugins } from './components/DynamicTrendingPlugins';
import { DynamicPopularPlugins } from './components/DynamicPopularPlugins';
import { DynamicRecentPlugins } from './components/DynamicRecentPlugins';
import { DynamicSearchResults } from './components/DynamicSearchResults';
import { DynamicFeaturedPlugins } from './components/DynamicFeaturedPlugins';
import SortSelector from './components/SortSelector';
import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { SearchBar } from './components/SearchBar';
import { Stars } from '@/components/ui/Stars';
import { SkeletonPluginGrid } from '@/components/plugins/SkeletonPluginGrid';

// Enable Partial Prerendering for this route
export const experimental_ppr = true;

// Cache the global fetch to avoid duplicate requests
const getGlobalData = cache(async () => {
  return (await getCachedGlobal('plugins-global', 4)()) as PluginsGlobal;
});

// Helper function to create URLs with params
const createUrlWithParams = (params: Record<string, string | undefined>) => {
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) urlParams.set(key, value);
  });

  return `/plugins?${urlParams.toString()}`;
};

// Metadata generation without awaiting during build
export function generateMetadata(): Metadata {
  // For metadata, we rely on default values that will be enhanced client-side
  return {
    title: 'Plugins - Payload CMS',
    description: 'Discover and share plugins, extensions, and tools for Payload CMS',
  };
}

// Component to handle global data fetching
async function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  const pluginsGlobal = await getGlobalData();

  if (!pluginsGlobal) {
    return notFound();
  }

  return <>{children}</>;
}

// Component to handle draft mode
async function DraftModeProvider({ children }: { children: React.ReactNode }) {
  const { isEnabled: draft } = await draftMode();

  return (
    <>
      {children}
      {draft && <LivePreviewListener />}
    </>
  );
}

// Dynamic category data fetching component
async function CategoryData({ selectedCategory }: { selectedCategory?: string }) {
  // Fetch categories (cached)
  const categories = await getCachedCategories();

  // Get total plugin count and update category counts
  const payload = await getPayload({ config: configPromise });

  // Get total plugin count
  const pluginCountResult = await payload.find({
    collection: 'plugins',
    limit: 0, // We only need the count, not the actual plugins
  });

  const pluginCount = pluginCountResult.totalDocs;

  // Update categories with their plugin counts
  if (categories.length > 0) {
    // Fetch counts for each category
    const categoryPromises = categories.map(async cat => {
      if (!cat.slug) return cat;

      const categoryResult = await payload.find({
        collection: 'plugins',
        where: {
          category: {
            equals: cat.id,
          },
        },
        limit: 0,
      });

      return {
        ...cat,
        pluginCount: categoryResult.totalDocs,
      };
    });

    // Wait for all category count queries to complete
    const updatedCategories = await Promise.all(categoryPromises);

    // Replace categories with updated ones that include counts
    for (let i = 0; i < categories.length; i++) {
      categories[i] = updatedCategories[i];
    }
  }

  return (
    <FilterSidebar
      categories={categories}
      selectedCategory={selectedCategory}
      totalCount={pluginCount}
    />
  );
}

// Dynamic content component that handles searchParams
async function PluginsContent({
  searchParams,
  draft,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  draft: boolean;
}) {
  const pluginsGlobal = await getGlobalData();

  // Extract parameters
  const pageStr =
    typeof searchParams.page === 'string'
      ? searchParams.page
      : Array.isArray(searchParams.page)
        ? searchParams.page[0]
        : '1';
  const limitStr =
    typeof searchParams.limit === 'string'
      ? searchParams.limit
      : Array.isArray(searchParams.limit)
        ? searchParams.limit[0]
        : '12';
  const sort =
    typeof searchParams.sort === 'string'
      ? searchParams.sort
      : Array.isArray(searchParams.sort)
        ? searchParams.sort[0]
        : '-createdAt';
  const category =
    typeof searchParams.category === 'string'
      ? searchParams.category
      : Array.isArray(searchParams.category)
        ? searchParams.category[0]
        : undefined;
  const search =
    typeof searchParams.search === 'string'
      ? searchParams.search
      : Array.isArray(searchParams.search)
        ? searchParams.search[0]
        : undefined;
  const view =
    typeof searchParams.view === 'string'
      ? searchParams.view
      : Array.isArray(searchParams.view)
        ? searchParams.view[0]
        : undefined;

  // Convert string values to appropriate types
  const page = parseInt(pageStr, 10) || 1;
  const limit = parseInt(limitStr, 10) || 12;

  // Prepare params for dynamic components
  const params = {
    page,
    limit,
    sort,
    category,
    search,
  };

  // Define available sorting options
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: '-views', label: 'Most Popular' },
    { value: '-githubData.stars', label: 'Most Stars' },
    { value: '-updatedAt', label: 'Recently Updated' },
  ];

  // Determine if we're showing filtered results
  // Now also check for view=all parameter
  const isFiltered = !!search || !!category || view === 'all';

  // Get the current sort option label
  const currentSortLabel =
    sortOptions.find(option => option.value === sort)?.label || 'Newest First';

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="mb-6 lg:hidden">
        <details className="group">
          <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-foreground/10 bg-background/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Icon icon="heroicons:adjustments-horizontal" className="h-5 w-5" />
              <span className="font-medium">Filters</span>
              {(category || view === 'all') && (
                <span className="ml-2 rounded-full bg-accent-500/20 px-2 py-0.5 text-xs text-accent-500">
                  {!!category || view === 'all' ? '1' : '0'}
                </span>
              )}
            </div>
            <Icon
              icon="heroicons:chevron-down"
              className="h-4 w-4 transition-transform group-open:rotate-180"
            />
          </summary>
          <div className="pt-4">
            <Suspense
              fallback={
                <div className="text-muted-foreground py-4 text-center">Loading filters...</div>
              }
            >
              <CategoryData selectedCategory={category} />
            </Suspense>
          </div>
        </details>
      </div>

      <div className="u-grid gap-8">
        {/* Sidebar with category filters - hidden on mobile */}
        <div className="col-span-12 hidden lg:col-span-3 lg:block">
          <Suspense
            fallback={
              <div className="text-muted-foreground flex h-40 items-center justify-center rounded-lg border border-foreground/10 bg-background p-6 shadow-lg">
                Loading filters...
              </div>
            }
          >
            <CategoryData selectedCategory={category} />
          </Suspense>
        </div>

        {/* Main content area */}
        <div className="col-span-12 lg:col-span-9">
          {/* Stars that extend throughout the page with fading effect */}
          <div className="pointer-events-none absolute inset-0">
            <Stars number={120} className="z-0 opacity-70" />
          </div>

          {/* Sort controls for filtered results */}
          {isFiltered && (
            <div className="mb-6 flex flex-wrap items-center justify-between">
              <h2 className="flex items-center fl-text-step-1">
                {search ? (
                  <>
                    <Icon
                      icon="heroicons:magnifying-glass"
                      className="mr-2 h-6 w-6 text-accent-500/70"
                    />
                    Search Results
                  </>
                ) : category ? (
                  <>
                    <Suspense
                      fallback={
                        <Icon icon="heroicons:beaker" className="mr-2 h-6 w-6 text-accent-500/70" />
                      }
                    >
                      <CategoryIcon category={category} />
                    </Suspense>
                    <Suspense fallback="Category Plugins">
                      <CategoryName category={category} />
                    </Suspense>
                  </>
                ) : view === 'all' ? (
                  <>
                    <Icon
                      icon="heroicons:squares-2x2"
                      className="mr-2 h-6 w-6 text-accent-500/70"
                    />
                    All Plugins
                  </>
                ) : (
                  'Plugins'
                )}
              </h2>

              {/* Add sort dropdown if not on the "All Plugins" view */}
              {isFiltered && view !== 'all' && (
                <div className="flex items-center">
                  <SortSelector options={sortOptions} value={sort} />
                </div>
              )}
            </div>
          )}

          {/* Content display */}
          {isFiltered ? (
            <Suspense
              fallback={
                <div>
                  <SkeletonPluginGrid count={12} />
                </div>
              }
            >
              <DynamicSearchResults
                params={params}
                searchQuery={search || ''}
                currentPage={page}
                isAllPluginsView={view === 'all'}
              />
            </Suspense>
          ) : (
            <>
              {/* SearchBar component */}
              {!category && (
                <Suspense
                  fallback={
                    <div className="mb-8 flex h-14 w-full items-center rounded-lg border border-foreground/10 bg-background px-5 pl-12 shadow-sm">
                      <Icon
                        icon="heroicons:magnifying-glass"
                        className="text-muted-foreground mr-3 h-5 w-5"
                      />
                      <span className="text-muted-foreground">Loading search...</span>
                    </div>
                  }
                >
                  <SearchBar />
                </Suspense>
              )}
              {/* Featured section */}
              <section className="mb-12">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center fl-text-step-1">
                    <Icon icon="heroicons:star" className="mr-2 h-6 w-6 text-accent-500/70" />
                    Featured Plugins
                  </h2>
                  <Button
                    as={Link}
                    href="/plugins?view=all&sort=-views"
                    variant="bordered"
                    className="rounded-none border-foreground/40 transition-colors hover:border-foreground hover:text-accent-400"
                    endContent={<Icon icon="heroicons:arrow-right" className="h-4 w-4" />}
                  >
                    View All Plugins
                  </Button>
                </div>
                <Suspense fallback={<SkeletonPluginGrid count={6} />}>
                  <DynamicFeaturedPlugins limit={6} />
                </Suspense>
              </section>

              <Divider className="opacity-30 fl-my-s" />
              {/* Trending section */}
              <section className="mb-12">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center fl-text-step-1">
                    <Icon
                      icon="heroicons:arrow-trending-up"
                      className="mr-2 h-6 w-6 text-accent-500/70"
                    />
                    Trending Plugins
                  </h2>
                </div>
                <Suspense fallback={<SkeletonPluginGrid count={6} />}>
                  <DynamicTrendingPlugins limit={6} />
                </Suspense>
              </section>

              <Divider className="opacity-30 fl-my-s" />
              {/* Recent section */}
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="flex items-center fl-text-step-1">
                    <Icon icon="heroicons:clock" className="mr-2 h-6 w-6 text-accent-500/70" />
                    Recent Plugins
                  </h2>
                </div>
                <Suspense fallback={<SkeletonPluginGrid count={6} />}>
                  <DynamicRecentPlugins limit={6} />
                </Suspense>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Helper components for category rendering
async function CategoryIcon({ category }: { category: string }) {
  const categories = await getCachedCategories();
  const icon = categories.find(c => c.slug === category)?.icon || 'heroicons:beaker';
  return <Icon icon={icon} className="mr-2 h-6 w-6 text-accent-500/70" />;
}

async function CategoryName({ category }: { category: string }) {
  const categories = await getCachedCategories();
  const name = categories.find(c => c.slug === category)?.name || 'Category';
  return <>{name} Plugins</>;
}

// Component for hero section to avoid awaits in the main component
function Hero() {
  return (
    <section className="relative flex min-h-[40vh] flex-col justify-center overflow-hidden py-12 md:h-auto md:py-16">
      {/* Background gradients and animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/10 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(79,70,229,0.15)_0%,transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.15)_0%,transparent_50%)]"></div>
      <HeroAnimation />

      <Suspense
        fallback={<div className="relative z-20 w-full animate-pulse bg-white/5 p-8"></div>}
      >
        <HeroContent />
      </Suspense>
    </section>
  );
}

// Async component for hero content
async function HeroContent() {
  const pluginsGlobal = await getGlobalData();

  return (
    <div className="relative z-20 w-full">
      <div className="u-container">
        {/* Hero content */}
        <div className="mb-6 mt-4 max-w-3xl md:mb-8 md:mt-8">
          <h1 className="relative mt-0 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent fl-mb-s [text-shadow:0_0_30px_rgba(255,255,255,0.2)]">
            {pluginsGlobal.hero?.title || 'Do More with Payload CMS'}
          </h1>

          <p className="max-w-lg text-lg text-white/80 fl-mb-m md:text-xl">
            {pluginsGlobal.hero?.subtitle ||
              'Discover and share plugins, extensions, and tools for Payload CMS'}
          </p>

          {/* Button for plugin submission */}
          <div className="relative mb-6 flex flex-wrap gap-4 md:mb-8">
            <Button
              as={Link}
              href="/submit"
              variant="solid"
              className="group rounded-none bg-foreground text-background shadow-lg hover:bg-foreground/90 hover:shadow-accent-500/20"
              size="lg"
              endContent={
                <svg
                  className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              Submit Your Plugin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that safely awaits searchParams
async function PluginsWrapper({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const { isEnabled: draft } = await draftMode();

  return (
    <main className="relative overflow-hidden">
      <Hero />

      <Divider className="opacity-30" />

      {/* Main content section with sidebar filters and results */}
      <section className="relative fl-py-xl">
        <div className="u-container">
          <Suspense fallback={<SkeletonPluginGrid count={12} />}>
            <PluginsContent searchParams={resolvedSearchParams} draft={draft} />
          </Suspense>
        </div>
      </section>

      {draft && <LivePreviewListener />}
    </main>
  );
}

export default function PluginsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black/90">
          <Spinner size="lg" color="white" variant="gradient" />
        </div>
      }
    >
      <PluginsWrapper searchParams={searchParams} />
    </Suspense>
  );
}
