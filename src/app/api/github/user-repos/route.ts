import { type NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams
		const username = searchParams.get('username')
		const token = searchParams.get('token')

		if (!token) {
			return NextResponse.json({ error: 'Authentication token is required' }, { status: 400 })
		}

		// When we have a token, we can use the authenticated user endpoint
		// This is more reliable than using the username
		// Add visibility=public parameter to only fetch public repositories
		const apiUrl = 'https://api.github.com/user/repos?sort=updated&per_page=10&visibility=public'

		const headers: HeadersInit = {
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'PayloadPlugins-App',
			'Authorization': `Bearer ${token}`
		}

		console.log('Fetching public GitHub repositories with token')
		const response = await fetch(apiUrl, { headers })

		if (!response.ok) {
			console.error('GitHub API error:', response.status, await response.text())
			throw new Error(`GitHub API error: ${response.status}`)
		}

		const repos = await response.json()

		// Validate repo objects
		const validRepos = repos.filter((repo: any) => {
			if (!repo || typeof repo !== 'object') return false
			if (!repo.html_url || !repo.full_name) return false
			// Double check that we're only including public repos
			if (repo.private === true) return false
			return true
		})

		// Process repo data to ensure all required fields
		const processedRepos = validRepos.map((repo: any) => ({
			id: repo.id,
			name: repo.name,
			fullName: repo.full_name,
			htmlUrl: repo.html_url,
			description: repo.description || '',
			updatedAt: repo.updated_at,
			stargazersCount: repo.stargazers_count || 0,
			forksCount: repo.forks_count || 0,
			language: repo.language,
			owner: {
				login: repo.owner?.login,
				avatarUrl: repo.owner?.avatar_url,
			},
		}))

		return NextResponse.json(processedRepos)
	} catch (error) {
		console.error('Error fetching user repositories:', error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch repositories' },
			{ status: 500 },
		)
	}
}
