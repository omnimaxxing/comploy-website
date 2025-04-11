'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { usePathname } from 'next/navigation'

interface PageTransitionProps {
	children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
	const pathname = usePathname()
	const transitionRef = useRef<HTMLDivElement>(null)
	const overlayRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const parallaxRef = useRef<HTMLDivElement>(null)
	const glowRef = useRef<HTMLDivElement>(null)
	const blurRef = useRef<HTMLDivElement>(null)
	const timelineRef = useRef<gsap.core.Timeline | null>(null)

	useEffect(() => {
		const context = gsap.context(() => {
			// Initial page load animation - more subtle and snappy
			gsap.set([contentRef.current, overlayRef.current, parallaxRef.current, blurRef.current], {
				opacity: 0,
				y: 8, // Reduced from 15
				rotateX: 0, // Removed rotation
				filter: 'blur(2px)',
			})

			gsap.set(glowRef.current, {
				opacity: 0,
				scale: 1.05, // Reduced scale
			})

			// Refined entrance animation
			const entranceTimeline = gsap.timeline({
				defaults: { ease: 'power2.out' }, // Changed from expo to power2 for snappier feel
			})

			entranceTimeline
				.to(contentRef.current, {
					opacity: 1,
					y: 0,
					filter: 'blur(0px)',
					duration: 0.4, // Faster duration
					clearProps: 'all',
				})
				.to(
					blurRef.current,
					{
						opacity: 0.015,
						y: 0,
						duration: 0.35,
					},
					'<0.02',
				)
				.to(
					parallaxRef.current,
					{
						opacity: 0.01,
						y: 0,
						duration: 0.35,
					},
					'<0.02',
				)
				.to(
					glowRef.current,
					{
						opacity: 0.02,
						scale: 1,
						duration: 0.45,
					},
					'<0.02',
				)

			// Refined transition timeline
			timelineRef.current = gsap.timeline({
				paused: true,
				defaults: {
					ease: 'power2.inOut', // Changed from expo for better control
				},
			})

			// Subtle and snappy transition sequence
			timelineRef.current
				.set(transitionRef.current, {
					display: 'block',
				})
				.to([blurRef.current, glowRef.current], {
					opacity: (vars: any) => (vars.target === blurRef.current ? 0.02 : 0.03),
					scale: (vars: any) => (vars.target === blurRef.current ? 1 : 1.02),
					duration: 0.2,
					stagger: 0.02,
				})
				.fromTo(
					transitionRef.current,
					{
						clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
						webkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)',
					},
					{
						clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
						webkitClipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
						duration: 0.4, // Faster clip animation
						ease: 'power3.inOut',
					},
				)
				.fromTo(
					[parallaxRef.current, blurRef.current],
					{
						yPercent: 50, // Reduced from 100
						opacity: 0,
					},
					{
						yPercent: 0,
						opacity: (vars: any) => (vars.target === parallaxRef.current ? 0.01 : 0.015),
						duration: 0.3,
						stagger: 0.03,
					},
					'<0.05',
				)
				.fromTo(
					overlayRef.current,
					{
						yPercent: 50,
						opacity: 0.3,
					},
					{
						yPercent: 0,
						opacity: 1,
						duration: 0.25,
					},
					'<0.05',
				)
				.to(
					transitionRef.current,
					{
						clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
						webkitClipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
						duration: 0.4,
						ease: 'power3.inOut',
					},
					'>-0.02',
				)
				.to(
					[glowRef.current, blurRef.current],
					{
						opacity: (vars: any) => (vars.target === glowRef.current ? 0.02 : 0.015),
						scale: 1,
						duration: 0.25,
						stagger: 0.02,
					},
					'<0.08',
				)
				.set(transitionRef.current, {
					display: 'none',
				})

			// Refined exit animation
			return () => {
				// Kill any running animations before cleanup
				if (timelineRef.current) {
					timelineRef.current.kill()
				}

				// Only run exit animation if elements still exist
				if (contentRef.current && parallaxRef.current && blurRef.current && glowRef.current) {
					const exitTimeline = gsap.timeline({
						defaults: { ease: 'power2.out' },
						onComplete: () => {
							// Don't try to play the timeline again on exit
							// if (timelineRef.current) {
							//     timelineRef.current.play(0)
							// }
						},
					})

					// Keep the exit animation but make it shorter
					exitTimeline
						.to(contentRef.current, {
							opacity: 0,
							y: -4,
							filter: 'blur(1px)',
							duration: 0.15, // Shorter duration
						})
						.to(
							[parallaxRef.current, blurRef.current],
							{
								opacity: 0,
								y: -3,
								duration: 0.1, // Shorter duration
								stagger: 0.02,
							},
							'<0.03',
						)
						.to(
							glowRef.current,
							{
								opacity: 0,
								scale: 1.02,
								duration: 0.1, // Shorter duration
							},
							'<0.02',
						)
				}
			}
		})

		return () => {
			// Kill all GSAP animations in the context before unmounting
			context.kill()
			context.revert()
		}
	}, [pathname])

	return (
		<div className="relative">
			{/* Main transition container */}
			<div
				ref={transitionRef}
				className="fixed inset-0 z-[60] hidden pointer-events-none"
				style={{
					backgroundColor: 'var(--background)',
					willChange: 'clip-path',
				}}
			>
				{/* Blur effect layer - reduced blur intensity */}
				<div
					ref={blurRef}
					className="absolute inset-0 backdrop-blur-[50px]"
					style={{
						willChange: 'opacity',
					}}
				/>

				{/* Parallax grid pattern - more subtle */}
				<div
					ref={parallaxRef}
					className="absolute inset-0 bg-grid-pattern-white/[0.008] dark:bg-grid-pattern-white/[0.008]"
					style={{
						backgroundSize: '20px 20px',
						willChange: 'opacity',
					}}
				/>

				{/* Animated overlay - more subtle gradient */}
				<div
					ref={overlayRef}
					className="absolute inset-0"
					style={{
						background: `
							linear-gradient(to bottom,
								var(--background),
								color-mix(in srgb, var(--primary) 0.8%, var(--background)),
								var(--background)
							)
						`,
						willChange: 'opacity',
					}}
				/>

				{/* Dynamic glow effect - more subtle */}
				<div
					ref={glowRef}
					className="absolute inset-0 opacity-0"
					style={{
						background: `
							radial-gradient(
								circle at 50% 50%,
								var(--primary)/0.04 0%,
								transparent 70%
							)
						`,
						willChange: 'opacity',
					}}
				/>
			</div>

			{/* Page content */}
			<div
				ref={contentRef}
				className="relative z-0"
				style={{
					willChange: 'opacity',
				}}
			>
				{children}
			</div>
		</div>
	)
}
