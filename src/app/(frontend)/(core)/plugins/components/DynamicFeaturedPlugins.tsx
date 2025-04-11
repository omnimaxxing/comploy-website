import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import type { Plugin } from '@/payload-types'
import { PluginCard } from '@/components/plugins/PluginCard'
import { ReactNode } from 'react'

interface DynamicFeaturedPluginsProps {
	limit?: number
	fallback?: ReactNode
}

/**
 * Fetches and displays featured plugins from the CMS
 * Uses Payload's 'isOfficial' and 'verification.isVerified' fields to prioritize plugins
 * alongside view counts to determine which plugins to feature
 */
export async function DynamicFeaturedPlugins({
	limit = 12,
	fallback,
}: DynamicFeaturedPluginsProps) {
	const payload = await getPayload({ config: configPromise })

	try {
		// Try to get plugins marked as official or verified, sorted by views
		const results = await payload.find({
			collection: 'plugins',
			where: {
				or: [
					{
						isOfficial: {
							equals: true,
						},
					},
					{
						'verification.isVerified': {
							equals: true,
						},
					},
				],
			},
			sort: '-views',
			limit,
			depth: 1,
		})

		// If we have enough featured plugins, return them
		if (results.docs.length >= limit / 2) {
			return (
				<div className="u-grid gap-6">
					{results.docs.map((plugin: Plugin) => (
						<PluginCard
							key={plugin.id}
							plugin={plugin}
							className="col-span-12 sm:col-span-6 lg:col-span-4"
						/>
					))}
				</div>
			)
		}

		// Fallback to sorting by views if not enough official/verified plugins
		const popularResults = await payload.find({
			collection: 'plugins',
			sort: '-views',
			limit,
			depth: 1,
		})

		return (
			<div className="u-grid gap-6">
				{popularResults.docs.map((plugin: Plugin) => (
					<PluginCard
						key={plugin.id}
						plugin={plugin}
						className="col-span-12 sm:col-span-6 lg:col-span-4"
					/>
				))}
			</div>
		)
	} catch (error) {
		console.error('Error fetching featured plugins:', error)

		// Return the fallback if provided, or an error message
		if (fallback) {
			return fallback
		}

		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">Failed to load featured plugins</p>
			</div>
		)
	}
}
