'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface RadarAnimationProps {
	speed?: number
}

export const RadarAnimation = ({ speed = 0.5 }: RadarAnimationProps) => {
	const containerRef = useRef<HTMLDivElement>(null)
	const linesRef = useRef<HTMLDivElement[]>([])

	useEffect(() => {
		if (!containerRef.current) return

		// Create center ping dot
		const pingDot = document.createElement('div')
		pingDot.className = 'absolute w-2 h-2 bg-red-500/80 rounded-full'
		pingDot.style.left = '50%'
		pingDot.style.top = '50%'
		pingDot.style.transform = 'translate(-50%, -50%)'
		containerRef.current.appendChild(pingDot)

		// Create radar lines
		const numLines = 4
		linesRef.current = []

		for (let i = 0; i < numLines; i++) {
			const line = document.createElement('div')
			line.className = 'absolute w-full h-full origin-center'
			line.style.transform = `rotate(${(360 / numLines) * i}deg)`

			const lineInner = document.createElement('div')
			lineInner.className =
				'absolute h-px w-1/2 origin-left bg-gradient-to-r from-red-500/20 to-transparent'
			lineInner.style.left = '50%'
			lineInner.style.top = '50%'

			line.appendChild(lineInner)
			containerRef.current.appendChild(line)
			linesRef.current.push(lineInner)
		}

		// Create animations
		const ctx = gsap.context(() => {
			// Animate lines with staggered start
			linesRef.current.forEach((line, i) => {
				gsap.to(line, {
					rotate: 360,
					duration: 6 / speed, // Slower rotation
					repeat: -1,
					ease: 'none',
					delay: i * (6 / (4 * speed)), // Staggered start
				})
			})

			// Animate center dot
			gsap.to(pingDot, {
				scale: 1.5,
				opacity: 0.4,
				duration: 1.5,
				repeat: -1,
				yoyo: true,
				ease: 'power1.inOut',
			})
		})

		return () => {
			ctx.revert()
		}
	}, [speed])

	return <div ref={containerRef} className="absolute inset-0 overflow-hidden" />
}
