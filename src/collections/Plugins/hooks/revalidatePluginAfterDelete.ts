import type { CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidatePluginAfterDelete: CollectionAfterDeleteHook = ({
	req: { payload },
}) => {
	// Revalidate the main plugins page after deletion
	payload.logger.info('Revalidating plugins page after deletion')
	revalidatePath('/plugins')
} 