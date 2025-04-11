'use client'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

gsap.registerPlugin(MotionPathPlugin)

export const LoadingAnimation = () => {
	const containerRef = useRef<HTMLDivElement>(null)
	const svgRef = useRef<SVGSVGElement>(null)
	const pathsRef = useRef<SVGPathElement[]>([])
	const particlesRef = useRef<SVGGElement>(null)
	const logoRef = useRef<SVGGElement>(null)

	useEffect(() => {
		if (!containerRef.current || !svgRef.current || !particlesRef.current || !logoRef.current)
			return

		// Create particles
		const particles = Array.from({ length: 30 }).map(() => {
			const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
			circle.setAttribute('r', (Math.random() * 2 + 1).toString())
			circle.setAttribute('fill', 'currentColor')
			circle.setAttribute('class', 'text-primary')
			particlesRef.current?.appendChild(circle)
			return circle
		})

		// Create the main timeline
		const tl = gsap.timeline({
			defaults: { ease: 'power2.inOut' },
		})

		// Initial setup
		gsap.set(particles, {
			xPercent: -50,
			yPercent: -50,
			transformOrigin: '50% 50%',
			opacity: 0,
		})

		// Setup paths for stroke animation
		const paths = pathsRef.current
		paths.forEach((path) => {
			const length = path.getTotalLength()
			gsap.set(path, {
				strokeDasharray: length,
				strokeDashoffset: length,
				opacity: 0.2,
			})
		})

		// Animate each path drawing
		paths.forEach((path, i) => {
			tl.to(
				path,
				{
					strokeDashoffset: 0,
					duration: 0.8,
					ease: 'power2.inOut',
				},
				i * 0.2,
			)
		})

		// Animate particles along paths
		particles.forEach((particle, i) => {
			const pathIndex = i % paths.length
			const path = paths[pathIndex]

			// Fade in particles
			tl.to(
				particle,
				{
					opacity: gsap.utils.random(0.3, 1),
					duration: 0.3,
					ease: 'power2.inOut',
				},
				1 + i * 0.02,
			)

			// Move particles along path
			tl.to(
				particle,
				{
					duration: 1.5,
					ease: 'power1.inOut',
					motionPath: {
						path: path,
						align: path,
						autoRotate: true,
						alignOrigin: [0.5, 0.5],
					},
				},
				1 + i * 0.02,
			)
		})

		// Logo animation
		tl.from(
			logoRef.current,
			{
				scale: 0.8,
				opacity: 0,
				duration: 1,
				ease: 'elastic.out(1, 0.3)',
			},
			1.5,
		)

		// Final animation and completion
		tl.to(
			particles,
			{
				opacity: 0,
				scale: 0,
				duration: 0.5,
				stagger: {
					each: 0.02,
					from: 'random',
				},
				ease: 'power2.in',
			},
			'+=1',
		)
			.to(
				paths,
				{
					opacity: 0,
					duration: 0.5,
					stagger: 0.1,
					ease: 'power2.in',
				},
				'<',
			)
			.to(
				logoRef.current,
				{
					scale: 1.1,
					opacity: 0,
					duration: 0.3,
					ease: 'power2.in',
					onComplete: () => {
						window.dispatchEvent(new CustomEvent('loadingComplete'))
					},
				},
				'<0.2',
			)

		// Fade out animation
		const fadeOut = () => {
			gsap.to(containerRef.current, {
				opacity: 0,
				duration: 0.5,
				ease: 'power2.inOut',
				onComplete: () => {
					if (containerRef.current) {
						containerRef.current.style.display = 'none'
					}
				},
			})
		}

		window.addEventListener('pageLoaded', fadeOut)

		return () => {
			window.removeEventListener('pageLoaded', fadeOut)
			tl.kill()
		}
	}, [])

	return (
		<div
			ref={containerRef}
			className="fixed inset-0 z-[9999] flex items-center justify-center bg-background"
			style={{
				backfaceVisibility: 'hidden',
			}}
		>
			<svg ref={svgRef} viewBox="-100 -100 200 200" className="w-[400px] h-[400px]">
				{/* Particle container */}
				<g ref={particlesRef} className="particles" />

				{/* Animated paths */}
				<path
					ref={(el) => {
						if (el) pathsRef.current[0] = el
					}}
					d="M-80,0 A80,80 0 1,1 80,0 A80,80 0 1,1 -80,0"
					stroke="currentColor"
					strokeWidth="1"
					fill="none"
					className="text-primary/20"
				/>
				<path
					ref={(el) => {
						if (el) pathsRef.current[1] = el
					}}
					d="M-60,-60 A84.85,84.85 0 1,1 60,60 A84.85,84.85 0 1,1 -60,-60"
					stroke="currentColor"
					strokeWidth="1"
					fill="none"
					className="text-primary/20"
				/>
				<path
					ref={(el) => {
						if (el) pathsRef.current[2] = el
					}}
					d="M0,-80 A80,80 0 1,1 0,80 A80,80 0 1,1 0,-80"
					stroke="currentColor"
					strokeWidth="1"
					fill="none"
					className="text-primary/20"
				/>

				{/* Logo container */}
				<g ref={logoRef} className="logo">
					<image
						href="/icons/omnipixel_text.svg"
						x="-50"
						y="-15"
						width="100"
						height="30"
						className="text-primary"
					/>
				</g>
			</svg>
		</div>
	)
}
