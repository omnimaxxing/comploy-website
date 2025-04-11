'use client'

import { cn } from '@/utilities/cn'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import type { Props } from '../types'

interface ExtendedVideoProps extends Props {
	poster?: string | { filename: string; url?: string }
	controls?: boolean
	autoPlay?: boolean
	loop?: boolean
	muted?: boolean
	playsInline?: boolean
	className?: string
	shimmer?: boolean
	fill?: boolean
	width?: number
	height?: number
}

export const VideoMedia: React.FC<ExtendedVideoProps> = (props) => {
	const {
		onClick,
		resource,
		videoClassName,
		fill = false,
		poster,
		controls = false,
		autoPlay = true,
		loop = true,
		muted = true,
		playsInline = true,
		className,
		shimmer = false,
		width,
		height,
	} = props

	const videoRef = useRef<HTMLVideoElement>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [showFallback, setShowFallback] = useState(false)

	useEffect(() => {
		const { current: video } = videoRef
		if (video) {
			video.addEventListener('loadeddata', () => setIsLoading(false))
			video.addEventListener('suspend', () => {
				setShowFallback(true)
				console.warn('Video was suspended, rendering fallback image.')
			})
		}
	}, [])

	const getUrl = (resource: string | { filename: string; url?: string }) => {
		if (typeof resource === 'object') {
			if (resource.url) {
				return resource.url.startsWith('http')
					? resource.url
					: `${process.env.NEXT_PUBLIC_SERVER_URL}${resource.url}`
			}
			return `${process.env.NEXT_PUBLIC_SERVER_URL}/media/${resource.filename}`
		}
		return resource
	}

	const src = resource ? getUrl(resource) : ''
	const posterUrl = poster ? getUrl(poster) : ''

	if (!src) return null

	const containerStyle = fill ? { position: 'relative', width: '100%', height: '100%' } : {}
	const videoStyle = fill
		? {
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
				objectFit: 'cover' as const,
			}
		: {}

	return (
		<div className={cn('relative', className)} style={containerStyle}>
			{showFallback && posterUrl ? (
				<img
					src={posterUrl}
					alt="Video thumbnail"
					className={cn(videoClassName, 'object-cover')}
					style={videoStyle}
					width={fill ? '100%' : width}
					height={fill ? '100%' : height}
				/>
			) : (
				<video
					ref={videoRef}
					className={cn(
						videoClassName,
						'object-cover',
						isLoading && shimmer && !posterUrl ? 'opacity-0' : 'opacity-100',
						'transition-opacity duration-300',
					)}
					style={videoStyle}
					onClick={onClick}
					controls={controls}
					autoPlay={autoPlay}
					loop={loop}
					muted={muted}
					playsInline={playsInline}
					poster={posterUrl}
					width={fill ? '100%' : width}
					height={fill ? '100%' : height}
				>
					<source src={src} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			)}
		</div>
	)
}
