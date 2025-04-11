import type { Metadata } from 'next'

import type {
	AboutGlobal,
	ContactGlobal,
	HomeGlobal,
	LegalDoc,
	//TODO: add other globals as needed
} from '../payload-types'

import { getServerSideURL } from './getURL'
import { mergeOpenGraph } from './mergeOpenGraph'

//TODO fix this page
export const generateMeta = async (args: {
	doc: Partial<LegalDoc> | Partial<AboutGlobal> | Partial<HomeGlobal> | Partial<ContactGlobal>
	//TODO: add other globals and collections as needed
}): Promise<Metadata> => {
	const { doc } = args || {}

	const ogImage =
		typeof doc?.meta?.image === 'object' &&
		doc.meta.image !== null &&
		'url' in doc.meta.image &&
		`${getServerSideURL()}${doc.meta.image.url}`

	const staticOgImage = `${getServerSideURL()}/omnipixel-og-image.jpg`
	const title = doc?.meta?.title ? `${doc?.meta?.title} | Omnipixel` : 'Omnipixel'

	const images = [
		{ url: staticOgImage }, // Static image
		ogImage ? { url: ogImage } : undefined, // Dynamic image, if exists
	].filter(Boolean) // Remove undefined values

	//TODO ensure all references docs have the meta field group in place.
	//TODO replace open graph image with one for heartland group
	return {
		description: doc?.meta?.description,
		openGraph: mergeOpenGraph({
			description: doc?.meta?.description || '',
			images, // Pass array of images
			title,
			url: Array.isArray(doc?.slug) ? doc?.slug.join('/') : '/',
		}),
		title,
	}
}
