import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface FloatProps {
	children: ReactNode
	delay?: number
	duration?: number
	className?: string
	intensity?: 'subtle' | 'medium' | 'strong'
}

export default function Float({
	children,
	delay = 0,
	duration = 30,
	className = '',
	intensity = 'subtle',
}: FloatProps) {
	const [randomOffset] = useState(() => Math.random() * 2 - 1)

	const intensityMap = {
		subtle: 8,
		medium: 12,
		strong: 16,
	}

	const baseAmount = intensityMap[intensity]

	return (
		<motion.div
			initial={{ y: 0, x: 0, rotate: 0, scale: 1 }}
			animate={{
				y: [
					0,
					baseAmount * 0.4 + randomOffset,
					-baseAmount * 0.3 + randomOffset,
					baseAmount * 0.5 + randomOffset,
					-baseAmount * 0.4 + randomOffset,
					baseAmount * 0.3 + randomOffset,
					-baseAmount * 0.2 + randomOffset,
					baseAmount * 0.4 + randomOffset,
					0,
				],
				x: [
					0,
					baseAmount * 0.3 + randomOffset,
					baseAmount * 0.4 + randomOffset,
					-baseAmount * 0.3 + randomOffset,
					-baseAmount * 0.4 + randomOffset,
					baseAmount * 0.3 + randomOffset,
					-baseAmount * 0.2 + randomOffset,
					baseAmount * 0.3 + randomOffset,
					0,
				],
				rotate: [
					0,
					2 + randomOffset * 0.5,
					-1 + randomOffset * 0.5,
					1.5 + randomOffset * 0.5,
					-1.5 + randomOffset * 0.5,
					1 + randomOffset * 0.5,
					-0.5 + randomOffset * 0.5,
					0.8 + randomOffset * 0.5,
					0,
				],
				scale: [
					1,
					1.03 + randomOffset * 0.02,
					0.97 + randomOffset * 0.02,
					1.02 + randomOffset * 0.02,
					0.98 + randomOffset * 0.02,
					1.04 + randomOffset * 0.02,
					0.99 + randomOffset * 0.02,
					1.01 + randomOffset * 0.02,
					1,
				],
			}}
			transition={{
				duration: duration + randomOffset * 3,
				repeat: Infinity,
				repeatType: 'reverse',
				ease: [0.25, 0.1, 0.25, 1],
				times: [0, 0.12, 0.25, 0.37, 0.5, 0.63, 0.75, 0.87, 1],
			}}
			className={className}
		>
			{children}
		</motion.div>
	)
}
