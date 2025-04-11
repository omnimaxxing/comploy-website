'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimationFrame, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/utilities/cn'

interface MeltingTextProps {
	text: string
	className?: string
	intensity?: number // 0-1
	speed?: number // 0-1
}

export default function MeltingText({
	text,
	className,
	intensity = 0.5,
	speed = 0.5,
}: MeltingTextProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const timeRef = useRef(0)
	const chars = text.split('')

	// Create a spring for smooth overall animation
	const springConfig = { damping: 30, stiffness: 150, mass: 1 }
	const flowProgress = useSpring(0, springConfig)

	// Animate continuously using requestAnimationFrame
	useAnimationFrame((time) => {
		timeRef.current = time * 0.001 * speed // Convert to seconds and apply speed
		// Create a smooth sine wave between 0 and 1
		const wave = (Math.sin(timeRef.current) + 1) * 0.5
		flowProgress.set(wave)
	})

	return (
		<motion.div
			ref={containerRef}
			className={cn('relative select-none', className)}
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
		>
			<div className="relative">
				{chars.map((char, i) => {
					// Create unique procedural animations for each character
					const charOffset = i * 0.1 // Offset each character in the wave
					const noiseOffset = Math.sin(i * 0.5) * 0.5 // Add some variation

					// Horizontal movement
					const xMovement = useTransform(
						flowProgress,
						[0, 0.5, 1],
						[0, Math.sin(i * 0.5) * 4 * intensity, 0],
					)

					// Vertical movement with wave effect
					const yMovement = useTransform(
						flowProgress,
						[0, 0.5, 1],
						[0, Math.cos(i * 0.3) * 6 * intensity + 3 * intensity, 0],
					)

					// Rotation that follows the flow
					const rotation = useTransform(
						flowProgress,
						[0, 0.5, 1],
						[0, (Math.sin(i * 0.2 + noiseOffset) * 8 - 4) * intensity, 0],
					)

					// Scale that pulses slightly
					const scale = useTransform(
						flowProgress,
						[0, 0.5, 1],
						[1, 1 + Math.sin(i * 0.4) * 0.1 * intensity, 1],
					)

					// Opacity that creates a flowing wave effect
					const opacity = useTransform(
						flowProgress,
						[0, 0.5, 1],
						[0.9, 0.7 + Math.sin(i * 0.3 + timeRef.current) * 0.2, 0.9],
					)

					return (
						<motion.span
							key={i}
							className="absolute inline-block origin-center"
							style={{
								left: `${i * 0.6}em`,
								x: xMovement,
								y: yMovement,
								rotate: rotation,
								scale: scale,
								opacity,
							}}
						>
							{/* Main character */}
							<span
								className="relative inline-block bg-gradient-to-b from-foreground/90 to-foreground/70 bg-clip-text text-transparent"
								style={{
									filter: `blur(${
										Math.abs(Math.sin(timeRef.current + i * 0.2)) * 0.5 * intensity
									}px)`,
								}}
							>
								{char}
							</span>

							{/* Glow effect */}
							<span
								className="absolute inset-0 inline-block bg-gradient-to-b from-foreground/30 to-transparent bg-clip-text text-transparent"
								style={{
									filter: `blur(${
										1 + Math.abs(Math.sin(timeRef.current + i * 0.2)) * intensity
									}px)`,
								}}
							>
								{char}
							</span>
						</motion.span>
					)
				})}

				{/* Base text for proper sizing */}
				<span className="invisible">{text}</span>
			</div>
		</motion.div>
	)
}
