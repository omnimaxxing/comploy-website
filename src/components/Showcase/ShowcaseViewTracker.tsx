'use client'

import { useEffect } from 'react'
import { trackShowcaseView } from '@/actions/trackShowcaseView'

interface ShowcaseViewTrackerProps {
	id: string
}

export function ShowcaseViewTracker({ id }: ShowcaseViewTrackerProps) {
	useEffect(() => {
		// Track the view after component mounts (client-side)
		const track = async () => {
			try {
				await trackShowcaseView(id)
			} catch (error) {
				console.error('Failed to track showcase view:', error)
			}
		}

		track()
	}, [id])

	// This component doesn't render anything
	return null
}
