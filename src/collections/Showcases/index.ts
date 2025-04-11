import { anyone } from '@/access/anyone'
import { admins } from '@/access/admins'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { revalidateShowcase } from './hooks/revalidateShowcase'
import { revalidateShowcaseAfterDelete } from './hooks/revalidateShowcaseAfterDelete'

export const Showcases: CollectionConfig = {
	slug: 'showcases',
	labels: {
		singular: 'Showcase',
		plural: 'Showcases',
	},

	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name', 'publishedAt', '_status', 'views', 'image'],
		description: 'Create and manage showcase examples built with Payload CMS.',
		group: 'Content',
		livePreview: {
			url: ({ data, req }) => {
				const path = generatePreviewPath({
					slug: typeof data?.slug === 'string' ? data.slug : '',
					collection: 'showcases',
					req,
				})

				return path
			},
		},
		preview: (data, { req }) =>
			generatePreviewPath({
				slug: typeof data?.slug === 'string' ? data.slug : '',
				collection: 'showcases',
				req,
			}),
	},

	access: {
		read: anyone,
		create: admins,
		update: admins,
		delete: admins,
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			label: 'Name',
			admin: { placeholder: 'Project Name' },
		},
		{
			name: 'description',
			type: 'textarea',
			label: 'Description',
			admin: {
				placeholder: 'A brief description of this project.',
			},
		},
		{
			name: 'websiteUrl',
			type: 'text',
			required: true,
			label: 'Website URL',
			admin: {
				placeholder: 'https://example.com',
				description: 'Live website URL for this project',
			},
		},
		{
			name: 'githubUrl',
			type: 'text',
			required: false,
			label: 'GitHub URL',
			admin: {
				placeholder: 'https://github.com/username/repo',
				description: 'GitHub repository URL (optional)',
			},
		},
		{
			name: 'image',
			type: 'upload',
			label: 'Image',
			relationTo: 'media',
			required: false,
			admin: {
				description: 'Screenshot or preview image of the project',
			},
		},
		{
			name: 'tags',
			type: 'relationship',
			label: 'Tags',
			relationTo: 'tags',
			hasMany: true,
			admin: {
				description: 'Tags for this showcase',
			},
		},
		{
			name: 'featured',
			type: 'checkbox',
			label: 'Featured Showcase',
			defaultValue: false,
			admin: {
				description: 'Check to mark this as a featured showcase',
			},
		},
		{
			name: 'views',
			type: 'number',
			label: 'Views',
			defaultValue: 0,
			admin: {
				position: 'sidebar',
				readOnly: true,
				description: 'Number of times this showcase has been viewed',
			},
		},
		...slugField(),
	],
	hooks: {
		afterChange: [revalidateShowcase],
		afterDelete: [revalidateShowcaseAfterDelete],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100,
			},
			schedulePublish: true,
		},
		maxPerDoc: 50,
	},
	timestamps: true,
}
