import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Plugin } from '@/payload-types'
import { PluginActions } from './PluginActions'
import { auth } from '@/auth'

// This component fetches the latest rating data for a plugin
// It's designed to be used with Suspense for PPR
export async function DynamicPluginRating({
	slug,
	isVerified,
	isOfficial,
	githubUrl,
	pluginName,
	initialUpvotes,
	initialDownvotes,
	initialScore,
	verificationUsername,
}: {
	slug: string
	isVerified: boolean
	isOfficial?: boolean
	githubUrl: string
	pluginName: string
	initialUpvotes: number
	initialDownvotes: number
	initialScore: number
	verificationUsername: string | null
}) {
	// Fetch fresh plugin data without caching
	const payload = await getPayload({ config: configPromise })

	// Fetch session data internally
	const session = await auth()
	const isAuthenticated = !!session?.user
	const currentUsername = session?.user?.username || null

	// Calculate isOwner internally
	let isOwner = false
	if (isAuthenticated && currentUsername && verificationUsername) {
		isOwner = currentUsername === verificationUsername
	}

	// Get only the rating data we need
	const pluginData = await payload.find({
		collection: 'plugins',
		where: {
			slug: {
				equals: slug,
			},
			_status: {
				equals: 'published',
			},
		},
		depth: 0,
	})

	const plugin = pluginData.docs[0] as Plugin

	if (!plugin) {
		return null
	}

	// Use the latest rating data from the database
	const upvotes = plugin.rating?.upvotes || initialUpvotes
	const downvotes = plugin.rating?.downvotes || initialDownvotes
	const score = plugin.rating?.score || initialScore

	return (
		<PluginActions
			slug={slug}
			isVerified={isVerified}
			isOfficial={isOfficial}
			githubUrl={githubUrl}
			pluginName={pluginName}
			initialUpvotes={upvotes}
			initialDownvotes={downvotes}
			initialScore={score}
			isAuthenticated={isAuthenticated}
			isOwner={isOwner}
			currentUsername={currentUsername}
		/>
	)
}
