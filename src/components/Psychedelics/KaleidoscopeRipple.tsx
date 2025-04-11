'use client'

import type React from 'react'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface KaleidoscopeRippleProps {
	children: React.ReactNode
	intensity?: number
	speed?: number
}

export default function KaleidoscopeRipple({
	children,
	intensity = 1,
	speed = 1,
}: KaleidoscopeRippleProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
	const mousePos = useRef({ x: 0, y: 0 })
	const animationRef = useRef<number>()
	const timeRef = useRef(0)

	useEffect(() => {
		if (!containerRef.current) return

		const updateDimensions = () => {
			if (containerRef.current) {
				const { width, height } = containerRef.current.getBoundingClientRect()
				setDimensions({ width, height })
			}
		}

		updateDimensions()
		window.addEventListener('resize', updateDimensions)
		return () => window.removeEventListener('resize', updateDimensions)
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const ctx = canvas.getContext('2d')
		if (!ctx) return

		const drawFractal = (x: number, y: number, size: number, depth: number) => {
			if (depth <= 0 || size < 1) return

			const time = timeRef.current * speed
			const hue = (time * 20) % 360

			ctx.save()
			ctx.translate(x, y)
			ctx.rotate(time * 0.2)

			// Create psychedelic color pattern
			const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size)
			gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.1)`)
			gradient.addColorStop(0.5, `hsla(${hue + 120}, 100%, 50%, 0.05)`)
			gradient.addColorStop(1, `hsla(${hue + 240}, 100%, 50%, 0)`)

			ctx.fillStyle = gradient
			ctx.beginPath()
			ctx.arc(0, 0, size, 0, Math.PI * 2)
			ctx.fill()

			// Recursive fractal pattern
			const newSize = size * 0.5
			const offset = size * 0.8
			const angleStep = (Math.PI * 2) / 6

			for (let i = 0; i < 6; i++) {
				const angle = i * angleStep + time
				const newX = Math.cos(angle) * offset
				const newY = Math.sin(angle) * offset
				drawFractal(newX, newY, newSize, depth - 1)
			}

			ctx.restore()
		}

		const animate = () => {
			if (!ctx || !canvas) return

			timeRef.current += 0.01

			// Clear canvas with fade effect
			ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
			ctx.fillRect(0, 0, canvas.width, canvas.height)

			// Draw ripple effect centered on mouse position
			const centerX = mousePos.current.x
			const centerY = mousePos.current.y

			// Draw multiple layers of fractals
			for (let i = 0; i < 3; i++) {
				const offset = (i * Math.PI) / 3
				const size = 100 * intensity * (1 + Math.sin(timeRef.current + offset))
				drawFractal(
					centerX + Math.cos(timeRef.current + offset) * 20,
					centerY + Math.sin(timeRef.current + offset) * 20,
					size,
					3,
				)
			}

			animationRef.current = requestAnimationFrame(animate)
		}

		// Start animation
		animate()

		return () => {
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
		}
	}, [intensity, speed])

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!containerRef.current) return
		const rect = containerRef.current.getBoundingClientRect()
		mousePos.current = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
		}
	}

	return (
		<motion.div
			ref={containerRef}
			className="relative overflow-hidden"
			onMouseMove={handleMouseMove}
			initial={{ scale: 1 }}
			whileHover={{ scale: 1.02 }}
			transition={{ type: 'spring', stiffness: 300, damping: 20 }}
		>
			{children}
			<canvas
				ref={canvasRef}
				width={dimensions.width}
				height={dimensions.height}
				className="absolute inset-0 pointer-events-none mix-blend-screen"
			/>
		</motion.div>
	)
}
