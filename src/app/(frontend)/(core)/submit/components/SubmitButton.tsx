'use client'

import React from 'react'
import { Button } from '@heroui/react'
import { useFormStatus } from 'react-dom'
import { Icon } from '@iconify/react'

interface SubmitButtonProps {
	children: React.ReactNode
	disabled?: boolean
	variant?: 'plugin' | 'showcase'
	className?: string
}

export function SubmitButton({
	children,
	disabled = false,
	variant = 'plugin',
	className = '',
}: SubmitButtonProps) {
	const { pending } = useFormStatus()

	// Styles based on variant
	const baseClasses =
		'relative rounded-none overflow-hidden group transition-all duration-500 shadow-lg font-medium'
	const iconClasses =
		'w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-500 -ml-4 group-hover:ml-2 group-hover:animate-[tail-wag_0.5s_ease-in-out]'

	// Plugin variant uses foreground color gradient
	// Showcase variant uses purple gradient
	const variantClasses = {
		plugin:
			'bg-gradient-to-r from-foreground/90 to-foreground hover:from-foreground hover:to-foreground/90 hover:shadow-foreground/20 text-background hover:shadow-[0_0_15px_rgba(255,255,255,0.3)]',
		showcase:
			'bg-gradient-to-r from-purple-400/90 to-purple-500 hover:from-purple-500 hover:to-purple-400/90 hover:shadow-purple-400/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
	}

	return (
		<Button
			type="submit"
			color="primary"
			isLoading={pending}
			disabled={disabled || pending}
			className={`${baseClasses} ${variantClasses[variant]} ${className}`}
		>
			{/* Pulse ring effect */}
			<div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500">
				<div className="absolute inset-0 rounded-lg border-2 border-foreground/30 animate-ping" />
			</div>

			{/* Content */}
			<div className="relative flex items-center">
				<span className="whitespace-nowrap">{children}</span>
				{variant === 'plugin' ? (
					<svg
						className={iconClasses}
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						style={{ transformOrigin: 'right center' }}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 7l5 5m0 0l-5 5m5-5H6"
						/>
					</svg>
				) : (
					<Icon
						icon="lucide:chevron-right"
						className={iconClasses}
						style={{ transformOrigin: 'right center' }}
					/>
				)}
			</div>
		</Button>
	)
}
