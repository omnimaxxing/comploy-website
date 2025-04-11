import type { CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateCategoryAfterDelete: CollectionAfterDeleteHook = async ({
	doc,
	req: { payload },
}) => {
	const path = `/plugins`
	const path2 = `/plugins/all`

	payload.logger.info(`Revalidating deleted category paths: ${path} and ${path2}`)

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
			payload.logger.error(`Error revalidating plugins for deleted category ${doc.id}: ${error}`)
		}
	}

	return doc
}
