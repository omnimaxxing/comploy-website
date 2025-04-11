import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Plugin } from '@/payload-types'
import { PluginCard } from '@/components/plugins/PluginCard'

// This component fetches the latest popular plugins data
// It's designed to be used with Suspense for PPR
export async function DynamicPopularPlugins({ limit = 8 }: { limit?: number }) {
  // Fetch fresh popular plugins data
  const payload = await getPayload({ config: configPromise })
  
  try {
    // Get plugins sorted by rating score (upvotes - downvotes)
    const response = await payload.find({
      collection: 'plugins',
      where: {
        _status: {
          equals: 'published',
        },
      },
      sort: '-rating.score', // Sort by highest score first
      limit,
      depth: 1,
    })
    
    const popularPlugins = response.docs as Plugin[]
    
    if (!popularPlugins || popularPlugins.length === 0) {
      return <p className="fl-mt-m">No popular plugins found at the moment.</p>
    }
    
    return (
      <div className="u-grid gap-6">
        {popularPlugins.map((plugin) => (
          <PluginCard
            key={plugin.id}
            plugin={plugin}
            className="col-span-6 md:col-span-4 lg:col-span-3"
          />
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching popular plugins:', error)
    return <p className="fl-mt-m">Error loading popular plugins.</p>
  }
}
