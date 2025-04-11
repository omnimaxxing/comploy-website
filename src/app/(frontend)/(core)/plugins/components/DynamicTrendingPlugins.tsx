import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Plugin } from '@/payload-types'
import { PluginCard } from '@/components/plugins/PluginCard'

// This component fetches the latest trending plugins data
// It's designed to be used with Suspense for PPR
export async function DynamicTrendingPlugins({ limit = 8 }: { limit?: number }) {
  // Fetch fresh trending plugins data
  const payload = await getPayload({ config: configPromise })
  
  // Get trending plugins (most viewed in last 7 days)
  const now = new Date()
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(now.getDate() - 7)
  
  try {
    const response = await payload.find({
      collection: 'plugins',
      where: {
        _status: {
          equals: 'published',
        },
        updatedAt: {
          greater_than: sevenDaysAgo.toISOString(),
        },
      },
      sort: '-views', // Sort by most views
      limit,
      depth: 1,
    })
    
    const trendingPlugins = response.docs as Plugin[]
    
    if (!trendingPlugins || trendingPlugins.length === 0) {
      return <p className="fl-mt-m">No trending plugins found at the moment.</p>
    }
    
    return (
      <div className="u-grid gap-6">
        {trendingPlugins.map((plugin) => (
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
    console.error('Error fetching trending plugins:', error)
    return <p className="fl-mt-m">Error loading trending plugins.</p>
  }
}
