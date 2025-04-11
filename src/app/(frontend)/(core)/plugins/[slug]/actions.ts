'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { z } from 'zod'
import type { Plugin } from '@/payload-types'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'
import { randomUUID } from 'crypto'
import jwt from 'jsonwebtoken'
import { auth } from '@/auth'

// Initialize Redis client
const redis = new Redis({
	url: process.env.UPSTASH_REDIS_REST_URL || '',
	token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Secret for JWT (should be in env vars in production)
const JWT_SECRET = process.env.JWT_SECRET || 'plugin-ownership-secret-key'

// Helper function to get a unique identifier for request
async function getRequestIdentifier(): Promise<string> {
	// Use cookies to identify users for rate limiting instead of headers
	const cookieStore = await cookies()
	let identifier = cookieStore.get('comment_identifier')?.value

	// If no identifier exists, create one and store it
	if (!identifier) {
		identifier = randomUUID()
		cookieStore.set('comment_identifier', identifier, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30, // 30 days
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		})
	}

	return identifier
}

// Enhanced schema for review validation with spam detection
const reviewSchema = z.object({
	author: z
		.string()
		.min(2, 'Name must be at least 2 characters')
		.max(50, 'Name is too long')
		// Reject names with excessive special characters or common spam patterns
		.refine((val) => !/(.)\1{4,}/.test(val), 'Name contains suspicious patterns'),
	comment: z
		.string()
		.min(10, 'Comment must be at least 10 characters')
		.max(1000, 'Comment cannot exceed 1000 characters')
		// Reject comments with excessive URLs, common spam phrases, or repeated characters
		.refine((val) => {
			const urlCount = (val.match(/(https?:\/\/[^\s]+)/g) || []).length
			return urlCount <= 2
		}, 'Too many links in comment')
		.refine((val) => !/(.)\1{8,}/.test(val), 'Comment contains suspicious patterns')
		.refine(
			(val) =>
				!/(cheap|discount|free|buy|sell|offer|promotion|viagra|casino|lottery|prize).{0,10}(https?:\/\/|www\.|\.com)/i.test(
					val,
				),
			'Comment appears to contain spam',
		),
	// Hidden honeypot field - should always be empty
	honeypot: z.string().max(0, 'Invalid submission').optional(),
})

// Helper function to get plugin by slug
async function getPluginBySlug(slug: string) {
	const payload = await getPayload({ config: configPromise })

	const plugins = await payload.find({
		collection: 'plugins',
		where: {
			slug: {
				equals: slug,
			},
		},
	})

	return plugins.docs[0] || null
}

// Helper function to manage votes in cookies (kept for backwards compatibility)
async function manageVoteInCookies(slug: string, voteType: 'upvote' | 'downvote' | 'remove') {
	const cookieStore = await cookies()
	const votedPluginsCookie = cookieStore.get('voted_plugins')

	let votedPlugins: Record<string, 'up' | 'down'> = {}

	if (votedPluginsCookie) {
		try {
			votedPlugins = JSON.parse(votedPluginsCookie.value)
		} catch (error) {
			console.error('Error parsing voted plugins cookie:', error)
		}
	}

	// Handle different vote types
	if (voteType === 'remove') {
		delete votedPlugins[slug]
	} else {
		votedPlugins[slug] = voteType === 'upvote' ? 'up' : 'down'
	}

	// Set cookie with voted plugins - expires in 1 year
	cookieStore.set('voted_plugins', JSON.stringify(votedPlugins), {
		path: '/',
		maxAge: 60 * 60 * 24 * 365, // 1 year
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
	})

	return votedPlugins
}

// Helper function to create a vote identifier key for Redis
async function getVoteIdentifier(): Promise<string> {
	// Use cookies to identify users for rate limiting
	const cookieStore = await cookies()
	let identifier = cookieStore.get('vote_identifier')?.value

	// If no identifier exists, create one and store it
	if (!identifier) {
		identifier = randomUUID()
		cookieStore.set('vote_identifier', identifier, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		})
	}

	return identifier
}

