import type { LegalDoc, Product } from '@/payload-types'
import type React from 'react'

import { getCachedDocument } from '@/utilities/getDocument'
import { getCachedRedirects } from '@/utilities/getRedirect'
import { notFound, redirect } from 'next/navigation'

interface Props {
	disableNotFound?: boolean
	url: string
}

//TODO update this component with correct types for collections + globals
/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({ disableNotFound, url }) => {
	const redirects = await getCachedRedirects()()

	const redirectItem = redirects.find((redirect) => redirect.from === url)

	if (redirectItem) {
		if (redirectItem.to?.url) {
			redirect(redirectItem.to.url)
		}

		let redirectUrl: string | undefined

		if (typeof redirectItem.to?.reference?.value === 'string') {
			const collection = redirectItem.to?.reference?.relationTo
			const id = redirectItem.to?.reference?.value

			const document = (await getCachedDocument(collection, id)()) as LegalDoc | Product
			redirectUrl = `/${collection}/${document?.slug}`
		} else if (typeof redirectItem.to?.reference?.value === 'object') {
			const collection = redirectItem.to?.reference?.relationTo
			const slug = redirectItem.to?.reference?.value?.slug
			redirectUrl = `/${collection}/${slug}`
		}

		if (redirectUrl) redirect(redirectUrl)
	}

	if (disableNotFound) return null

	notFound()
}
