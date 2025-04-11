import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'
import type { LegalDoc } from '@/payload-types'

export const revalidateLegal: CollectionAfterChangeHook<LegalDoc> = ({
	doc,
	previousDoc,
	req: { payload },
}) => {
	if (doc._status === 'published') {
		const path = `/legal/${doc.slug}`

		payload.logger.info(`Revalidating legal document path: ${path}`)

		revalidatePath(path)
	}

	if (previousDoc._status === 'published' && doc._status !== 'published') {
		const oldPath = `/legal/${previousDoc.slug}`

		payload.logger.info(`Revalidating old legal document at path: ${oldPath}`)

		revalidatePath(oldPath)
	}

	return doc
}
