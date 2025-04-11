/**
 * GitHub API service for fetching Payload CMS releases
 */

// Type definitions for GitHub release data
export interface GitHubReleaseAsset {
  name: string;
  browser_download_url: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  published_at: string;
  body: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
  assets: GitHubReleaseAsset[];
}

/**
 * Fetch releases from the Payload CMS GitHub repository
 * @param limit Maximum number of releases to fetch
 * @returns Array of GitHub releases
 */
export async function fetchPayloadReleases(limit = 100): Promise<GitHubRelease[]> {
  try {
    // GitHub API endpoint for Payload CMS releases
    const url = `https://api.github.com/repos/payloadcms/payload/releases?per_page=${limit}`;

    // Fetch with GitHub API headers
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        // Use GitHub token if available in environment variables
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
      // Cache for 1 hour
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const releases: GitHubRelease[] = await response.json();

    // Filter out prereleases and drafts, and only include releases with a valid tag name
    return releases.filter(release => !release.prerelease && !release.draft && release.tag_name);
  } catch (error) {
    console.error('Error fetching Payload CMS releases:', error);
    return [];
  }
}

/**
 * Fetch a specific release by version/tag
 * @param version The version or tag name to fetch
 * @returns The GitHub release or null if not found
 */
export async function fetchPayloadReleaseByVersion(version: string): Promise<GitHubRelease | null> {
  try {
    // GitHub API endpoint for a specific Payload CMS release
    const url = `https://api.github.com/repos/payloadcms/payload/releases/tags/${version}`;

    // Fetch with GitHub API headers
    const response = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        // Use GitHub token if available in environment variables
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const release: GitHubRelease = await response.json();

    // Only return the release if it's not a prerelease or draft
    if (release.prerelease || release.draft) {
      return null;
    }

    return release;
  } catch (error) {
    console.error(`Error fetching Payload CMS release ${version}:`, error);
    return null;
  }
}

/**
 * Determine if a release contains breaking changes
 * @param releaseBody The markdown body text of the release
 * @returns Boolean indicating if the release contains breaking changes
 */
export function hasBreakingChanges(releaseBody: string): boolean {
  // Check for common breaking change indicators in the release notes
  return (
    releaseBody.includes('BREAKING CHANGE') ||
    releaseBody.includes('BREAKING CHANGES') ||
    releaseBody.includes('💥') ||
    releaseBody.includes('## Breaking Changes') ||
    releaseBody.includes('### Breaking Changes') ||
    releaseBody.includes('⚠ BREAKING')
  );
}

/**
 * Parse release notes to extract structured content
 * @param body The markdown body of the release
 * @returns Structured content from the release notes
 */
export function parseReleaseNotes(body: string) {
  const sections = {
    bugFixes: [] as { description: string; issueNumber?: number; commitHash?: string }[],
    features: [] as { description: string; issueNumber?: number; commitHash?: string }[],
    documentation: [] as { description: string; issueNumber?: number; commitHash?: string }[],
    tests: [] as { description: string; issueNumber?: number; commitHash?: string }[],
    chores: [] as { description: string; issueNumber?: number; commitHash?: string }[],
    contributors: [] as { name: string; githubUsername?: string }[],
  };

  // This is a simple parser - a more robust parser would use regex patterns
  const lines = body.split('\n');
  let currentSection: keyof typeof sections | null = null;

  for (const line of lines) {
    // Detect section headers
    if (line.includes('🐛 Bug Fixes') || line.includes('### Bug Fixes')) {
      currentSection = 'bugFixes';
      continue;
    } else if (line.includes('🚀 Features') || line.includes('### Features')) {
      currentSection = 'features';
      continue;
    } else if (line.includes('📚 Documentation') || line.includes('### Documentation')) {
      currentSection = 'documentation';
      continue;
    } else if (line.includes('🧪 Tests') || line.includes('### Tests')) {
      currentSection = 'tests';
      continue;
    } else if (line.includes('🏡 Chores') || line.includes('### Chores')) {
      currentSection = 'chores';
      continue;
    } else if (line.includes('🤝 Contributors') || line.includes('### Contributors')) {
      currentSection = 'contributors';
      continue;
    }

    // Skip empty lines or section headers
    if (!line.trim() || !currentSection || line.startsWith('#')) {
      continue;
    }

    // Parse the line based on the current section
    if (currentSection === 'contributors') {
      // Contributors are usually listed as: Name (@username)
      const match = line.trim().match(/\*\s*(.+?)\s*\(@(.+?)\)/);
      if (match) {
        sections.contributors.push({
          name: match[1].trim(),
          githubUsername: match[2].trim(),
        });
      }
    } else {
      // Parse other sections (bugFixes, features, etc.)
      // Format is usually: * item description (#1234) (abcdef0)
      const itemMatch = line.trim().match(/\*\s*(.+?)(?:\s*\(#(\d+)\))?(?:\s*\(([a-f0-9]+)\))?$/);
      if (itemMatch) {
        const [, description, issueNumberStr, commitHash] = itemMatch;

        sections[currentSection].push({
          description: description.trim(),
          issueNumber: issueNumberStr ? parseInt(issueNumberStr, 10) : undefined,
          commitHash: commitHash || undefined,
        });
      }
    }
  }

  return sections;
}
