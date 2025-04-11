import type { PayloadHandler } from 'payload'

export const updateReleasesDataEndpoint: PayloadHandler = async (req) => {
  const { payload, user } = req

  console.log('[Releases Update Endpoint] Starting update process')

  if (!user) {
    console.log('[Releases Update Endpoint] Unauthorized access attempt')
    return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[Releases Update Endpoint] Queueing PayloadCMS releases update')
    
    // Queue a job to fetch PayloadCMS releases
    await payload.jobs.queue({
      task: 'fetchPayloadReleases',
      input: {},
      queue: 'payload-releases'
    })
    
    console.log('[Releases Update Endpoint] Successfully queued releases update')
    return Response.json({ 
      success: true, 
      message: 'Queued PayloadCMS releases update' 
    }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred while updating releases data'
    payload.logger.error(`[Releases Update Endpoint] Error: ${message}`)
    console.error(`[Releases Update Endpoint] Error: ${message}`)
    
    return Response.json({ success: false, message }, { status: 500 })
  }
} 