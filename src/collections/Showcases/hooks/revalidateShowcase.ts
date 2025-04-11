import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'
import type { Showcase } from '@/payload-types'

export const revalidateShowcase: CollectionAfterChangeHook<Showcase> = ({
	doc,
	previousDoc,
	req: { payload },
}) => {
	if (doc._status === 'published') {
		const path = `/showcase/${doc.slug}`
		const path2 = `/showcase`

		payload.logger.info(`Revalidating showcase path: ${path} and ${path2}`)

		revalidatePath(path)
		revalidatePath(path2)
	}

	if (previousDoc?._status === 'published' && doc._status !== 'published') {
		const oldPath = `/showcase/${previousDoc.slug}`
		const oldPath2 = `/showcase`

		payload.logger.info(`Revalidating old showcase path: ${oldPath} and ${oldPath2}`)

		revalidatePath(oldPath)
		revalidatePath(oldPath2)
	}

	// Also revalidate the main showcase page
	revalidatePath('/showcase')

	return doc
}
