/**
 * Individual Plugin Detail Page
 *
 * This page implements Next.js 15's Partial Prerendering (PPR) to optimize the balance
 * between static and dynamic content. PPR allows us to prerender as much of the page
 * as possible at build time while dynamically loading frequently changing content.
 *
 * === PPR Implementation ===
 *
 * 1. Static Content (Prerendered):
 *    - Plugin metadata (name, description, GitHub data)
 *    - Plugin categories and tags
 *    - Installation instructions
 *    - Screenshots and related links
 *
 * 2. Dynamic Content (Loaded with Suspense):
 *    - View counts (DynamicPluginStats)
 *    - Upvotes/downvotes (DynamicPluginRating)
 *    - User discussions/comments (DynamicComments)
 *
 * === How It Works ===
 *
 * - Static content uses React's `cache()` wrapper and is prerendered at build time
 * - Dynamic components fetch fresh data on each request without caching
 * - Suspense boundaries wrap dynamic content with fallbacks showing cached data
 * - Revalidation hooks in collections trigger rebuilds of static content when needed
 * - View counts and other frequent updates don't trigger unnecessary revalidations
 *
 * === GitHub Authentication Integration ===
 *
 * - Uses Auth.js for GitHub authentication
 * - Allows plugin owners to verify ownership through GitHub
 * - Dynamic components respect authentication state for actions like voting
 * - Ownership verification uses consistent data format between client and server
 *
 * This approach provides:
 * - Fast initial page loads (static content)
 * - Always fresh dynamic data (views, votes, comments)
 * - Optimized server load (smart revalidation)
 * - Improved user experience (no loading spinners for dynamic content)
 * - SEO benefits (core content is statically generated)
 */

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { unstable_noStore } from 'next/cache';

import { getPayload } from 'payload';
import configPromise from '@/payload.config';
import { cache, Suspense } from 'react';
import Link from 'next/link';
import { Divider, cn, Button, Card, Tabs, Tab, Badge, Spinner, Skeleton } from '@heroui/react';
import { Icon } from '@iconify/react';
import Image from 'next/image';
import CodeBlock from '@/components/ui/code-block';
import type { Plugin, Media, Tag as PayloadTag } from '@/payload-types';
import { ViewTracker } from './components/ViewTracker';
import { ImageCarousel } from './components/ImageCarousel';
import { RelatedPluginsCarousel } from './components/RelatedPluginsCarousel';
import { Tag, type TagColor } from '@/components/ui/tag';
import { Contributors } from './components/Contributors';
import { PluginActions } from './components/PluginActions';
import { ReviewSection } from './components/ReviewSection';
import { auth } from '@/auth';
import { DynamicPluginStats } from './components/DynamicPluginStats';
import { DynamicPluginRating } from './components/DynamicPluginRating';
import { DynamicComments } from './components/DynamicComments';
import { PayloadIcon } from '@/components/Icons/PayloadIcon';

// Enable Partial Prerendering for this route
export const experimental_ppr = true;

type PageParams = {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Updated type to match Next.js 15 page component requirements with PPR
type Props = {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Cache plugin fetching function
const getCachedPluginBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise });

  try {
    const plugin = await payload.find({
      collection: 'plugins',
      where: {
        slug: {
          equals: slug,
        },
        _status: {
          equals: 'published',
        },
      },
      depth: 2,
    });

    return (plugin.docs[0] as Plugin) || null;
  } catch (error) {
    console.error(`Error fetching plugin with slug ${slug}:`, error);
    return null;
  }
});

// Cache all plugins slugs for static generation
const getAllPluginSlugs = cache(async () => {
  const payload = await getPayload({ config: configPromise });

  try {
    const plugins = await payload.find({
      collection: 'plugins',
      where: {
        _status: {
          equals: 'published',
        },
      },
      limit: 1000, // Adjust based on expected number of plugins
    });

    return plugins.docs.map(plugin => plugin.slug).filter(Boolean);
  } catch (error) {
    console.error('Error fetching plugin slugs:', error);
    return [];
  }
});