// Helper function to manage votes in Redis
async function manageVoteInRedis(
	slug: string,
	voteType: 'upvote' | 'downvote' | 'remove',
): Promise<{ status: string; rateLimit?: boolean }> {
	try {
		const identifier = await getVoteIdentifier()

		// Create Redis keys
		const voteKey = `vote:${identifier}:${slug}`
		const rateLimitKey = `vote-rate-limit:${identifier}`

		// Check rate limiting - prevent too many vote changes in short period
		const rateLimitCount = await redis.get(rateLimitKey)

		// If more than 10 vote changes in 5 minutes, rate limit
		if (rateLimitCount && Number(rateLimitCount) > 10) {
			return { status: 'rate-limited', rateLimit: true }
		}

		// Increment rate limit counter and set expiry if not exists
		await redis.incr(rateLimitKey)
		await redis.expire(rateLimitKey, 300) // 5 minutes expiry

		// For vote removal
		if (voteType === 'remove') {
			await redis.del(voteKey)
			return { status: 'removed' }
		}

		// Store the vote with a 1 year expiry
		await redis.set(voteKey, voteType, { ex: 60 * 60 * 24 * 365 }) // 1 year expiry

		// Also maintain compatibility with cookies for transition period
		await manageVoteInCookies(slug, voteType)

		return { status: 'success' }
	} catch (error) {
		console.error('Error managing vote in Redis:', error)
		// Fall back to cookies if Redis fails
		await manageVoteInCookies(slug, voteType)
		return { status: 'fallback-to-cookies' }
	}
}

// This function checks if the user has already voted on a plugin
export async function checkUserVote(slug: string) {
	try {
		// First try to get vote from Redis
		const identifier = await getVoteIdentifier()
		const voteKey = `vote:${identifier}:${slug}`
		const redisVote = await redis.get(voteKey)

		if (redisVote) {
			return redisVote === 'upvote' ? 'up' : 'down'
		}

		// Fall back to cookies if not in Redis
		const cookieStore = await cookies()
		const votedPluginsCookie = cookieStore.get('voted_plugins')

		if (!votedPluginsCookie) {
			return null
		}

		try {
			const votedPlugins = JSON.parse(votedPluginsCookie.value) as Record<string, 'up' | 'down'>
			return votedPlugins[slug] || null
		} catch (error) {
			console.error('Error parsing voted plugins cookie:', error)
			return null
		}
	} catch (error) {
		console.error('Error checking user vote:', error)
		return null
	}
}

// Function to upvote a plugin
export async function upvotePlugin(slug: string) {
	if (!slug) {
		return { success: false, message: 'Plugin slug is required' }
	}

	try {
		const payload = await getPayload({ config: configPromise })
		const plugin = await getPluginBySlug(slug)

		if (!plugin) {
			return { success: false, message: 'Plugin not found' }
		}

		// Check if user has already voted
		const currentVote = await checkUserVote(slug)

		// Check for rate limiting
		const identifier = await getVoteIdentifier()
		const rateLimitKey = `vote-rate-limit:${identifier}`
		const rateLimitCount = await redis.get(rateLimitKey)

		// If more than 10 vote changes in 5 minutes, rate limit
		if (rateLimitCount && Number(rateLimitCount) > 10) {
			return {
				success: false,
				message: 'You are voting too frequently. Please try again later.',
			}
		}

		let upvotes = plugin.rating?.upvotes || 0
		let downvotes = plugin.rating?.downvotes || 0

		// Handle different vote scenarios
		if (currentVote === 'up') {
			// Remove upvote if already upvoted
			upvotes -= 1
			await manageVoteInRedis(slug, 'remove')
		} else if (currentVote === 'down') {
			// Change from downvote to upvote
			downvotes -= 1
			upvotes += 1
			await manageVoteInRedis(slug, 'upvote')
		} else {
			// New upvote
			upvotes += 1
			await manageVoteInRedis(slug, 'upvote')
		}

		// Update plugin
		await payload.update({
			collection: 'plugins',
			id: plugin.id,
			data: {
				rating: {
					upvotes,
					downvotes,
					score: upvotes - downvotes,
				},
			},
		})

		// Revalidate the page
		revalidatePath(`/plugins/${slug}`)

		return {
			success: true,
			upvotes,
			downvotes,
			score: upvotes - downvotes,
			userVote: currentVote === 'up' ? null : 'up',
		}
	} catch (error) {
		console.error('Error upvoting plugin:', error)
		return { success: false, message: error instanceof Error ? error.message : 'Unknown error' }
	}
}

