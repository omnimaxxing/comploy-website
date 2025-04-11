'use client'

import { cn } from '@/utilities/cn'
import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Icon } from '@iconify/react'
import { useRouter } from 'next/navigation'

export const FloatingTab = React.memo(function FloatingTab() {
	const router = useRouter()
	const tabRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const iconRef = useRef<HTMLDivElement>(null)
	const pulseRef = useRef<HTMLDivElement>(null)
	const sparkRef = useRef<HTMLDivElement>(null)
	const hoverTl = useRef<gsap.core.Timeline | null>(null)
	const hasInitialized = useRef(false)
	const gsapContext = useRef<gsap.Context | null>(null)
	// Use a ref instead of state to track expanded/collapsed status
	const isExpandedRef = useRef(false)

	useEffect(() => {
		if (hasInitialized.current) return
		hasInitialized.current = true

		//console.log('FloatingTab: Initializing GSAP animations (first time)')
		gsapContext.current = gsap.context(() => {
			// Set initial states for the content container
			gsap.set(contentRef.current, {
				opacity: 0,
				x: 20,
			})

			// Pulse animation for the background element
			gsap.to(pulseRef.current, {
				scale: 1.2,
				opacity: 0.6,
				duration: 1.5,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut',
			})

			// Icon float animation
			gsap.to(iconRef.current, {
				y: -4,
				duration: 2,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut',
			})

			// Sparks animation
			const sparks = sparkRef.current?.children
			if (sparks) {
				gsap.to(sparks, {
					y: -20,
					opacity: 0,
					duration: 1,
					stagger: 0.2,
					repeat: -1,
					ease: 'power1.out',
					repeatDelay: 0.5,
				})
			}

			// Create hover/expand animation
			hoverTl.current = gsap.timeline({ paused: true })
			hoverTl.current
				.to(tabRef.current, {
					width: 'auto',
					duration: 0.4,
					ease: 'power2.out',
				})
				.to(
					contentRef.current,
					{
						opacity: 1,
						x: 0,
						duration: 0.3,
						ease: 'power2.out',
					},
					'-=0.2',
				)
		})

		//console.log('FloatingTab: GSAP animations initialized')

		return () => {
			if (gsapContext.current) {
				//console.log('FloatingTab: Component unmounting, cleaning up GSAP context')
				gsapContext.current.revert()
			}
		}
	}, [])

	const handleMouseEnter = () => {
		if (!isExpandedRef.current && hoverTl.current) {
			hoverTl.current.play()
			isExpandedRef.current = true
		}
	}

	const handleMouseLeave = () => {
		if (isExpandedRef.current && hoverTl.current) {
			hoverTl.current.reverse()
			isExpandedRef.current = false
		}
	}

	const handleClick = () => {
		if (!isExpandedRef.current) return

		gsap
			.timeline()
			.to(tabRef.current, {
				scale: 0.95,
				duration: 0.1,
			})
			.to(tabRef.current, {
				scale: 1,
				duration: 0.1,
				onComplete: () => {
					setTimeout(() => {
						router.push('/payload-experts')
					}, 50)
				},
			})
	}

	return (
		<div
			ref={tabRef}
			onClick={handleClick}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			className={cn(
				'fixed right-0 top-1/2 -translate-y-1/2 z-[90]',
				'bg-white/95 shadow-lg rounded-l-2xl overflow-hidden',
				'flex items-center pr-4 pl-4 py-4',
				'backdrop-blur-md border border-r-0 border-primary/10',
				'hover:shadow-xl transition-shadow duration-300',
				'w-[68px]', // Initial width to show just the icon
			)}
		>
			<div className="relative">
				<div ref={pulseRef} className="absolute inset-0 rounded-xl bg-primary/20" />
				<div
					ref={iconRef}
					className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center"
				>
					<Icon icon="simple-icons:payloadcms" className="w-6 h-6 text-primary" />
					{/* Sparks */}
					<div ref={sparkRef} className="absolute inset-0">
						{[...Array(3)].map((_, i) => (
							<div
								key={i}
								className="absolute w-1 h-1 bg-primary/50 rounded-full"
								style={{
									left: `${25 + i * 25}%`,
									top: '50%',
								}}
							/>
						))}
					</div>
				</div>
			</div>
			<div ref={contentRef} className="ml-6 whitespace-nowrap">
				<div className="flex flex-col gap-1">
					<h4 className="font-medium text-base text-foreground flex items-center gap-2">
						Payload CMS Experts
						<Icon icon="heroicons:arrow-right" className="w-4 h-4 text-primary animate-pulse" />
					</h4>
					<p className="text-sm text-muted-foreground">Click to learn more about our expertise</p>
				</div>
			</div>
		</div>
	)
})
