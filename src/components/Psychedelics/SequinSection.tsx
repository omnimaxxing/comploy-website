'use client' // Use client-side rendering for interactivity

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface Sequin {
	id: string
	x: number
	y: number
	flipped: boolean
}

interface SequinCanvasProps {
	svgImage: string
	width?: number
	height?: number
	sequinSize?: number
}

interface SequinProps {
	x: number
	y: number
	size: number
	flipped: boolean
	svgImage: string
}

export default function SequinCanvas({
	svgImage,
	width = 400,
	height = 400,
	sequinSize = 20,
}: SequinCanvasProps) {
	const [sequins, setSequins] = useState<Sequin[]>([])
	const canvasRef = useRef<HTMLDivElement>(null)
	const [isInteracting, setIsInteracting] = useState(false)

	// Generate sequin grid on mount
	useEffect(() => {
		const cols = Math.ceil(width / sequinSize)
		const rows = Math.ceil(height / sequinSize)
		const newSequins: Sequin[] = []

		for (let row = 0; row < rows; row++) {
			for (let col = 0; col < cols; col++) {
				newSequins.push({
					id: `${row}-${col}`,
					x: col * sequinSize,
					y: row * sequinSize,
					flipped: false,
				})
			}
		}
		setSequins(newSequins)
	}, [width, height, sequinSize])

	// Handle mouse interaction
	const handleInteraction = (
		e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
	) => {
		if (!canvasRef.current) return

		const rect = canvasRef.current.getBoundingClientRect()
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
		const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
		const mouseX = clientX - rect.left
		const mouseY = clientY - rect.top

		setSequins((prevSequins) =>
			prevSequins.map((sequin) => {
				const distance = Math.sqrt(
					Math.pow(mouseX - (sequin.x + sequinSize / 2), 2) +
						Math.pow(mouseY - (sequin.y + sequinSize / 2), 2),
				)
				return distance < sequinSize * 2 ? { ...sequin, flipped: true } : sequin
			}),
		)
	}

	// Reset sequins gradually
	useEffect(() => {
		if (!isInteracting) {
			const timer = setInterval(() => {
				setSequins((prevSequins) => {
					const hasFlipped = prevSequins.some((s) => s.flipped)
					if (!hasFlipped) {
						clearInterval(timer)
						return prevSequins
					}
					return prevSequins.map((sequin) => ({
						...sequin,
						flipped: Math.random() > 0.1 ? sequin.flipped : false,
					}))
				})
			}, 100)
			return () => clearInterval(timer)
		}
	}, [isInteracting])

	return (
		<div className="flex items-center justify-center py-16">
			<div
				ref={canvasRef}
				className="relative overflow-hidden bg-gray-900/50 backdrop-blur-sm rounded-lg cursor-pointer"
				style={{ width, height }}
				onMouseMove={handleInteraction}
				onTouchMove={handleInteraction}
				onMouseEnter={() => setIsInteracting(true)}
				onMouseLeave={() => setIsInteracting(false)}
				onTouchStart={() => setIsInteracting(true)}
				onTouchEnd={() => setIsInteracting(false)}
			>
				{/* Background gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-transparent" />

				{/* Sequin Grid */}
				{sequins.map((sequin) => (
					<Sequin
						key={sequin.id}
						x={sequin.x}
						y={sequin.y}
						size={sequinSize}
						flipped={sequin.flipped}
						svgImage={svgImage}
					/>
				))}
			</div>
		</div>
	)
}

// Individual Sequin Component
function Sequin({ x, y, size, flipped, svgImage }: SequinProps) {
	return (
		<motion.div
			className="absolute"
			style={{
				left: x,
				top: y,
				width: size,
				height: size,
				transformStyle: 'preserve-3d',
			}}
			initial={{ rotateY: 0 }}
			animate={{ rotateY: flipped ? 180 : 0 }}
			transition={{ duration: 0.3, ease: 'easeInOut' }}
		>
			{/* Front Face (Neutral) */}
			<div
				className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full shadow-inner"
				style={{ backfaceVisibility: 'hidden' }}
			/>
			{/* Back Face (SVG Portion) */}
			<div
				className="absolute inset-0 rounded-full overflow-hidden"
				style={{
					transform: 'rotateY(180deg)',
					backfaceVisibility: 'hidden',
					background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
				}}
			>
				<div
					className="absolute inset-0"
					style={{
						transform: `translate(${-x}px, ${-y}px)`,
						width: '400px',
						height: '400px',
						pointerEvents: 'none',
					}}
				>
					<Image
						src={svgImage}
						alt="Sequin SVG"
						fill
						style={{
							objectFit: 'contain',
						}}
						priority
					/>
				</div>
			</div>
		</motion.div>
	)
}
