import { Icon } from '@iconify/react'
import type { Plugin } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

// This component dynamically fetches the most up-to-date view count
export async function DynamicPluginStats({ plugin }: { plugin: Plugin }) {
  // Fetch fresh plugin data without caching
  const payload = await getPayload({ config: configPromise })
  
  // Get only the dynamic data we need
  const pluginData = await payload.find({
    collection: 'plugins',
    where: {
      slug: {
        equals: plugin.slug,
      },
      _status: {
        equals: 'published',
      },
    },
    depth: 0,
  })
  
  const updatedPlugin = pluginData.docs[0] as Plugin
  
  if (!updatedPlugin) {
    return null
  }
  
  return (
    <div className="flex items-center gap-1.5 text-white/80">
      <Icon icon="heroicons:eye" className="w-5 h-5" />
      <span className="font-medium">{updatedPlugin.views || 0} views</span>
    </div>
  )
}
