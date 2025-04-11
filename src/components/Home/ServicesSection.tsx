'use client'

import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import { Button } from '@heroui/react'
import { cn } from '@heroui/react'
import Link from 'next/link'
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
import type { HomeGlobal } from '@/payload-types'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLayoutEffect, useRef, useState, useEffect } from 'react'

type ServicesSectionProps = {
	page: HomeGlobal
}

const ServiceSkeletonOne = () => {
	const containerVariants = {
		initial: { scale: 1 },
		hover: { scale: 1.02 },
	}

	return (
		<Link href="/services#web-development">
			<motion.div
				variants={containerVariants}
				initial="initial"
				whileHover="hover"
				className="group flex flex-1 w-full h-full min-h-[6rem] bg-diagonal-gradient-primary/[0.03] dark:bg-diagonal-gradient-white/[0.02] p-8 cursor-pointer"
			>
				<div className="w-full h-full rounded-xl border border-neutral-100 dark:border-white/[0.2] bg-black/5 backdrop-blur-sm overflow-hidden">
					{/* Browser Header */}
					<div className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-black/20 border-b border-neutral-200 dark:border-white/[0.1]">
						<div className="flex space-x-2">
							{['#FF5F56', '#FFBD2E', '#27C93F'].map((color, i) => (
								<motion.div
									key={i}
									className="w-3 h-3 rounded-full"
									animate={{
										scale: [1, 1.2, 1],
										opacity: [1, 0.8, 1],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										delay: i * 0.3,
										ease: 'easeInOut',
									}}
									style={{ backgroundColor: color }}
								/>
							))}
						</div>
						<div className="flex-1 text-center">
							<span className="text-xs text-neutral-500 dark:text-neutral-400">browser</span>
						</div>
					</div>
					{/* Browser Content */}
					<div className="p-4">
						{/* Content Area */}
						<div className="space-y-4">
							{/* Hero Section */}
							<div className="h-24 rounded-lg bg-gradient-to-br from-primary-500/30 via-primary-400/20 to-transparent p-4 relative overflow-hidden">
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/10 to-transparent"
									animate={{
										x: ['-100%', '100%'],
										opacity: [0, 1, 0],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: 'linear',
									}}
								/>
								<div className="flex justify-between items-start h-full relative">
									<div className="space-y-2">
										<motion.div
											className="h-3 w-32 bg-primary-500/30 rounded-full"
											animate={{
												opacity: [0.5, 0.8, 0.5],
												width: ['8rem', '10rem', '8rem'],
											}}
											transition={{
												duration: 3,
												repeat: Infinity,
												ease: 'easeInOut',
											}}
										/>
										<motion.div
											className="text-[10px] text-primary-600/70"
											animate={{ opacity: [1, 0, 1] }}
											transition={{ duration: 7, repeat: Infinity, ease: 'anticipate' }}
										>
											We can build you a website inside a website inside a website
										</motion.div>
									</div>
									<motion.div
										className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/30 to-primary-400/10"
										animate={{
											scale: [1, 1.1, 1],
											rotate: [0, 10, 0],
											y: [0, -5, 0],
										}}
										transition={{
											duration: 4,
											repeat: Infinity,
											ease: 'easeInOut',
										}}
									>
										<motion.div
											className="w-full h-full rounded-xl bg-gradient-to-br from-primary-500/30 to-transparent"
											animate={{
												opacity: [0, 0.5, 0],
												scale: [0.8, 1, 0.8],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: 'easeInOut',
											}}
										/>
									</motion.div>
								</div>
							</div>
							{/* Features Grid */}
							<div className="grid grid-cols-2 gap-3">
								<motion.div
									className="h-16 rounded-lg bg-gradient-to-br from-primary-500/20 via-primary-400/10 to-transparent p-3 relative overflow-hidden"
									animate={{
										opacity: [0.5, 0.7, 0.5],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
								>
									<motion.div
										className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-400/10 to-transparent"
										animate={{
											x: ['-100%', '100%'],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: 'linear',
										}}
									/>
									<div className="flex items-center space-x-2 relative">
										<motion.div
											className="w-6 h-6 rounded-md bg-primary-500/30"
											animate={{
												scale: [1, 1.1, 1],
												rotate: [0, 5, 0],
											}}
											transition={{
												duration: 2,
												repeat: Infinity,
												ease: 'easeInOut',
											}}
										/>
										<div className="space-y-1">
											<motion.div
												className="h-2 w-12 bg-primary-500/30 rounded-full"
												animate={{
													width: ['3rem', '4rem', '3rem'],
												}}
												transition={{
													duration: 2,
													repeat: Infinity,
													ease: 'easeInOut',
												}}
											/>
											<motion.div
												className="h-2 w-8 bg-primary-400/20 rounded-full"
												animate={{
													width: ['2rem', '3rem', '2rem'],
												}}
												transition={{
													duration: 2,
													repeat: Infinity,
													ease: 'easeInOut',
												}}
											/>
										</div>
									</div>
								</motion.div>
								{/* View Service Button */}
								<motion.div
									className="h-16 rounded-lg bg-gradient-to-br from-primary-500/20 via-primary-400/10 to-transparent p-3 relative overflow-hidden group/button"
									whileHover={{ scale: 1.02 }}
								>
									<motion.div
										className="absolute inset-0 bg-white"
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: 'linear',
										}}
									/>
									<div className="flex items-center justify-between h-full relative">
										<div className="flex items-center gap-2">
											<div className="w-6 h-6 rounded-md bg-primary-500/30 flex items-center justify-center">
												<Icon icon="heroicons:arrow-right" className="w-4 h-4 text-primary-500" />
											</div>
											<span className="text-sm font-medium text-primary-500">View Service</span>
										</div>
										<motion.div
											className="w-2 h-4 bg-primary-500/30"
											animate={{ opacity: [1, 0.5, 1] }}
											transition={{ duration: 1.5, repeat: Infinity }}
										/>
									</div>
								</motion.div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</Link>
	)
}

