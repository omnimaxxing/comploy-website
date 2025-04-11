import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

/**
 * Fetch categories from the CMS with caching
 */
export const getCachedCategories = cache(async () => {
	const payload = await getPayload({ config: configPromise })

	try {
		const response = await payload.find({
			collection: 'categories',
			limit: 50,
			depth: 0,
		})

		return response.docs
	} catch (error) {
		console.error('Error fetching categories:', error)
		return []
	}
})

/**
 * Fetch tags from the CMS with caching
 */
export const getCachedTags = cache(async () => {
	const payload = await getPayload({ config: configPromise })

	try {
		const response = await payload.find({
			collection: 'tags',
			limit: 50,
			sort: 'name', // Sort alphabetically
		})

		return response.docs
	} catch (error) {
		console.error('Error fetching tags:', error)
		return []
	}
})
