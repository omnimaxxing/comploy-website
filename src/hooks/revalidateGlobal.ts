import type { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

/**
 * Creates a revalidation hook for a given global slug.
 * @param slug - The slug of the global to revalidate.
 * @returns A Payload CMS GlobalAfterChangeHook.
 */
export const createRevalidateGlobal = (slug: string): GlobalAfterChangeHook => {
	return ({ doc }) => {
		console.info(`Revalidating global: ${slug}`)
		revalidateTag(`global_${slug}`)
		return doc
	}
}
