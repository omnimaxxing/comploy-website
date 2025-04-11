import type { CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'

export const revalidateShowcaseAfterDelete: CollectionAfterDeleteHook = ({
	req: { payload },
}) => {
	// Revalidate the main showcase page after deletion
	payload.logger.info('Revalidating showcase page after deletion')
	revalidatePath('/showcase')
} 