const ServiceSkeletonTwo = () => {
	const containerVariants = {
		initial: { scale: 1 },
		hover: { scale: 1.02 },
	}

	return (
		<Link href="/services#custom-software">
			<motion.div
				variants={containerVariants}
				initial="initial"
				whileHover="hover"
				className="group flex flex-1 w-full h-full min-h-[6rem] bg-grid-small-primary/[0.02] dark:bg-grid-small-white/[0.02] p-8 cursor-pointer"
			>
				<div className="relative w-full h-full rounded-xl border border-neutral-100 dark:border-white/[0.2] bg-black/5 backdrop-blur-sm overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-50" />
					<div className="relative h-full flex flex-col">
						{/* Terminal Header */}
						<div className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-black/20 border-b border-neutral-200 dark:border-white/[0.1]">
							<div className="flex space-x-2">
								{['#FF5F56', '#FFBD2E', '#27C93F'].map((color, i) => (
									<div
										key={i}
										className="w-3 h-3 rounded-full"
										style={{ backgroundColor: color }}
									/>
								))}
							</div>
							<div className="flex-1 text-center">
								<span className="text-xs text-neutral-500 dark:text-neutral-400">terminal</span>
							</div>
						</div>
						{/* Terminal Content */}
						<div className="flex-1 p-4 overflow-hidden">
							<div className="space-y-2 font-mono text-xs h-full max-h-[180px] overflow-y-auto break-words whitespace-normal scrollbar-thin scrollbar-thumb-neutral-400/20 scrollbar-track-transparent">
								{/* Updated Command History */}
								<div className="text-neutral-400">$ pnpm run turbocharge</div>
								<div className="text-emerald-500">
									✓ Performance boosted by 317% (we broke the speed limit)
								</div>
								<div className="text-neutral-400">$ git commit -m "Made everything awesome"</div>
								<div className="text-emerald-500">✓ Awesomeness pushed to production</div>
								<div className="text-neutral-400">$ ./deploy.sh --magic</div>
								<div className="text-emerald-500">✓ Sprinkling digital fairy dust complete</div>
								{/* Command Line with View Service */}
								<div className="flex items-center text-emerald-500 group/button sticky bottom-0 bg-white py-1">
									<span className="mr-2">$</span>
									<motion.div
										className="flex items-center gap-2 text-emerald-500 cursor-pointer"
										whileHover={{ x: 5 }}
									>
										<span>view-service</span>
										<Icon icon="heroicons:arrow-right" className="w-4 h-4" />
									</motion.div>
									<motion.span
										animate={{ opacity: [1, 0] }}
										transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
										className="w-2 h-4 bg-emerald-500 ml-2"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</Link>
	)
}

