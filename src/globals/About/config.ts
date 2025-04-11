import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import { defaultLexical } from '@/fields/defaultLexical'
import { seoGroup } from '@/fields/seoGroup'
import { createRevalidateGlobal } from '@/hooks/revalidateGlobal'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import type { GlobalConfig } from 'payload'

const AboutGlobal: GlobalConfig = {
	slug: 'about-global',
	label: 'About Page',
	access: {
		read: anyone,
		update: admins,
	},
	admin: {
		description: 'Configure the about page content and SEO settings.',
		meta: {
			title: 'About Page',
			description: 'Configure the about page content and SEO settings.',
		},
		livePreview: {
			url: ({ data }) => {
				const path = generatePreviewPath({
					global: 'about-global',
				})

				return `${getServerSideURL()}${path}`
			},
		},
		preview: (data) => {
			const path = generatePreviewPath({
				global: 'about-global',
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
					description: 'SEO and metadata settings for the about page',
					fields: [seoGroup()],
				},
				{
					label: 'Hero Section',
					fields: [
						{
							name: 'hero',
							type: 'group',
							label: 'Hero',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Title',
									defaultValue: 'Our Mission',
								},
								{
									type: 'textarea',
									name: 'subtitle',
									label: 'Subtitle',
									defaultValue: 'Building a better ecosystem for the Payload CMS community',
								},
							],
						},
					],
				},
				{
					label: 'Main Content',
					fields: [
						{
							name: 'mainContent',
							type: 'richText',
							label: 'Page Content',
                            editor: defaultLexical,
						},
					],
				},
				{
					label: 'Footer Content',
					fields: [
						{
							name: 'footer',
							type: 'group',
							label: 'Footer Section',
							fields: [
								{
									type: 'text',
									name: 'quote',
									label: 'Quote Text',
									defaultValue: '"All things Payload, all in one place."',
								},
								{
									type: 'group',
									name: 'button',
									label: 'Button',
									fields: [
										{
											type: 'text',
											name: 'text',
											label: 'Button Text',
											defaultValue: 'Join Our Mission',
										},
										{
											type: 'text',
											name: 'link',
											label: 'Button Link',
											defaultValue: '/submit',
										},
									],
								},
							],
						},
					],
				},
			],
		},
	],
	hooks: {
		afterChange: [createRevalidateGlobal('about-global')],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100,
			},
		},
	},
}

export default AboutGlobal 