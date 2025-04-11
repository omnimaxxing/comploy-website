'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plugin } from '@/payload-types'
import { PluginCard } from './PluginCard'
import { Icon } from '@iconify/react'
import useEmblaCarousel from 'embla-carousel-react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'

// Define a type that represents both real plugins and mock plugins
type PluginCardData = Plugin | (Omit<Plugin, 'id'> & { id: string })

interface InfinitePluginCarouselProps {
	plugins: PluginCardData[]
	title: string
	description?: string
	className?: string
	autoScroll?: boolean
}

export const InfinitePluginCarousel = ({
	plugins,
	title,
	description,
	className = '',
	autoScroll = true,
}: InfinitePluginCarouselProps) => {
	// Create a duplicate array for infinite scrolling effect
	const duplicatedPlugins = [...plugins, ...plugins, ...plugins]
	const [prevBtnEnabled, setPrevBtnEnabled] = useState(false)
	const [nextBtnEnabled, setNextBtnEnabled] = useState(true)
	const [scrollProgress, setScrollProgress] = useState(0)

	// Embla carousel options
	const options: EmblaOptionsType = {
		align: 'start',
		containScroll: 'trimSnaps',
		loop: true,
		dragFree: true,
	}

	const [emblaRef, emblaApi] = useEmblaCarousel(options)

	// Auto scrolling
	useEffect(() => {
		if (!emblaApi || !autoScroll) return

		const intervalId = setInterval(() => {
			emblaApi.scrollNext()
		}, 4000)

		// Clean up on unmount
		return () => clearInterval(intervalId)
	}, [emblaApi, autoScroll])

	// Update button states based on carousel state
	const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
		setPrevBtnEnabled(emblaApi.canScrollPrev())
		setNextBtnEnabled(emblaApi.canScrollNext())

		// Calculate and update the scroll progress
		const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
		setScrollProgress(progress * 100)
	}, [])

	useEffect(() => {
		if (!emblaApi) return

		onSelect(emblaApi)
		emblaApi.on('select', onSelect)
		emblaApi.on('scroll', () => {
			const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
			setScrollProgress(progress * 100)
		})
	}, [emblaApi, onSelect])

	// Navigation handlers
	const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi])
	const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi])

	// If no plugins, don't render
	if (!plugins.length) return null

	return (
		<div className={`relative ${className}`}>
			{/* Header section with title and description */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
				<div>
					<h2 className="fl-text-step-1 relative">
						{title}
						<span className="absolute -bottom-1.5 left-0 h-[2px] w-20 bg-gradient-to-r from-indigo-500/70 to-transparent"></span>
					</h2>
					{description && <p className="text-muted-foreground text-sm mt-3">{description}</p>}
				</div>

				{/* Navigation arrows with improved styling */}
				<div className="flex items-center gap-2 mt-2 md:mt-0">
					<button
						onClick={scrollPrev}
						className="p-2 rounded-full bg-background/80 hover:bg-accent/80 border border-foreground/10 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
						aria-label="Scroll left"
						disabled={!prevBtnEnabled}
					>
						<Icon icon="heroicons:arrow-left" className="w-5 h-5" />
					</button>
					<button
						onClick={scrollNext}
						className="p-2 rounded-full bg-background/80 hover:bg-accent/80 border border-foreground/10 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
						aria-label="Scroll right"
						disabled={!nextBtnEnabled}
					>
						<Icon icon="heroicons:arrow-right" className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* Enhanced carousel container */}
			<div className="relative overflow-hidden rounded-md">
				{/* Gradient masks for smooth fading effect */}
				<div className="absolute left-0 top-0 bottom-4 w-20 z-10 pointer-events-none bg-gradient-to-r from-background via-background/80 to-transparent"></div>
				<div className="absolute right-0 top-0 bottom-4 w-20 z-10 pointer-events-none bg-gradient-to-l from-background via-background/80 to-transparent"></div>

				{/* Embla carousel container */}
				<div className="overflow-hidden" ref={emblaRef}>
					<div className="flex">
						{/* Render duplicated plugins for seamless looping */}
						{duplicatedPlugins.map((plugin, index) => (
							<div
								key={`${plugin.id}-${index}`}
								className="min-w-[300px] flex-shrink-0 pr-4 transition-all duration-300"
								style={{ flex: '0 0 300px' }}
							>
								<div className="transform transition-transform duration-300 hover:translate-y-[-4px]">
									<PluginCard
										plugin={plugin}
										className="h-full shadow-sm hover:shadow-lg transition-all duration-500"
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Improved scroll progress indicator */}
			<div className="mt-4 h-0.5 bg-accent/5 rounded-full overflow-hidden">
				<div
					className="h-full bg-accent/30 rounded-full transition-all duration-700 ease-in-out"
					style={{
						width: `${scrollProgress}%`,
					}}
				/>
			</div>
		</div>
	)
}