const ServiceSkeletonThree = () => {
	const variants = {
		initial: {
			backgroundPosition: '0 50%',
		},
		animate: {
			backgroundPosition: ['0, 50%', '100% 50%', '0 50%'],
		},
	}

	const chartVariants = {
		initial: { height: '20%' },
		hover: (i: number) => ({
			height: ['20%', '80%', '40%', '60%'],
			transition: {
				duration: 2,
				repeat: Infinity,
				repeatType: 'mirror' as const,
				delay: i * 0.2,
			},
		}),
	}

	return (
		<Link href="/services#digital-strategy">
			<motion.div
				initial="initial"
				whileHover="hover"
				className="group flex flex-1 w-full h-full min-h-[6rem] p-8 cursor-pointer"
			>
				<div className="w-full h-full rounded-xl border border-neutral-100 dark:border-white/[0.2] bg-black/5 backdrop-blur-sm overflow-hidden">
					{/* Dashboard Header */}
					<div className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-black/20 border-b border-neutral-200 dark:border-white/[0.1]">
						<div className="flex space-x-2">
							{['#FF5F56', '#FFBD2E', '#27C93F'].map((color, i) => (
								<motion.div
									key={i}
									className="w-3 h-3 rounded-full"
									animate={{
										scale: [1, 1.15, 1],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: [0.4, 0, 0.2, 1],
										delay: i * 0.2,
									}}
									style={{ backgroundColor: color }}
								/>
							))}
						</div>
						<div className="flex-1 text-center">
							<span className="text-xs text-neutral-500 dark:text-neutral-400">analytics</span>
						</div>
					</div>
					{/* Dashboard Content */}
					<div className="p-4 overflow-hidden">
						{/* KPI Cards */}
						<div className="grid grid-cols-3 gap-1 mb-4">
							{[
								{ label: 'Conversion', value: '+187%', animate: true },
								{ label: 'ROI', value: '12.4x', animate: true },
								{ label: 'View', value: '→', isButton: true },
							].map((kpi, i) => (
								<motion.div
									key={i}
									whileHover={{ scale: kpi.isButton ? 1.05 : 1.02 }}
									className={cn(
										'p-1.5 rounded-lg overflow-hidden',
										kpi.isButton ? 'bg-primary/10 group/button' : 'bg-white',
									)}
								>
									<div className="text-[10px] truncate text-neutral-500">{kpi.label}</div>
									<motion.div
										className={cn(
											'text-xs font-medium truncate',
											kpi.isButton
												? 'text-primary group-hover/button:translate-x-1 transition-transform'
												: '',
										)}
										animate={
											kpi.animate
												? {
														scale: [1, 1.05, 1],
														opacity: [0.8, 1, 0.8],
												  }
												: {}
										}
										transition={{
											duration: 2,
											repeat: Infinity,
											ease: 'easeInOut',
											delay: i * 0.2,
										}}
									>
										{kpi.value}
									</motion.div>
								</motion.div>
							))}
						</div>
						{/* Chart */}
						<div className="relative h-24 flex items-end justify-between gap-1">
							<motion.div
								className="absolute top-0 right-0 text-[8px] sm:text-[10px] text-primary-500/90 italic max-w-[90%] line-clamp-2"
								animate={{
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: [0.4, 0, 0.2, 1],
								}}
							>
								// Data doesn't lie, but our charts stretch the truth
							</motion.div>
							{Array.from({ length: 8 }).map((_, i) => (
								<motion.div
									key={i}
									variants={chartVariants}
									custom={i}
									animate={{
										height: ['20%', '60%', '30%', '80%', '20%'],
									}}
									transition={{
										duration: 3,
										repeat: Infinity,
										ease: 'easeInOut',
										delay: i * 0.1,
									}}
									className="w-full bg-gradient-to-t from-primary-400/20 to-primary-300/10 rounded-t-lg"
								/>
							))}
						</div>
					</div>
				</div>
			</motion.div>
		</Link>
	)
}

