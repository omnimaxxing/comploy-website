import { getPayload } from 'payload'
import type { NextRequest } from 'next/server'
import configPromise from '@/payload.config'
import type { Release } from '@/payload-types'

// GitHub API configuration
const GITHUB_ORG = 'payloadcms'
const GITHUB_REPO = 'payload'
const RELEASES_PER_PAGE = 30 // GitHub's max per page

// Helper function to check if a release contains breaking changes
const containsBreakingChanges = (content: string): boolean => {
  return content.includes('BREAKING CHANGES') || 
         content.includes('⚠️ BREAKING CHANGES') || 
         content.includes('**Breaking Changes**') ||
         content.toLowerCase().includes('breaking change')
}

// Extract the version and date from release title
const extractVersionAndDate = (title: string): { version: string; date: string | null } => {
  const version = title.trim().split(' ')[0]
  
  // Extract date in format (YYYY-MM-DD)
  const dateMatch = title.match(/\((\d{4}-\d{2}-\d{2})\)/)
  const date = dateMatch ? dateMatch[1] : null
  
  return { version, date }
}

// Helper function to extract contributors section
const extractContributors = (content: string): string => {
  const contributorsMatch = content.match(/(?:### 🤝 Contributors|Contributors)([^#]*)/s)
  return contributorsMatch ? contributorsMatch[1].trim() : ''
}

// Main API handler - supports both GET and POST methods
export async function GET(request: NextRequest) {
  try {
    // Initialize Payload with config
    const payload = await getPayload({
      config: configPromise,
    })
    
    // Query releases from the database
    const releases = await payload.find({
      collection: 'releases',
      sort: '-releaseDate',
      limit: 200, // Reasonable limit, adjust as needed
    })
    
    // Return the releases as JSON
    return Response.json(releases, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Error fetching releases:', error)
    return Response.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    )
  }
}

// Type for GitHub API responses
interface GitHubRelease {
  id: number;
  name: string;
  tag_name: string;
  body: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string;
}

// POST endpoint to trigger a sync from GitHub
export async function POST(request: NextRequest) {
  try {
    // Check if request includes authorization
    // This is a simple example - in production, use proper auth
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Payload
    const payload = await getPayload({
      config: configPromise,
    })

    // Get existing releases to avoid duplicates
    const existingReleases = await payload.find({
      collection: 'releases',
      limit: 500, // High enough to get most releases
    })
    
    const existingVersions = new Set(existingReleases.docs.map(r => r.version))

    // Fetch releases from GitHub
    let allReleases: GitHubRelease[] = []
    let page = 1
    let hasMorePages = true

    while (hasMorePages) {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_ORG}/${GITHUB_REPO}/releases?per_page=${RELEASES_PER_PAGE}&page=${page}`,
        {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          }
        }
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.statusText}`)
      }

      const releases = await response.json() as GitHubRelease[]
      
      if (releases.length === 0) {
        hasMorePages = false
      } else {
        allReleases = [...allReleases, ...releases]
        page++
      }
      
      // Stop after 5 pages to prevent excessive API calls
      if (page > 5) {
        hasMorePages = false
      }
    }

    console.log(`Fetched ${allReleases.length} releases from GitHub`)

    // Process and save each release
    const createdCount = await Promise.all(
      allReleases.map(async (release: GitHubRelease) => {
        try {
          // Skip draft or prerelease versions if needed
          if (release.draft || release.prerelease) {
            return null
          }

          // Extract version and date
          const { version, date } = extractVersionAndDate(release.name || release.tag_name)
          
          // Skip if we already have this version
          if (existingVersions.has(version)) {
            return null
          }

          // Process content - GitHub release notes are in body
          const content = release.body || ''
          
          // Check for breaking changes
          const isBreaking = containsBreakingChanges(content)
          
          // Extract contributors as a string (not an array)
          const contributorsText = extractContributors(content)

          // Create release date - either from title or fallback to published_at
          const releaseDateStr = date || release.published_at.split('T')[0]

          // Create the release in Payload
          const createdRelease = await payload.create({
            collection: 'releases',
            data: {
              version,
              releaseDate: releaseDateStr,
              isBreaking,
              content,
              contributors: contributorsText, // Now correctly passing as string
              githubReleaseId: release.id.toString(),
              lastSyncedAt: new Date().toISOString(),
            },
          })

          return createdRelease
        } catch (error) {
          console.error(`Error processing release:`, error)
          return null
        }
      })
    )

    // Filter out nulls and count created releases
    const successfulCreations = createdCount.filter(Boolean)

    return Response.json({
      success: true,
      message: `Successfully synced ${successfulCreations.length} new releases`,
      created: successfulCreations.length,
    })
  } catch (error) {
    console.error('Error syncing releases:', error)
    return Response.json(
      { error: 'Failed to sync releases from GitHub' },
      { status: 500 }
    )
  }
}