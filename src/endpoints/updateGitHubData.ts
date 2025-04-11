import type { PayloadHandler } from 'payload'

export const updateGitHubDataEndpoint: PayloadHandler = async (req) => {
  const { payload, user } = req

  console.log('[GitHub Update Endpoint] Starting update process')

  if (!user) {
    console.log('[GitHub Update Endpoint] Unauthorized access attempt')
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[GitHub Update Endpoint] Finding plugins with GitHub URLs')
    // Find all published plugins with GitHub URLs
    const pluginsResult = await payload.find({
      collection: 'plugins',
      where: {
        and: [
          {
            _status: {
              equals: 'published'
            }
          },
          {
            githubUrl: {
              not_equals: null
            }
          }
        ]
      },
      depth: 0
    })
    
    const plugins = pluginsResult.docs
    console.log(`[GitHub Update Endpoint] Found ${plugins.length} plugins to update`)
    
    // Queue update jobs for each plugin
    let queuedCount = 0
    
    for (const plugin of plugins) {
      console.log(`[GitHub Update Endpoint] Queueing update for plugin: ${plugin.name || plugin.id}`)
      // Queue job with the registered task
      await payload.jobs.queue({
        task: 'updateGitHubData',
        input: {
          pluginId: String(plugin.id)
        },
        queue: 'github-updates'
      })
      queuedCount++
    }
    
    console.log(`[GitHub Update Endpoint] Successfully queued ${queuedCount} plugin updates`)
    return Response.json({ 
      success: true, 
      message: `Queued GitHub data updates for ${queuedCount} plugins` 
    }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An error occurred while updating GitHub data'
    payload.logger.error(`[GitHub Update Endpoint] Error: ${message}`)
    console.error(`[GitHub Update Endpoint] Error: ${message}`)
    
    return Response.json({ success: false, message }, { status: 500 })
  }
} 