// Function to downvote a plugin
export async function downvotePlugin(slug: string) {
	if (!slug) {
		return { success: false, message: 'Plugin slug is required' }
	}

	try {
		const payload = await getPayload({ config: configPromise })
		const plugin = await getPluginBySlug(slug)

		if (!plugin) {
			return { success: false, message: 'Plugin not found' }
		}

		// Check if user has already voted
		const currentVote = await checkUserVote(slug)

		// Check for rate limiting
		const identifier = await getVoteIdentifier()
		const rateLimitKey = `vote-rate-limit:${identifier}`
		const rateLimitCount = await redis.get(rateLimitKey)

		// If more than 10 vote changes in 5 minutes, rate limit
		if (rateLimitCount && Number(rateLimitCount) > 10) {
			return {
				success: false,
				message: 'You are voting too frequently. Please try again later.',
			}
		}

		let upvotes = plugin.rating?.upvotes || 0
		let downvotes = plugin.rating?.downvotes || 0

		// Handle different vote scenarios
		if (currentVote === 'down') {
			// Remove downvote if already downvoted
			downvotes -= 1
			await manageVoteInRedis(slug, 'remove')
		} else if (currentVote === 'up') {
			// Change from upvote to downvote
			upvotes -= 1
			downvotes += 1
			await manageVoteInRedis(slug, 'downvote')
		} else {
			// New downvote
			downvotes += 1
			await manageVoteInRedis(slug, 'downvote')
		}

		// Update plugin
		await payload.update({
			collection: 'plugins',
			id: plugin.id,
			data: {
				rating: {
					upvotes,
					downvotes,
					score: upvotes - downvotes,
				},
			},
		})

		// Revalidate the page
		revalidatePath(`/plugins/${slug}`)

		return {
			success: true,
			upvotes,
			downvotes,
			score: upvotes - downvotes,
			userVote: currentVote === 'down' ? null : 'down',
		}
	} catch (error) {
		console.error('Error downvoting plugin:', error)
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

// Function to add a review
export async function addReview(
	slug: string,
	reviewData: { author: string; comment: string; honeypot?: string },
) {
	if (!slug) {
		return { success: false, message: 'Plugin slug is required' }
	}

	if (!reviewData || !reviewData.author || !reviewData.comment) {
		return { success: false, message: 'Author and comment are required' }
	}

	try {
		// Redis rate limiting using timestamps
		const timestampKey = `${slug}:${reviewData.author}:timestamp`
		const lastSubmission = await redis.get(timestampKey)
		const now = Date.now()

		// If there was a submission in the last 30 seconds
		if (lastSubmission && now - Number(lastSubmission) < 30000) {
			return {
				success: false,
				message: 'Please wait a moment before posting another comment.',
			}
		}

		// Store the timestamp for future rate limiting
		await redis.set(timestampKey, now.toString(), { ex: 3600 }) // 1 hour expiry

		// Get content similarity key
		const contentKey = `${slug}:${reviewData.author}:content`
		const recentContent = await redis.get(contentKey)

		// If same/similar content was posted recently
		if (recentContent && typeof recentContent === 'string') {
			const similarity = calculateStringSimilarity(recentContent, reviewData.comment)
			if (similarity > 0.8) {
				// 80% similarity threshold
				return {
					success: false,
					message: 'Similar comment already submitted. Please wait before posting again.',
				}
			}
		}

		// Store this comment for future similarity checks
		await redis.set(contentKey, reviewData.comment, { ex: 86400 }) // 24 hour retention

		// Validate review data with enhanced validation
		const validatedData = reviewSchema.parse(reviewData)

		const payload = await getPayload({ config: configPromise })
		const plugin = await getPluginBySlug(slug)

		if (!plugin) {
			return { success: false, message: 'Plugin not found' }
		}

		// Get existing comments or initialize empty array
		const existingComments = plugin.comments || []

		// Add new comment
		const newComment = {
			author: validatedData.author,
			comment: validatedData.comment,
			createdAt: new Date().toISOString(),
		}

		// Update plugin with new comment
		await payload.update({
			collection: 'plugins',
			id: plugin.id,
			data: {
				comments: [...existingComments, newComment],
			},
		})

		// Revalidate the page
		revalidatePath(`/plugins/${slug}`)

		return {
			success: true,
			message: 'Comment added successfully',
			review: newComment,
		}
	} catch (error) {
		console.error('Error adding review:', error)
		if (error instanceof z.ZodError) {
			// Return the first validation error message
			return {
				success: false,
				message: error.errors[0]?.message || 'Validation error',
			}
		}
		return {
			success: false,
			message: error instanceof Error ? error.message : 'Unknown error',
		}
	}
}

// Simple function to calculate string similarity (Levenshtein distance based)
function calculateStringSimilarity(str1: string, str2: string): number {
	// Normalize and get lowercase versions for comparison
	const s1 = str1.toLowerCase().trim()
	const s2 = str2.toLowerCase().trim()

	if (s1 === s2) return 1.0 // Exact match
	if (s1.length === 0 || s2.length === 0) return 0.0

	// Calculate Levenshtein distance
	const matrix: number[][] = []

	// Initialize matrix
	for (let i = 0; i <= s1.length; i++) {
		matrix[i] = [i]
		for (let j = 1; j <= s2.length; j++) {
			if (i === 0) matrix[i][j] = j
			else matrix[i][j] = 0
		}
	}

	// Fill matrix
	for (let i = 1; i <= s1.length; i++) {
		for (let j = 1; j <= s2.length; j++) {
			const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1
			matrix[i][j] = Math.min(
				matrix[i - 1][j] + 1, // Deletion
				matrix[i][j - 1] + 1, // Insertion
				matrix[i - 1][j - 1] + cost, // Substitution
			)
		}
	}

	// Convert distance to similarity score (0-1 range)
	const maxLength = Math.max(s1.length, s2.length)
	const distance = matrix[s1.length][s2.length]
	return 1 - distance / maxLength
}

// Helper function to create a view identifier key for Redis
async function getViewIdentifier(): Promise<string> {
	// Use cookies to identify users for view tracking
	const cookieStore = await cookies()
	let identifier = cookieStore.get('view_identifier')?.value

	// If no identifier exists, create one and store it
	if (!identifier) {
		identifier = randomUUID()
		cookieStore.set('view_identifier', identifier, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		})
	}

	return identifier
}

// This function tracks a view for a plugin
export async function trackPluginView(slug: string) {
	try {
		// Get the user identifier
		const identifier = await getViewIdentifier()

		// Create Redis key for this view
		const viewKey = `view:${identifier}:${slug}`

		// Check if this plugin was viewed in the last 24 hours using Redis
		const hasViewed = await redis.exists(viewKey)

		if (hasViewed) {
			return { success: false, reason: 'already-viewed' }
		}

		// Set in Redis with 24 hour expiry to prevent duplicate views
		await redis.set(viewKey, '1', { ex: 60 * 60 * 24 }) // 24 hours expiry

		// Also set in cookies as backup and for backward compatibility
		const cookieStore = await cookies()
		const cookieViewKey = `plugin-view-${slug}`

		// Set a cookie to prevent multiple views in 24 hours
		cookieStore.set(cookieViewKey, '1', {
			maxAge: 60 * 60 * 24, // 24 hours
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
		})

		const payload = await getPayload({ config: configPromise })

		// Get the plugin to check current view count
		const plugins = await payload.find({
			collection: 'plugins',
			where: {
				slug: {
					equals: slug,
				},
			},
			depth: 0,
		})

		if (!plugins.docs.length) {
			throw new Error('Plugin not found')
		}

		const plugin = plugins.docs[0] as Plugin & { views?: number }
		const currentViews = plugin.views || 0

		// Increment the view count
		await payload.update({
			collection: 'plugins',
			where: {
				slug: {
					equals: slug,
				},
			},
			data: {
				views: currentViews + 1,
			} as any, // Type assertion to bypass TypeScript check
		})

		// Optional: Track daily/weekly view counts in Redis for analytics
		const dayKey = `views:daily:${slug}:${new Date().toISOString().split('T')[0]}`
		const weekKey = `views:weekly:${slug}:${getWeekNumber()}`

		await redis.incr(dayKey)
		await redis.expire(dayKey, 60 * 60 * 24 * 8) // 8 days retention

		await redis.incr(weekKey)
		await redis.expire(weekKey, 60 * 60 * 24 * 31) // 31 days retention

		return { success: true, views: currentViews + 1 }
	} catch (error) {
		console.error('Error tracking plugin view:', error)
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

// Check if the current user owns a plugin
export async function checkPluginOwnership(slug: string): Promise<boolean> {
	try {
		// First, check the session to get the current GitHub user
		const session = await auth()
		const githubUserId = session?.user?.id

		// If we have a GitHub user ID, check if they're the verified owner in the database
		if (githubUserId) {
			const payload = await getPayload({ config: configPromise })

			// Get the plugin
			const plugin = await getPluginBySlug(slug)

			// Check if the plugin exists and has verification data
			if (
				plugin &&
				plugin.verification &&
				plugin.verification.isVerified &&
				plugin.verification.githubVerification &&
				plugin.verification.githubVerification.userId === githubUserId
			) {
				// The current GitHub user is the verified owner in the database
				// Make sure to also update the ownership token for consistency
				await addPluginToOwnership(slug)
				return true
			}
		}

		// Fallback to checking ownership token from cookies
		const cookieStore = await cookies()
		const ownershipToken = cookieStore.get('plugin_ownership_token')?.value

		if (!ownershipToken) {
			return false
		}

		// Verify the token
		try {
			const decoded = jwt.verify(ownershipToken, JWT_SECRET) as { pluginSlugs?: string[] }

			// Check if this plugin's slug is in the user's owned plugins
			return Array.isArray(decoded.pluginSlugs) && decoded.pluginSlugs.includes(slug)
		} catch (error) {
			console.error('Error verifying ownership token:', error)
			return false
		}
	} catch (error) {
		console.error('Error checking plugin ownership:', error)
		return false
	}
}

// Function to generate ownership token
export async function generateOwnershipToken(pluginSlugs: string[]): Promise<string> {
	// Create a token with the plugin slugs
	return jwt.sign(
		{
			pluginSlugs,
			// Add a timestamp to help with token refresh/expiration
			issuedAt: Date.now(),
		},
		JWT_SECRET,
		{ expiresIn: '30d' }, // Token expires in 30 days
	)
}

// Function to add a plugin to a user's ownership
export async function addPluginToOwnership(slug: string): Promise<boolean> {
	console.log(`[addPluginToOwnership] Starting process to add plugin to user ownership: ${slug}`)
	try {
		// Get the current session
		const session = await auth()
		console.log(`[addPluginToOwnership] Session retrieved:`, {
			hasSession: !!session,
			hasUser: !!session?.user,
			hasAccessToken: !!session?.accessToken,
			userId: session?.user?.id,
		})

		if (!session || !session.user) {
			console.log(`[addPluginToOwnership] No authenticated user found`)
			return false
		}

		// Get the payload instance
		const payload = await getPayload({ config: configPromise })

		// Get the plugin data
		const plugin = await getPluginBySlug(slug)
		console.log(`[addPluginToOwnership] Plugin data retrieved:`, {
			pluginFound: !!plugin,
			pluginId: plugin?.id,
			pluginName: plugin?.name,
		})

		if (!plugin) {
			console.log(`[addPluginToOwnership] Plugin not found: ${slug}`)
			return false
		}

		// Get the current ownership token from cookies
		const cookieStore = await cookies()
		const ownershipToken = cookieStore.get('plugin_ownership_token')?.value
		console.log(`[addPluginToOwnership] Current ownership token from cookies:`, {
			hasToken: !!ownershipToken,
			tokenLength: ownershipToken?.length,
		})

		// Decode the token if it exists
		let ownedPlugins: string[] = []
		if (ownershipToken) {
			try {
				const decoded = jwt.verify(ownershipToken, JWT_SECRET) as { pluginSlugs: string[] }
				ownedPlugins = decoded.pluginSlugs
				console.log(`[addPluginToOwnership] Decoded existing token:`, {
					ownedPluginsCount: ownedPlugins.length,
					ownedPlugins: ownedPlugins,
				})
			} catch (error) {
				console.error(`[addPluginToOwnership] Error decoding token:`, error)
				// Invalid token, start fresh
				ownedPlugins = []
			}
		}

		// Add the current plugin to the owned plugins if not already there
		if (!ownedPlugins.includes(slug)) {
			ownedPlugins.push(slug)
			console.log(`[addPluginToOwnership] Added plugin to owned plugins list:`, {
				newOwnedPluginsCount: ownedPlugins.length,
				addedSlug: slug,
			})
		} else {
			console.log(`[addPluginToOwnership] Plugin already in owned plugins list:`, {
				slug: slug,
			})
		}

		// Generate a new token
		const newToken = await generateOwnershipToken(ownedPlugins)
		console.log(`[addPluginToOwnership] Generated new ownership token:`, {
			tokenGenerated: !!newToken,
			tokenLength: newToken?.length,
		})

		// Set the token in cookies
		cookieStore.set('plugin_ownership_token', newToken, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365, // 1 year
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
		})
		console.log(`[addPluginToOwnership] Set new ownership token in cookies`)

		// Extract GitHub username using the same function as in GitHubVerification
		const githubUser = session.user
		const githubUsername = githubUser.username || extractGitHubUsername(githubUser.email, githubUser.name)
		console.log(`[addPluginToOwnership] Extracted GitHub username:`, {
			username: githubUsername,
			fromEmail: githubUser.email,
			fromName: githubUser.name,
		})

		// Update the plugin's verification status in the database
		console.log(`[addPluginToOwnership] Updating plugin verification in database`)
		try {
			const updateResult = await payload.update({
				collection: 'plugins',
				where: {
					slug: {
						equals: slug,
					},
				},
				data: {
					verification: {
						isVerified: true,
						verifiedBy: githubUsername,
						verifiedAt: new Date().toISOString(),
						githubVerification: {
							userId: session.user.id,
							username: githubUsername,
							method: 'owner',
						},
					},
				},
			})
			console.log(`[addPluginToOwnership] Database update result:`, {
				success: true,
				updatedPluginCount: updateResult.docs?.length,
				updatedPlugin: updateResult.docs?.[0] ? {
					id: updateResult.docs[0].id,
					verification: updateResult.docs[0].verification
				} : null,
			})
		} catch (updateError) {
			console.error(`[addPluginToOwnership] Error updating plugin verification in database:`, updateError)
		}

		// Revalidate the plugin page
		console.log(`[addPluginToOwnership] Revalidating path: /plugins/${slug}`)
		revalidatePath(`/plugins/${slug}`)

		return true
	} catch (error) {
		console.error(`[addPluginToOwnership] Error adding plugin to ownership:`, error)
		return false
	}
}

// Function to handle plugin deletion requests and reports
export async function submitPluginReport(
	slug: string,
	reportData: {
		reportType: 'deletion' | 'content-violation' | 'security' | 'copyright' | 'other'
		reporterName: string
		reporterEmail: string
		message: string
	},
) {
	if (!slug || !reportData) {
		return { success: false, message: 'Required data is missing' }
	}

	try {
		const payload = await getPayload({ config: configPromise })

		// Get plugin details
		const plugin = await getPluginBySlug(slug)
		if (!plugin) {
			return { success: false, message: 'Plugin not found' }
		}

		// Check if the user is the owner
		const isOwner = await checkPluginOwnership(slug)

		// Create the report
		await payload.create({
			collection: 'plugin-reports',
			data: {
				reportType: reportData.reportType,
				pluginName: plugin.name,
				pluginSlug: slug,
				reporterName: reportData.reporterName,
				reporterEmail: reportData.reporterEmail,
				isOwner: isOwner,
				message: reportData.message,
				status: 'pending',
			},
		})

		return {
			success: true,
			message:
				reportData.reportType === 'deletion'
					? 'Deletion request submitted successfully. An administrator will review your request.'
					: 'Report submitted successfully. Thank you for helping us maintain quality content.',
		}
	} catch (error) {
		console.error('Error submitting plugin report:', error)
		return {
			success: false,
			message: 'An error occurred while submitting your report. Please try again later.',
		}
	}
}

// Add the new function to fetch contributors from GitHub
export async function fetchRepositoryContributors(githubUrl: string, limit: number = 10) {
	try {
		// Extract owner and repo from GitHub URL
		// Format: https://github.com/owner/repo
		const urlParts = githubUrl.split('/')
		if (urlParts.length < 5) {
			return { success: false, error: 'Invalid GitHub URL format' }
		}

		const owner = urlParts[3]
		const repo = urlParts[4]

		// GitHub API URL for contributors
		const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=${limit}`

		// Set up headers with optional GitHub token for higher rate limits
		const headers: HeadersInit = {
			Accept: 'application/vnd.github.v3+json',
		}

		// Add GitHub token if available in environment variables
		if (process.env.GITHUB_TOKEN) {
			headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
		}

		// Fetch contributors data
		const response = await fetch(apiUrl, { headers })

		if (!response.ok) {
			return {
				success: false,
				error: `GitHub API error: ${response.status}`,
				message: await response.text(),
			}
		}

		const contributors = await response.json()

		return {
			success: true,
			contributors: contributors.map((contributor: any) => ({
				id: contributor.id,
				login: contributor.login,
				avatarUrl: contributor.avatar_url,
				htmlUrl: contributor.html_url,
				contributions: contributor.contributions,
			})),
			totalCount: contributors.length,
		}
	} catch (error) {
		console.error('Error fetching repository contributors:', error)
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error fetching contributors',
		}
	}
}

// Add the extractGitHubUsername function to match the one in GitHubVerification component
function extractGitHubUsername(email?: string | null, name?: string | null): string {
	// Extract GitHub username from email if available
	if (email && email.includes('@users.noreply.github.com')) {
		return email.split('@')[0];
	}
	
	// If email doesn't contain GitHub domain or is not available, use name as fallback
	return name || 'GitHub User';
}

// Check if the current authenticated GitHub user is the owner of a plugin
export async function checkGitHubOwnership(slug: string): Promise<{
	success: boolean
	isOwner: boolean
	message?: string
}> {
	try {
		console.log(`[checkGitHubOwnership] Starting ownership verification for plugin: ${slug}`)
		
		// Get the current session
		const session = await auth()
		console.log(`[checkGitHubOwnership] Session retrieved:`, {
			hasSession: !!session,
			hasUser: !!session?.user,
			hasAccessToken: !!session?.accessToken,
			userId: session?.user?.id,
			userName: session?.user?.name,
			userEmail: session?.user?.email,
		})

		if (!session || !session.user || !session.accessToken) {
			console.log(`[checkGitHubOwnership] No authenticated GitHub user found`)
			return {
				success: true,
				isOwner: false,
				message: 'No authenticated GitHub user found',
			}
		}

		// Get the plugin data
		const plugin = await getPluginBySlug(slug)
		console.log(`[checkGitHubOwnership] Plugin data retrieved:`, {
			pluginFound: !!plugin,
			pluginId: plugin?.id,
			pluginName: plugin?.name,
			pluginGithubUrl: plugin?.githubUrl,
			pluginVerification: plugin?.verification,
		})

		if (!plugin) {
			console.log(`[checkGitHubOwnership] Plugin not found: ${slug}`)
			return {
				success: false,
				isOwner: false,
				message: 'Plugin not found',
			}
		}

		const githubUrl = plugin.githubUrl as string

		if (!githubUrl) {
			console.log(`[checkGitHubOwnership] Plugin has no GitHub URL: ${slug}`)
			return {
				success: false,
				isOwner: false,
				message: 'Plugin has no GitHub URL',
			}
		}

		// Extract owner and repo from GitHub URL
		const urlParts = githubUrl.split('/')
		const owner = urlParts[3]
		const repo = urlParts[4]
		console.log(`[checkGitHubOwnership] Extracted repo info:`, { owner, repo, githubUrl })

		if (!owner || !repo) {
			console.log(`[checkGitHubOwnership] Invalid GitHub URL format: ${githubUrl}`)
			return {
				success: false,
				isOwner: false,
				message: 'Invalid GitHub URL format',
			}
		}

		// Check if the user has write access to the repository
		console.log(`[checkGitHubOwnership] Checking repository access for ${owner}/${repo}`)
		const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
			headers: {
				Authorization: `token ${session.accessToken}`,
				Accept: 'application/vnd.github.v3+json',
			},
		})

		console.log(`[checkGitHubOwnership] GitHub API response status: ${response.status}`)

		if (!response.ok) {
			console.log(`[checkGitHubOwnership] Failed to verify repository access: ${response.statusText}`)
			return {
				success: false,
				isOwner: false,
				message: 'Failed to verify repository access',
			}
		}

		const repoData = await response.json()
		console.log(`[checkGitHubOwnership] Repository data retrieved:`, {
			repoId: repoData.id,
			repoName: repoData.name,
			repoOwner: repoData.owner?.login,
			permissions: repoData.permissions,
		})

		// Check if the user has permissions to the repo
		// First check if the authenticated user is the owner of the repo
		if (repoData.permissions && (repoData.permissions.admin || repoData.permissions.push)) {
			console.log(`[checkGitHubOwnership] User has write access to repository. Adding to ownership.`)
			
			// User has write access, add the plugin to their ownership
			const ownershipResult = await addPluginToOwnership(slug)
			console.log(`[checkGitHubOwnership] addPluginToOwnership result:`, ownershipResult)

			// Get the payload instance
			const payload = await getPayload({ config: configPromise })

			// Extract GitHub username using the same function as in GitHubVerification
			const githubUser = session.user
			const githubUsername = githubUser.username || extractGitHubUsername(githubUser.email, githubUser.name)
			console.log(`[checkGitHubOwnership] Extracted GitHub username:`, {
				username: githubUsername,
				fromEmail: githubUser.email,
				fromName: githubUser.name,
			})

			// Update the plugin's verification status using the same structure as in plugin submission
			console.log(`[checkGitHubOwnership] Updating plugin verification status in database`)
			try {
				const updateResult = await payload.update({
					collection: 'plugins',
					where: {
						slug: {
							equals: slug,
						},
					},
					data: {
						verification: {
							isVerified: true,
							verifiedBy: githubUsername,
							verifiedAt: new Date().toISOString(),
							githubVerification: {
								userId: session.user.id,
								username: githubUsername, // Use consistent username format
								method: repoData.permissions.admin ? 'owner' : 'contributor',
							},
						},
					},
				})
				console.log(`[checkGitHubOwnership] Plugin verification update result:`, {
					success: true,
					updatedPluginCount: updateResult.docs?.length,
					updatedPlugin: updateResult.docs?.[0] ? {
						id: updateResult.docs[0].id,
						verification: updateResult.docs[0].verification
					} : null,
				})
			} catch (updateError) {
				console.error(`[checkGitHubOwnership] Error updating plugin verification:`, updateError)
			}

			// Revalidate the plugin page
			console.log(`[checkGitHubOwnership] Revalidating path: /plugins/${slug}`)
			revalidatePath(`/plugins/${slug}`)

			return {
				success: true,
				isOwner: true,
			}
		}

		console.log(`[checkGitHubOwnership] User does not have write access to repository`)
		return {
			success: true,
			isOwner: false,
			message: 'You do not have write access to this repository',
		}
	} catch (error) {
		console.error('[checkGitHubOwnership] Error checking GitHub ownership:', error)
		return {
			success: false,
			isOwner: false,
			message: 'An error occurred while verifying ownership',
		}
	}
}
