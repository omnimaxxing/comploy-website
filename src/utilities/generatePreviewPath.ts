import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
	plugins: '/plugins',
	'legal-docs': '/legal',
}

const globalPrefixMap: Record<string, string> = {
	'about-global': '/about',
	'contact-global': '/contact',
	'payload-experts-global': '/payload-experts',
	'home-global': '/',
	'plugins-global': '/plugins',
}

type Props = {
	collection?: keyof typeof collectionPrefixMap
	global?: keyof typeof globalPrefixMap
	slug?: string
	req?: PayloadRequest
}

export const generatePreviewPath = ({ collection, global, slug }: Props) => {
	const encodedParams = new URLSearchParams({
		previewSecret: process.env.PREVIEW_SECRET || '',
	})

	if (collection && slug) {
		encodedParams.set('collection', collection)
		encodedParams.set('slug', slug)
		encodedParams.set('path', `${collectionPrefixMap[collection]}/${slug}`)
	} else if (global) {
		encodedParams.set('global', global)
		encodedParams.set('path', globalPrefixMap[global])
	}

	const url = `/next/preview?${encodedParams.toString()}`
	return url
}
