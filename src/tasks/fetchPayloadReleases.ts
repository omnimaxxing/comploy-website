import type { PayloadRequest } from 'payload'

interface ReleaseTaskArgs {
  input?: {
    // Optional: Specific release to fetch, if omitted, fetches all recent releases
    releaseVersion?: string;
  }
  req: PayloadRequest
}

interface GithubReleaseAsset {
  name: string;
  browser_download_url: string;
}

interface GithubRelease {
  id: string;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  draft: boolean;
  prerelease: boolean;
  assets: GithubReleaseAsset[];
  html_url: string;
}

// This function parses the release notes for different sections like bug fixes, features, etc.
const parseReleaseNotes = (body: string) => {
  const sections = {
    bugFixes: [] as { description: string, issueNumber?: number, commitHash?: string }[],
    features: [] as { description: string, issueNumber?: number, commitHash?: string }[],
    documentation: [] as { description: string, issueNumber?: number, commitHash?: string }[],
    tests: [] as { description: string, issueNumber?: number, commitHash?: string }[],
    chores: [] as { description: string, issueNumber?: number, commitHash?: string }[],
    contributors: [] as { name: string, githubUsername?: string }[],
  }
  
  // This is a simple parser - a more robust parser would use regex patterns
  const lines = body.split('\n')
  let currentSection: keyof typeof sections | null = null
  
  for (const line of lines) {
    // Detect section headers
    if (line.includes('🐛 Bug Fixes') || line.includes('### Bug Fixes')) {
      currentSection = 'bugFixes'
      continue
    } else if (line.includes('🚀 Features') || line.includes('### Features')) {
      currentSection = 'features'
      continue
    } else if (line.includes('📚 Documentation') || line.includes('### Documentation')) {
      currentSection = 'documentation'
      continue
    } else if (line.includes('🧪 Tests') || line.includes('### Tests')) {
      currentSection = 'tests'
      continue
    } else if (line.includes('🏡 Chores') || line.includes('### Chores')) {
      currentSection = 'chores'
      continue
    } else if (line.includes('🤝 Contributors') || line.includes('### Contributors')) {
      currentSection = 'contributors'
      continue
    }
    
    // Skip empty lines or section headers
    if (!line.trim() || !currentSection || line.startsWith('#')) {
      continue
    }
    
    // Parse the line based on the current section
    if (currentSection === 'contributors') {
      // Contributors are usually listed as: Name (@username)
      const match = line.trim().match(/\*\s*(.+?)\s*\(@(.+?)\)/)
      if (match) {
        sections.contributors.push({
          name: match[1].trim(),
          githubUsername: match[2].trim(),
        })
      }
    } else {
      // Parse other sections (bugFixes, features, etc.)
      // Format is usually: * item description (#1234) (abcdef0)
      const itemMatch = line.trim().match(/\*\s*(.+?)(?:\s*\(#(\d+)\))?(?:\s*\(([a-f0-9]+)\))?$/)
      if (itemMatch) {
        const [, description, issueNumberStr, commitHash] = itemMatch
        
        sections[currentSection].push({
          description: description.trim(),
          issueNumber: issueNumberStr ? parseInt(issueNumberStr, 10) : undefined,
          commitHash: commitHash || undefined,
        })
      }
    }
  }
  
  return sections
}

// Task to fetch releases from PayloadCMS GitHub repo
const fetchPayloadReleasesHandler = async ({ input = {}, req }: ReleaseTaskArgs) => {
  try {
    console.log('[Payload Releases Task] Starting fetch process')
    
    // GitHub API endpoint for PayloadCMS releases
    const apiUrl = input?.releaseVersion 
      ? `https://api.github.com/repos/payloadcms/payload/releases/tags/${input.releaseVersion}`
      : 'https://api.github.com/repos/payloadcms/payload/releases?per_page=100'
    
    console.log(`[Payload Releases Task] Fetching from: ${apiUrl}`)
    
    // Fetch releases from GitHub API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {})
      }
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${await response.text()}`)
    }
    
    // Parse response based on whether we're fetching a single release or multiple
    const releases: GithubRelease[] = input?.releaseVersion 
      ? [await response.json()]
      : await response.json()
    
    console.log(`[Payload Releases Task] Fetched ${releases.length} releases`)
    
    // Process each release
    let successCount = 0
    let errorCount = 0
    
    for (const release of releases) {
      try {
        // Skip drafts and prereleases
        if (release.draft || release.prerelease) {
          console.log(`[Payload Releases Task] Skipping draft/prerelease: ${release.tag_name}`)
          continue
        }
        
        // Check if this release already exists in our database
        const existingRelease = await req.payload.find({
          collection: 'releases',
          where: {
            version: {
              equals: release.tag_name
            }
          },
          limit: 1
        })
        
        // Parse release notes to extract structured content
        const parsedContent = parseReleaseNotes(release.body)
        
        // If release exists, update it; otherwise, create new
        if (existingRelease.docs.length > 0) {
          const existingId = existingRelease.docs[0].id
          console.log(`[Payload Releases Task] Updating existing release: ${release.tag_name}`)
          
          await req.payload.update({
            collection: 'releases',
            id: existingId,
            data: {
              version: release.tag_name,
              releaseDate: new Date(release.published_at).toISOString(),
              content: release.body,
              githubReleaseId: release.id,
              lastSyncedAt: new Date().toISOString(),
              bugFixes: parsedContent.bugFixes,
              features: parsedContent.features,
              documentation: parsedContent.documentation,
              tests: parsedContent.tests,
              chores: parsedContent.chores,
              contributors: parsedContent.contributors,
              // Check for breaking changes by looking for "BREAKING CHANGES" in content
              isBreaking: release.body.includes('BREAKING CHANGES') || release.body.includes('⚠ BREAKING')
            }
          })
        } else {
          console.log(`[Payload Releases Task] Creating new release: ${release.tag_name}`)
          
          await req.payload.create({
            collection: 'releases',
            data: {
              version: release.tag_name,
              releaseDate: new Date(release.published_at).toISOString(),
              content: release.body,
              githubReleaseId: release.id,
              lastSyncedAt: new Date().toISOString(),
              bugFixes: parsedContent.bugFixes,
              features: parsedContent.features,
              documentation: parsedContent.documentation,
              tests: parsedContent.tests,
              chores: parsedContent.chores,
              contributors: parsedContent.contributors,
              // Check for breaking changes by looking for "BREAKING CHANGES" in content
              isBreaking: release.body.includes('BREAKING CHANGES') || release.body.includes('⚠ BREAKING')
            }
          })
        }
        
        successCount++
      } catch (error) {
        console.error(`[Payload Releases Task] Error processing release ${release.tag_name}:`, error)
        errorCount++
      }
    }
    
    console.log(`[Payload Releases Task] Completed: ${successCount} successes, ${errorCount} errors`)
    
    return {
      output: {
        success: true,
        message: `Processed ${successCount} releases successfully (${errorCount} errors)`,
        processedCount: successCount,
        errorCount
      }
    }
  } catch (error) {
    console.error('[Payload Releases Task] Failed:', error)
    throw error
  }
}

export default fetchPayloadReleasesHandler 