'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface BreathingBackgroundProps {
	colorScheme?: 'psychedelic' | 'nature' | 'ocean' | 'sunset'
	intensity?: number
	speed?: number
	enableParticles?: boolean
	noiseIntensity?: number
}

export default function BreathingBackground({
	colorScheme = 'psychedelic',
	intensity = 1,
	speed = 1,
	enableParticles = true,
	noiseIntensity = 0.65,
}: BreathingBackgroundProps) {
	const particlesRef = useRef<HTMLCanvasElement>(null)
	const controls = useAnimation()

	// Color schemes inspired by different psychedelic experiences
	const colorSchemes = {
		psychedelic: [
			'hsl(320, 100%, 50%)',
			'hsl(260, 100%, 40%)',
			'hsl(180, 100%, 50%)',
			'hsl(300, 100%, 45%)',
		],
		nature: [
			'hsl(140, 80%, 30%)',
			'hsl(160, 70%, 40%)',
			'hsl(120, 90%, 35%)',
			'hsl(180, 60%, 45%)',
		],
		ocean: [
			'hsl(200, 100%, 40%)',
			'hsl(220, 90%, 30%)',
			'hsl(190, 95%, 35%)',
			'hsl(230, 85%, 45%)',
		],
		sunset: [
			'hsl(360, 100%, 50%)',
			'hsl(30, 100%, 50%)',
			'hsl(45, 100%, 60%)',
			'hsl(15, 100%, 55%)',
		],
	}

	const colors = colorSchemes[colorScheme]

	// Animate particles
	useEffect(() => {
		if (!enableParticles || !particlesRef.current) return

		const canvas = particlesRef.current
		const ctx = canvas.getContext('2d')
		if (!ctx) return

		// Set canvas size
		const resizeCanvas = () => {
			canvas.width = window.innerWidth
			canvas.height = window.innerHeight
		}
		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)

		// Particle system
		const particles: Array<{
			x: number
			y: number
			size: number
			speedX: number
			speedY: number
			hue: number
		}> = []

		const createParticle = () => {
			return {
				x: Math.random() * canvas.width,
				y: Math.random() * canvas.height,
				size: Math.random() * 3 + 1,
				speedX: (Math.random() - 0.5) * 0.5,
				speedY: (Math.random() - 0.5) * 0.5,
				hue: Math.random() * 60 - 30,
			}
		}

		// Initialize particles
		for (let i = 0; i < 50; i++) {
			particles.push(createParticle())
		}

		// Animation loop
		const animate = () => {
			ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			particles.forEach((particle) => {
				particle.x += particle.speedX
				particle.y += particle.speedY

				// Wrap around edges
				if (particle.x < 0) particle.x = canvas.width
				if (particle.x > canvas.width) particle.x = 0
				if (particle.y < 0) particle.y = canvas.height
				if (particle.y > canvas.height) particle.y = 0

				ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, 0.5)`
				ctx.beginPath()
				ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
				ctx.fill()
			})

			requestAnimationFrame(animate)
		}

		animate()

		return () => {
			window.removeEventListener('resize', resizeCanvas)
		}
	}, [enableParticles])

	// Breathing animation
	useEffect(() => {
		controls.start({
			scale: [1, 1 + 0.05 * intensity, 1],
			filter: ['hue-rotate(0deg)', `hue-rotate(${180 * intensity}deg)`, 'hue-rotate(360deg)'],
			transition: {
				duration: 8 / speed,
				repeat: Number.POSITIVE_INFINITY,
				ease: 'easeInOut',
			},
		})
	}, [controls, intensity, speed])

	return (
		<>
			<motion.div className="fixed inset-0 -z-10 overflow-hidden" animate={controls}>
				{/* Multiple gradient layers */}
				<motion.div
					className="absolute inset-0"
					style={{
						background: `
              radial-gradient(circle at 50% 50%, ${colors[0]}, transparent 60%),
              radial-gradient(circle at 0% 0%, ${colors[1]}, transparent 50%),
              radial-gradient(circle at 100% 100%, ${colors[2]}, transparent 50%),
              radial-gradient(circle at 0% 100%, ${colors[3]}, transparent 50%)
            `,
					}}
					animate={{
						scale: [1, 1.1, 1],
						rotate: [0, 5, 0],
					}}
					transition={{
						duration: 10 / speed,
						repeat: Number.POSITIVE_INFINITY,
						ease: 'easeInOut',
					}}
				/>

				{/* SVG Filters */}
				<svg className="hidden">
					<defs>
						<filter id="noise">
							<feTurbulence
								type="fractalNoise"
								baseFrequency={noiseIntensity}
								numOctaves="3"
								seed={Math.random() * 100}
							/>
							<feDisplacementMap in="SourceGraphic" scale={20 * intensity} />
						</filter>
						<filter id="blur">
							<feGaussianBlur stdDeviation="20" />
						</filter>
					</defs>
				</svg>

				{/* Noise overlay */}
				<div className="absolute inset-0 opacity-[0.15]" style={{ filter: 'url(#noise)' }} />
			</motion.div>

			{/* Particle system */}
			{enableParticles && <canvas ref={particlesRef} className="fixed inset-0 -z-10 opacity-30" />}
		</>
	)
}
