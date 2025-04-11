import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import type {  LegalDoc } from '@/payload-types'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { Media } from '@/collections/Media'
import { SVGs } from '@/collections/SVGs'
import { appleOAuth } from '@/plugins/appleOAuth'
import { getServerSideURL } from '@/utilities/getURL'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { seoPlugin } from '@payloadcms/plugin-seo'
import type { GenerateImage, GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { stripePlugin } from '@payloadcms/plugin-stripe'
import { s3Storage } from '@payloadcms/storage-s3'

import type { Plugin } from 'payload'
import { googleOAuth } from './google0Auth'
import { pluginSearch } from './searchPlugin'

export const plugins: Plugin[] = [
	/*
	s3Storage({
		collections: {
			media: {
				prefix: 'media',
			},
			documents: {
				prefix: 'documents',
			},
			videos: {
				prefix: 'videos',
			},
		},
		bucket: process.env.S3_BUCKET,

		config: {
			forcePathStyle: true, // Required for Supabase S3 storage
			credentials: {
				accessKeyId: process.env.S3_ACCESS_KEY_ID,
				secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
			},
			region: process.env.S3_REGION,
			endpoint: process.env.S3_ENDPOINT,
		},
	}),
	*/
	vercelBlobStorage({
		enabled: true, // Optional, defaults to true
		// Specify which collections should use Vercel Blob
		collections: {
			media: true,
			documents: {
				prefix: 'documents',
			},
			videos: {
				prefix: 'videos',
			},
			'lottie-animations': {
				prefix: 'lottie-animations',
			},
			svgs: {
				prefix: 'svgs',
			},
		} as Record<string, any>,
		// Token provided by Vercel once Blob storage is added to your Vercel project
		token: process.env.BLOB_READ_WRITE_TOKEN,
	}),
	/*
	sentryPlugin({
		Sentry,
	}),
*/

	/*
	nestedDocsPlugin({
		//collections: ['links', 'categories'],
	}),
	*/
	//googleOAuth,
	//appleOAuth,
	pluginSearch,
]
