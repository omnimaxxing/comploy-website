'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@heroui/react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { HomeGlobal } from '@/payload-types'

gsap.registerPlugin(ScrollTrigger)

const processSteps = [
	{
		phase: '01',
		title: 'Discover & Strategize',
		description:
			"We begin by immersing ourselves in your business—uncovering goals, challenges, and inspirations. Through competitor analysis, tech stack discussions, and a deep-dive into your brand's vision, we build a strategic foundation for success.",
		tags: [
			{ tag: 'Stakeholder Interviews' },
			{ tag: 'Market Research' },
			{ tag: 'Technical Feasibility' },
			{ tag: 'SEO/Website Audits' },
		],
	},
	{
		phase: '02',
		title: 'Design & Prototype',
		description:
			"Next comes the creative blueprint. Starting with low-fidelity wireframes and evolving into polished, high-fidelity prototypes, we ensure every screen and user flow is crafted to reflect your brand's aesthetic and deliver top-notch UX",
		tags: [
			{ tag: 'Lo-fi Wireframes' },
			{ tag: 'Hi-fi Prototyping' },
			{ tag: 'User Experience Planning' },
			{ tag: 'Content Structure' },
		],
	},
	{
		phase: '03',
		title: 'Build & Refine',
		description:
			'With designs locked in, our developers bring your platform to life. We maintain transparent communication with weekly check-ins, and we guide you on populating your site or app with real content—powered by Payload CMS for seamless management.',
		tags: [
			{ tag: 'Agile Development' },
			{ tag: 'Technical Integration' },
			{ tag: 'QA Testing' },
			{ tag: 'Client Collaboration' },
		],
	},
	{
		phase: '04',
		title: 'Launch & Evolve',
		description:
			'When it\'s time to go live, we handle the rollout with precision—offering "hypercare" to squash bugs, ensure stability, and fine-tune performance. Beyond launch, we continue to optimize, add new features, and keep you ahead of the curve',
		tags: [
			{ tag: 'Launch Readiness' },
			{ tag: 'Performance Monitoring' },
			{ tag: 'Iterative Improvements' },
			{ tag: 'Long-term Maintenance' },
		],
	},
]

const getLottieIconForPhase = (phase: string) => {
	switch (phase) {
		case '01':
			return 'discover'
		case '02':
			return 'lightbulb'
		case '03':
			return 'robot'
		case '04':
			return 'launch'
		default:
			return 'lightbulb'
	}
}

type ProcessSectionProps = {
	page: HomeGlobal
}

