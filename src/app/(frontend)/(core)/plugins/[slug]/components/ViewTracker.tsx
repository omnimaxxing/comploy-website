'use client'

import { useEffect } from 'react'
import { trackPluginView } from '../actions'

interface ViewTrackerProps {
	slug: string
}

export function ViewTracker({ slug }: ViewTrackerProps) {
	useEffect(() => {
		// Track the view after component mounts (client-side)
		const track = async () => {
			try {
				await trackPluginView(slug)
			} catch (error) {
				console.error('Failed to track view:', error)
			}
		}

		track()
	}, [slug])

	// This component doesn't render anything
	return null
}
