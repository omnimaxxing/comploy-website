import type { Showcase } from '@/payload-types'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { cache } from 'react'

type Properties = {
	depth?: number
	limit?: number
	page?: number
	sort?: string
	where?: Record<string, any>
}

interface GetShowcasesOptions {
	page?: number
	limit?: number
}

interface ShowcasesResponse {
	docs: Showcase[]
	hasNextPage: boolean
	hasPrevPage: boolean
	nextPage: number | null
	prevPage: number | null
	totalPages: number
	totalDocs: number
}

/**
 * Fetch showcases from the CMS with caching
 */
export const getCachedShowcases = cache(
	async (options: GetShowcasesOptions = {}): Promise<ShowcasesResponse> => {
		const { page = 1, limit = 12 } = options
		const payload = await getPayload({ config: configPromise })

		try {
			const response = await payload.find({
				collection: 'showcases',
				where: {
					_status: {
						equals: 'published',
					},
				},
				sort: '-createdAt',
				page,
				limit,
				depth: 2,
			})

			return {
				docs: response.docs as Showcase[],
				hasNextPage: response.hasNextPage || false,
				hasPrevPage: response.hasPrevPage || false,
				nextPage: response.nextPage ?? null,
				prevPage: response.prevPage ?? null,
				totalPages: response.totalPages || 0,
				totalDocs: response.totalDocs || 0,
			}
		} catch (error) {
			console.error('Error fetching showcases:', error)
			return {
				docs: [],
				hasNextPage: false,
				hasPrevPage: false,
				nextPage: null,
				prevPage: null,
				totalPages: 0,
				totalDocs: 0,
			}
		}
	},
)

/**
 * Get a single showcase by ID with caching
 */
export const getCachedShowcaseById = cache(async (id: string): Promise<Showcase | null> => {
	const payload = await getPayload({ config: configPromise })

	try {
		const showcase = await payload.findByID({
			collection: 'showcases',
			id,
			depth: 1,
		})

		return showcase as Showcase
	} catch (error) {
		console.error(`Error fetching showcase with ID ${id}:`, error)
		return null
	}
})

/**
 * Get a single showcase by slug with caching
 */
export const getCachedShowcaseBySlug = cache(async (slug: string): Promise<Showcase | null> => {
	const payload = await getPayload({ config: configPromise })

	try {
		const showcase = await payload.find({
			collection: 'showcases',
			where: {
				slug: {
					equals: slug,
				},
				_status: {
					equals: 'published',
				},
			},
			depth: 1,
		})

		return (showcase.docs[0] as Showcase) || null
	} catch (error) {
		console.error(`Error fetching showcase with slug ${slug}:`, error)
		return null
	}
})
