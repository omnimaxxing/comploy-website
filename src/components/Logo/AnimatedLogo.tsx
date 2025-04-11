'use client'
import { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import { OmniPixelLogo } from '../Icons/OmniPixelLogo'

export const AnimatedLogo = () => {
	const containerRef = useRef<HTMLDivElement>(null)
	const logoRef = useRef<SVGSVGElement>(null)
	const glowRef = useRef<HTMLDivElement>(null)
	const glowInnerRef = useRef<HTMLDivElement>(null)
	const particlesRef = useRef<HTMLDivElement>(null)
	const particles = useRef<HTMLDivElement[]>([])
	const timelineRef = useRef<gsap.core.Timeline | null>(null)
	const isExitingRef = useRef(false)

	// Function to handle exit animation
	const exitAnimation = useCallback(() => {
		if (!timelineRef.current || isExitingRef.current || !containerRef.current) return
		isExitingRef.current = true

		const tl = gsap.timeline({
			onComplete: () => {
				if (containerRef.current?.parentElement) {
					gsap.to(containerRef.current.parentElement, {
						opacity: 0,
						duration: 0.15,
						ease: 'power3.out',
						onComplete: () => {
							// Don't manually remove DOM elements, just dispatch the event
							// containerRef.current?.parentElement?.remove()
							window.dispatchEvent(new CustomEvent('exitComplete'))
						},
					})
				}
			},
		})

		tl.to(logoRef.current, {
			scale: 1.1,
			y: -10,
			rotateY: -10,
			filter: 'blur(4px)',
			opacity: 0,
			duration: 0.3,
			ease: 'power3.out',
		})
			.to(
				particles.current,
				{
					opacity: 0,
					scale: 0,
					stagger: {
						each: 0.01,
						from: 'random',
					},
					duration: 0.2,
				},
				'-=0.2',
			)
			.to(
				[glowRef.current, glowInnerRef.current],
				{
					opacity: 0,
					scale: 1.2,
					duration: 0.2,
					ease: 'power2.in',
				},
				'-=0.15',
			)
	}, [])

	useEffect(() => {
		const ctx = gsap.context(() => {
			// Create particles
			const particlesContainer = particlesRef.current
			if (particlesContainer) {
				particlesContainer.innerHTML = ''
				particles.current = []

				for (let i = 0; i < 20; i++) {
					const particle = document.createElement('div')
					particle.className = 'absolute w-1 h-1 rounded-full bg-primary/20 motion-reduce:hidden'
					particlesContainer.appendChild(particle)
					particles.current.push(particle)

					gsap.set(particle, {
						x: gsap.utils.random(-120, 120),
						y: gsap.utils.random(-80, 80),
						scale: gsap.utils.random(0.3, 2),
						opacity: 0,
					})
				}
			}

			// Set initial states only if refs exist
			if (logoRef.current && glowRef.current && glowInnerRef.current) {
				gsap.set([logoRef.current, glowRef.current, glowInnerRef.current], {
					opacity: 0,
				})

				gsap.set(logoRef.current, {
					scale: 1.2,
					y: 20,
					filter: 'blur(10px)',
					rotateY: 15,
					opacity: 0,
					transformPerspective: 1000,
				})

				// Create and start animation timeline
				timelineRef.current = gsap.timeline({
					onComplete: () => {
						setTimeout(() => {
							exitAnimation()
						}, 100)
						window.dispatchEvent(new CustomEvent('lottieComplete'))
					},
					defaults: {
						duration: 0.3,
						ease: 'power2.out',
					},
				})

				const tl = timelineRef.current

				// Enhanced animation sequence with faster timings
				tl.to(glowRef.current, {
					opacity: 0.4,
					duration: 0.3,
					ease: 'power2.out',
				})
					.to(
						particles.current,
						{
							opacity: 0.6,
							stagger: {
								each: 0.02,
								from: 'random',
							},
							duration: 0.4,
							ease: 'power1.out',
						},
						'-=0.2',
					)
					.to(
						logoRef.current,
						{
							opacity: 1,
							rotateY: 0,
							duration: 0.4,
							ease: 'power2.out',
						},
						'-=0.3',
					)
					.to(
						glowInnerRef.current,
						{
							opacity: 0.5,
							duration: 0.3,
							ease: 'power2.out',
						},
						'-=0.25',
					)
					.to(
						logoRef.current,
						{
							scale: 1,
							y: 0,
							filter: 'blur(0px)',
							duration: 0.4,
							ease: 'back.out(1.2)',
						},
						'-=0.2',
					)
					.to(
						particles.current,
						{
							x: 0,
							y: 0,
							opacity: 0,
							scale: 0.3,
							stagger: {
								each: 0.01,
								from: 'random',
							},
							duration: 0.3,
							ease: 'power3.inOut',
						},
						'-=0.2',
					)
					.to(
						[glowRef.current, glowInnerRef.current],
						{
							opacity: 0,
							scale: 0.8,
							duration: 0.2,
							ease: 'power2.inOut',
						},
						'-=0.1',
					)
			}
		}, containerRef)

		return () => {
			if (timelineRef.current) {
				timelineRef.current.kill()
			}
			ctx.revert()
		}
	}, [exitAnimation])

	return (
		<div
			ref={containerRef}
			className="relative flex items-center justify-center h-screen w-screen bg-transparent perspective-[1000px] will-change-transform"
		>
			<div
				ref={particlesRef}
				className="absolute inset-0 overflow-hidden will-change-transform motion-reduce:hidden"
			/>

			<div
				ref={glowRef}
				className="absolute w-[500px] h-[200px] will-change-transform motion-reduce:hidden"
				style={{
					background:
						'radial-gradient(ellipse at center, rgba(var(--primary-rgb), 0.25) 0%, transparent 70%)',
					filter: 'blur(40px)',
					transform: 'translate(-50%, -50%)',
					left: '50%',
					top: '50%',
				}}
			/>

			<div
				ref={glowInnerRef}
				className="absolute w-[400px] h-[150px] will-change-transform motion-reduce:hidden"
				style={{
					background:
						'radial-gradient(ellipse at center, rgba(var(--primary-rgb), 0.35) 0%, transparent 60%)',
					filter: 'blur(20px)',
					transform: 'translate(-50%, -50%)',
					left: '50%',
					top: '50%',
				}}
			/>

			<OmniPixelLogo
				ref={logoRef}
				className="relative will-change-transform preserve-3d opacity-0 w-[300px] h-auto"
			/>
		</div>
	)
}
