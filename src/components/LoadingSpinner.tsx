'use client'

import { metronome } from 'ldrs'
import { useEffect } from 'react'

// Register the loading animation
metronome.register()

export default function LoadingSpinner() {
	return (
		<div className="flex h-screen items-center justify-center">
			<div className="text-center">
				<l-metronome size="40" speed="1.6" color="black"></l-metronome>
				<p className="mt-4 text-gray-600">Loading checkout...</p>
			</div>
		</div>
	)
}
