import type { Config } from 'src/payload-types'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'

type Global = keyof Config['globals']

async function getGlobal(slug: Global, depth = 0) {
	try {
		const { isEnabled: draft } = await draftMode()
		const payload = await getPayload({ config: configPromise })

		const global = await payload.findGlobal({
			slug,
			depth,
			draft,
		})

		return global
	} catch (error) {
		console.error(`Error fetching global data for ${slug}:`, error)
		// Return null to indicate missing data
		return null
	}
}

/**
 * Returns either a cached version of the global for published content,
 * or fetches it directly for draft mode
 */
export const getCachedGlobal = (slug: Global, depth = 0) => {
	const cachedGetter = unstable_cache(async () => getGlobal(slug, depth), [slug], {
		tags: [`global_${slug}`],
	})

	return async () => {
		const { isEnabled: draft } = await draftMode()

		if (draft) {
			// Fetch directly without caching for draft mode
			const payload = await getPayload({ config: configPromise })
			return payload.findGlobal({
				slug,
				depth,
				draft: true,
			})
		}

		// Use cached version for published content
		return cachedGetter()
	}
}
