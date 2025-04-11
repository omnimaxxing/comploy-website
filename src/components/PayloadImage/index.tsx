'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { cn } from '@heroui/react'
import type { Media } from '@/payload-types'

type ImageSize = 'thumbnail' | 'square' | 'small' | 'medium' | 'large' | 'xlarge'

// Default blur data URL for a light gray placeholder
const DEFAULT_BLUR_DATA_URL =
	'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4='

interface PayloadImageProps {
	media?: Media | null
	alt?: string
	className?: string
	fill?: boolean
	width?: number
	height?: number
	sizes?: string
	priority?: boolean
	quality?: number
	fallbackIcon?: string
	fallbackText?: string
	fallbackClassName?: string
	aspectRatio?: string
	objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
	preferredSize?: ImageSize
}

export const PayloadImage: React.FC<PayloadImageProps> = ({
	media,
	alt,
	className,
	fill = false,
	width,
	height,
	sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
	priority = false,
	quality = 80,
	fallbackIcon = 'heroicons:photo',
	fallbackText,
	fallbackClassName,
	aspectRatio = 'aspect-[4/3]',
	objectFit = 'cover',
	preferredSize = 'large',
}) => {
	const [isLoaded, setIsLoaded] = useState(false)

	// Helper function to get the appropriate image URL based on size
	const getImageUrl = (media: Media, size: ImageSize): string => {
		if (media.sizes && media.sizes[size] && media.sizes[size].url) {
			return media.sizes[size].url
		}
		return media.url || ''
	}

	// If no media is provided, show placeholder
	if (!media || typeof media !== 'object' || !('url' in media)) {
		return (
			<div
				className={cn(
					'relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center',
					aspectRatio,
					fallbackClassName,
				)}
			>
				<div className="flex flex-col items-center justify-center text-primary/50">
					<Icon icon={fallbackIcon} className="w-12 h-12 mb-2" />
					{fallbackText && <span className="text-sm">{fallbackText}</span>}
				</div>
			</div>
		)
	}

	// Determine the image URL to use
	const imageUrl = getImageUrl(media, preferredSize)
	const imageAlt = alt || media.alt || 'Image'
	const blurDataURL = media.blurDataURL || DEFAULT_BLUR_DATA_URL

	return (
		<div className={cn('relative overflow-hidden rounded-2xl', aspectRatio, className)}>
			{fill ? (
				<Image
					src={imageUrl}
					alt={imageAlt}
					fill
					sizes={sizes}
					priority={priority}
					quality={quality}
					className={cn(
						'transition-opacity duration-500',
						objectFit === 'cover' && 'object-cover',
						objectFit === 'contain' && 'object-contain',
						objectFit === 'fill' && 'object-fill',
						objectFit === 'none' && 'object-none',
						objectFit === 'scale-down' && 'object-scale-down',
					)}
					placeholder="blur"
					blurDataURL={blurDataURL}
					onLoad={() => setIsLoaded(true)}
				/>
			) : (
				<Image
					src={imageUrl}
					alt={imageAlt}
					width={width || 800}
					height={height || 600}
					sizes={sizes}
					priority={priority}
					quality={quality}
					className={cn(
						'transition-opacity duration-500 w-full h-auto',
						objectFit === 'cover' && 'object-cover',
						objectFit === 'contain' && 'object-contain',
						objectFit === 'fill' && 'object-fill',
						objectFit === 'none' && 'object-none',
						objectFit === 'scale-down' && 'object-scale-down',
					)}
					placeholder="blur"
					blurDataURL={blurDataURL}
					onLoad={() => setIsLoaded(true)}
				/>
			)}
		</div>
	)
}

export default PayloadImage
