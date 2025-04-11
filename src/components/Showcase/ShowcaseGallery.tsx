'use client'

import { useState, useRef, useEffect } from 'react'
import { ShowcaseGrid } from '@/components/Showcase/ShowcaseGrid'
import Link from 'next/link'
import { motion } from 'motion/react'
import Image from 'next/image'
import { cn } from '@/utilities/cn'
import type { Showcase } from '@/payload-types'
import type { Media } from '@/payload-types'
import { trackShowcaseView } from '@/actions/trackShowcaseView'

interface ShowcaseGalleryProps {
	showcases: Showcase[]
	totalPages: number
	currentPage: number
	onLoadMore: (page: number) => Promise<{
		docs: Showcase[]
		hasNextPage: boolean
	}>
}

export const ShowcaseGallery = ({
	showcases: initialShowcases,
	totalPages,
	currentPage,
	onLoadMore,
}: ShowcaseGalleryProps) => {
	const [showcases, setShowcases] = useState(initialShowcases)
	const [page, setPage] = useState(currentPage)
	const [isLoading, setIsLoading] = useState(false)
	const [hasMore, setHasMore] = useState(page < totalPages)
	const galleryRef = useRef<HTMLDivElement>(null)
	const preloadingInProgress = useRef<boolean>(false)
	const loadStartTime = useRef<number>(0)

	// Convert showcases to items for ShowcaseGrid
	const items = showcases
		.map((showcase) => {
			const { image } = showcase
			let imageUrl = ''
			let blurDataURL: string | undefined
			let imageUrls = {
				small: '',
				medium: '',
				large: '',
			}

			if (typeof image === 'string') {
				imageUrl = image
			} else if (image && typeof image === 'object' && 'url' in image) {
				imageUrl = image.url || ''
				if ('sizes' in image && image.sizes) {
					const sizes = image.sizes
					imageUrls = {
						small: sizes.thumbnail?.url || image.url || '',
						medium: sizes.medium?.url || image.url || '',
						large: sizes.large?.url || image.url || '',
					}
				}
				// Handle blur data URL from Media collection
				if ('blurDataURL' in image && image.blurDataURL) {
					blurDataURL = String(image.blurDataURL)
				}
			}

			// Process tags data
			type TagItem = { id: string; name?: string; slug?: string; color?: string }
			const tags: TagItem[] = []

			if (showcase.tags && Array.isArray(showcase.tags)) {
				showcase.tags.forEach((tag) => {
					if (typeof tag === 'string') {
						tags.push({ id: tag, name: tag })
					} else if (tag && typeof tag === 'object') {
						tags.push({
							id: String(tag.id || ''),
							name: typeof tag.name === 'string' ? tag.name : '',
							slug: typeof tag.slug === 'string' ? tag.slug : undefined,
							color: typeof tag.color === 'string' ? tag.color : undefined,
						})
					}
				})
			}

			return {
				id: showcase.id,
				title: showcase.name || '',
				views: showcase.views || 0,
				imageUrl,
				imageUrls,
				blurDataURL,
				tags,
				websiteUrl: showcase.websiteUrl || '',
				githubUrl: showcase.githubUrl || '',
				description: showcase.description || undefined,
			}
		})
		.filter((item) => item.imageUrl) // Remove items without images

	// Handle clicking on a showcase image
	const handleImageClick = async (imageUrl: string) => {
		console.log('Image clicked:', imageUrl)

		// Find the showcase by matching any of its possible image URLs
		const showcase = showcases.find((s) => {
			const image = s.image

			// Direct string comparison
			if (typeof image === 'string') {
				return image === imageUrl
			}

			// Object with URL
			if (image && typeof image === 'object' && 'url' in image) {
				const urls = [
					image.url,
					image.sizes?.thumbnail?.url,
					image.sizes?.medium?.url,
					image.sizes?.large?.url,
				].filter(Boolean)

				return urls.includes(imageUrl)
			}

			return false
		})

	console.log('Found showcase:', showcase)

	if (showcase?.id) {
		// Open the website if URL exists first
		if (showcase.websiteUrl) {
			console.log('Opening website:', showcase.websiteUrl)
			const url = showcase.websiteUrl.startsWith('http') 
				? showcase.websiteUrl 
				: `https://${showcase.websiteUrl}`
			window.open(url, '_blank')
		}

		// Then track the view
		console.log('Tracking view for showcase:', showcase.id)
		const result = await trackShowcaseView(showcase.id.toString())
		console.log('Track view result:', result)

		// Update local state if tracking was successful
		if (result.success && typeof result.views === 'number') {
			console.log('Updating local state with new view count:', result.views)
			setShowcases((prev) =>
				prev.map((s) => (s.id === showcase.id ? { ...s, views: result.views } : s)),
			)
		}
	} else {
		console.log('No showcase found for image URL:', imageUrl)
	}
}

// Enhanced preload images function with progressive loading
const preloadImages = async (showcases: Showcase[]): Promise<void> => {
	if (preloadingInProgress.current) return
	preloadingInProgress.current = true

	try {
		console.log(`Preloading ${showcases.length} showcase images`)

		// Extract image URLs from showcases with high/medium/low priority
		const imageData = showcases
			.map((showcase, index) => {
				const { image } = showcase
				let url: string | null = null
				let mediumUrl: string | null = null
				let thumbnailUrl: string | null = null

				if (typeof image === 'string') {
					url = image
				} else if (image && typeof image === 'object' && 'url' in image) {
					url = image.url || null

					if ('sizes' in image && image.sizes) {
						thumbnailUrl = image.sizes.thumbnail?.url || null
						mediumUrl = image.sizes.medium?.url || null
					}
				}

				// Calculate priority - first items are highest priority
				const priority = index < 6 ? 'high' : index < 12 ? 'medium' : 'low'

				return {
					originalUrl: url,
					mediumUrl,
					thumbnailUrl,
					priority,
				}
			})
			.filter((data) => data.originalUrl !== null)

		// Preload thumbnails first (for all images)
		const thumbnailPromises = imageData
			.filter((data) => data.thumbnailUrl)
			.map(
				(data) =>
					new Promise<void>((resolve) => {
						if (typeof window === 'undefined') {
							resolve()
							return
						}

						const img = new window.Image()
						img.onload = () => resolve()
						img.onerror = () => resolve()
						img.src = data.thumbnailUrl!
					}),
			)

		// Wait for thumbnails or a short timeout
		await Promise.race([
			Promise.all(thumbnailPromises),
			new Promise<void>((resolve) => setTimeout(resolve, 500)),
		])

		// Then preload medium quality images for high priority items
		const mediumPromises = imageData
			.filter((data) => data.priority === 'high' && data.mediumUrl)
			.map(
				(data) =>
					new Promise<void>((resolve) => {
						if (typeof window === 'undefined') {
							resolve()
							return
						}

						const img = new window.Image()
						img.onload = () => resolve()
						img.onerror = () => resolve()
						img.src = data.mediumUrl!
					}),
			)

		// Wait for medium quality images or a timeout
		await Promise.race([
			Promise.all(mediumPromises),
			new Promise<void>((resolve) => setTimeout(resolve, 1000)),
		])

		// Finally preload full quality images for high priority items
		const fullPromises = imageData
			.filter((data) => data.priority === 'high' && data.originalUrl)
			.map(
				(data) =>
					new Promise<void>((resolve) => {
						if (typeof window === 'undefined') {
							resolve()
							return
						}

						const img = new window.Image()
						img.onload = () => resolve()
						img.onerror = () => resolve()
						img.src = data.originalUrl!
					}),
			)

		// Wait for full quality images or a timeout
		await Promise.race([
			Promise.all(fullPromises),
			new Promise<void>((resolve) => setTimeout(resolve, 1500)),
		])

		console.log('Preloading complete')
	} finally {
		preloadingInProgress.current = false
	}
}

// Load more showcases with enhanced stability
const loadMore = async () => {
	if (isLoading || !hasMore) {
		console.log(`Skipping loadMore: isLoading=${isLoading}, hasMore=${hasMore}`)
		return
	}

	try {
		console.log('Loading more showcases...')
		setIsLoading(true)
		loadStartTime.current = Date.now()

		const nextPage = page + 1

		// Save current document height and scroll position before any changes
		const documentHeight = document.documentElement.scrollHeight
		const scrollPosition = window.scrollY

		// Set a minimum height on container to prevent layout shifts
		if (galleryRef.current && galleryRef.current.parentElement) {
			galleryRef.current.parentElement.style.minHeight = `${documentHeight}px`
		}

		// Fetch new showcases
		console.log(`Fetching page ${nextPage}...`)
		const { docs: newShowcases, hasNextPage } = await onLoadMore(nextPage)
		console.log(`Received ${newShowcases.length} new showcases, hasNextPage=${hasNextPage}`)

		// Start preloading images immediately (don't wait)
		preloadImages(newShowcases).catch((error) => {
			console.error('Error preloading images:', error)
		})

		// Update state
		setPage(nextPage)
		setHasMore(hasNextPage)

		// Add new showcases to the array
		setShowcases((prev) => [...prev, ...newShowcases])

		// Ensure loading state is maintained for at least 500ms for better UX
		const timeElapsed = Date.now() - loadStartTime.current
		const minLoadingTime = 500 // minimum loading time in ms

		if (timeElapsed < minLoadingTime) {
			await new Promise((resolve) => setTimeout(resolve, minLoadingTime - timeElapsed))
		}

		// Use requestAnimationFrame to ensure scroll restoration happens after layout
		requestAnimationFrame(() => {
			// Restore scroll position
			window.scrollTo(0, scrollPosition)

			// Double-check after a short delay
			setTimeout(() => {
				const currentPosition = window.scrollY
				// If we've drifted by more than 5px, adjust again
				if (Math.abs(currentPosition - scrollPosition) > 5) {
					window.scrollTo(0, scrollPosition)
				}

				// Reset height constraint
				if (galleryRef.current && galleryRef.current.parentElement) {
					requestAnimationFrame(() => {
						galleryRef.current!.parentElement!.style.minHeight = ''
					})
				}

				setIsLoading(false)
				console.log('Load complete, ready for more')
			}, 50)
		})
	} catch (error) {
		console.error('Error loading more showcases:', error)

		// Reset height constraint
		if (galleryRef.current && galleryRef.current.parentElement) {
			galleryRef.current.parentElement.style.minHeight = ''
		}

		setIsLoading(false)
	}
}

// Debug loading state changes
useEffect(() => {
	console.log(`Loading state changed: ${isLoading}`)
}, [isLoading])

return (
	<div ref={galleryRef} className="w-full">
		<ShowcaseGrid
			items={items}
			onImageClick={handleImageClick}
			onLoadMore={loadMore}
			isLoading={isLoading}
			hasMore={hasMore}
		/>
	</div>
)
}

