'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { Redis } from '@upstash/redis'
import { randomUUID } from 'crypto'

// Initialize Redis client
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL || '',
	token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Helper function to create a view identifier key for Redis
async function getViewIdentifier(): Promise<string> {
	// Use cookies to identify users for view tracking
	const cookieStore = await cookies()
	let identifier = cookieStore.get('showcase_view_identifier')?.value

	// If no identifier exists, create one and store it
	if (!identifier) {
		identifier = randomUUID()
		cookieStore.set('showcase_view_identifier', identifier, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		})
	}

	return identifier
}

export async function trackShowcaseView(id: string) {
	try {
		console.log('Starting view tracking for showcase:', id)

		// Get the user identifier
		const identifier = await getViewIdentifier()

		// Create Redis key for this view
		const viewKey = `showcase-view:${identifier}:${id}`

		// Check if this showcase was viewed in the last 24 hours using Redis
		const hasViewed = await redis.exists(viewKey)

		if (hasViewed) {
			console.log('Already viewed in last 24 hours')
			return { success: false, reason: 'already-viewed' }
		}

		// Set in Redis with 24 hour expiry to prevent duplicate views
		await redis.set(viewKey, '1', { ex: 60 * 60 * 24 }) // 24 hours expiry

		// Also set in cookies as backup and for backward compatibility
		const cookieStore = await cookies()
		const cookieViewKey = `showcase-view-${id}`

		cookieStore.set(cookieViewKey, '1', {
			maxAge: 60 * 60 * 24, // 24 hours
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		})

		const payload = await getPayload({ config: configPromise })

		// Get current showcase to get the current view count
		const showcase = await payload.findByID({
			collection: 'showcases',
			id,
			depth: 0,
		})

		if (!showcase) {
			console.log('Showcase not found:', id)
			throw new Error('Showcase not found')
		}

		console.log('Current view count:', showcase.views)

		// Increment the view count
		const updatedShowcase = await payload.update({
			collection: 'showcases',
			id,
			data: {
				views: (showcase.views || 0) + 1,
			},
		})

		console.log('Updated view count:', updatedShowcase.views)

		// Optional: Track daily/weekly view counts in Redis for analytics
		const dayKey = `showcase-views:daily:${id}:${new Date().toISOString().split('T')[0]}`
		const weekKey = `showcase-views:weekly:${id}:${getWeekNumber()}`

		await redis.incr(dayKey)
		await redis.expire(dayKey, 60 * 60 * 24 * 8) // 8 days retention

		await redis.incr(weekKey)
		await redis.expire(weekKey, 60 * 60 * 24 * 31) // 31 days retention

		return { success: true, views: updatedShowcase.views }
	} catch (error) {
		console.error('Error tracking showcase view:', error)
		return { success: false, error: 'Failed to track view' }
	}
}

// Helper function to get week number for analytics
function getWeekNumber(): string {
	const now = new Date()
	const oneJan = new Date(now.getFullYear(), 0, 1)
	const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000))
	const weekNumber = Math.ceil((now.getDay() + 1 + numberOfDays) / 7)
	return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`
}
