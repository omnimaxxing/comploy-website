'use client'

import { useRef, useEffect } from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import type { HomeGlobal } from '@/payload-types'

gsap.registerPlugin(ScrollTrigger)

type CallToActionSectionProps = {
	page: HomeGlobal
}

export function CallToActionSection({ page }: CallToActionSectionProps) {
	const sectionRef = useRef<HTMLDivElement>(null)
	const contentRef = useRef<HTMLDivElement>(null)
	const headingRef = useRef<HTMLHeadingElement>(null)
	const subheadingRef = useRef<HTMLParagraphElement>(null)
	const phoneRef = useRef<HTMLDivElement>(null)
	const buttonRef = useRef<HTMLAnchorElement>(null)

	useEffect(() => {
		if (!sectionRef.current || !contentRef.current) return

		// Set initial state for the entire content container
		gsap.set(contentRef.current, {
			opacity: 0,
			y: 40,
		})

		// Set initial state for the phone separately (just for scale)
		gsap.set(phoneRef.current, {
			scale: 0.9,
		})

		// Create a single unified timeline for smooth animation
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: sectionRef.current,
				start: 'top 75%',
				end: 'center center',
				toggleActions: 'play none none none',
				markers: false,
				scrub: false,
			},
			defaults: {
				ease: 'power3.out', // Smoother easing
				duration: 0.8, // Faster, more cohesive animation
			},
		})

		// Animate the entire content container as one unit
		tl.to(contentRef.current, {
			opacity: 1,
			y: 0,
		})
			// Animate the phone scale separately but simultaneously
			.to(
				phoneRef.current,
				{
					scale: 1,
					duration: 1,
					ease: 'back.out(1.2)',
				},
				'<',
			) // The '<' ensures this animation starts at the same time as the previous one

		// Add hover effect for the phone
		const button = buttonRef.current
		if (button) {
			button.addEventListener('mouseenter', () => {
				gsap.to(phoneRef.current, {
					rotation: 10,
					duration: 0.4,
					ease: 'power2.out',
				})
			})

			button.addEventListener('mouseleave', () => {
				gsap.to(phoneRef.current, {
					rotation: 0,
					duration: 0.6,
					ease: 'elastic.out(1, 0.5)',
				})
			})
		}

		return () => {
			// Cleanup
			if (button) {
				button.removeEventListener('mouseenter', () => {})
				button.removeEventListener('mouseleave', () => {})
			}
			ScrollTrigger.getAll().forEach((trigger) => {
				if (trigger.vars.trigger === sectionRef.current) {
					trigger.kill()
				}
			})
		}
	}, [])

	// Extract CTA data from page, or use defaults
	const ctaData = (page as any)?.ctaSection
	const title = ctaData?.title || 'This is literally a call to action'
	const subtitle =
		ctaData?.subtitle ||
		'Like what you see? We can build something just as captivating for your brand. Or better. Probably better, actually.'
	const buttonText = ctaData?.buttonText || 'Pick Up The Phone'
	const buttonLink = ctaData?.buttonLink || '/contact'

	return (
		<section
			ref={sectionRef}
			className="py-28 md:py-32 bg-gradient-to-b from-muted/30 to-muted/50 relative overflow-hidden"
		>
			{/* Background pattern */}
			<div className="absolute inset-0 pointer-events-none opacity-10">
				<div
					className="absolute inset-0"
					style={{
						backgroundImage:
							"url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3Ccircle cx='13' cy='13' r='1'/%3E%3C/g%3E%3C/svg%3E\")",
						backgroundSize: '24px 24px',
					}}
				></div>
			</div>

			<div className="u-container">
				<div ref={contentRef} className="max-w-6xl mx-auto text-center will-change-transform">
					<h2 ref={headingRef} className="fl-text-step-3 font-medium text-foreground mb-8 relative">
						{title}
					</h2>

					<div ref={phoneRef} className="w-48 h-48 mx-auto mb-8 will-change-transform">
						<DotLottieReact src="/anim/calling.json" loop autoplay className="w-full h-full" />
					</div>

					<p
						ref={subheadingRef}
						className="fl-text-step-1 text-foreground/80 max-w-3xl mx-auto mb-10"
					>
						{subtitle}
					</p>

					<Link
						href={buttonLink}
						ref={buttonRef}
						className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary-50 text-primary-900 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
					>
						{buttonText}
						<svg
							className="ml-2 h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M14 5l7 7m0 0l-7 7m7-7H3"
							/>
						</svg>
					</Link>
				</div>
			</div>
		</section>
	)
}