// A card component for showcases that shows more details and links
const ShowcaseCard = ({ showcase }: { showcase: Showcase }) => {
	const handleClick = async () => {
		if (showcase.id) {
			await trackShowcaseView(showcase.id.toString())
		}
	}

	return (
		<motion.div
			whileHover={{ y: -5, scale: 1.02 }}
			transition={{ duration: 0.2 }}
			className="relative bg-background/30 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden shadow-lg"
		>
			{/* View count badge */}
			<div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 text-xs text-white/70 flex items-center gap-1">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 20 20"
					fill="currentColor"
					className="w-4 h-4"
				>
					<path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
					<path
						fillRule="evenodd"
						d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
						clipRule="evenodd"
					/>
				</svg>
				{showcase.views || 0}
			</div>

			{/* @ts-ignore */}
			{showcase.image?.url && (
				<div className="relative h-48 w-full">
					<Link
						href={showcase.websiteUrl.startsWith('http') ? showcase.websiteUrl : `https://${showcase.websiteUrl}`}
						target="_blank"
						rel="noopener noreferrer"
						onClick={handleClick}
					>
						<Image
							//@ts-ignore
							src={showcase.image.url}
							//@ts-ignore
							alt={showcase.image.alt || showcase.name}
							fill
							className="object-cover transition-transform hover:scale-105"
							onLoad={(img) => {
								img.currentTarget.classList.remove('opacity-0')
							}}
						/>
					</Link>
				</div>
			)}
			<div className="p-5">
				<Link
					href={showcase.websiteUrl.startsWith('http') ? showcase.websiteUrl : `https://${showcase.websiteUrl}`}
					target="_blank"
					rel="noopener noreferrer"
					onClick={handleClick}
				>
					<h3 className="text-lg font-medium fl-mb-xs hover:text-blue-300 transition-colors">
						{showcase.name}
					</h3>
				</Link>
				{showcase.description && (
					<p className="text-sm text-white/70 fl-mb-s line-clamp-2">{showcase.description}</p>
				)}
				<div className="flex flex-wrap gap-2 mt-3">
					<Link
						href={showcase.websiteUrl.startsWith('http') ? showcase.websiteUrl : `https://${showcase.websiteUrl}`}
						target="_blank"
						rel="noopener noreferrer"
						onClick={handleClick}
						className={cn(
							'inline-flex items-center text-sm px-3 py-1.5 rounded-md',
							'bg-white text-black hover:bg-white/90 transition-colors',
						)}
					>
						Visit Website
					</Link>
					{showcase.githubUrl && (
						<Link
							href={showcase.githubUrl.startsWith('http') ? showcase.githubUrl : `https://${showcase.githubUrl}`}
							target="_blank"
							rel="noopener noreferrer"
							className={cn(
								'inline-flex items-center text-sm px-3 py-1.5 rounded-md',
								'bg-white/10 hover:bg-white/20 transition-colors',
							)}
						>
							<svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
							GitHub
						</Link>
					)}
				</div>
			</div>
		</motion.div>
	)
}
