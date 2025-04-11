import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Plugin } from '@/payload-types'
import { PluginCard } from '@/components/plugins/PluginCard'

// This component fetches the latest recent plugins data
// It's designed to be used with Suspense for PPR
export async function DynamicRecentPlugins({ limit = 12 }: { limit?: number }) {
  // Fetch fresh recent plugins data
  const payload = await getPayload({ config: configPromise })
  
  try {
    const response = await payload.find({
      collection: 'plugins',
      where: {
        _status: {
          equals: 'published',
        },
      },
      sort: '-createdAt', // Sort by newest first
      limit,
      depth: 1,
    })
    
    const recentPlugins = response.docs as Plugin[]
    
    if (!recentPlugins || recentPlugins.length === 0) {
      return <p className="fl-mt-m">No plugins found. Be the first to submit one!</p>
    }
    
    return (
      <div className="u-grid gap-6">
        {recentPlugins.map((plugin) => (
          <div key={plugin.id} className="col-span-12 sm:col-span-6 lg:col-span-4">
            <PluginCard
              plugin={plugin}
              className="h-full bg-background/30 hover:bg-background/50"
            />
          </div>
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error fetching recent plugins:', error)
    return <p className="fl-mt-m">Error loading recent plugins.</p>
  }
}