// Generate metadata for the page
export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  // We can't use Suspense here, but we're fine since metadata doesn't need PPR
  // The Next.js docs indicate that metadata functions aren't impacted by PPR bailout points
  // This will only run at build time or on first load
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  const plugin = await getCachedPluginBySlug(slug);

  if (!plugin) {
    return {
      title: 'Plugin Not Found',
      description: 'The requested plugin could not be found.',
    };
  }

  return {
    title: `${plugin.name} - Payload CMS Plugin`,
    description: plugin.shortDescription || 'A plugin for Payload CMS',
  };
}

// Generate static params for all plugins
export async function generateStaticParams() {
  try {
    const slugs = await getAllPluginSlugs();

    return slugs.map(slug => ({
      slug,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Simple rich text renderer for Lexical format
const RichTextRenderer = ({ content }: { content: any }) => {
  if (!content || !content.root) {
    return <p>No content available</p>;
  }

  // Extract plain text for simple rendering
  const extractTextFromNodes = (nodes: any[]): string => {
    if (!nodes) return '';

    return nodes
      .map(node => {
        if (node.type === 'text') {
          return node.text;
        } else if (node.children) {
          return extractTextFromNodes(node.children);
        }
        return '';
      })
      .join('');
  };

  const paragraphs = content.root.children.map((paragraph: any, i: number) => {
    const text = extractTextFromNodes(paragraph.children);
    return (
      <p key={i} className="fl-mb-s">
        {text}
      </p>
    );
  });

  return <div>{paragraphs}</div>;
};

// Format date in a human-readable way with better "today" detection
const formatDate = (dateString?: string | null) => {
  if (!dateString) return '';

  const date = new Date(dateString);
  const now = new Date();

  // Reset hours to compare just the dates
  const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const nowWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Calculate difference in milliseconds and convert to days
  const diffTime = Math.abs(nowWithoutTime.getTime() - dateWithoutTime.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Handle relative dates
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // Otherwise, show the date
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Async component for plugin main image
async function PluginMainImage({ plugin }: { plugin: Plugin }) {
  if (
    !plugin?.mainImage ||
    typeof plugin.mainImage !== 'object' ||
    !plugin.mainImage ||
    !('url' in plugin.mainImage) ||
    !plugin.mainImage.url
  ) {
    return null;
  }

  return (
    <div className="order-1 w-full lg:order-1 lg:w-2/5">
      <div className="group relative aspect-[16/9] overflow-hidden rounded-none border border-white/10 shadow-2xl transition-all hover:border-white/20 hover:shadow-indigo-900/20">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/60 to-transparent mix-blend-overlay"></div>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/30 to-transparent"></div>
        <Image
          src={plugin.mainImage.url}
          alt={plugin.mainImage.alt || `${plugin.name} main image`}
          fill
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="z-0 object-cover transition-transform duration-700 group-hover:scale-105"
          priority
        />
      </div>
    </div>
  );
}

// Async component for plugin categories
async function PluginCategories({ plugin }: { plugin: Plugin }) {
  if (!plugin.category) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {Array.isArray(plugin.category)
        ? plugin.category.map(
            category =>
              typeof category === 'object' &&
              category !== null &&
              'name' in category && (
                <Link
                  key={typeof category.id === 'string' ? category.id : String(category.id)}
                  href={`/plugins/all?category=${
                    typeof category.slug === 'string' ? category.slug : ''
                  }`}
                  className="inline-flex h-6 items-center rounded-none bg-white/5 px-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
                >
                  {category.name}
                </Link>
              )
          )
        : typeof plugin.category === 'object' &&
          plugin.category !== null &&
          'name' in plugin.category && (
            <Link
              key={
                typeof plugin.category.id === 'string'
                  ? plugin.category.id
                  : String(plugin.category.id)
              }
              href={`/plugins/all?category=${
                typeof plugin.category.slug === 'string' ? plugin.category.slug : ''
              }`}
              className="inline-flex h-6 items-center rounded-none bg-white/5 px-2 text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
            >
              {plugin.category.name}
            </Link>
          )}
    </div>
  );
}

// Async component for GitHub metadata
async function GitHubStats({ githubData }: { githubData: Plugin['githubData'] }) {
  if (!githubData) return null;

  return (
    <div className="flex items-center gap-4">
      {githubData.stars !== undefined && (
        <div className="flex items-center gap-1.5 text-white/80">
          <Icon icon="heroicons:star" className="h-5 w-5 text-amber-400" />
          <span className="font-medium">{githubData.stars}</span>
        </div>
      )}

      {githubData.forks !== undefined && (
        <div className="flex items-center gap-1.5 text-white/80">
          <Icon icon="octicon:git-branch" className="h-5 w-5" />
          <span className="font-medium">{githubData.forks}</span>
        </div>
      )}

      {githubData.lastCommit && (
        <div className="flex items-center gap-1.5 text-white/80">
          <Icon icon="heroicons:clock" className="h-5 w-5" />
          <span className="font-medium">Updated {formatDate(githubData.lastCommit)}</span>
        </div>
      )}
    </div>
  );
}

// Plugin verification badges component
function PluginBadges({ isVerified, isOfficial }: { isVerified?: boolean; isOfficial?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      {isVerified && (
        <div className="flex items-center gap-1.5 text-white/80">
          <Icon icon="heroicons:check-badge" className="h-5 w-5 text-green-400" />
          <span className="font-medium">Verified</span>
        </div>
      )}

      {isOfficial && (
        <div className="flex items-center gap-1.5 text-white/80">
          <PayloadIcon className="h-5 w-5" />
          <span className="font-medium">Official</span>
        </div>
      )}
    </div>
  );
}

// Plugin info component that displays tags
async function PluginTags({ plugin }: { plugin: Plugin }) {
  if (!plugin.tags || !Array.isArray(plugin.tags) || plugin.tags.length === 0) {
    return null;
  }

  return (
    <div>
      <dt className="mb-1 text-white/60">Tags</dt>
      <dd className="mt-2 flex flex-wrap gap-1 font-medium">
        {plugin.tags
          .filter(
            (tag): tag is PayloadTag =>
              typeof tag === 'object' && tag !== null && 'id' in tag && 'name' in tag
          )
          .map(tag => (
            <Tag
              key={String(tag.id)}
              tag={{
                id: String(tag.id),
                name: tag.name || '',
                slug: tag.slug || undefined,
                color: (tag.color || undefined) as TagColor,
              }}
              showHash={true}
            />
          ))}
      </dd>
    </div>
  );
}

// Plugin category display for the sidebar
async function PluginSidebarCategory({ category }: { category: any }) {
  if (!category || typeof category !== 'object' || !category.name) {
    return null;
  }

  return (
    <div>
      <dt className="mb-1 text-white/60">Category</dt>
      <dd className="mt-2 font-medium">
        <Link
          href={`/plugins?category=${category.slug || ''}`}
          className="inline-flex items-center rounded-sm border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-500/10"
        >
          {category.name}
        </Link>
      </dd>
    </div>
  );
}

// Plugin details sidebar
async function PluginSidebar({ plugin }: { plugin: Plugin }) {
  return (
    <div className="sticky top-24">
      <div className="via-fuchsia-500/3 mb-8 overflow-hidden rounded-none bg-gradient-to-br from-indigo-500/5 to-transparent p-0.5 shadow-xl">
        <div className="overflow-hidden rounded-none bg-black/60 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-xl font-bold">Plugin Details</h3>

          <dl className="space-y-4 text-sm">
            <div>
              <dt className="mb-1 text-white/60">Author</dt>
              <dd className="flex items-center font-medium">
                {/* Safe access of author data */}
                {plugin.isOfficial ? (
                  <>
                    <span className="font-medium">Payload CMS Team</span>
                    <span className="ml-2 inline-flex items-center rounded-none bg-indigo-950/30 px-2 py-0.5 text-xs">
                      <PayloadIcon className="mr-1 h-3 w-3" />
                      Official
                    </span>
                  </>
                ) : (
                  <>
                    {plugin.githubData?.owner ? (
                      <span className="font-medium">{plugin.githubData.owner}</span>
                    ) : (
                      'Unknown Author'
                    )}
                  </>
                )}
              </dd>
            </div>

            {plugin.githubData?.license && (
              <div>
                <dt className="mb-1 text-white/60">License</dt>
                <dd className="font-medium">{plugin.githubData.license}</dd>
              </div>
            )}

            <Suspense fallback={<div className="h-16 animate-pulse rounded-none bg-white/5"></div>}>
              <PluginTags plugin={plugin} />
            </Suspense>

            <Suspense fallback={<div className="h-16 animate-pulse rounded-none bg-white/5"></div>}>
              <PluginSidebarCategory category={plugin.category} />
            </Suspense>

            <div>
              <dt className="mb-1 text-white/60">Added to Directory</dt>
              <dd className="font-medium">{formatDate(plugin.createdAt)}</dd>
            </div>

            {plugin.githubData?.lastCommit && (
              <div>
                <dt className="mb-1 text-white/60">Latest GitHub Commit</dt>
                <dd className="font-medium">{formatDate(plugin.githubData.lastCommit)}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <RelatedLinksCard plugin={plugin} />

      <ContributorsCard githubUrl={plugin.githubUrl as string} />
    </div>
  );
}

// Related links card component
function RelatedLinksCard({ plugin }: { plugin: Plugin }) {
  return (
    <div className="mb-8 overflow-hidden rounded-none bg-gradient-to-br from-white/5 to-transparent p-0.5 shadow-xl">
      <div className="overflow-hidden rounded-none bg-black/60 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-xl font-bold">Related Links</h3>

        <ul className="space-y-3">
          <li>
            <a
              href={plugin.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
            >
              <div className="rounded-none bg-white/10 p-1.5">
                <Icon icon="heroicons:code-bracket-square" className="h-4 w-4" />
              </div>
              <span>GitHub Repository</span>
            </a>
          </li>

          {plugin.relatedLinks?.npmUrl && (
            <li>
              <a
                href={plugin.relatedLinks.npmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
              >
                <div className="rounded-none bg-white/10 p-1.5">
                  <Icon icon="heroicons:cube" className="h-4 w-4" />
                </div>
                <span>NPM Package</span>
              </a>
            </li>
          )}

          {plugin.relatedLinks?.demoUrl && (
            <li>
              <a
                href={plugin.relatedLinks.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
              >
                <div className="rounded-none bg-white/10 p-1.5">
                  <Icon icon="heroicons:play" className="h-4 w-4" />
                </div>
                <span>Live Demo</span>
              </a>
            </li>
          )}

          {plugin.relatedLinks?.videoUrl && (
            <li>
              <a
                href={plugin.relatedLinks.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white/80 transition-colors hover:text-white"
              >
                <div className="rounded-none bg-white/10 p-1.5">
                  <Icon icon="heroicons:video-camera" className="h-4 w-4" />
                </div>
                <span>Tutorial Video</span>
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Contributors card component
function ContributorsCard({ githubUrl }: { githubUrl?: string }) {
  if (!githubUrl) {
    return (
      <div className="overflow-hidden rounded-none bg-gradient-to-br from-rose-500/5 to-transparent p-0.5 shadow-xl">
        <div className="overflow-hidden rounded-none bg-black/60 p-6 backdrop-blur-md">
          <h3 className="mb-4 text-xl font-bold">Contributors</h3>
          <p className="text-sm italic text-white/70">No GitHub repository URL provided</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-none bg-gradient-to-br from-rose-500/5 to-transparent p-0.5 shadow-xl">
      <div className="overflow-hidden rounded-none bg-black/60 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-xl font-bold">Contributors</h3>

        <Suspense
          fallback={
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full">
                  <div className="h-10 w-10 rounded-full bg-foreground/5"></div>
                </Skeleton>
                <Skeleton className="h-5 w-32 rounded-none">
                  <div className="h-5 w-32 bg-foreground/5"></div>
                </Skeleton>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full">
                  <div className="h-10 w-10 rounded-full bg-foreground/5"></div>
                </Skeleton>
                <Skeleton className="h-5 w-28 rounded-none">
                  <div className="h-5 w-28 bg-foreground/5"></div>
                </Skeleton>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full">
                  <div className="h-10 w-10 rounded-full bg-foreground/5"></div>
                </Skeleton>
                <Skeleton className="h-5 w-36 rounded-none">
                  <div className="h-5 w-36 bg-foreground/5"></div>
                </Skeleton>
              </div>
            </div>
          }
        >
          <Contributors githubUrl={githubUrl} limit={4} />
        </Suspense>
      </div>
    </div>
  );
}

// About section component
function AboutSection({ plugin }: { plugin: Plugin }) {
  return (
    <section id="about" className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">About</h2>

      <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:leading-relaxed prose-p:text-white/80">
        {plugin.fullDescription ? (
          <RichTextRenderer content={plugin.fullDescription} />
        ) : (
          <p className="text-white/70">No detailed description available.</p>
        )}
      </div>
    </section>
  );
}

// Installation section component
function InstallationSection({ plugin }: { plugin: Plugin }) {
  return (
    <section id="installation" className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">Installation</h2>

      <div className="w-full overflow-hidden border border-white/10 bg-black/30 shadow-xl">
        {plugin.installCommands && plugin.installCommands.length > 0 ? (
          <CodeBlock
            tabs={plugin.installCommands.map(cmd => ({
              label:
                cmd.packageManager === 'other' && cmd.customLabel
                  ? cmd.customLabel
                  : cmd.packageManager || 'npm',
              code: cmd.command || '',
              language: 'bash',
            }))}
            theme="oneDark"
          />
        ) : (
          <div className="p-6">
            <p className="text-white/70">No installation commands provided.</p>
          </div>
        )}
      </div>
    </section>
  );
}

// Screenshots section component
function ScreenshotsSection({ plugin }: { plugin: Plugin }) {
  if (
    !plugin.imagesGallery ||
    !Array.isArray(plugin.imagesGallery) ||
    plugin.imagesGallery.length === 0
  ) {
    return null;
  }

  return (
    <section id="screenshots" className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">Screenshots</h2>

      <div className="mb-8 overflow-hidden rounded-none bg-gradient-to-br from-white/5 to-transparent p-0.5 shadow-xl">
        <div className="overflow-hidden rounded-none bg-black/50 p-6 backdrop-blur-sm">
          <div className="aspect-video relative mx-auto max-w-full">
            <ImageCarousel
              images={plugin.imagesGallery
                .filter(
                  (image): image is Media =>
                    typeof image === 'object' && image !== null && 'url' in image && !!image.url
                )
                .map(image => ({
                  url: image.url as string,
                  alt: image.alt || `${plugin.name} screenshot`,
                }))}
              pluginName={plugin.name}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Community Discussion section
function CommentsSection({ plugin, slug }: { plugin: Plugin; slug: string }) {
  return (
    <section id="comments" className="mb-12">
      <h2 className="mb-6 text-2xl font-bold">Community Discussion</h2>

      <div className="overflow-hidden rounded-none bg-gradient-to-br from-white/5 to-transparent p-0.5 shadow-lg">
        <div className="overflow-hidden rounded-none bg-black/50 p-6 backdrop-blur-sm">
          <Suspense
            fallback={
              <ReviewSection
                slug={slug}
                initialReviews={(plugin.comments || []).map(review => ({
                  author: review.author,
                  comment: review.comment,
                  createdAt: review.createdAt || new Date().toISOString(),
                }))}
              />
            }
          >
            <DynamicComments
              slug={slug}
              initialReviews={(plugin.comments || []).map(review => ({
                author: review.author,
                comment: review.comment,
                createdAt: review.createdAt || new Date().toISOString(),
              }))}
            />
          </Suspense>
        </div>
      </div>
    </section>
  );
}

// Main plugin content component
async function PluginContent({ slug }: { slug: string }) {
  const plugin = await getCachedPluginBySlug(slug);

  if (!plugin) {
    return notFound();
  }

  return (
    <main className="relative overflow-hidden">
      {/* View tracker component to handle tracking without revalidation during SSR */}
      <ViewTracker slug={slug} />

      {/* Hero section with cosmic gradient background similar to plugins page */}
      <section className="relative pb-8">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black via-indigo-950/5 to-black"></div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.1)_0%,transparent_50%)]"></div>

        {/* Back navigation */}
        <div className="u-container relative z-10 pt-8 md:pt-10">
          <Link
            href="/plugins"
            className="group mb-6 inline-flex items-center gap-1.5 text-sm text-white/70 transition-colors hover:text-white"
          >
            <Icon
              icon="heroicons:arrow-left"
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            <span>Back to plugins</span>
          </Link>

          {/* Plugin header */}
          <div className="mb-8 flex flex-col items-start gap-10 lg:flex-row">
            {/* Plugin image with enhanced styling */}
            <Suspense
              fallback={
                <div className="order-1 aspect-[16/9] w-full animate-pulse bg-white/5 lg:order-1 lg:w-2/5"></div>
              }
            >
              <PluginMainImage plugin={plugin} />
            </Suspense>

            {/* Plugin info with better spacing and organization */}
            <div className="order-2 min-w-0 flex-1 lg:order-2">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {/* Categories */}
                <Suspense fallback={<div className="h-6 w-20 animate-pulse bg-white/5"></div>}>
                  <PluginCategories plugin={plugin} />
                </Suspense>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight md:text-5xl">{plugin.name}</h1>

              <p className="mb-6 max-w-2xl text-xl text-white/80">{plugin.shortDescription}</p>

              {/* Plugin metadata in a refined horizontal layout */}
              <div className="mb-6 flex flex-wrap items-center gap-6">
                {/* GitHub stats */}
                <Suspense fallback={<div className="h-5 w-32 animate-pulse bg-white/5"></div>}>
                  <GitHubStats githubData={plugin.githubData} />
                </Suspense>

                {/* Views and verification */}
                <div className="flex items-center gap-4">
                  <PluginBadges
                    isVerified={!!plugin.verification?.isVerified}
                    isOfficial={!!plugin.isOfficial}
                  />

                  <Suspense
                    fallback={
                      <div className="flex items-center gap-1.5 text-white/80">
                        <Icon icon="heroicons:eye" className="h-5 w-5" />
                        <span className="font-medium">{plugin.views || 0} views</span>
                      </div>
                    }
                  >
                    <DynamicPluginStats plugin={plugin} />
                  </Suspense>
                </div>
              </div>

              {/* Plugin actions (GitHub link, menu, voting) */}
              <Suspense
                fallback={
                  <PluginActions
                    slug={slug}
                    isVerified={!!plugin.verification?.isVerified}
                    githubUrl={plugin.githubUrl as string}
                    pluginName={plugin.name as string}
                    initialUpvotes={plugin.rating?.upvotes || 0}
                    initialDownvotes={plugin.rating?.downvotes || 0}
                    initialScore={plugin.rating?.score || 0}
                    isAuthenticated={false}
                    isOwner={false}
                    currentUsername={null}
                  />
                }
              >
                <DynamicPluginRating
                  slug={slug}
                  isVerified={!!plugin.verification?.isVerified}
                  isOfficial={!!plugin.isOfficial}
                  githubUrl={plugin.githubUrl as string}
                  pluginName={plugin.name as string}
                  initialUpvotes={plugin.rating?.upvotes || 0}
                  initialDownvotes={plugin.rating?.downvotes || 0}
                  initialScore={plugin.rating?.score || 0}
                  verificationUsername={plugin.verification?.githubVerification?.username || null}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      <Divider className="opacity-30" />

      {/* Main content section */}
      <section className="u-container fl-py-l">
        <div className="u-grid gap-8">
          {/* Main content */}
          <div className="col-span-12 lg:col-span-8">
            {/* Navigation tabs */}
            <div className="mb-8 border-b border-white/10">
              <div className="flex space-x-8">
                <a
                  href="#about"
                  className="inline-flex border-b-2 border-white pb-2 pt-1 font-medium text-white"
                >
                  ReadMe
                </a>
                <a
                  href="#installation"
                  className="inline-flex border-b-2 border-transparent pb-2 pt-1 font-medium text-white/70 transition-colors hover:text-white"
                >
                  Installation
                </a>
                {plugin.imagesGallery &&
                  Array.isArray(plugin.imagesGallery) &&
                  plugin.imagesGallery.length > 0 && (
                    <a
                      href="#screenshots"
                      className="inline-flex border-b-2 border-transparent pb-2 pt-1 font-medium text-white/70 transition-colors hover:text-white"
                    >
                      Screenshots
                    </a>
                  )}
                <a
                  href="#comments"
                  className="inline-flex border-b-2 border-transparent pb-2 pt-1 font-medium text-white/70 transition-colors hover:text-white"
                >
                  Comments
                </a>
              </div>
            </div>

            {/* Content sections */}
            <AboutSection plugin={plugin} />
            <InstallationSection plugin={plugin} />
            <ScreenshotsSection plugin={plugin} />
            <CommentsSection plugin={plugin} slug={slug} />
          </div>

          {/* Sidebar with enhanced styling */}
          <div className="col-span-12 lg:col-span-4">
            <Suspense
              fallback={
                <div className="via-fuchsia-500/3 rounded-none bg-gradient-to-br from-indigo-500/5 to-transparent p-0.5 shadow-xl">
                  <div className="h-96 animate-pulse rounded-none bg-black/50 p-6 backdrop-blur-sm"></div>
                </div>
              }
            >
              <PluginSidebar plugin={plugin} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Related Plugins Carousel Section */}
      <section className="w-full border-t border-white/10 bg-black/70 fl-py-l">
        <div className="u-container">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Related Plugins</h2>
            <Link
              href="/plugins?view=all"
              className="flex items-center text-sm text-white/70 transition-colors hover:text-white"
            >
              View all plugins
              <Icon icon="heroicons:arrow-right" className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="flex w-full justify-center py-10">
                <Spinner
                  aria-label="Loading related plugins"
                  classNames={{
                    label: 'mt-2 text-foreground/80',
                  }}
                  label="Loading Related Plugins"
                  color="white"
                  variant="gradient"
                />
              </div>
            }
          >
            <RelatedPluginsCarousel currentPlugin={plugin} pluginSlug={slug} />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

// Component that handles awaiting the params
async function PluginWrapper({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  // Handle both Promise and resolved params
  const resolvedParams = params instanceof Promise ? await params : params;
  return <PluginContent slug={resolvedParams.slug} />;
}

export default function PluginPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black/90">
          <Spinner size="lg" color="white" variant="gradient" />
        </div>
      }
    >
      <PluginWrapper params={params} />
    </Suspense>
  );
}
