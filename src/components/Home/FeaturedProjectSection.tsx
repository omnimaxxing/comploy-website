'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from '@iconify/react'
import { Button } from '@heroui/react'
import Image from 'next/image'
import { cn } from '@heroui/react'
import type { HomeGlobal } from '@/payload-types'

gsap.registerPlugin(ScrollTrigger)

type FeaturedProjectSectionProps = {
	page: HomeGlobal
}

export function FeaturedProjectSection({ page }: FeaturedProjectSectionProps) {
	const sectionRef = useRef(null)
	const headerRef = useRef(null)
	const imageRef = useRef(null)
	const imageInnerRef = useRef(null)
	const windowFrameRef = useRef(null)
	const windowShineRef = useRef(null)
	const statsRef = useRef(null)
	const challengeRef = useRef(null)
	const approachRef = useRef(null)
	const ctaRef = useRef(null)
	const approachItemsRef = useRef<(HTMLDivElement | null)[]>([])
	const [isInView, setIsInView] = useState(false)
	const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

	// Get section data from page
	const title = page?.title
	const chip = page?.chip
	const subtitle = page?.subtitle
	const projectImage = page?.projectImage
	const stats = page?.stats || []
	const challenge = page?.challenge
	const approach = page?.approach

	// Handle mouse movement for the parallax effect
	const handleMouseMove = (e: React.MouseEvent) => {
		if (!imageRef.current) return

		const rect = (imageRef.current as HTMLElement).getBoundingClientRect()
		const x = (e.clientX - rect.left) / rect.width - 0.5
		const y = (e.clientY - rect.top) / rect.height - 0.5

		setMousePosition({ x, y })

		// Move the shine effect with the mouse
		if (windowShineRef.current) {
			const shineX = e.clientX - rect.left
			const shineY = e.clientY - rect.top

			gsap.to(windowShineRef.current, {
				left: `${shineX}px`,
				top: `${shineY}px`,
				opacity: 0.15,
				duration: 0.5,
				ease: 'power2.out',
			})
		}
	}

	// Handle mouse leave for the shine effect
	const handleMouseLeave = () => {
		// Reset image position on mouse leave
		if (imageInnerRef.current) {
			gsap.to(imageInnerRef.current, {
				x: 0,
				y: 0,
				duration: 1,
				ease: 'power2.out',
			})
		}

		// Fade out the shine effect
		if (windowShineRef.current) {
			gsap.to(windowShineRef.current, {
				opacity: 0,
				duration: 0.5,
				ease: 'power2.out',
			})
		}
	}

	useEffect(() => {
		// Apply the mouse position to create a parallax effect
		if (imageInnerRef.current && isInView) {
			gsap.to(imageInnerRef.current, {
				x: mousePosition.x * 20, // Adjust the multiplier to control the effect intensity
				y: mousePosition.y * 20,
				duration: 1,
				ease: 'power2.out',
			})
		}
	}, [mousePosition, isInView])

	useEffect(() => {
		const section = sectionRef.current
		if (!section) return

		// Create a context to isolate GSAP animations
		const ctx = gsap.context(() => {
			// Set initial states for smoother animations
			gsap.set(
				[
					headerRef.current,
					imageRef.current,
					statsRef.current,
					challengeRef.current,
					approachRef.current,
					ctaRef.current,
				],
				{
					opacity: 0,
				},
			)

			// Create a main ScrollTrigger for the section
			const mainTrigger = ScrollTrigger.create({
				trigger: section,
				start: 'top 80%', // Start earlier - when the top of the section is 80% from the top of the viewport
				onEnter: () => setIsInView(true),
				onLeaveBack: () => setIsInView(false),
			})

			// Header animation - subtle fade up
			gsap.to(headerRef.current, {
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: headerRef.current,
					start: 'top 85%', // Start earlier
					toggleActions: 'play none none reverse',
				},
			})

			// Window frame reveal animation
			gsap.to(windowFrameRef.current, {
				opacity: 1,
				scale: 1,
				duration: 1.2,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: imageRef.current,
					start: 'top 85%',
					toggleActions: 'play none none reverse',
				},
			})

			// Image animation - scale and reveal with window effect
			gsap.to(imageRef.current, {
				opacity: 1,
				scale: 1,
				duration: 1.2,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: imageRef.current,
					start: 'top 85%', // Start earlier
					toggleActions: 'play none none reverse',
				},
			})

			// Parallax effect on scroll
			gsap.fromTo(
				imageInnerRef.current,
				{ y: -20 },
				{
					y: 20,
					ease: 'none',
					scrollTrigger: {
						trigger: imageRef.current,
						start: 'top bottom',
						end: 'bottom top',
						scrub: 0.5, // Smoother scrub
					},
				},
			)

			// Stats animation - staggered reveal
			gsap.to(statsRef.current, {
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: statsRef.current,
					start: 'top 85%', // Start earlier
					toggleActions: 'play none none reverse',
				},
			})

			// Animate individual stats with stagger
			gsap.to('.stat', {
				opacity: 1,
				y: 0,
				stagger: 0.15,
				duration: 0.6,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: statsRef.current,
					start: 'top 85%', // Start earlier
					toggleActions: 'play none none reverse',
				},
			})

			// Challenge section animation
			gsap.to(challengeRef.current, {
				opacity: 1,
				x: 0,
				duration: 0.8,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: challengeRef.current,
					start: 'top 85%', // Start earlier
					toggleActions: 'play none none reverse',
				},
			})

			// Approach section animation
			gsap.to(approachRef.current, {
				opacity: 1,
				x: 0,
				duration: 0.8,
				ease: 'power2.out',
				scrollTrigger: {
					trigger: approachRef.current,
					start: 'top 85%', // Start earlier
					toggleActions: 'play none none reverse',
				},
			})

			// Approach items staggered animation
			approachItemsRef.current.forEach((item, index) => {
				if (!item) return

				gsap.from(item, {
					opacity: 0,
					y: 20,
					duration: 0.5,
					delay: index * 0.1,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: approachRef.current,
						start: 'top 80%',
						toggleActions: 'play none none reverse',
					},
				})
			})

			// CTA animation with bounce effect
			gsap.to(ctaRef.current, {
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: 'back.out(1.5)',
				scrollTrigger: {
					trigger: ctaRef.current,
					start: 'top 90%', // Start earlier
					toggleActions: 'play none none reverse',
				},
			})
		}, sectionRef)

		// Cleanup animations on unmount
		return () => {
			ctx.revert() // This will clean up all GSAP animations created in this context
		}
	}, [])

	const approachItems = [
		{
			title: 'Advanced 3D Configurator',
			description:
				'Built with Three.js, enabling real-time, interactive previews so users can tweak paddle colors, patterns, and more—no static images required.',
			icon: 'heroicons:cube-transparent',
		},
		{
			title: 'AI-Driven Customization',
			description:
				'Powered by GROQ for lightning-fast prompt refinement and Flux for instant image generation—delivering the fastest commercially available AI customization pipeline.',
			icon: 'heroicons:cpu-chip',
		},
		{
			title: 'Dynamic Product Management',
			description:
				'Leveraged Next.js and Payload CMS to efficiently handle near-infinite product variants under one SKU—no bloated workarounds, no confusing catalog setups.',
			icon: 'heroicons:squares-2x2',
		},
		{
			title: 'Streamlined E-Commerce Flow',
			description:
				'Integrated Stripe for secure payments and Resend for automated emails, delivering an enterprise-grade checkout experience without the overhead.',
			icon: 'heroicons:shopping-cart',
		},
	]

	return (
		<section ref={sectionRef} className="py-32 relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage:
						'radial-gradient(circle at 50% 50%, rgba(var(--primary-rgb), 0.3) 0%, transparent 70%)',
				}}
			/>

			{/* Additional subtle background elements */}
			<div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-400/5 blur-3xl" />
			<div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-cyan-400/5 blur-3xl" />

			<div className="u-container relative z-10">
				<div className="max-w-7xl mx-auto">
					{/* Header - Prominent and Engaging */}
					<div ref={headerRef} className="text-center mb-20 opacity-0 transform translate-y-8">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/10 mb-6">
							<Icon icon="heroicons:star" className="w-4 h-4 text-primary" />
							<span className="text-sm font-medium text-primary">{chip || 'Featured Project'}</span>
						</div>
						<h2 className="header-title fl-text-step-5 font-medium text-foreground mb-4">
							{title || 'Reimagining E-Commerce with '}{' '}
							<span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
								3D Customization & AI
							</span>
						</h2>
						<p className="header-subtitle fl-text-step-0 text-foreground/70 max-w-2xl mx-auto">
							{subtitle ||
								'How we built a revolutionary product customization platform for Tigershark Pickleball'}
						</p>
					</div>

					{/* Window-like Image Container */}
					<div
						ref={imageRef}
						className="relative mb-24 opacity-0 transform scale-[0.98]"
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
					>
						{/* Refined, Apple-inspired frame */}
						<div ref={windowFrameRef} className="relative max-w-4xl mx-auto opacity-0 scale-[0.98]">
							{/* Subtle shadow for depth */}
							<div className="absolute -inset-1 bg-gradient-to-b from-white/5 to-black/5 rounded-3xl blur-md"></div>

							{/* Main container with minimal border */}
							<div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-black/5 backdrop-blur-sm border border-white/10">
								{/* Ultra-subtle highlight at the top edge */}
								<div className="absolute inset-x-0 top-0 h-[1px] bg-white/20"></div>

								{/* Minimal glass reflection */}
								<div className="absolute inset-0 bg-gradient-to-b from-white/8 to-transparent h-1/3 pointer-events-none z-10"></div>

								{/* Window shine effect - more subtle and refined */}
								<div
									ref={windowShineRef}
									className="absolute w-[400px] h-[400px] rounded-full bg-white opacity-0 pointer-events-none z-10 blur-2xl"
									style={{
										transform: 'translate(-50%, -50%)',
										mixBlendMode: 'soft-light',
									}}
								></div>

								{/* Image container with subtle parallax */}
								<div ref={imageInnerRef} className="absolute inset-0 will-change-transform">
									<Image
										src={
											typeof projectImage === 'object' && projectImage?.url
												? '/assets/images/ts_sc_grad.png'
												: '/assets/images/ts_sc_grad.png'
										}
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
										alt="Featured Project"
										className="object-cover"
										style={{ objectPosition: 'center center' }}
										priority
										quality={95}
										loading="eager"
									/>
								</div>
							</div>

							{/* Ultra-subtle bottom shadow */}
							<div className="absolute -bottom-4 inset-x-8 h-4 bg-black/10 blur-xl rounded-full opacity-50"></div>
						</div>

						<div
							ref={statsRef}
							className="mt-16 grid grid-cols-3 gap-8 md:gap-12 items-center opacity-0 transform translate-y-8 max-w-3xl mx-auto"
						>
							{stats.map((stat, index) => (
								<div
									key={index}
									className="stat opacity-0 flex flex-col items-center justify-center transform translate-y-4"
								>
									<div className="text-2xl md:text-3xl font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
										{stat.value}
									</div>
									<div className="text-sm text-foreground/60">{stat.label}</div>
								</div>
							))}
						</div>
					</div>

					{/* Details - Clear and Digestible */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
						{/* Challenge - Focused and Interactive */}
						<div
							ref={challengeRef}
							className="challenge space-y-6 opacity-0 transform -translate-x-8"
						>
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 backdrop-blur-sm">
								<Icon
									icon={challenge?.icon || 'heroicons:puzzle-piece'}
									className="w-4 h-4 text-foreground/70"
								/>
								<span className="text-sm font-medium text-foreground/70">
									{challenge?.label || 'The Challenge'}
								</span>
							</div>

							<h3 className="fl-text-step-2 font-medium text-foreground">
								{challenge?.title || 'Creating a Custom E-Commerce Experience'}
							</h3>

							<p className="text-foreground/80 leading-relaxed">
								{challenge?.description ||
									'Tigershark Pickleball needed a revolutionary online store where customers could personalize every aspect of their paddles—from color schemes and logos to AI-generated graphics. Traditional e-commerce platforms struggled with real-time 3D rendering and infinite product variants, especially on a startup-friendly budget.'}
							</p>

							<div className="flex flex-wrap gap-2 pt-2">
								{(challenge?.tags || ['Custom E-Commerce', '3D Configurator', 'AI-Driven']).map(
									(tag, index) => (
										<span
											key={index}
											className="px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-foreground border border-primary/10 transition-all duration-300 hover:bg-primary/20"
										>
											{typeof tag === 'object' ? tag.tag : tag}
										</span>
									),
								)}
							</div>

							<div className="pt-4">
								<Button
									variant="bordered"
									className="group border-foreground/20 hover:border-foreground/40"
									endContent={
										<Icon
											icon="heroicons:arrow-up-right"
											className="ml-2 w-5 h-5 transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
										/>
									}
									onPress={() =>
										window.open(
											challenge?.cta?.url || 'https://www.tigersharkpickleball.com',
											'_blank',
										)
									}
								>
									<span className="text-foreground">
										{challenge?.cta?.label || 'Visit Tigershark'}
									</span>
								</Button>
							</div>
						</div>

						{/* Approach - Visually Enhanced */}
						<div ref={approachRef} className="approach space-y-8 opacity-0 transform translate-x-8">
							<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 backdrop-blur-sm">
								<Icon
									icon={approach?.icon || 'heroicons:light-bulb'}
									className="w-4 h-4 text-foreground/70"
								/>
								<span className="text-sm font-medium text-foreground/70">
									{approach?.label || 'Our Approach'}
								</span>
							</div>

							<h3 className="fl-text-step-2 font-medium text-foreground">
								{approach?.title || 'Innovative Technical Solutions'}
							</h3>

							<div className="space-y-6">
								{(approach?.items || approachItems).map((item, index) => (
									<div
										key={index}
										ref={(el) => {
											approachItemsRef.current[index] = el
										}}
										className={cn(
											'flex gap-4 group p-4 rounded-xl transition-all duration-300',
											'hover:bg-foreground/5',
										)}
									>
										<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 transition-colors duration-300 group-hover:bg-primary/20">
											<Icon icon={item.icon} className="w-6 h-6 text-primary" />
										</div>
										<div>
											<h4 className="font-medium text-foreground mb-2">{item.title}</h4>
											<p className="text-sm text-foreground/80 leading-relaxed">
												{item.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
