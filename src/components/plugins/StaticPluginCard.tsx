'use client'

import { Icon } from '@iconify/react'
import Image from 'next/image'
import Link from 'next/link'
import { Plugin } from '@/payload-types'

// Define a type that represents both real plugins and mock plugins
type PluginCardData = Plugin | (Omit<Plugin, 'id'> & { id: string })

// Format date in a human-readable way
const formatDate = (dateString?: string) => {
	if (!dateString) return ''

	const date = new Date(dateString)
	const now = new Date()
	const diffTime = Math.abs(now.getTime() - date.getTime())
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

	// If less than 30 days, show relative time
	if (diffDays < 30) {
		if (diffDays === 1) return 'Yesterday'
		if (diffDays < 7) return `${diffDays} days ago`
		const diffWeeks = Math.floor(diffDays / 7)
		return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`
	}

	// Otherwise, show the date
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

interface StaticPluginCardProps {
	plugin: PluginCardData
	className?: string
	featured?: boolean
}

export const StaticPluginCard = ({ plugin, className = '', featured = false }: StaticPluginCardProps) => {
	return (
		<Link
			href={`/plugins/${plugin.slug}`}
			className={`flex flex-col p-4 rounded-lg transition-all hover:shadow-sm ${className}`}
		>
			<div className="flex gap-4">
				{/* Icon/Logo */}
				<div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
					{plugin.mainImage &&
					typeof plugin.mainImage === 'object' &&
					'url' in plugin.mainImage &&
					plugin.mainImage.url ? (
						<Image
							src={plugin.mainImage.url}
							alt={plugin.name || 'Plugin icon'}
							width={48}
							height={48}
							className="object-cover"
						/>
					) : (
						<Icon icon="heroicons:puzzle-piece" className="w-6 h-6 text-primary" />
					)}
				</div>

				<div className="flex-1">
					{/* Name and verification badge */}
					<div className="flex items-center gap-2 mb-1">
						<h3
							className={`font-medium line-clamp-1 ${
								featured ? 'fl-text-step-1' : 'fl-text-step-0'
							}`}
						>
							{plugin.name}
						</h3>

						{/* Show verification badge if verified */}
						{plugin.verification?.isVerified && (
							<span className="flex-shrink-0">
								<Icon icon="heroicons:check-badge" className="w-4 h-4 text-green-600" />
							</span>
						)}

						{/* Show official badge if official */}
						{plugin.isOfficial && (
							<span className="flex-shrink-0">
								<Icon icon="heroicons:star" className="w-4 h-4 text-amber-500" />
							</span>
						)}
					</div>

					{/* Stats line - WITHOUT view count */}
					<div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-2">
						{plugin.githubData?.stars && (
							<span className="inline-flex items-center text-xs">
								<Icon
									icon="heroicons:star"
									className={`w-3.5 h-3.5 mr-1 ${featured ? 'text-amber-500' : ''}`}
								/>
								{plugin.githubData.stars}
							</span>
						)}
						{plugin.githubData?.forks && (
							<span className="inline-flex items-center text-xs">
								<Icon icon="meteor-icons:git-fork" className="w-3.5 h-3.5 mr-1" />
								{plugin.githubData.forks}
							</span>
						)}
						{/* Show vote score instead of just upvotes */}
						{plugin.rating?.score !== undefined &&
							plugin.rating.score !== null &&
							plugin.rating.score > 0 && (
								<span className="inline-flex items-center text-xs">
									<Icon icon="heroicons:arrow-trending-up" className="w-3.5 h-3.5 mr-1" />
									{plugin.rating.score}
								</span>
							)}
						{/* Last updated date */}
						{plugin.githubData?.lastCommit && (
							<span className="inline-flex items-center text-xs">
								<Icon icon="heroicons:clock" className="w-3.5 h-3.5 mr-1" />
								{formatDate(plugin.githubData.lastCommit)}
							</span>
						)}
					</div>

					{/* Description - truncated to 2 lines */}
					<p
						className={`text-muted-foreground line-clamp-2 mb-2 ${
							featured ? 'text-sm' : 'fl-text-step--1'
						}`}
					>
						{plugin.shortDescription}
					</p>

					{/* Badges */}
					<div className="flex flex-wrap gap-2">
						{/* Verification badge - now with transparent background */}
						{plugin.verification?.isVerified && (
							<span className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium text-green-400 border border-green-500/20">
								<Icon icon="heroicons:check-badge" className="w-2.5 h-2.5 mr-0.5" />
								Verified
							</span>
						)}

						{/* Official badge - now with transparent background */}
						{plugin.isOfficial && (
							<span className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium text-amber-400 border border-amber-500/20">
								<Icon icon="heroicons:star" className="w-2.5 h-2.5 mr-0.5" />
								Official
							</span>
						)}

						{/* Category badge if available - now with transparent background */}
						{plugin.category && typeof plugin.category === 'object' && plugin.category.name && (
							<span className="inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
								{plugin.category.name}
							</span>
						)}
					</div>

					{/* Featured plugin may have additional elements */}
					{featured && (
						<div className="flex items-center justify-between mt-4">
							<div className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 font-medium text-white shadow-sm transition-all hover:bg-primary/90 w-fit">
								View Plugin
							</div>
						</div>
					)}
				</div>
			</div>
		</Link>
	)
}
