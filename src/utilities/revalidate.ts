import type { Payload } from 'payload'

export const revalidate = async (args: {
	collection: string
	slug: string
	payload: Payload
}): Promise<void> => {
	const { collection, slug, payload } = args

	try {
		// Use the collection and slug directly without assuming a path structure
		const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/next/revalidate?secret=${process.env.NEXT_PRIVATE_REVALIDATION_KEY}&collection=${encodeURIComponent(collection)}&slug=${encodeURIComponent(slug)}&type=collection`

		console.log('Revalidation URL:', url)

		const res = await fetch(url)

		if (res.ok) {
			const data = await res.json()
			payload.logger.info(
				`Revalidated ${collection}: ${slug} at ${new Date(data.now).toISOString()}`,
			)
		} else {
			const errorText = await res.text()
			payload.logger.error(
				`Error revalidating ${collection}: ${slug}. Status: ${res.status}, Error: ${errorText}`,
			)
		}
	} catch (err: unknown) {
		payload.logger.error(`Error hitting revalidate route for ${collection}: ${slug}`, err)
	}
}
