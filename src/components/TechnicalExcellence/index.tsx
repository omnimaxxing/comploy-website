'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'
import clsx from 'clsx'
import { RadarAnimation } from '@/components/RadarAnimation'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import type { HomeGlobal } from '@/payload-types'

gsap.registerPlugin(ScrollTrigger)

type TechnicalExcellenceProps = {
	page: HomeGlobal
}

const UptimeAnimation = () => {
	const canvasRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!canvasRef.current) return

		const ctx = gsap.context(() => {
			// Clear any existing children first
			while (canvasRef.current?.firstChild) {
				canvasRef.current.removeChild(canvasRef.current.firstChild)
			}

			// Create center status dot
			const dot = document.createElement('div')
			dot.className =
				'absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2'
			canvasRef.current?.appendChild(dot)

			gsap.to(dot, {
				scale: 1.2,
				opacity: 0.7,
				duration: 1,
				repeat: -1,
				yoyo: true,
				ease: 'sine.inOut',
			})

			// Create pulse rings with enhanced timing and darker opacity
			const rings: HTMLDivElement[] = []
			for (let i = 0; i < 2; i++) {
				const ring = document.createElement('div')
				ring.className = 'absolute inset-0 rounded-full border-[1.5px] border-[#8A8F8D]' // Darker gray color
				canvasRef.current?.appendChild(ring)
				rings.push(ring)

				gsap.set(ring, {
					scale: 0.7,
					opacity: 0.22, // Increased from 0.12 to 0.22 for better visibility
				})

				gsap.to(ring, {
					scale: 1.05,
					opacity: 0,
					duration: 4,
					repeat: -1,
					delay: i * 2,
					ease: 'expo.out',
					transformOrigin: 'center center',
				})
			}

			// Enhanced heartbeat line with refined gradient
			const line = document.createElement('div')
			line.className =
				'absolute h-[1.5px] w-[60%] left-[20%] bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent top-1/2 -translate-y-1/2' // Increased opacity from 30 to 40
			canvasRef.current?.appendChild(line)

			// Perfect heartbeat timing
			gsap.to(line, {
				keyframes: [
					{ scaleX: 1, opacity: 0.25, duration: 0.15 }, // Increased from 0.15 to 0.25
					{ scaleX: 1.15, opacity: 0.4, duration: 0.1 }, // Increased from 0.3 to 0.4
					{ scaleX: 1, opacity: 0.25, duration: 0.15 },
					{ scaleX: 1.08, opacity: 0.35, duration: 0.08 }, // Increased from 0.25 to 0.35
					{ scaleX: 1, opacity: 0.25, duration: 0.12 },
				],
				repeat: -1,
				repeatDelay: 1.6,
				ease: 'sine.inOut',
			})

			return () => {
				rings.forEach((ring: HTMLDivElement) => {
					ring.parentNode?.removeChild(ring)
				})
			}
		})

		return () => ctx.revert()
	}, [])

	return <div ref={canvasRef} className="absolute inset-0 overflow-hidden" />
}

const ComplianceAnimation = () => {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		const ctx = gsap.context(() => {
			// Create shield outline with refined glow
			const shield = document.createElement('div')
			shield.className = 'absolute inset-4 rounded-xl border-[1.5px] border-[#9CA19F]'
			containerRef.current?.appendChild(shield)

			// Add inner shield for depth
			const innerShield = document.createElement('div')
			innerShield.className =
				'absolute inset-[24%] rounded-lg border-[1px] border-[#9CA19F] opacity-20'
			containerRef.current?.appendChild(innerShield)

			// Enhanced scanning effect with refined gradient
			const scanner = document.createElement('div')
			scanner.className =
				'absolute inset-4 bg-gradient-to-b from-transparent via-amber-400/10 to-transparent rounded-xl'
			containerRef.current?.appendChild(scanner)

			// Perfect scanning timing
			gsap.fromTo(
				scanner,
				{ y: '-100%' },
				{
					y: '200%',
					duration: 4,
					repeat: -1,
					ease: 'power1.inOut',
					repeatDelay: 0.8,
				},
			)

			// Smoother inner shield rotation
			gsap.to(innerShield, {
				rotate: 360,
				duration: 25,
				repeat: -1,
				ease: 'none',
			})

			// Verification dots in perfect golden ratio spiral
			const positions = [
				{ left: '32%', top: '38%', delay: 0 },
				{ left: '58%', top: '42%', delay: 0.5 },
				{ left: '45%', top: '62%', delay: 1 },
			]

			positions.forEach((pos) => {
				const dot = document.createElement('div')
				dot.className = 'absolute w-1.5 h-1.5 rounded-full bg-amber-400'
				dot.style.left = pos.left
				dot.style.top = pos.top
				containerRef.current?.appendChild(dot)

				// Perfect pulse timing
				gsap.to(dot, {
					keyframes: [
						{ scale: 1, opacity: 0.2, duration: 0.5 },
						{ scale: 1.3, opacity: 0.4, duration: 0.5 },
						{ scale: 1, opacity: 0.2, duration: 0.5 },
					],
					repeat: -1,
					delay: pos.delay,
					repeatDelay: 1.5,
					ease: 'sine.inOut',
				})
			})
		})

		return () => ctx.revert()
	}, [])

	return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
}

