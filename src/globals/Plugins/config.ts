import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import { defaultLexical } from '@/fields/defaultLexical'
import { seoGroup } from '@/fields/seoGroup'
import { createRevalidateGlobal } from '@/hooks/revalidateGlobal'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import type { GlobalConfig } from 'payload'
import { buttonField } from '../../fields/buttonField'

const PluginsGlobal: GlobalConfig = {
	slug: 'plugins-global',
	label: 'Plugins Page',
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
					global: 'plugins-global',
				})

				return `${getServerSideURL()}${path}`
			},
		},
		preview: (data) => {
			const path = generatePreviewPath({
				global: 'plugins-global',
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
								{
									type: 'array',
									name: 'animatedTags',
									label: 'Animated Tags',
									fields: [
										{
											type: 'text',
											name: 'tag',
											label: 'Tag',
										},
									],
								},
								buttonField({
									overrides: {
										name: 'button1',
										label: 'Button 1',
										defaultValue: {
											label: 'See All Plugins',
											url: '/plugins/all',
										},
									},
								}),
								buttonField({
									overrides: {
										name: 'button2',
										label: 'Button 2',
										defaultValue: {
											label: 'Submit Your Plugin',
											url: '/submit/plugins',
										},
									},
								}),
							],
						},
					],
				},
				{
					label: 'Main Content',
					description: 'Main content for the plugins page',
					fields: [
						{
							name: 'featuredSection',
							type: 'group',
							label: 'Featured Section',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Title',
									defaultValue: 'Featured Plugins',
								},
								{
									type: 'textarea',
									name: 'subtitle',
									label: 'Subtitle',
									defaultValue: 'Highlighted plugins selected by our team',
								},
								{
									name: 'featuredPlugins',
									type: 'relationship',
									label: 'Featured Plugins',
									relationTo: 'plugins',
									hasMany: true,
								},
								{
									name: 'mainPlugin',
									type: 'relationship',
									label: 'Main Featured Plugin',
									relationTo: 'plugins',
									hasMany: false,
								},
							],
						},
						{
							name: 'popularSection',
							type: 'group',
							label: 'Popular Section',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Title',
									defaultValue: 'Popular Plugins',
								},
								{
									type: 'textarea',
									name: 'subtitle',
									label: 'Subtitle',
									defaultValue: 'Well-established plugins trusted by the community',
								},
							],
						},
						{
							name: 'recentPlugins',
							type: 'group',
							label: 'Recent Plugins',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Title',
									defaultValue: 'Recent Plugins',
								},
								{
									type: 'textarea',
									name: 'subtitle',
									label: 'Subtitle',
									defaultValue: 'Newest additions to our plugin ecosystem',
								},
							],
						},
					],
				},
			],
		},
	],
	hooks: {
		afterChange: [createRevalidateGlobal('plugins-global')],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100,
			},
		},
	},
}

export default PluginsGlobal
