'use client'

import { useEffect, useState } from 'react'
import { Plugin } from '@/payload-types'
import { PluginCard } from '@/components/plugins/PluginCard'
import { Icon } from '@iconify/react'
import { cn } from '@heroui/react'

// Define types for Tag and Category
interface Tag {
	id: string
	name: string
	slug?: string
}

interface Category {
	id: string
	name: string
	slug?: string
}

interface RelatedPluginsCarouselProps {
	currentPlugin: Plugin
	pluginSlug: string
	maxPlugins?: number
}

export const RelatedPluginsCarousel = ({
	currentPlugin,
	pluginSlug,
	maxPlugins = 8,
}: RelatedPluginsCarouselProps) => {
	const [relatedPlugins, setRelatedPlugins] = useState<Plugin[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [activeIndex, setActiveIndex] = useState(0)
	const [visibleCount, setVisibleCount] = useState(4) // Default for desktop

	// Function to find related plugins based on tags or category
	useEffect(() => {
		const fetchRelatedPlugins = async () => {
			try {
				setIsLoading(true)

				// Build query parameters
				const params = new URLSearchParams()

				// Get tag names if available
				let tagNames: string[] = []
				if (currentPlugin.tags && Array.isArray(currentPlugin.tags)) {
					// Safely extract tag names without type predicates
					tagNames = currentPlugin.tags
						.map((tag) => {
							if (typeof tag === 'object' && tag !== null && 'name' in tag) {
								return tag.name as string
							}
							return ''
						})
						.filter(Boolean)
				}

				// Get category slug if available
				let categorySlug = ''
				if (currentPlugin.category) {
					if (
						typeof currentPlugin.category === 'object' &&
						currentPlugin.category !== null &&
						'slug' in currentPlugin.category &&
						typeof currentPlugin.category.slug === 'string'
					) {
						categorySlug = currentPlugin.category.slug
					}
				}

				// Prioritize tags, but fall back to category if needed
				if (tagNames.length > 0) {
					// Use the first 2 tags for better results
					const searchTags = tagNames.slice(0, 2).join(' ')
					params.append('q', searchTags)
				} else if (categorySlug) {
					params.append('category', categorySlug)
				}

				// Add limit
				params.append('limit', `${maxPlugins + 1}`) // +1 to account for current plugin

				// Make the API request
				const response = await fetch(`/api/plugins?${params.toString()}`)
				if (!response.ok) throw new Error('Failed to fetch related plugins')

				const data = await response.json()

				// Filter out the current plugin
				const filtered = data.docs.filter((plugin: Plugin) => plugin.slug !== pluginSlug)

				// Take only the required number
				setRelatedPlugins(filtered.slice(0, maxPlugins))
			} catch (error) {
				console.error('Error fetching related plugins:', error)
				setRelatedPlugins([])
			} finally {
				setIsLoading(false)
			}
		}

		fetchRelatedPlugins()
	}, [currentPlugin, pluginSlug, maxPlugins])

	// Adjust visible count based on screen size
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth >= 1280) setVisibleCount(4) // xl
			else if (window.innerWidth >= 1024) setVisibleCount(3) // lg
			else if (window.innerWidth >= 768) setVisibleCount(2) // md
			else setVisibleCount(1) // sm
		}

		// Set initial value
		handleResize()

		// Add event listener
		window.addEventListener('resize', handleResize)

		// Cleanup
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	// Navigation functions
	const goNext = () => {
		setActiveIndex((prev) =>
			prev + visibleCount >= relatedPlugins.length ? 0 : prev + visibleCount,
		)
	}

	const goPrev = () => {
		setActiveIndex((prev) =>
			prev - visibleCount < 0
				? Math.max(0, relatedPlugins.length - visibleCount)
				: prev - visibleCount,
		)
	}

	if (isLoading) {
		return (
			<div className="w-full flex justify-center py-10">
				<div className="animate-spin text-white/40">
					<Icon icon="heroicons:arrow-path" className="w-8 h-8" />
				</div>
			</div>
		)
	}

	if (relatedPlugins.length === 0) {
		return (
			<div className="w-full py-8 text-center">
				<p className="text-white/60">No related plugins found.</p>
			</div>
		)
	}

	return (
		<div className="relative">
			{/* Navigation buttons - outside the carousel for cleaner look */}
			<div className="flex justify-end gap-2 mb-4">
				<button
					onClick={goPrev}
					aria-label="Previous plugins"
					className={cn(
						'w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center transition-all',
						'hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20',
						relatedPlugins.length <= visibleCount && 'opacity-50 pointer-events-none',
					)}
				>
					<Icon icon="heroicons:chevron-left" className="w-5 h-5" />
				</button>
				<button
					onClick={goNext}
					aria-label="Next plugins"
					className={cn(
						'w-10 h-10 rounded-none bg-white/5 border border-white/10 flex items-center justify-center transition-all',
						'hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20',
						relatedPlugins.length <= visibleCount && 'opacity-50 pointer-events-none',
					)}
				>
					<Icon icon="heroicons:chevron-right" className="w-5 h-5" />
				</button>
			</div>

			{/* Carousel container */}
			<div className="relative overflow-hidden">
				{/* Inner sliding container */}
				<div
					className="flex transition-transform duration-500 ease-in-out"
					style={{
						transform: `translateX(-${activeIndex * (100 / visibleCount)}%)`,
						width: `${(relatedPlugins.length / visibleCount) * 100}%`,
					}}
				>
					{/* Plugin cards */}
					{relatedPlugins.map((plugin) => (
						<div
							key={plugin.id}
							className="shrink-0 px-2"
							style={{ width: `${(100 / relatedPlugins.length) * visibleCount}%` }}
						>
							<div className="bg-gradient-to-br from-white/5 to-transparent p-0.5 rounded-none overflow-hidden h-full">
								<div className="bg-black/50 backdrop-blur-sm h-full">
									<PluginCard plugin={plugin} />
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Pagination dots */}
			{relatedPlugins.length > visibleCount && (
				<div className="flex justify-center mt-6 gap-2">
					{Array.from({ length: Math.ceil(relatedPlugins.length / visibleCount) }).map(
						(_, index) => {
							const isActive = index === Math.floor(activeIndex / visibleCount)
							return (
								<button
									key={index}
									onClick={() => setActiveIndex(index * visibleCount)}
									className={cn(
										'h-1.5 rounded-none transition-all focus:outline-none',
										isActive ? 'bg-white w-6' : 'bg-white/30 w-3 hover:bg-white/50',
									)}
									aria-label={`Go to slide ${index + 1}`}
								/>
							)
						},
					)}
				</div>
			)}
		</div>
	)
}
