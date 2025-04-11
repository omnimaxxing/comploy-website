import type { CollectionConfig } from 'payload'

import {
	BlocksFeature,
	FixedToolbarFeature,
	HeadingFeature,
	HorizontalRuleFeature,
	InlineToolbarFeature,
	lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { admins } from '@/access/admins'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'

import { anyone } from '@/access/anyone'
import { slugField } from '@/fields/slug'

import { getServerSideURL } from '@/utilities/getURL'

import { revalidateLegal } from './hooks/revalidateLegal'
import { defaultLexical } from '@/fields/defaultLexical'

export const LegalDocs: CollectionConfig = {
	slug: 'legal-docs',
	labels: {
		singular: 'Legal Document',
		plural: 'Legal Documents',
	},
	access: {
		create: admins,
		delete: admins,
		read: anyone,
		update: admins,
	},
	admin: {
		description: 'Legal Documents & Policies for the website.',
		defaultColumns: ['title', 'updatedAt'],
		meta: {
			title: 'Legal Documents',
			description: 'Legal Documents & Policies for the website.',
		},
		livePreview: {
			url: ({ data }) => {
				const path = generatePreviewPath({
					slug: typeof data?.slug === 'string' ? data.slug : '',
					collection: 'legal-docs',
				})

				return `${getServerSideURL()}${path}`
			},
		},
		preview: (data) => {
			const path = generatePreviewPath({
				slug: typeof data?.slug === 'string' ? data.slug : '',
				collection: 'legal-docs',
			})

			return `${getServerSideURL()}${path}`
		},
		useAsTitle: 'title',
	},

	fields: [
		{
			name: 'title',
			type: 'text',
			required: true,
		},
		...slugField(),
		{
			name: 'content',
			type: 'richText',
			editor: defaultLexical,
			label: false,
			required: true,
			admin: {
				description:
					'Write your document content here. Use the toolbar to format text, add links, and more.',
				components: {
					Label: '@/fields/DocumentContentField',
				},
			},
		},
	],
	hooks: {
		afterChange: [revalidateLegal],
		afterRead: [],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100, // We set this interval for optimal live preview
			},
		},
		maxPerDoc: 50,
	},
}
