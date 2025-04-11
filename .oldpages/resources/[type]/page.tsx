import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { cache } from 'react'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import { cn } from '@/utilities/cn'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { Resource } from '@/payload-types'

// Enable Partial Prerendering for this route
export const experimental_ppr = true;

// Resource type mapping for UI elements
const resourceTypeConfig = {
  tutorials: {
    icon: 'heroicons:book-open',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
    label: 'Tutorials',
    singular: 'Tutorial',
    description: 'Learn how to use Payload CMS with step-by-step tutorials',
  },
  blog: {
    icon: 'heroicons:document-text',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
    label: 'Blog Posts',
    singular: 'Blog Post',
    description: 'Read the latest news and updates from the Payload CMS community',
  },
  videos: {
    icon: 'heroicons:play-circle',
    color: 'rose',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    borderColor: 'border-rose-500/20',
    label: 'Videos',
    singular: 'Video',
    description: 'Watch tutorials, demos, and presentations about Payload CMS',
  },
  tools: {
    icon: 'heroicons:wrench-screwdriver',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/20',
    label: 'Tools',
    singular: 'Tool',
    description: 'Discover useful tools and utilities for Payload CMS development',
  },
};

// Cache resources fetch function
const getCachedResources = cache(async (type: string): Promise<Resource[]> => {
  const payload = await getPayload({ config: configPromise })

  try {
    // Map plural resource type to singular for the database query
    const resourceType = type === 'tutorials' ? 'tutorial' : 
                         type === 'videos' ? 'video' : 
                         type === 'tools' ? 'tool' : type;
                         
    const response = await payload.find({
      collection: 'resources' as any,
      where: {
        resourceType: {
          equals: resourceType
        },
        status: {
          equals: 'published'
        }
      },
      sort: '-publishedDate',
      limit: 100,
      depth: 1
    })

    // Transform the response to match our Resource interface
    return response.docs.map(doc => {
      // Cast doc as any to work with it more easily
      const resource = doc as any;
      return resource;
    }) as unknown as Resource[]
  } catch (error) {
    console.error(`Error fetching ${type} resources:`, error)
    return []
  }
})

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ type: string }>; 
}) {
  const resolvedParams = await params;
  // Ensure type is properly decoded
  const type = decodeURIComponent(resolvedParams.type);
  const config = resourceTypeConfig[type as keyof typeof resourceTypeConfig];
  
  if (!config) {
    return {
      title: 'Resources Not Found',
      description: 'The requested resource category could not be found.'
    }
  }
  
  return {
    title: `${config.label} | Payload Plugins Resources`,
    description: config.description,
  }
}

export default async function ResourceCategoryPage({ 
  params 
}: { 
  params: Promise<{ type: string }>;
}) {
  try {
    const { isEnabled: draft } = await draftMode();
    const resolvedParams = await params;
    // Ensure type is properly decoded
    const type = decodeURIComponent(resolvedParams.type);
    
    // Validate resource type
    if (!Object.keys(resourceTypeConfig).includes(type)) {
      return notFound();
    }
    
    // Get config for this resource type
    const config = resourceTypeConfig[type as keyof typeof resourceTypeConfig];
    
    // Fetch resources for this type
    const resources = await getCachedResources(type);
    
    return (
      <main className="relative min-h-screen">
        <section className="u-container py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-8">
            <Link href="/resources" className="hover:text-white transition-colors">
              Resources
            </Link>
            <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
            <span className="text-white">
              {config.label}
            </span>
          </div>
          
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full",
                config.bgColor
              )}>
                <Icon icon={config.icon} className={cn("w-6 h-6", config.textColor)} />
              </div>
              <h1 className="text-3xl font-bold">{config.label}</h1>
            </div>
            <p className="text-lg text-white/70 max-w-2xl">
              {config.description}
            </p>
          </header>
          
          {/* Resource grid */}
          {resources.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/5 rounded-lg">
              <Icon icon="heroicons:document-magnifying-glass" className="w-16 h-16 mx-auto text-white/20 mb-4" />
              <h2 className="text-xl font-medium mb-2">No resources found</h2>
              <p className="text-white/60 max-w-md mx-auto mb-6">
                We don't have any {config.label.toLowerCase()} available yet. Check back soon or submit your own!
              </p>
              <Link
                href="/resources/submit"
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all",
                  config.bgColor,
                  config.textColor
                )}
              >
                <Icon icon="heroicons:plus" className="mr-2 w-5 h-5" />
                Submit a {config.singular}
              </Link>
            </div>
          )}
        </section>
        
        {draft && <LivePreviewListener />}
      </main>
    )
  } catch (error) {
    console.error(error)
    return notFound()
  }
} 