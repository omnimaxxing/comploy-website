'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@heroui/react'
import { AnimatedLogo } from '@/components/Logo/AnimatedLogo'
import { useReducedMotion } from 'framer-motion'

export function PageLoadingAnimation() {
	const [isLoading, setIsLoading] = useState(true)
	const [hasFirstPaint, setHasFirstPaint] = useState(false)
	const loadingRef = useRef<HTMLDivElement>(null)
	const prefersReducedMotion = useReducedMotion()

	useEffect(() => {
		// Mark first paint immediately on mount
		setHasFirstPaint(true)

		// For users who prefer reduced motion, skip loading animation
		if (prefersReducedMotion) {
			setIsLoading(false)
			document.body.style.removeProperty('overflow')
			window.dispatchEvent(new CustomEvent('coreAnimationsComplete'))
			return
		}

		// Dispatch event to notify other components when loading is complete
		const handleLoadingComplete = () => {
			setTimeout(() => {
				setIsLoading(false)
				document.body.style.removeProperty('overflow')
				window.dispatchEvent(new CustomEvent('coreAnimationsComplete'))
			}, 500)
		}

		window.addEventListener('loadingComplete', handleLoadingComplete)

		// Fallback timer to ensure loading completes
		const fallbackTimer = setTimeout(() => {
			handleLoadingComplete()
		}, 3000) // 3 seconds max wait time

		// Cleanup function
		return () => {
			window.removeEventListener('loadingComplete', handleLoadingComplete)
			document.body.style.removeProperty('overflow')
			clearTimeout(fallbackTimer)
		}
	}, [prefersReducedMotion])

	// Skip rendering if user prefers reduced motion
	if (prefersReducedMotion) return null

	return (
		<>
			{/* Loading overlay - conditionally rendered and non-blocking */}
			{hasFirstPaint && (
				<div
					ref={loadingRef}
					className={cn(
						'fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500',
						isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none',
					)}
					aria-hidden={!isLoading}
					style={{
						// Use CSS variables for animation to reduce JS load
						animationDuration: '1.5s',
						// Make sure this doesn't block interaction
						pointerEvents: isLoading ? 'auto' : 'none',
					}}
				>
					<AnimatedLogo />
				</div>
			)}
		</>
	)
}
