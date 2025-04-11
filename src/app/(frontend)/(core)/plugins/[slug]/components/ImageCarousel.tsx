'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'

interface ImageCarouselProps {
	images: Array<{
		url: string
		alt?: string
	}>
	pluginName: string
}

export function ImageCarousel({ images, pluginName }: ImageCarouselProps) {
	const [currentIndex, setCurrentIndex] = useState(0)

	if (!images || images.length === 0) {
		return null
	}

	const handlePrev = () => {
		setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
	}

	const handleNext = () => {
		setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
	}

	return (
		<div className="relative">
			{/* Main Image */}
			<div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
				<Image
					src={images[currentIndex].url}
					alt={images[currentIndex].alt || `${pluginName} screenshot ${currentIndex + 1}`}
					fill
					className="object-cover"
				/>

				{/* Navigation Arrows */}
				<button
					onClick={handlePrev}
					className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
					aria-label="Previous image"
				>
					<Icon icon="heroicons:chevron-left" className="w-5 h-5" />
				</button>

				<button
					onClick={handleNext}
					className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
					aria-label="Next image"
				>
					<Icon icon="heroicons:chevron-right" className="w-5 h-5" />
				</button>
			</div>

			{/* Thumbnails */}
			{images.length > 1 && (
				<div className="flex gap-2 overflow-x-auto pb-2">
					{images.map((image, index) => (
						<button
							key={index}
							onClick={() => setCurrentIndex(index)}
							className={`relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 ${
								index === currentIndex ? 'border-primary' : 'border-transparent'
							}`}
							aria-label={`View image ${index + 1}`}
						>
							<Image
								src={image.url}
								alt={image.alt || `${pluginName} thumbnail ${index + 1}`}
								fill
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}

			{/* Image Counter */}
			<div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
				{currentIndex + 1} / {images.length}
			</div>
		</div>
	)
}
