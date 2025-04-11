import type { CollectionAfterChangeHook } from 'payload'

import { revalidatePath } from 'next/cache'
import type { Category, Plugin } from '@/payload-types'

export const revalidateCategory: CollectionAfterChangeHook<Category> = async ({
	doc,
	previousDoc,
	req: { payload },
}) => {
	const path = `/plugins`
	const path2 = `/plugins/all`

	payload.logger.info(`Revalidating category paths: ${path} and ${path2}`)

	revalidatePath(path)
	revalidatePath(path2)

	// Also revalidate the main showcase page
	revalidatePath('/showcase')

	// Revalidate plugins that are assigned to the category
	if (doc.id) {
		try {
			// Query plugins with this category
			const plugins = await payload.find({
				collection: 'plugins',
				where: {
					category: {
						equals: doc.id,
					},
				},
			})

			// Safely access the slug property with type checking
			for (const plugin of plugins.docs) {
				const pluginSlug = plugin.slug as unknown as string
				if (pluginSlug) {
					payload.logger.info(`Revalidating plugin: ${pluginSlug}`)
					revalidatePath(`/plugins/${pluginSlug}`)
				}
			}
		} catch (error) {
			payload.logger.error(`Error revalidating plugins for category ${doc.id}: ${error}`)
		}
	}

	return doc
}
