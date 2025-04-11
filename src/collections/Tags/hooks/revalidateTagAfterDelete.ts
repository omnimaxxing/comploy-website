import type { CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'
import type { Tag } from '@/payload-types'

export const revalidateTagAfterDelete: CollectionAfterDeleteHook<Tag> = async ({
	doc,
	req: { payload },
}) => {
	const path = `/plugins`
	const path2 = `/plugins/all`

	payload.logger.info(`Revalidating deleted tag paths: ${path} and ${path2}`)

	revalidatePath(path)
	revalidatePath(path2)

	// Also revalidate the main showcase page
	revalidatePath('/showcase')

	// Revalidate plugins that are assigned to the tag
	if (doc.id) {
		try {
			// Query plugins with this tag
			const plugins = await payload.find({
				collection: 'plugins',
				where: {
					tags: {
						in: doc.id,
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
			payload.logger.error(`Error revalidating plugins for tag ${doc.id}: ${error}`)
		}
	}

	return doc
}