const metrics = [
	{
		icon: 'heroicons:shield-check',
		value: '99.99%',
		label: 'Uptime',
		description: 'Enterprise-grade reliability with continuous monitoring and automated failover.',
	},
	{
		icon: 'heroicons:signal',
		value: '<100ms',
		label: 'Latency',
		description: 'Lightning-fast response times powered by edge computing and smart caching.',
	},
	{
		icon: 'heroicons:document-check',
		value: 'SOC 2',
		label: 'Compliant',
		description: 'Rigorous security standards and best practices for data protection.',
	},
]

export const TechnicalExcellence = ({ page }: TechnicalExcellenceProps) => {
	const cardsRef = useRef<HTMLDivElement>(null)
	const cardRefs = useRef<(HTMLDivElement | null)[]>([])

	// Get section data from page
	const data = page?.technicalExcellenceSection
	const title = data?.title || 'Technical Excellence'
	const subtitle = data?.subtitle || 'Enterprise-Grade Infrastructure'

	useEffect(() => {
		const mm = gsap.matchMedia()

		// Desktop Animation (3D perspective)
		mm.add('(min-width: 768px)', () => {
			if (!cardsRef.current) return

			// Reset perspective container
			gsap.set('.tech-cards-container', {
				perspective: 1000,
				clearProps: 'opacity',
			})

			cardRefs.current.forEach((card, index) => {
				if (!card) return

				// Calculate 3D transforms
				const rotationY = (1 - index) * 15
				const translateZ = Math.abs(index - 1) * -50
				const translateX = (index - 1) * 20

				// Reset card to initial state
				gsap.set(card, {
					clearProps: 'all',
					rotationY: rotationY * 2,
					z: translateZ * 1.5,
					x: translateX * 2,
					opacity: 0,
					transformOrigin: 'center center',
				})

				// Floating animation
				gsap.to(card, {
					y: 'random(-8, 8)',
					duration: 'random(2, 3)',
					repeat: -1,
					yoyo: true,
					ease: 'sine.inOut',
					delay: index * 0.2,
				})

				// Entrance animation
				gsap.to(card, {
					rotationY: rotationY,
					z: translateZ,
					x: translateX,
					opacity: 1,
					duration: 0.8,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: '.tech-cards-container',
						start: 'top 85%',
						end: 'top 65%',
						toggleActions: 'play none none reverse',
						once: true,
					},
				})

				// Create hover context for each card
				const hoverContext = gsap.context(() => {
					let hoverTween: gsap.core.Tween

					card.addEventListener('mouseenter', () => {
						if (hoverTween) hoverTween.kill()
						hoverTween = gsap.to(card, {
							rotationY: rotationY * 0.5,
							z: translateZ + 30,
							scale: 1.02,
							duration: 0.4,
							ease: 'power2.out',
							overwrite: true,
						})
					})

					card.addEventListener('mouseleave', () => {
						if (hoverTween) hoverTween.kill()
						hoverTween = gsap.to(card, {
							rotationY: rotationY,
							z: translateZ,
							x: translateX,
							scale: 1,
							duration: 0.5,
							ease: 'power2.inOut',
							overwrite: true,
						})
					})
				}, card)

				return () => hoverContext.revert()
			})
		})

		// Enhanced Mobile Animation (3D vertical stack)
		mm.add('(max-width: 767px)', () => {
			if (!cardsRef.current) return

			// Set container perspective for mobile
			gsap.set('.tech-cards-container', {
				perspective: 1000,
				transformStyle: 'preserve-3d',
			})

			cardRefs.current.forEach((card, index) => {
				if (!card) return

				// Calculate angles based on position in stack
				// Top card tilts back, middle is neutral, bottom tilts forward
				const rotationX = (1 - index) * 10 // This creates the tilt effect
				const translateZ = Math.abs(index - 1) * -20 // Subtle depth
				const translateY = index * 20 // Spacing between cards

				// Reset to initial state with 3D transforms
				gsap.set(card, {
					clearProps: 'all',
					rotationX: rotationX * 2,
					z: translateZ * 1.5,
					y: 50,
					opacity: 0,
					scale: 0.95,
					transformOrigin: 'center center',
					transformStyle: 'preserve-3d',
				})

				// Entrance animation
				gsap.to(card, {
					rotationX: rotationX,
					z: translateZ,
					y: translateY,
					opacity: 1,
					scale: 1,
					duration: 0.8,
					delay: index * 0.2,
					ease: 'power2.out',
					scrollTrigger: {
						trigger: card,
						start: 'top 85%',
						end: 'top 65%',
						toggleActions: 'play none none reverse',
						once: true,
					},
				})

				// Add hover effect for mobile
				const hoverContext = gsap.context(() => {
					let hoverTween: gsap.core.Tween

					card.addEventListener('touchstart', () => {
						if (hoverTween) hoverTween.kill()
						hoverTween = gsap.to(card, {
							rotationX: rotationX * 0.5,
							z: translateZ + 20,
							scale: 1.02,
							duration: 0.3,
							ease: 'power2.out',
							overwrite: true,
						})
					})

					card.addEventListener('touchend', () => {
						if (hoverTween) hoverTween.kill()
						hoverTween = gsap.to(card, {
							rotationX: rotationX,
							z: translateZ,
							y: translateY,
							scale: 1,
							duration: 0.4,
							ease: 'power2.inOut',
							overwrite: true,
						})
					})
				}, card)

				// Enhanced scroll parallax
				ScrollTrigger.create({
					trigger: card,
					start: 'top bottom',
					end: 'bottom top',
					scrub: 0.5,
					onUpdate: (self) => {
						const progress = self.progress
						gsap.to(card, {
							rotationX: rotationX + progress * 5, // Subtle rotation change on scroll
							y: translateY + progress * -10, // Slight upward movement
							z: translateZ + progress * -5, // Depth change
							duration: 0.1,
							ease: 'none',
						})
					},
				})

				return () => hoverContext.revert()
			})
		})

		return () => {
			mm.revert()
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
		}
	}, [])

	return (
		<section className="py-32 relative bg-muted/30">
			<div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
			<div className="u-container">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-24">
						<h2 className="fl-text-step-2 text-foreground font-medium mb-4">{title}</h2>

						<p className="fl-text-step-5 font-medium text-foreground max-w-4xl mx-auto">
							{subtitle}
						</p>
					</div>

					<div
						ref={cardsRef}
						className="tech-cards-container grid grid-cols-1 md:grid-cols-3 gap-6"
					>
						{metrics.map((metric, index) => (
							<motion.div
								key={index}
								ref={(el) => {
									cardRefs.current[index] = el
								}}
								className="relative transform-gpu"
								initial={false}
								transition={{ duration: 0.4, ease: 'power2.out' }}
							>
								<div className="relative space-y-6 p-8 bg-background/80 backdrop-blur-sm rounded-3xl border border-primary/10 h-full">
									{index === 0 && <UptimeAnimation />}
									{index === 1 && <RadarAnimation speed={0.5} />}
									{index === 2 && <ComplianceAnimation />}
									<div className="metric-icon-wrapper relative z-10 w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
										<Icon icon={metric.icon} className="w-6 h-6 text-[#9CA19F]" />
									</div>
									<div className="metric-value relative z-10 fl-text-step-6 font-medium text-foreground/90 mb-2 tracking-tight text-center">
										{metric.value}
									</div>
									<div className="relative z-10 text-sm font-medium text-[#9CA19F] mb-4 text-center">
										{metric.label}
									</div>
									<p className="relative z-10 text-foreground/70 text-center">
										{metric.description}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
