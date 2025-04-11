import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import { heroGroup } from '@/fields/heroGroup'
import { ctaGroup } from '@/fields/ctaGroup'
import { createRevalidateGlobal } from '@/hooks/revalidateGlobal'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import {
	FixedToolbarFeature,
	HeadingFeature,
	HorizontalRuleFeature,
	InlineToolbarFeature,
	lexicalEditor,
} from '@payloadcms/richtext-lexical'
import type { GlobalConfig } from 'payload'
import { seoGroup } from '@/fields/seoGroup'

const ServicesGlobal: GlobalConfig = {
	slug: 'services-global',
	label: 'Services Page',
	access: {
		read: anyone,
		update: admins,
	},
	admin: {
		description: 'Content for the Services Page, displayed at /services.',
		meta: {
			title: 'Services Page',
			description: 'Global Settings and Content for the services page, displayed at /services.',
		},
		livePreview: {
			url: ({ data }) => {
				const path = generatePreviewPath({
					global: 'services-global',
				})

				return `${getServerSideURL()}${path}`
			},
		},
		preview: (data) => {
			const path = generatePreviewPath({
				global: 'services-global',
			})

			return `${getServerSideURL()}${path}`
		},
	},
	fields: [
		{
			type: 'tabs',
			label: 'Content Sections',
			tabs: [
				{
					label: 'SEO & Metadata',
					fields: [seoGroup()],
				},
				{
					label: 'Hero Section',
					description: 'The hero section of the services page',
					fields: [heroGroup()],
				},
				{
					label: 'Featured Services Section',
					description: 'The featured services section of the services page',
					fields: [
						{
							name: 'services',
							type: 'relationship',
							relationTo: 'services',
							hasMany: true,
							admin: {
								description: 'Select the services to display in the featured services section',
							},
						},
					],
				},
			],
		},
	],
	hooks: {
		afterChange: [createRevalidateGlobal('services-global')],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100,
			},
		},
	},
}

export default ServicesGlobal