const ServiceSkeletonFour = () => {
	// Create refs for elements we want to animate
	const containerRef = useRef<HTMLDivElement>(null)
	const headerDotsRef = useRef<(HTMLDivElement | null)[]>([])
	const taglineRef = useRef<HTMLDivElement>(null)
	const sliderTrackRef = useRef<HTMLDivElement>(null)
	const sliderThumbRef = useRef<HTMLDivElement>(null)
	const typographyContainerRef = useRef<HTMLDivElement>(null)
	const fluidTextRef = useRef<HTMLDivElement>(null)
	const descriptionRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLDivElement>(null)
	const arrowRef = useRef<HTMLDivElement>(null)
	const [isHovering, setIsHovering] = useState(false)

	// Register GSAP plugins
	useEffect(() => {
		// Register ScrollTrigger plugin
		gsap.registerPlugin(ScrollTrigger)

		return () => {
			// Clean up ScrollTrigger instances when component unmounts
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
		}
	}, [])

	// Set up GSAP animations with useGSAP for better performance
	useGSAP(
		() => {
			if (!containerRef.current) return

			// Create a context to keep animations isolated
			const ctx = gsap.context(() => {
				// Master timeline for coordinating animations
				const masterTl = gsap.timeline({
					scrollTrigger: {
						trigger: containerRef.current,
						start: 'top bottom-=100',
						end: 'bottom top+=100',
						toggleActions: 'play pause resume reset',
						// markers: true, // Uncomment for debugging
					},
				})

				// Header dots animation with staggered effect
				const dotsAnimation = gsap.to(headerDotsRef.current, {
					scale: 1.15,
					duration: 1.5,
					repeat: -1,
					ease: 'elastic.out(1, 0.3)',
					stagger: {
						each: 0.15,
						repeat: -1,
						yoyo: true,
					},
					yoyo: true,
					yoyoEase: 'power2.in',
					paused: true,
				})

				// Add to master timeline
				masterTl.add(dotsAnimation.play(), 0)

				// Tagline animation with text glow effect
				const taglineTl = gsap.timeline({ repeat: -1, paused: true })
				taglineTl
					.fromTo(
						taglineRef.current,
						{ opacity: 0.5, textShadow: '0 0 0 rgba(59, 130, 246, 0)' },
						{
							opacity: 1,
							textShadow: '0 0 3px rgba(59, 130, 246, 0.3)',
							duration: 2,
							ease: 'sine.inOut',
						},
					)
					.to(taglineRef.current, {
						opacity: 0.5,
						textShadow: '0 0 0 rgba(59, 130, 246, 0)',
						duration: 2,
						ease: 'sine.inOut',
					})

				// Add to master timeline
				masterTl.add(taglineTl.play(), 0)

				// Create a more sophisticated slider animation
				// Slider track animation with custom easing
				const sliderKeyframes = [
					{ width: '20%', ease: 'power1.inOut' },
					{ width: '60%', ease: 'power1.inOut' },
					{ width: '40%', ease: 'power1.inOut' },
					{ width: '50%', ease: 'power1.inOut' },
					{ width: '20%', ease: 'power1.inOut' },
				]

				const sliderTrackTl = gsap.timeline({ repeat: -1, paused: true })
				sliderKeyframes.forEach((keyframe, i) => {
					sliderTrackTl.to(sliderTrackRef.current, {
						width: keyframe.width,
						duration: i === 0 ? 0 : 2,
						ease: keyframe.ease,
					})
				})

				// Add to master timeline
				masterTl.add(sliderTrackTl.play(), 0)

				// Slider thumb animation synchronized with track
				const thumbKeyframes = [
					{ left: '20%', scale: 1, ease: 'power1.inOut' },
					{ left: '60%', scale: 1.05, ease: 'elastic.out(1, 0.3)' },
					{ left: '40%', scale: 1, ease: 'power1.inOut' },
					{ left: '50%', scale: 1.05, ease: 'elastic.out(1, 0.3)' },
					{ left: '20%', scale: 1, ease: 'power1.inOut' },
				]

				const sliderThumbTl = gsap.timeline({ repeat: -1, paused: true })
				thumbKeyframes.forEach((keyframe, i) => {
					sliderThumbTl.to(sliderThumbRef.current, {
						left: keyframe.left,
						scale: keyframe.scale,
						duration: i === 0 ? 0 : 2,
						ease: keyframe.ease,
					})
				})

				// Add to master timeline
				masterTl.add(sliderThumbTl.play(), 0)

				// Typography container animation with subtle 3D effect and scroll-based parallax
				gsap.to(typographyContainerRef.current, {
					scale: 1.02,
					rotationX: 2,
					rotationY: 2,
					duration: 8,
					repeat: -1,
					ease: 'sine.inOut',
					yoyo: true,
					scrollTrigger: {
						trigger: typographyContainerRef.current,
						start: 'top bottom',
						end: 'bottom top',
						scrub: 0.5,
						// markers: true, // Uncomment for debugging
						onUpdate: (self) => {
							// Add subtle parallax effect based on scroll position
							gsap.to(typographyContainerRef.current, {
								y: self.progress * -10,
								duration: 0.5,
								overwrite: 'auto',
							})
						},
					},
				})

				// Fluid text animation with enhanced gradient flow
				const fluidTextTl = gsap.timeline({
					repeat: -1,
					paused: true,
					scrollTrigger: {
						trigger: fluidTextRef.current,
						start: 'top bottom',
						end: 'bottom top',
						toggleActions: 'play pause resume reset',
					},
				})

				// Initial state
				gsap.set(fluidTextRef.current, {
					fontSize: '1rem',
					letterSpacing: '-0.01em',
					backgroundPosition: '0% 50%',
				})

				// Sequence of fluid typography changes
				fluidTextTl
					.to(fluidTextRef.current, {
						fontSize: '1.4rem',
						letterSpacing: '0.01em',
						duration: 2,
						ease: 'power2.inOut',
					})
					.to(fluidTextRef.current, {
						fontSize: '1.2rem',
						letterSpacing: '0em',
						duration: 2,
						ease: 'power2.inOut',
					})
					.to(fluidTextRef.current, {
						fontSize: '1.3rem',
						letterSpacing: '0.01em',
						duration: 2,
						ease: 'power2.inOut',
					})
					.to(fluidTextRef.current, {
						fontSize: '1rem',
						letterSpacing: '-0.01em',
						duration: 2,
						ease: 'power2.inOut',
					})

				// Play the timeline
				fluidTextTl.play()

				// Continuous background gradient animation
				gsap.to(fluidTextRef.current, {
					backgroundPosition: '200% 50%',
					duration: 12,
					repeat: -1,
					ease: 'none',
					scrollTrigger: {
						trigger: fluidTextRef.current,
						start: 'top bottom',
						end: 'bottom top',
						toggleActions: 'play pause resume reset',
					},
				})

				// Description text animation synchronized with fluid text
				const descriptionTl = gsap.timeline({
					repeat: -1,
					paused: true,
					scrollTrigger: {
						trigger: descriptionRef.current,
						start: 'top bottom',
						end: 'bottom top',
						toggleActions: 'play pause resume reset',
					},
				})

				// Initial state
				gsap.set(descriptionRef.current, {
					fontSize: '0.7rem',
					lineHeight: 1.4,
				})

				// Sequence of description text changes
				descriptionTl
					.to(descriptionRef.current, {
						fontSize: '0.8rem',
						lineHeight: 1.5,
						duration: 2,
						ease: 'power2.inOut',
					})
					.to(descriptionRef.current, {
						fontSize: '0.75rem',
						lineHeight: 1.45,
						duration: 2,
						ease: 'power2.inOut',
					})
					.to(descriptionRef.current, {
						fontSize: '0.78rem',
						lineHeight: 1.48,
						duration: 2,
						ease: 'power2.inOut',
					})
					.to(descriptionRef.current, {
						fontSize: '0.7rem',
						lineHeight: 1.4,
						duration: 2,
						ease: 'power2.inOut',
					})

				// Play the timeline
				descriptionTl.play()

				// Create a reveal animation when the component enters the viewport
				gsap.fromTo(
					containerRef.current,
					{
						y: 30,
						opacity: 0,
						scale: 0.95,
					},
					{
						y: 0,
						opacity: 1,
						scale: 1,
						duration: 0.8,
						ease: 'power2.out',
						scrollTrigger: {
							trigger: containerRef.current,
							start: 'top bottom-=100',
							end: 'top center',
							scrub: 0.5,
							// markers: true, // Uncomment for debugging
							once: true,
						},
					},
				)
			}, containerRef) // Scope all animations to the container

			// Cleanup function
			return () => ctx.revert()
		},
		{ scope: containerRef },
	)

	// Handle hover state changes with GSAP
	useGSAP(
		() => {
			if (!containerRef.current) return

			const hoverTl = gsap.timeline({ paused: true })

			// Container scale animation
			hoverTl.to(
				containerRef.current,
				{
					scale: 1.02,
					duration: 0.3,
					ease: 'power2.out',
				},
				0,
			)

			// Button scale and glow animation
			if (buttonRef.current) {
				hoverTl.to(
					buttonRef.current,
					{
						scale: 1.05,
						duration: 0.3,
						ease: 'back.out(1.5)',
					},
					0,
				)
			}

			// Arrow movement animation
			if (arrowRef.current) {
				hoverTl.to(
					arrowRef.current,
					{
						x: 5,
						duration: 0.2,
						ease: 'power1.out',
					},
					0,
				)
			}

			// Play or reverse the timeline based on hover state
			if (isHovering) {
				hoverTl.play()
			} else {
				hoverTl.reverse()
			}

			return () => {
				hoverTl.kill()
			}
		},
		{ scope: containerRef, dependencies: [isHovering] },
	)

	return (
		<Link href="/services#ux-design">
			<div
				ref={containerRef}
				className="group flex flex-1 w-full h-full min-h-[6rem]  p-8 cursor-pointer"
				onMouseEnter={() => setIsHovering(true)}
				onMouseLeave={() => setIsHovering(false)}
			>
				<div className="w-full h-full rounded-xl border border-neutral-100 dark:border-white/[0.2] bg-black/5 backdrop-blur-sm overflow-hidden">
					{/* Design Preview Header */}
					<div className="flex items-center px-4 py-2 bg-neutral-100 dark:bg-black/20 border-b border-neutral-200 dark:border-white/[0.1]">
						<div className="flex space-x-2">
							{['#FF5F56', '#FFBD2E', '#27C93F'].map((color, i) => (
								<div
									key={i}
									ref={(el) => {
										headerDotsRef.current[i] = el
										return undefined
									}}
									className="w-3 h-3 rounded-full"
									style={{ backgroundColor: color }}
								/>
							))}
						</div>
						<div className="flex-1 text-center">
							<span className="text-xs text-neutral-500 dark:text-neutral-400">fluid design</span>
						</div>
					</div>

					{/* Fluid Design Preview Content */}
					<div className="p-4 h-[calc(100%-3rem)] flex flex-col relative">
						<div className="flex items-center justify-between mb-3">
							<div
								ref={taglineRef}
								className="text-[10px] text-primary-600/70 italic truncate max-w-[60%]"
							>
								Because responsive is so 2010
							</div>

							<div
								ref={buttonRef}
								className="p-1.5 rounded-lg bg-primary-500/10 flex items-center group/button"
							>
								<span className="text-xs text-primary-500 flex items-center gap-1">
									View Service
									<div ref={arrowRef} className="inline-block">
										<Icon icon="heroicons:arrow-right" className="w-3 h-3" />
									</div>
								</span>
							</div>
						</div>

						{/* Fluid Design Demo */}
						<div className="bg-neutral-50 dark:bg-black/30 rounded-xl border border-neutral-200/40 dark:border-white/[0.1] flex-1 overflow-hidden p-5 flex flex-col relative">
							{/* Browser Size Slider */}
							<div className="flex items-center gap-2 h-6">
								<span className="text-[10px] text-neutral-500">Browser Size</span>
								<div className="flex-1 h-1 bg-neutral-200 dark:bg-white/10 rounded-full relative">
									<div
										ref={sliderTrackRef}
										className="absolute inset-y-0 left-0 bg-primary-500/40 rounded-full will-change-[width] transform-gpu"
										style={{ width: '20%' }}
									/>
									<div
										ref={sliderThumbRef}
										className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-primary-500/40 shadow-sm will-change-transform transform-gpu"
										style={{ left: '20%' }}
									/>
								</div>
							</div>

							{/* Fluid Typography Demo */}
							<div className="h-[140px] relative mt-2">
								<div
									ref={typographyContainerRef}
									className="absolute inset-0 flex flex-col items-center justify-center text-center px-2 will-change-transform transform-gpu"
									style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
								>
									<div className="h-14 flex items-center justify-center">
										<div
											ref={fluidTextRef}
											className="text-primary-500 font-medium max-w-full overflow-visible leading-relaxed will-change-[font-size,letter-spacing] transform-gpu"
											style={{
												fontSize: '1rem',
												letterSpacing: '-0.01em',
												background:
													'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #8b5cf6, #3b82f6)',
												WebkitBackgroundClip: 'text',
												WebkitTextFillColor: 'transparent',
												backgroundSize: '200% 100%',
												backgroundPosition: '0% 50%',
												textShadow: '0 0 1px rgba(59, 130, 246, 0.1)',
											}}
										>
											Fluid Typography
										</div>
									</div>
									<div className="h-12 flex items-center justify-center w-full">
										<div
											ref={descriptionRef}
											className="text-neutral-600 max-w-[70%] mx-auto flex items-center justify-center will-change-[font-size,line-height] transform-gpu"
											style={{
												fontSize: '0.7rem',
												lineHeight: 1.4,
											}}
										>
											<span
												className="text-center w-full min-h-[2.8em]"
												style={{
													display: '-webkit-box',
													WebkitLineClamp: 2,
													WebkitBoxOrient: 'vertical',
													overflow: 'hidden',
													maxWidth: '100%',
													wordBreak: 'break-word',
												}}
											>
												We scale text smoothly across all screen sizes. No more jarring jumps at
												breakpoints.
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Link>
	)
}

