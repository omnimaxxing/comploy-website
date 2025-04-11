'use client'

import { cn } from '@/utilities/cn'
import type { StaticImageData } from 'next/image'
import NextImage from 'next/image'
import React, { useState } from 'react'

import { cssVariables } from '@/cssVariables'

import type { Props as MediaProps } from '../types'

const { breakpoints } = cssVariables

interface ExtendedMediaProps extends MediaProps {
	shimmer?: boolean // Show shimmer loading effect
}

export const ImageMedia: React.FC<ExtendedMediaProps> = ({
	alt: altFromProps,
	fill,
	imgClassName,
	onClick,
	onLoad: onLoadFromProps,
	priority,
	resource,
	size: sizeFromProps,
	src: srcFromProps,
	blurDataURL: blurDataURLFromProps,
	layout,
	className,
	width: widthProp,
	height: heightProp,
	shimmer = false, // Default shimmer to false
	objectFit = 'cover', // Default object-fit to 'cover'
}) => {
	const [isLoading, setIsLoading] = useState(true)

	// Initialize image attributes
	let width: number | undefined = widthProp
	let height: number | undefined = heightProp
	let alt = altFromProps || 'Image for Heartland Group' // Default alt text
	let src: StaticImageData | string = srcFromProps || ''
	let blurDataURL = blurDataURLFromProps

	// Extract data from resource if available
	if (!src && resource && typeof resource === 'object') {
		const {
			alt: altFromResource,
			filename: fullFilename,
			height: fullHeight,
			url,
			width: fullWidth,
			blurDataURL: blurDataURLFromResource,
			sizes,
		} = resource

		width = width ?? fullWidth ?? undefined
		height = height ?? fullHeight ?? undefined
		alt = altFromProps || altFromResource || 'Image for Heartland Group' // Prioritize props, fallback to resource or default

		// If a specific size is requested and exists in the resource's sizes, use that
		if (sizeFromProps && sizes && typeof sizes === 'object' && sizeFromProps in sizes) {
			const sizeUrl = sizes[sizeFromProps].url
			src =
				typeof sizeUrl === 'string' && !sizeUrl.startsWith('http')
					? `${process.env.NEXT_PUBLIC_SERVER_URL}${sizeUrl}`
					: sizeUrl
		} else {
			// Otherwise use the default url
			src =
				typeof url === 'string' && !url.startsWith('http')
					? `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`
					: url || src
		}

		blurDataURL = blurDataURL || blurDataURLFromResource || undefined
	}

	const useBlurPlaceholder = !!blurDataURL

	const isFill = layout === 'fill' || fill

	// Generate responsive sizes for image
	const sizes = sizeFromProps
		? sizeFromProps
		: Object.entries(breakpoints)
				.map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
				.join(', ')

	return (
		<div className={cn('relative', isFill ? 'w-full h-full' : '', className)}>
			<NextImage
				alt={alt}
				className={cn(
					imgClassName,
					objectFit === 'cover' ? 'object-cover' : 'object-contain',
					isLoading && shimmer && !useBlurPlaceholder ? 'opacity-0' : 'opacity-100',
					'transition-opacity duration-300',
				)}
				onClick={onClick}
				onLoad={() => {
					setIsLoading(false)
					if (typeof onLoadFromProps === 'function') {
						onLoadFromProps()
					}
				}}
				priority={priority}
				quality={100}
				sizes={sizes}
				src={src}
				placeholder={useBlurPlaceholder ? 'blur' : undefined}
				blurDataURL={useBlurPlaceholder ? blurDataURL : undefined}
				fill={isFill}
				width={!isFill ? width : undefined}
				height={!isFill ? height : undefined}
			/>
		</div>
	)
}