export function ProcessSection({ page }: ProcessSectionProps) {
	const processRef = useRef<HTMLDivElement>(null)
	const processLineRef = useRef<HTMLDivElement>(null)
	const processItemsRef = useRef<(HTMLDivElement | null)[]>([])
	const timelineRef = useRef<gsap.core.Timeline | null>(null)

	// Get section data from page
	const data = page?.processSection
	const title = data?.title || 'Our Process'
	const subtitle = data?.subtitle || 'Turning Great Ideas into Tailor-Made Solutions'
	const steps = data?.steps || processSteps

	// Function to get the Lottie animation URL for a step
	const getLottieAnimationUrl = (step: any, index: number) => {
		// If the step has a custom Lottie animation, use that
		if (
			step.lottieAnimation &&
			typeof step.lottieAnimation === 'object' &&
			step.lottieAnimation.url
		) {
			return step.lottieAnimation.url
		}

		// If the step has a defaultAnimationName, use that
		if (step.defaultAnimationName) {
			return `/anim/${step.defaultAnimationName}.json`
		}

		// Otherwise, fall back to the default based on phase number
		return `/anim/${getLottieIconForPhase(`0${index + 1}`)}.json`
	}

	useEffect(() => {
		if (!processRef.current || !processLineRef.current || !processItemsRef.current) return

		// Set initial states
		gsap.set(processItemsRef.current, {
			opacity: 0,
			y: 50,
		})

		gsap.set(processLineRef.current, {
			scaleY: 0,
			transformOrigin: 'top',
		})

		// Create a timeline for the process section animations
		const processTl = gsap.timeline({
			scrollTrigger: {
				trigger: processRef.current,
				start: 'top 90%', // Trigger earlier (was 80%)
				end: 'bottom bottom',
				toggleActions: 'play none none reset', // Reset on scroll up
				once: false, // Allow re-triggering
				markers: false,
				onEnter: () => {
					// Ensure animation plays when section enters viewport
					if (processTl.progress() === 0) {
						processTl.play(0)
					}
				},
				onLeaveBack: () => {
					// Reset when scrolling back up
					processTl.progress(0)
				},
			},
		})

		// Add the connection line animation to the timeline
		processTl.to(
			processLineRef.current,
			{
				scaleY: 1,
				duration: 1.5,
				ease: 'power3.out',
			},
			0,
		)

		// Store event listeners for cleanup
		const eventListeners: { element: HTMLElement; type: string; handler: EventListener }[] = []

		// Animate each process step
		processItemsRef.current.forEach((item, index) => {
			if (!item) return

			const contentElements = item.querySelectorAll('.relative.group, .relative.aspect-square')
			const cardElement = item.querySelector('.process-card')
			const phaseElement = item.querySelector('.phase-number')
			const tagsContainer = item.querySelector('.tags-container')
			const tagElements = item.querySelectorAll('.tag')
			const lottieContainer = item.querySelector('.lottie-container')

			// Set 3D perspective on the card
			gsap.set(cardElement, {
				transformPerspective: 1000,
				transformStyle: 'preserve-3d',
				transformOrigin: 'center center',
			})

			// Set 3D perspective on the lottie container
			gsap.set(lottieContainer, {
				transformPerspective: 1000,
				transformStyle: 'preserve-3d',
				transformOrigin: 'center center',
			})

			// Create a separate timeline for each step with its own scroll trigger
			const stepTl = gsap.timeline({
				scrollTrigger: {
					trigger: item,
					start: 'top 95%', // Trigger significantly earlier (was 85%)
					end: 'center center',
					toggleActions: 'play none none reset', // Reset on scroll up
					once: false, // Allow re-triggering
					markers: false,
					id: `process-step-${index}`, // Add ID for debugging
					onEnter: () => {
						// Ensure animation plays when step enters viewport
						if (stepTl.progress() === 0) {
							stepTl.play(0)
						}
					},
				},
			})

			// Main item animation
			stepTl.to(
				item,
				{
					opacity: 1,
					y: 0,
					duration: 1,
					ease: 'power3.out',
				},
				0,
			)

			// Phase number animation
			stepTl.from(
				phaseElement,
				{
					scale: 0.5,
					opacity: 0,
					duration: 1.2,
					ease: 'elastic.out(1, 0.5)',
				},
				0.2,
			)

			// Stagger animate the content elements with 3D rotation
			stepTl.from(
				contentElements,
				{
					x: () => (index % 2 === 0 ? -50 : 50),
					opacity: 0,
					rotationY: () => (index % 2 === 0 ? 15 : -15),
					duration: 1.2,
					stagger: {
						each: 0.2,
						from: index % 2 === 0 ? 'start' : 'end',
					},
					ease: 'power3.out',
				},
				0.3,
			)

			// Stagger animate the tags
			stepTl.from(
				tagElements,
				{
					y: 20,
					opacity: 0,
					scale: 0.8,
					duration: 0.8,
					stagger: 0.1,
					ease: 'back.out(1.7)',
				},
				0.5,
			)

			// Add parallax effect on scroll - reduce the Y movement to prevent clipping
			if (cardElement) {
				gsap.to(cardElement, {
					y: -20, // Reduced from -30
					rotateX: index % 2 === 0 ? 2 : -2,
					rotateY: index % 2 === 0 ? -2 : 2,
					scrollTrigger: {
						trigger: item,
						start: 'top bottom',
						end: 'bottom top',
						scrub: true,
						toggleActions: 'play none none reverse',
					},
				})
			}

			// Add parallax effect for lottie container - reduce the Y movement to prevent clipping
			if (lottieContainer) {
				// Special handling for the robot animation (step 3) which has more vertical movement
				const isThirdStep = index === 2 // Step 3 is at index 2 (0-based)

				gsap.to(lottieContainer, {
					y: isThirdStep ? -20 : -30, // Less movement for robot animation
					rotateX: index % 2 === 0 ? -2 : 2,
					rotateY: index % 2 === 0 ? 2 : -2,
					scrollTrigger: {
						trigger: item,
						start: 'top bottom',
						end: 'bottom top',
						scrub: true,
						toggleActions: 'play none none reverse',
					},
				})
			}

			// Add hover animations for 3D effect
			if (cardElement && !window.matchMedia('(max-width: 768px)').matches) {
				const handleMouseMove = (e: MouseEvent) => {
					const card = e.currentTarget as HTMLElement
					const rect = card.getBoundingClientRect()
					const centerX = rect.left + rect.width / 2
					const centerY = rect.top + rect.height / 2
					const mouseX = e.clientX
					const mouseY = e.clientY

					// Calculate rotation based on mouse position - more subtle for Apple-like feel
					const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 3 // Reduced from 5
					const rotateX = -((mouseY - centerY) / (rect.height / 2)) * 3 // Reduced from 5

					// Find the glossy overlay and inner highlight elements
					const glossyOverlay = card.querySelector('.absolute.inset-0.rounded-3xl') as HTMLElement
					const innerHighlight = card.querySelector(
						'.absolute.inset-\\[1px\\].rounded-\\[22px\\]',
					) as HTMLElement

					// Calculate light position for dynamic highlight
					const lightX = (mouseX - rect.left) / rect.width
					const lightY = (mouseY - rect.top) / rect.height

					// Apply Apple-like subtle 3D transform and lighting effects
					gsap.to(card, {
						rotateX: rotateX,
						rotateY: rotateY,
						duration: 0.4,
						ease: 'power2.out',
						boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
					})

					// Update the glossy overlay gradient based on mouse position
					if (glossyOverlay) {
						gsap.to(glossyOverlay, {
							background: `linear-gradient(
								${135 + (lightX - 0.5) * 30}deg, 
								rgba(255, 255, 255, ${0.12 + lightY * 0.08}), 
								rgba(255, 255, 255, ${0.03 + lightX * 0.05}) 40%, 
								rgba(255, 255, 255, 0) 60%
							)`,
							duration: 0.4,
							ease: 'power2.out',
						})
					}

					// Update the inner highlight based on mouse position
					if (innerHighlight) {
						gsap.to(innerHighlight, {
							boxShadow: `inset 0 0 0 1px rgba(255, 255, 255, ${0.08 + (1 - lightY) * 0.08})`,
							duration: 0.4,
							ease: 'power2.out',
						})
					}
				}

				const handleMouseLeave = () => {
					const card = cardElement as HTMLElement
					const glossyOverlay = card.querySelector('.absolute.inset-0.rounded-3xl') as HTMLElement
					const innerHighlight = card.querySelector(
						'.absolute.inset-\\[1px\\].rounded-\\[22px\\]',
					) as HTMLElement

					// Reset card to original state with subtle elastic bounce
					gsap.to(cardElement, {
						rotateX: 0,
						rotateY: 0,
						duration: 0.6,
						ease: 'elastic.out(1, 0.4)', // More subtle elastic effect
						boxShadow:
							'0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(var(--foreground-rgb), 0.05)',
					})

					// Reset glossy overlay
					if (glossyOverlay) {
						gsap.to(glossyOverlay, {
							background:
								'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0) 60%)',
							duration: 0.6,
							ease: 'power2.out',
						})
					}

					// Reset inner highlight
					if (innerHighlight) {
						gsap.to(innerHighlight, {
							boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
							duration: 0.6,
							ease: 'power2.out',
						})
					}
				}

				cardElement.addEventListener('mousemove', handleMouseMove)
				cardElement.addEventListener('mouseleave', handleMouseLeave)

				// Store event listeners for cleanup
				eventListeners.push(
					{
						element: cardElement as HTMLElement,
						type: 'mousemove',
						handler: handleMouseMove as EventListener,
					},
					{
						element: cardElement as HTMLElement,
						type: 'mouseleave',
						handler: handleMouseLeave as EventListener,
					},
				)
			}

			// Add hover animations for Lottie container (Apple-style)
			if (lottieContainer && !window.matchMedia('(max-width: 768px)').matches) {
				const handleLottieMouseMove = (e: MouseEvent) => {
					const container = e.currentTarget as HTMLElement
					const rect = container.getBoundingClientRect()
					const centerX = rect.left + rect.width / 2
					const centerY = rect.top + rect.height / 2
					const mouseX = e.clientX
					const mouseY = e.clientY

					// Calculate rotation based on mouse position - subtle for Apple-like feel
					const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 2.5
					const rotateX = -((mouseY - centerY) / (rect.height / 2)) * 2.5

					// Apply subtle 3D transform only
					gsap.to(container, {
						rotateX: rotateX,
						rotateY: rotateY,
						scale: 1.02, // Subtle scale effect
						duration: 0.4,
						ease: 'power2.out',
					})

					// Also animate the Lottie animation itself
					const lottieElement = container.querySelector('.lottie-container') as HTMLElement
					if (lottieElement) {
						gsap.to(lottieElement, {
							scale: 1.05,
							duration: 0.4,
							ease: 'power2.out',
						})
					}
				}

				const handleLottieMouseLeave = () => {
					const container = lottieContainer as HTMLElement
					const lottieElement = container.querySelector('.lottie-container') as HTMLElement

					// Reset container to original state with subtle elastic bounce
					gsap.to(container, {
						rotateX: 0,
						rotateY: 0,
						scale: 1,
						duration: 0.6,
						ease: 'elastic.out(1, 0.4)', // Subtle elastic effect
					})

					// Reset Lottie element
					if (lottieElement) {
						gsap.to(lottieElement, {
							scale: 1,
							duration: 0.6,
							ease: 'elastic.out(1, 0.4)',
						})
					}
				}

				lottieContainer.addEventListener('mousemove', handleLottieMouseMove)
				lottieContainer.addEventListener('mouseleave', handleLottieMouseLeave)

				// Store event listeners for cleanup
				eventListeners.push(
					{
						element: lottieContainer as HTMLElement,
						type: 'mousemove',
						handler: handleLottieMouseMove as EventListener,
					},
					{
						element: lottieContainer as HTMLElement,
						type: 'mouseleave',
						handler: handleLottieMouseLeave as EventListener,
					},
				)
			}
		})

		// Add a fallback to ensure animations play even if scroll events are missed
		const checkVisibility = () => {
			if (!processRef.current) return

			const rect = processRef.current.getBoundingClientRect()
			const isVisible = rect.top < window.innerHeight && rect.bottom > 0

			if (isVisible && processItemsRef.current) {
				// Force opacity to 1 for all items that should be visible
				processItemsRef.current.forEach((item, index) => {
					if (!item) return

					const itemRect = item.getBoundingClientRect()
					const shouldBeVisible = itemRect.top < window.innerHeight && itemRect.bottom > 0

					if (shouldBeVisible && item.style.opacity === '0') {
						gsap.to(item, {
							opacity: 1,
							y: 0,
							duration: 0.8,
							ease: 'power3.out',
							overwrite: 'auto',
						})
					}
				})
			}
		}

		// Check visibility on load and scroll
		checkVisibility()
		window.addEventListener('scroll', checkVisibility, { passive: true })
		window.addEventListener('resize', checkVisibility, { passive: true })

		// Refresh ScrollTrigger when everything is loaded
		const refreshScrollTrigger = () => {
			ScrollTrigger.refresh(true)
		}

		window.addEventListener('load', refreshScrollTrigger)

		// Also refresh after a short delay to catch any layout shifts
		const refreshTimeout = setTimeout(refreshScrollTrigger, 1000)

		return () => {
			// Clean up all event listeners
			eventListeners.forEach(({ element, type, handler }) => {
				element.removeEventListener(type, handler)
			})

			// Remove window event listeners
			window.removeEventListener('scroll', checkVisibility)
			window.removeEventListener('resize', checkVisibility)
			window.removeEventListener('load', refreshScrollTrigger)
			clearTimeout(refreshTimeout)

			// Kill all ScrollTrigger instances
			ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
		}
	}, [])

	// Add keyframes for the pulse and travel animation
	const pulseAndTravelKeyframes = `
	@keyframes pulseAndTravel {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(-50px) scale(0.5);
		}
		20% {
			opacity: 1;
			transform: translateX(-50%) translateY(0) scale(1);
		}
		80% {
			opacity: 1;
			transform: translateX(-50%) translateY(50px) scale(1);
		}
		100% {
			opacity: 0;
			transform: translateX(-50%) translateY(100px) scale(0.5);
		}
	}

	@keyframes floatA {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	@keyframes floatB {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}
	`

	// Add the keyframes to the document head
	useEffect(() => {
		// Create style element if it doesn't exist
		if (!document.getElementById('process-section-keyframes')) {
			const styleEl = document.createElement('style')
			styleEl.id = 'process-section-keyframes'
			styleEl.innerHTML = pulseAndTravelKeyframes
			document.head.appendChild(styleEl)

			// Clean up on unmount
			return () => {
				const styleElement = document.getElementById('process-section-keyframes')
				if (styleElement) {
					styleElement.remove()
				}
			}
		}
	}, [])

	return (
		<section
			ref={processRef}
			className="py-32 relative bg-muted/30 overflow-hidden"
			style={{
				background:
					'linear-gradient(180deg, rgba(var(--muted-rgb), 0.2) 0%, rgba(var(--muted-rgb), 0.4) 100%)',
			}}
		>
			{/* Apple-style subtle background grain */}
			<div
				className="absolute inset-0 opacity-[0.03] pointer-events-none"
				style={{
					backgroundImage:
						"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
					backgroundRepeat: 'repeat',
					mixBlendMode: 'multiply',
				}}
			/>

			<div className="u-container">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-24">
						<h2 className="fl-text-step-2 text-foreground font-medium mb-4">{title}</h2>
						<p className="fl-text-step-5 font-medium text-foreground max-w-4xl mx-auto">
							{subtitle}
						</p>
					</div>

					<div className="relative">
						{/* Enhanced Connection Line with Apple-style gradient and pulse effect */}
						<div
							ref={processLineRef}
							className="absolute left-1/2 top-0 bottom-0 w-px"
							style={{
								background:
									'linear-gradient(to bottom, rgba(var(--primary-rgb), 0.5) 0%, rgba(var(--primary-rgb), 0.2) 50%, rgba(var(--primary-rgb), 0) 100%)',
								boxShadow: '0 0 15px 1px rgba(var(--primary-rgb), 0.15)',
							}}
						/>

						{/* Subtle animated dots along the connection line */}
						{[0, 1, 2, 3].map((i) => (
							<div
								key={i}
								className="absolute left-1/2 w-2 h-2 rounded-full -translate-x-1/2"
								style={{
									top: `${(i + 1) * 20}%`,
									background: 'rgba(var(--primary-rgb), 0.6)',
									boxShadow: '0 0 10px 2px rgba(var(--primary-rgb), 0.3)',
									animation: `pulseAndTravel 8s infinite ${i * 2}s ease-in-out`,
								}}
							/>
						))}

						{/* Process Steps */}
						<div className="space-y-32">
							{steps.map((step, index) => (
								<div
									key={index}
									ref={(el) => {
										processItemsRef.current[index] = el
									}}
									className="relative"
								>
									<div
										className={cn(
											'grid grid-cols-1 md:grid-cols-2 gap-8 items-center',
											index % 2 === 1 ? 'md:[direction:rtl]' : '',
										)}
									>
										<div
											className={cn(
												'process-card relative group pl-8 pr-6 py-8 sm:p-8 md:p-10 rounded-3xl backdrop-blur-sm will-change-transform mx-4 sm:mx-0',
												index % 2 === 1 ? 'md:translate-x-12' : 'md:-translate-x-12',
											)}
											style={{
												background: 'rgba(var(--foreground-rgb), 0.03)',
												boxShadow:
													'0 10px 30px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(var(--foreground-rgb), 0.05)',
												backdropFilter: 'blur(10px)',
											}}
										>
											{/* Apple-inspired glossy overlay with refined edge highlights */}
											<div
												className="absolute inset-0 rounded-3xl overflow-hidden"
												style={{
													background:
														'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03) 40%, rgba(255, 255, 255, 0) 60%)',
													borderTop: '1px solid rgba(255, 255, 255, 0.18)',
													borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
													borderRight: '1px solid rgba(0, 0, 0, 0.03)',
													borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
												}}
											/>

											{/* Apple-style inner highlight edge */}
											<div
												className="absolute inset-[1px] rounded-[22px] overflow-hidden pointer-events-none"
												style={{
													background: 'transparent',
													boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
												}}
											/>

											<div className="relative z-10">
												<div
													className="phase-number fl-text-step-6 font-medium text-foreground/20 mb-4"
													style={{
														textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
														willChange: 'transform',
														animation: `float${
															index % 2 === 0 ? 'A' : 'B'
														} 6s ease-in-out infinite`,
													}}
												>
													{`0${index + 1}`}
												</div>
												<h3 className="fl-text-step-2 font-medium text-foreground mb-4">
													{step.title}
												</h3>
												<p className="fl-text-step-0 text-foreground/80 mb-6">{step.description}</p>
												<div className="tags-container flex flex-wrap gap-2">
													{(step.tags || []).map((feature, fIndex) => (
														<span
															key={fIndex}
															className="tag px-3 py-1 rounded-full text-sm text-foreground/80"
															style={{
																backdropFilter: 'blur(4px)',
																background: 'rgba(var(--foreground-rgb), 0.04)',
																boxShadow:
																	'0 2px 5px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
															}}
														>
															{feature.tag}
														</span>
													))}
												</div>
											</div>
										</div>
										<div
											className={cn(
												'relative aspect-square rounded-3xl flex items-center justify-center overflow-visible will-change-transform',
												index % 2 === 1 ? 'md:-translate-x-12' : 'md:translate-x-12',
											)}
											style={{
												background: 'transparent',
												boxShadow: 'none',
											}}
										>
											{/* Removed frosted glass effect */}

											{/* Removed glow behind the icon */}

											{/* Add extra padding for the third step (robot animation) which has more vertical movement */}
											<div
												className={`lottie-container relative z-10 fl-p-s w-4/5 h-4/5 ${
													index === 2 ? 'scale-[0.85]' : ''
												}`}
												style={{
													padding: index === 2 ? '2rem' : '1rem',
												}}
											>
												<DotLottieReact
													src={getLottieAnimationUrl(step, index)}
													loop
													speed={0.5}
													autoplay
													className="w-full h-full"
												/>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