const serviceItems = [
	{
		title: 'Web Development',
		description:
			'Cutting-edge websites built with Next.js, React, and Payload CMS—designed to captivate, convert, and keep you ahead of the curve.',
		header: <ServiceSkeletonOne />,
		className: 'md:col-span-2',
		icon: 'heroicons:code-bracket',
	},
	{
		title: 'Custom Software',
		description:
			'Bespoke, cloud-native platforms that solve complex challenges and scale as you grow—without the enterprise bloat.',
		header: <ServiceSkeletonTwo />,
		className: 'md:col-span-1',
		icon: 'heroicons:command-line',
	},
	{
		title: 'Digital Strategy',
		description:
			'Strategic guidance from initial concept to full-scale transformation. We align people, processes, and technology to propel your business forward.',
		header: <ServiceSkeletonThree />,
		className: 'md:col-span-1',
		icon: 'heroicons:presentation-chart-line',
	},
	{
		title: 'UX & Web Design',
		description:
			'Blending style and substance for intuitive, on-brand experiences that adapt effortlessly to every device. Our advanced fluid design techniques go beyond standard responsiveness—ensuring every screen is dynamic, delightful, and user-focused. Responsive is like a staircase, fluid design is like melted butter.',
		header: <ServiceSkeletonFour />,
		className: 'md:col-span-2',
		icon: 'heroicons:paint-brush',
	},
]

