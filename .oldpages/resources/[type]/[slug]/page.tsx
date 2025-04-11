import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { draftMode } from 'next/headers'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { cache } from 'react'
import { formatDistance } from 'date-fns'
import { Icon } from '@iconify/react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/utilities/cn'
import RichText from '@/components/RichText'

// Enable Partial Prerendering for this route
export const experimental_ppr = true;

// Resource type mapping for UI elements
const resourceTypeConfig = {
  tutorial: {
    icon: 'heroicons:book-open',
    color: 'emerald',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500',
    borderColor: 'border-emerald-500/20',
    label: 'Tutorial',
  },
  blog: {
    icon: 'heroicons:document-text',
    color: 'purple',
    bgColor: 'bg-purple-500/10',
    textColor: 'text-purple-500',
    borderColor: 'border-purple-500/20',
    label: 'Blog Post',
  },
  video: {
    icon: 'heroicons:play-circle',
    color: 'rose',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500',
    borderColor: 'border-rose-500/20',
    label: 'Video',
  },
  tool: {
    icon: 'heroicons:wrench-screwdriver',
    color: 'blue',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-500',
    borderColor: 'border-blue-500/20',
    label: 'Tool',
  },
};

// Cache resource fetch function
const getCachedResource = cache(async ({ type, slug }: { type: string; slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  try {
    // Ensure slug is properly decoded
    const decodedSlug = decodeURIComponent(slug)
    
    const response = await payload.find({
      collection: 'resources' as any,
      where: {
        resourceType: {
          equals: type
        },
        slug: {
          equals: decodedSlug
        },
        status: {
          equals: 'published'
        }
      },
      depth: 2
    })

    return response.docs[0] || null
  } catch (error) {
    console.error(`Error fetching resource ${type}/${slug}:`, error)
    return null
  }
})

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ type: string; slug: string }>;
}) {
  const resolvedParams = await params;
  // Ensure params are properly decoded
  const type = decodeURIComponent(resolvedParams.type);
  const slug = decodeURIComponent(resolvedParams.slug);
  
  const resource = await getCachedResource({ type, slug })
  
  if (!resource) {
    return {
      title: 'Resource Not Found',
      description: 'The requested resource could not be found.'
    }
  }
  
  return {
    title: `${resource.title} | Payload Plugins Resources`,
    description: resource.description || 'A resource for Payload CMS developers',
  }
}

export default async function ResourceDetailPage({ 
  params 
}: { 
  params: Promise<{ type: string; slug: string }>;
}) {
  try {
    const { isEnabled: draft } = await draftMode()
    const resolvedParams = await params;
    // Ensure params are properly decoded
    const type = decodeURIComponent(resolvedParams.type);
    const slug = decodeURIComponent(resolvedParams.slug);
    
    // Fetch the resource
    const resource = await getCachedResource({ type, slug })
    
    // If resource not found or is external, redirect to 404
    if (!resource || resource.source === 'external') {
      return notFound()
    }
    
    // Get config for this resource type
    const config = resourceTypeConfig[type as keyof typeof resourceTypeConfig] || resourceTypeConfig.tutorial
    
    // Format dates
    const formattedDate = resource.publishedDate
      ? new Date(resource.publishedDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null
    
    // Time ago
    const timeAgo = resource.publishedDate
      ? formatDistance(new Date(resource.publishedDate), new Date(), { addSuffix: true })
      : null

    return (
      <main className="relative min-h-screen">
        <article className="u-container py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/60 mb-8">
            <Link href="/resources" className="hover:text-white transition-colors">
              Resources
            </Link>
            <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
            <Link href={`/resources/${type}`} className="hover:text-white transition-colors capitalize">
              {config.label}s
            </Link>
            <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
            <span className="truncate max-w-xs">
              {resource.title}
            </span>
          </div>
          
          {/* Header */}
          <header className="mb-12">
            {/* Resource type and date */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium",
                config.bgColor,
                config.textColor
              )}>
                <Icon icon={config.icon} className="w-3.5 h-3.5" />
                <span>{config.label}</span>
              </div>
              
              {formattedDate && (
                <span className="text-sm text-white/60" title={formattedDate}>
                  Published {timeAgo}
                </span>
              )}
              
              {resource.difficulty && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 text-white/80 text-xs">
                  {resource.difficulty === 'beginner' && <Icon icon="heroicons:sparkles" className="w-3.5 h-3.5" />}
                  {resource.difficulty === 'intermediate' && <Icon icon="heroicons:adjustments-horizontal" className="w-3.5 h-3.5" />}
                  {resource.difficulty === 'advanced' && <Icon icon="heroicons:academic-cap" className="w-3.5 h-3.5" />}
                  <span className="capitalize">{resource.difficulty}</span>
                </div>
              )}
            </div>
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{resource.title}</h1>
            
            {/* Description */}
            <p className="text-lg text-white/80 max-w-3xl">{resource.description}</p>
          </header>
          
          {/* Featured image */}
          {resource.image && typeof resource.image === 'object' && resource.image.url && (
            <div className="w-full aspect-video relative rounded-lg overflow-hidden mb-12">
              <Image
                src={resource.image.url}
                alt={resource.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          {/* Content */}
          <div className="prose prose-lg prose-invert max-w-3xl mx-auto">
            {resource.content ? (
              <RichText content={resource.content} />
            ) : (
              <div className="bg-white/5 rounded-lg p-8 text-center">
                <Icon icon="heroicons:exclamation-triangle" className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-medium mb-2">Content Unavailable</h2>
                <p className="text-white/70">
                  The content for this resource is not available. Please check back later.
                </p>
              </div>
            )}
          </div>
        </article>
        
        {draft && <LivePreviewListener />}
      </main>
    )
  } catch (error) {
    console.error(error)
    return notFound()
  }
} 