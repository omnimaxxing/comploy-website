import { NextResponse } from 'next/server'

// Simple in-memory cache
let cachedData: any = null
let lastFetch = 0
const CACHE_DURATION = 1000 * 60 * 5 // 5 minutes

export async function GET() {
	try {
		// Return cached data if available and not expired
		const now = Date.now()
		if (cachedData && now - lastFetch < CACHE_DURATION) {
			return NextResponse.json(cachedData)
		}

		// Add a delay to avoid rate limiting
		await new Promise((resolve) => setTimeout(resolve, 1000))

		const response = await fetch('https://ipapi.co/json/', {
			headers: {
				Accept: 'application/json',
				'User-Agent': 'OmniPixel/1.0',
			},
		})

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const text = await response.text() // Get response as text first

		try {
			const data = JSON.parse(text) // Try to parse as JSON

			// Cache the successful response
			cachedData = data
			lastFetch = now

			return NextResponse.json(data)
		} catch (parseError) {
			console.error('Failed to parse response:', text)
			throw new Error('Invalid JSON response')
		}
	} catch (error) {
		console.error('Error fetching location:', error)

		// Return a default response with mock data
		return NextResponse.json({
			city: 'Local',
			region: 'Your Area',
			country_name: 'Region',
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		})
	}
}
