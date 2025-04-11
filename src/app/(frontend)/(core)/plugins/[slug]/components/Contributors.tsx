'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { Spinner } from '@heroui/react'
import { fetchRepositoryContributors } from '../actions'

interface Contributor {
	id: number
	login: string
	avatarUrl: string
	htmlUrl: string
	contributions: number
}

interface ContributorsProps {
	githubUrl: string
	limit?: number
}

export function Contributors({ githubUrl, limit = 6 }: ContributorsProps) {
	const [contributors, setContributors] = useState<Contributor[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [totalCount, setTotalCount] = useState(0)

	useEffect(() => {
		const fetchContributors = async () => {
			if (!githubUrl) {
				setError('No GitHub URL provided')
				setLoading(false)
				return
			}

			try {
				setLoading(true)
				setError(null)

				const result = await fetchRepositoryContributors(githubUrl, limit)

				if (result.success && result.contributors) {
					setContributors(result.contributors)
					setTotalCount(result.totalCount || result.contributors.length)
				} else {
					setError(result.error || 'Failed to fetch contributors')
				}
			} catch (err) {
				console.error('Error in contributors component:', err)
				setError('Failed to load contributors')
			} finally {
				setLoading(false)
			}
		}

		fetchContributors()
	}, [githubUrl, limit])

	// Extract owner/repo from GitHub URL for the "View all" link
	const repoPath = githubUrl.replace('https://github.com/', '')

	if (loading) {
		return (
			<div className="py-8 flex flex-col items-center justify-center">
				<Spinner size="sm" color="primary" className="mb-2" />
				<p className="text-xs text-white/60">Loading contributors...</p>
			</div>
		)
	}

	if (error) {
		return (
			<div className="py-4">
				<p className="text-sm text-white/70 italic">
					Couldn't fetch contributors:{' '}
					{error === 'Invalid GitHub URL format' ? 'Invalid repository URL' : 'GitHub API error'}
				</p>
				<a
					href={`${githubUrl}/graphs/contributors`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-sm text-primary hover:underline flex items-center mt-2"
				>
					View contributors on GitHub
					<Icon icon="heroicons:arrow-right" className="w-3.5 h-3.5 ml-1" />
				</a>
			</div>
		)
	}

	if (contributors.length === 0) {
		return (
			<div className="py-4">
				<p className="text-sm text-white/70 italic">No contributors found</p>
			</div>
		)
	}

	// Group the rest after the first contributor
	const mainContributor = contributors[0]
	const otherContributors = contributors.slice(1)
	const remainingCount = totalCount - contributors.length

	return (
		<div>
			<div className="flex flex-wrap gap-3 mb-4">
				{/* Main contributor */}
				{mainContributor && (
					<a
						href={mainContributor.htmlUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex flex-col items-center gap-1"
					>
						<div className="w-12 h-12 bg-white/10 rounded-none overflow-hidden border border-white/20 relative group">
							<img
								src={mainContributor.avatarUrl}
								alt={`${mainContributor.login}'s avatar`}
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
						<div className="flex flex-col items-center">
							<span className="text-xs text-white/70">@{mainContributor.login}</span>
							<span className="text-[10px] text-white/50">
								{mainContributor.contributions} commits
							</span>
						</div>
					</a>
				)}

				{/* Other contributors */}
				{otherContributors.map((contributor) => (
					<a
						key={contributor.id}
						href={contributor.htmlUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="flex flex-col items-center gap-1"
					>
						<div className="w-10 h-10 bg-white/10 rounded-none overflow-hidden border border-white/20 relative group">
							<img
								src={contributor.avatarUrl}
								alt={`${contributor.login}'s avatar`}
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
							/>
							<div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
						</div>
						<span className="text-[10px] text-white/50">@{contributor.login}</span>
					</a>
				))}

				{/* Show remaining count if applicable */}
				{remainingCount > 0 && (
					<div className="flex flex-col items-center gap-1">
						<div className="w-10 h-10 bg-white/10 rounded-none overflow-hidden border border-white/20 flex items-center justify-center">
							<div className="text-white/60 font-medium text-sm">+{remainingCount}</div>
						</div>
						<span className="text-[10px] text-white/50">more</span>
					</div>
				)}
			</div>

			<a
				href={`${githubUrl}/graphs/contributors`}
				target="_blank"
				rel="noopener noreferrer"
				className="text-sm text-primary hover:underline flex items-center"
			>
				View all contributors
				<Icon icon="heroicons:arrow-right" className="w-3.5 h-3.5 ml-1" />
			</a>
		</div>
	)
}
