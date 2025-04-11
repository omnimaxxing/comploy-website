import  configPromise  from '@/payload.config';
import { fetchGitHubRepo } from '../app/(frontend)/(core)/submit/actions'
import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'

// Define the Task Handler interface
interface TaskHandlerArgs {
  input: {
    pluginId: string
  }
  req: PayloadRequest
}

const updateGitHubDataHandler = async ({ 
  input, 
  req 
}: TaskHandlerArgs) => {
  try {
    console.log(`[GitHub Update Task] STARTED for plugin: ${input.pluginId}`)
    console.log(`[GitHub Update Task] Processing time: ${new Date().toISOString()}`)
    
    // Get the plugin
    console.log(`[GitHub Update Task] Fetching plugin with ID: ${input.pluginId}`)
    const plugin = await req.payload.findByID({
      collection: 'plugins',
      id: input.pluginId
    })
    
    if (!plugin) {
      console.log(`[GitHub Update Task] ERROR: Plugin with ID ${input.pluginId} not found`)
      throw new Error(`Plugin with ID ${input.pluginId} not found`)
    }
    
    const { githubUrl, name } = plugin
    console.log(`[GitHub Update Task] Found plugin: ${name} with GitHub URL: ${githubUrl}`)
    
    if (!githubUrl) {
      console.log(`[GitHub Update Task] ERROR: Plugin ${name} (${input.pluginId}) does not have a GitHub URL`)
      throw new Error(`Plugin ${input.pluginId} does not have a GitHub URL`)
    }
    
    // Fetch updated GitHub data
    console.log(`[GitHub Update Task] Fetching GitHub data for plugin: ${name}, URL: ${githubUrl}`)
    const githubData = await fetchGitHubRepo(githubUrl)
    
    if (!githubData.success) {
      console.log(`[GitHub Update Task] ERROR: Failed to fetch GitHub data for ${name}: ${githubData.error}`)
      throw new Error(`Failed to fetch GitHub data: ${githubData.error}`)
    }
    
    // Update the plugin with new GitHub data
    console.log(`[GitHub Update Task] Updating plugin ${name} with fresh GitHub data:`, {
      stars: githubData.repo?.stars,
      forks: githubData.repo?.forks
    })
    
    // Prepare the data correctly - only update the githubData field
    const updateData = {
      githubData: {
        stars: githubData.repo?.stars,
        forks: githubData.repo?.forks,
        owner: githubData.repo?.owner.login, 
        lastCommit: githubData.repo?.pushedAt,
        license: githubData.repo?.license,
        lastUpdated: new Date().toISOString()
      }
    }
    
    console.log(`[GitHub Update Task] Calling payload.update for plugin: ${name}`)
    const updatedPlugin = await req.payload.update({
      collection: 'plugins',
      id: input.pluginId,
      data: updateData
    })
    
    console.log(`[GitHub Update Task] COMPLETED for plugin: ${name} (${input.pluginId})`)
    console.log(`[GitHub Update Task] Completion time: ${new Date().toISOString()}`)
    
    return {
      output: {
        success: true,
        pluginId: input.pluginId,
        updatedAt: new Date().toISOString(),
        stars: githubData.repo?.stars,
        forks: githubData.repo?.forks
      }
    }
  } catch (error) {
    console.error(`[GitHub Update Task] FAILED: ${error.message}`)
    console.error(`[GitHub Update Task] Stack trace: ${error.stack}`)
    throw error
  }
}

export default updateGitHubDataHandler 