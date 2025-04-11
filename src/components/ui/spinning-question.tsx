'use client'

import { cn } from '@heroui/react'

interface SpinningQuestionProps {
	className?: string
	color?: string
}

export default function SpinningQuestion({
	className,
	color = 'currentColor',
}: SpinningQuestionProps) {
	return (
		<div className={cn('relative inline-block', className)}>
			<div
				className="animate-spin-slow"
				style={{
					transformStyle: 'preserve-3d',
					perspective: '1000px',
					transformOrigin: 'center center',
				}}
			>
				<span
					className="inline-block font-medium"
					style={{
						color,
						textShadow: `0 0 10px ${color}40`,
					}}
				>
					?
				</span>
			</div>
		</div>
	)
}
