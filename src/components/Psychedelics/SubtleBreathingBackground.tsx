'use client'

import { useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { cn } from '@/utilities/cn'

interface SubtleBreathingBackgroundProps {
	className?: string
	accentClassName?: string
	intensity?: number
	speed?: number
}

export default function SubtleBreathingBackground({
	className = 'bg-background',
	accentClassName = 'bg-indigo-50',
	intensity = 0.1,
	speed = 0.5,
}: SubtleBreathingBackgroundProps) {
	const controls = useAnimation()

	useEffect(() => {
		controls.start({
			scale: [1, 1 + 0.02 * intensity, 1],
			opacity: [0.02, 0.08, 0.02],
			transition: {
				duration: 12 / speed,
				repeat: Number.POSITIVE_INFINITY,
				ease: 'easeInOut',
			},
		})
	}, [controls, intensity, speed])

	return (
		<div className={cn('fixed inset-0 w-full h-full -z-10', className)}>
			{/* Gradient overlays */}
			<motion.div
				className="absolute inset-0 w-full h-full"
				animate={controls}
				initial={{ opacity: 0.02 }}
			>
				{/* Center gradient */}
				<div
					className={cn('absolute inset-0 w-full h-full', accentClassName, 'opacity-[0.03]')}
					style={{
						maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)',
						WebkitMaskImage: 'radial-gradient(circle at 50% 50%, black, transparent 70%)',
					}}
				/>
				{/* Top left gradient */}
				<div
					className={cn('absolute inset-0 w-full h-full', accentClassName, 'opacity-[0.02]')}
					style={{
						maskImage: 'radial-gradient(circle at 0% 0%, black, transparent 60%)',
						WebkitMaskImage: 'radial-gradient(circle at 0% 0%, black, transparent 60%)',
					}}
				/>
				{/* Bottom right gradient */}
				<div
					className={cn('absolute inset-0 w-full h-full', accentClassName, 'opacity-[0.02]')}
					style={{
						maskImage: 'radial-gradient(circle at 100% 100%, black, transparent 60%)',
						WebkitMaskImage: 'radial-gradient(circle at 100% 100%, black, transparent 60%)',
					}}
				/>
			</motion.div>

			{/* Noise overlay */}
			<div
				className="absolute inset-0 w-full h-full mix-blend-overlay opacity-[0.01]"
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
					transform: 'scale(1.5)',
				}}
			/>
		</div>
	)
}