export function ServicesSection({ page }: ServicesSectionProps) {
	// Get section data from page
	const data = page?.servicesSection
	const title = data?.title || 'Our Service Offerings'
	const subtitle =
		data?.subtitle || 'Delivering Modern End-to-End Digital Solutions Tailored to Your Vision'

	// Get service cards data
	const serviceCardOne = data?.serviceCardOne || serviceItems[0]
	const serviceCardTwo = data?.serviceCardTwo || serviceItems[1]
	const serviceCardThree = data?.serviceCardThree || serviceItems[2]
	const serviceCardFour = data?.serviceCardFour || serviceItems[3]

	// Update service items with data from page if available
	const updatedServiceItems = [
		{
			...serviceItems[0],
			title: serviceCardOne.title || serviceItems[0].title,
			description: serviceCardOne.description || serviceItems[0].description,
		},
		{
			...serviceItems[1],
			title: serviceCardTwo.title || serviceItems[1].title,
			description: serviceCardTwo.description || serviceItems[1].description,
		},
		{
			...serviceItems[2],
			title: serviceCardThree.title || serviceItems[2].title,
			description: serviceCardThree.description || serviceItems[2].description,
		},
		{
			...serviceItems[3],
			title: serviceCardFour.title || serviceItems[3].title,
			description: serviceCardFour.description || serviceItems[3].description,
		},
	]

	return (
		<section className="fl-my-2xl fl-py-l relative">
			<div className="u-container">
				<div className="">
					<div className="text-center fl-mb-s">
						<h2 className="fl-text-step-2 text-foreground font-medium mb-4">{title}</h2>
						<p className="fl-text-step-5 font-medium text-foreground max-w-4xl mx-auto">
							{subtitle}
						</p>
					</div>

					<div className="fl-mb-l text-center">
						<Button
							variant="bordered"
							size="lg"
							className="group"
							endContent={
								<Icon
									icon="heroicons:arrow-right"
									className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1"
								/>
							}
						>
							<Link href={'/services'}>Explore Our Full Services</Link>
						</Button>
					</div>

					<BentoGrid className="md:auto-rows-[32rem]">
						{updatedServiceItems.map((item, i) => (
							<BentoGridItem
								key={i}
								title={item.title}
								description={<span className="text-sm text-foreground/80">{item.description}</span>}
								header={item.header}
								className={cn('[&>p:text-lg]', item.className)}
								icon={<Icon icon={item.icon} className="h-4 w-4 text-foreground/60" />}
							/>
						))}
					</BentoGrid>
				</div>
			</div>
		</section>
	)
}
