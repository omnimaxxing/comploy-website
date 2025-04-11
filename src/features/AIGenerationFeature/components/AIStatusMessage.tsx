'use client'

import React, { useEffect, useState } from 'react'

type AIStatusMessageProps = {
	message: string
	type: 'loading' | 'success' | 'error'
	duration?: number
	onDismiss?: () => void
}

export const AIStatusMessage: React.FC<AIStatusMessageProps> = ({
	message,
	type,
	duration = 3000,
	onDismiss,
}) => {
	const [visible, setVisible] = useState(true)

	useEffect(() => {
		const timer = setTimeout(() => {
			setVisible(false)
			if (onDismiss) {
				onDismiss()
			}
		}, duration)

		return () => {
			clearTimeout(timer)
		}
	}, [duration, onDismiss])

	if (!visible) return null

	return (
		<div className={`ai-status-message ${type}`}>
			{type === 'loading' && (
				<span className="loading-spinner">
					<svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<circle
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
							fill="none"
							strokeDasharray="31.4 31.4"
							strokeDashoffset="0"
							strokeLinecap="round"
						>
							<animateTransform
								attributeName="transform"
								type="rotate"
								from="0 12 12"
								to="360 12 12"
								dur="1s"
								repeatCount="indefinite"
							/>
						</circle>
					</svg>
				</span>
			)}
			{message}
		</div>
	)
}

export default AIStatusMessage
