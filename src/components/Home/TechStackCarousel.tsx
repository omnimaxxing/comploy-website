'use client'

import React, { useRef, useEffect, ReactElement } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ScrollingBanner from '@/components/ui/ScrollingBanner'
import type { HomeGlobal } from '@/payload-types'
import {
	SupabaseLogo,
	Logo1,
	Logo2,
	Logo3,
	Logo5,
	Logo6,
	Logo7,
	Logo8,
	Logo9,
	Logo10,
	Logo11,
} from './logos'

gsap.registerPlugin(ScrollTrigger)

type TechLogo = {
	name: string
	Logo: ReactElement<any> | React.FC<React.SVGProps<SVGSVGElement>>
}

// Tech stack logos using imported components
const techLogos: TechLogo[] = [
	{ name: 'Vercel', Logo: Logo1 },
	{ name: 'Next.js', Logo: Logo2 },

	{ name: 'TypeScript', Logo: Logo3 },
	{ name: 'Payload CMS', Logo: Logo5 },
	{ name: 'Prisma', Logo: Logo6 },
	{ name: 'Tailwind', Logo: Logo7 },
	{ name: 'GSAP', Logo: Logo8 },
	{ name: 'Supabase', Logo: SupabaseLogo },
	{ name: 'Figma', Logo: Logo10 },
]

// Duplicate the array to ensure smooth infinite scrolling
const allLogos = [...techLogos, ...techLogos]

type TechStackCarouselProps = {
	page: HomeGlobal
}

export function TechStackCarousel({ page }: TechStackCarouselProps) {
	const sectionRef = useRef<HTMLDivElement>(null)
	const titleRef = useRef<HTMLHeadingElement>(null)
	const subtitleRef = useRef<HTMLParagraphElement>(null)

	useEffect(() => {
		if (!sectionRef.current) return

		// Initialize animations
		gsap.set([titleRef.current, subtitleRef.current], {
			opacity: 0,
			y: 20,
		})

		// Create timeline for the section
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: sectionRef.current,
				start: 'top 90%',
				end: 'center center',
				toggleActions: 'play none none none',
				markers: false,
			},
		})

		// Add animations to timeline
		tl.to(titleRef.current, {
			opacity: 1,
			y: 0,
			duration: 0.8,
			ease: 'power3.out',
		}).to(
			subtitleRef.current,
			{
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: 'power3.out',
			},
			'-=0.6',
		)

		return () => {
			// Cleanup
			ScrollTrigger.getAll().forEach((trigger) => {
				if (trigger.vars.trigger === sectionRef.current) {
					trigger.kill()
				}
			})
		}
	}, [])

	// Extract data from page, or use defaults
	const techStackData = (page as any)?.techStackSection
	const title = techStackData?.title || 'Built with Modern Tech'
	const subtitle =
		techStackData?.subtitle ||
		'We leverage cutting-edge technologies to build scalable, performant solutions'

	return (
		<section
			ref={sectionRef}
			className="py-16 md:py-20 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden"
		>
			<div className="u-container mb-8">
				<div className="max-w-4xl mx-auto text-center">
					<h2 ref={titleRef} className="fl-text-step-2 font-medium text-foreground mb-4">
						{title}
					</h2>
					<p ref={subtitleRef} className="fl-text-step-0 text-foreground/70">
						{subtitle}
					</p>
				</div>
			</div>

			<div className="py-6">
				{/* Single row - left to right */}
				<ScrollingBanner duration={30} gap="3rem">
					{allLogos.map((tech, index) => {
						return (
							<div
								key={`${tech.name}-${index}`}
								className="flex flex-col items-center justify-center px-4 py-2"
							>
								<div className="w-20 h-20 md:w-24 md:h-24 relative flex items-center justify-center bg-white/5 rounded-xl p-3 backdrop-blur-sm">
									{typeof tech.Logo === 'function' ? (
										<tech.Logo
											width="48"
											height="48"
											className="object-contain w-full h-full filter grayscale hover:grayscale-0 transition-all duration-300"
										/>
									) : (
										<div className="w-full h-full flex items-center justify-center">
											{React.cloneElement(tech.Logo as ReactElement<any>, {
												width: '48',
												height: '48',
												className:
													'object-contain w-full h-full filter grayscale hover:grayscale-0 transition-all duration-300',
											})}
										</div>
									)}
								</div>
								<span className="mt-3 text-sm text-foreground/60">{tech.name}</span>
							</div>
						)
					})}
				</ScrollingBanner>
			</div>
		</section>
	)
}
