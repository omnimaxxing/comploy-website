import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'
import type { Plugin } from '@/payload-types'

export const revalidatePlugin: CollectionAfterChangeHook<Plugin> = ({
	doc,
	previousDoc,
	req: { payload },
}) => {
	// Skip revalidation if this is only a view count update
	const isViewCountUpdate =
		previousDoc &&
		doc.views !== previousDoc.views &&
		Object.keys(doc).length === Object.keys(previousDoc).length &&
		Object.keys(doc).every((key) => {
			if (key === 'views') return true
			if (key === 'updatedAt') return true
			return JSON.stringify(doc[key]) === JSON.stringify(previousDoc[key])
		})

	if (isViewCountUpdate) {
		payload.logger.info(`Skipping revalidation for view count update on ${doc.slug}`)
		return doc
	}

	if (doc._status === 'published') {
		const path = `/plugins/${doc.slug}`

		payload.logger.info(`Revalidating plugin path: ${path}`)

		revalidatePath(path)

		const path2 = `/plugins`

		payload.logger.info(`Revalidating old plugin path: ${path2}`)

		revalidatePath(path2)

		const path3 = '/plugins/all'

		payload.logger.info(`Revalidating old plugin path: ${path3}`)

		revalidatePath(path3)
	}

	if (previousDoc?._status === 'published' && doc._status !== 'published') {
		const oldPath = `/plugins/${previousDoc.slug}`

		payload.logger.info(`Revalidating old plugin path: ${oldPath}`)

		revalidatePath(oldPath)

		const oldPath2 = `/plugins`

		payload.logger.info(`Revalidating old plugin path: ${oldPath2}`)

		revalidatePath(oldPath2)

		const oldPath3 = '/plugins/all'

		payload.logger.info(`Revalidating old plugin path: ${oldPath3}`)

		revalidatePath(oldPath3)
	}

	// Also revalidate the main plugins page
	revalidatePath('/plugins')

	return doc
}
