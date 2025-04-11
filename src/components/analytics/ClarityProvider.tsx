'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

export default function ClarityProvider() {
	useEffect(() => {
		// Replace 'YOUR_CLARITY_PROJECT_ID' with your actual Clarity project ID
		Clarity.init('qf9w4xkd5o')
	}, [])

	return null
}
