import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Plugin } from '@/payload-types'
import { ReviewSection } from './ReviewSection'

// This component fetches the latest comments for a plugin
// It's designed to be used with Suspense for PPR
export async function DynamicComments({ 
  slug,
  initialReviews
}: { 
  slug: string
  initialReviews: {
    author: string
    comment: string
    createdAt: string
  }[]
}) {
  // Fetch fresh plugin data without caching
  const payload = await getPayload({ config: configPromise })
  
  // Get only the comments data we need
  const pluginData = await payload.find({
    collection: 'plugins',
    where: {
      slug: {
        equals: slug,
      },
      _status: {
        equals: 'published',
      },
    },
    depth: 0,
  })
  
  const plugin = pluginData.docs[0] as Plugin
  
  if (!plugin) {
    // Fall back to initial reviews if plugin can't be fetched
    return <ReviewSection slug={slug} initialReviews={initialReviews} />
  }
  
  // Map comments to the format expected by ReviewSection
  const reviews = (plugin.comments || []).map((review) => ({
    author: review.author,
    comment: review.comment,
    createdAt: review.createdAt || new Date().toISOString(),
  }))
  
  // Use the latest reviews or fall back to initial ones if none found
  const latestReviews = reviews.length > 0 ? reviews : initialReviews
  
  return (
    <ReviewSection
      slug={slug}
      initialReviews={latestReviews}
    />
  )
}
