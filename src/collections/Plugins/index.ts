import { anyone } from '@/access/anyone'
import { admins } from '@/access/admins'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { revalidatePlugin } from '@/collections/Plugins/hooks/revalidatePlugin'
import { revalidatePluginAfterDelete } from '@/collections/Plugins/hooks/revalidatePluginAfterDelete'
import { setMainImage } from '@/collections/Plugins/hooks/setMainImage'
import { validateRelationships } from '@/collections/Plugins/hooks/validateRelationships'

// Define collection slugs to satisfy TypeScript
type PluginCollectionSlug = 'plugins' | 'categories' | 'tags' | 'media' | 'users'

export const Plugins: CollectionConfig = {
	slug: 'plugins',
	labels: {
		singular: 'Plugin',
		plural: 'Plugins',
	},

	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name', 'publishedAt', 'status'],
		description: 'Create and manage plugins for Payload CMS.',
		group: 'Content',
		components: {
			// Add the GitHub update button before the list view
			beforeList: ['@/components/UpdateGitHubButton'],
		},
		livePreview: {
			url: ({ data, req }) => {
				const path = generatePreviewPath({
					slug: typeof data?.slug === 'string' ? data.slug : '',
					collection: 'plugins',
					req,
				})

				return path
			},
		},
		preview: (data, { req }) =>
			generatePreviewPath({
				slug: typeof data?.slug === 'string' ? data.slug : '',
				collection: 'plugins',
				req,
			}),
	},

	access: {
		read: anyone,
		create: anyone,
		update: anyone,
		delete: anyone,
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			label: 'Name',
			admin: { placeholder: 'Plugin Name' },
		},
		{
			name: 'shortDescription',
			type: 'textarea',
			label: 'Short Description',
			admin: {
				placeholder: 'A brief description of this plugin.',
			},
		},
		{
			name: 'githubUrl',
			type: 'text',
			required: true,
			label: 'GitHub URL',
			admin: {
				placeholder: 'https://github.com/username/repo',
				description: 'GitHub repository URL',
			},
		},
		{
			name: 'category',
			type: 'relationship',
			relationTo: 'categories' as PluginCollectionSlug,
			hasMany: false,
			label: 'Category',
			admin: {
				description: 'Primary category for this plugin',
			},
			validate: (value) => {
				if (value && typeof value === 'object' && 'relationTo' in value && 'value' in value) {
					return true
				}
				if (typeof value === 'string' || typeof value === 'number') {
					return true
				}
				return 'Invalid relationship format'
			},
		},
		{
			name: 'tags',
			type: 'relationship',
			relationTo: 'tags' as PluginCollectionSlug,
			hasMany: true,
			label: 'Tags',
			admin: {
				description: 'Tags to help users find this plugin',
			},
			validate: (value) => {
				if (value && Array.isArray(value) && value.length > 10) {
					return 'Maximum 10 tags allowed'
				}
				return true
			},
		},
		{
			name: 'isOfficial',
			type: 'checkbox',
			label: 'Official Plugin',
			defaultValue: false,
			admin: {
				description: 'Is this an official plugin developed by PayloadCMS?',
			},
		},
		{
			name: 'installCommands',
			type: 'array',
			label: 'Installation Commands',
			admin: {
				description: 'Commands to install this plugin with different package managers',
			},
			fields: [
				{
					name: 'packageManager',
					type: 'select',
					label: 'Package Manager',
					required: true,
					options: [
						{ label: 'npm', value: 'npm' },
						{ label: 'yarn', value: 'yarn' },
						{ label: 'pnpm', value: 'pnpm' },
						{ label: 'bun', value: 'bun' },
						{ label: 'Other', value: 'other' },
					],
				},
				{
					name: 'customLabel',
					type: 'text',
					label: 'Custom Label',
					admin: {
						description: 'Custom label for the package manager (only if Other is selected)',
						condition: (data, siblingData) => siblingData?.packageManager === 'other',
					},
				},
				{
					name: 'command',
					type: 'text',
					label: 'Command',
					required: true,
					admin: {
						placeholder: 'npm install package-name',
					},
				},
			],
		},
		{
			name: 'fullDescription',
			type: 'richText',
			label: 'Full Description',
			admin: {
				description: 'Detailed description of the plugin',
			},
		},
		{
			name: 'relatedLinks',
			type: 'group',
			label: 'Related Links',
			admin: {
				description: 'Additional links related to the plugin',
			},
			fields: [
				{
					name: 'npmUrl',
					type: 'text',
					label: 'NPM Package URL',
					admin: {
						placeholder: 'https://www.npmjs.com/package/your-package',
					},
				},
				{
					name: 'demoUrl',
					type: 'text',
					label: 'Demo URL',
					admin: {
						placeholder: 'https://example.com/demo',
					},
				},
				{
					name: 'videoUrl',
					type: 'text',
					label: 'Video URL',
					admin: {
						placeholder: 'https://www.youtube.com/watch?v=...',
					},
				},
			],
		},
		{
			name: 'imagesGallery',
			type: 'upload',
			relationTo: 'media' as PluginCollectionSlug,
			hasMany: true,
			label: 'Image Gallery',
			admin: {
				description: 'Upload multiple images to showcase your plugin',
			},
		},
		{
			name: 'mainImage',
			type: 'upload',
			relationTo: 'media' as PluginCollectionSlug,
			hasMany: false,
			label: 'Main Image',
			admin: {
				description: 'Main image for this plugin (automatically set from first gallery image)',
				readOnly: true,
				position: 'sidebar',
			},
		},
		{
			name: 'githubData',
			type: 'group',
			label: 'GitHub Repository Data',
			admin: {
				description: 'Data fetched from GitHub API (updates automatically)',
				readOnly: true,
			},
			fields: [
				{
					name: 'stars',
					type: 'number',
					label: 'Stars',
				},
				{
					name: 'forks',
					type: 'number',
					label: 'Forks',
				},
				{
					name: 'owner',
					type: 'text',
					label: 'Repository Owner',
				},
				{
					name: 'lastCommit',
					type: 'date',
					label: 'Last Commit Date',
				},
				{
					name: 'license',
					type: 'text',
					label: 'License',
				},
				{
					name: 'lastUpdated',
					type: 'date',
					label: 'Data Last Updated',
					admin: {
						position: 'sidebar',
						description: 'When the GitHub data was last refreshed',
					},
				},
			],
		},
		{
			name: 'verification',
			type: 'group',
			label: 'Verification Status',
			admin: {
				description: 'Plugin verification information',
			},
			fields: [
				{
					name: 'isVerified',
					type: 'checkbox',
					label: 'Is Verified',
					defaultValue: false,
				},
				{
					name: 'verifiedBy',
					type: 'text',
					label: 'Verified By',
					admin: {
						condition: (data, siblingData) => siblingData?.isVerified,
					},
				},
				{
					name: 'verifiedAt',
					type: 'date',
					label: 'Verified At',
					admin: {
						condition: (data, siblingData) => siblingData?.isVerified,
					},
				},
				{
					name: 'githubVerification',
					type: 'group',
					label: 'GitHub Verification',
					admin: {
						description: 'Data related to GitHub verification',
					},
					fields: [
						{
							name: 'userId',
							type: 'text',
							label: 'GitHub User ID',
							admin: {
								readOnly: true,
							},
						},
						{
							name: 'username',
							type: 'text',
							label: 'GitHub Username',
							admin: {
								readOnly: true,
							},
						},
						{
							name: 'method',
							type: 'select',
							label: 'Verification Method',
							options: [
								{
									label: 'Repository Owner',
									value: 'owner',
								},
								{
									label: 'Repository Contributor',
									value: 'contributor',
								},
								{
									label: 'Manual Verification',
									value: 'manual',
								},
							],
							admin: {
								readOnly: true,
							},
						},
					],
				},
			],
		},
		{
			name: 'rating',
			type: 'group',
			label: 'Plugin Rating',
			admin: {
				description: 'Rating information for this plugin',
			},
			fields: [
				{
					name: 'upvotes',
					type: 'number',
					label: 'Upvotes',
					defaultValue: 0,
					admin: {
						readOnly: true,
					},
				},
				{
					name: 'downvotes',
					type: 'number',
					label: 'Downvotes',
					defaultValue: 0,
					admin: {
						readOnly: true,
					},
				},
				{
					name: 'score',
					type: 'number',
					label: 'Total Score',
					defaultValue: 0,
					admin: {
						readOnly: true,
						description: 'Calculated as upvotes - downvotes',
					},
				},
			],
		},
		{
			name: 'views',
			type: 'number',
			label: 'Views',
			defaultValue: 0,
			admin: {
				description: 'Number of times this plugin page has been viewed',
				readOnly: true,
			},
		},
		{
			name: 'comments',
			type: 'array',
			label: 'User Discussions',
			admin: {
				description: 'Comments left by users for this plugin',
			},
			fields: [
				{
					name: 'author',
					type: 'text',
					label: 'Author Name',
					required: true,
				},
				{
					name: 'comment',
					type: 'textarea',
					label: 'Comment',
					required: true,
				},
				{
					name: 'createdAt',
					type: 'date',
					label: 'Created At',
					admin: {
						readOnly: true,
					},
				},
			],
		},
		...slugField(['name']),
	],
	hooks: {
		beforeValidate: [validateRelationships],
		beforeChange: [setMainImage],
		afterChange: [revalidatePlugin],
		afterDelete: [revalidatePluginAfterDelete],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100,
			},
		},
		maxPerDoc: 50,
	},
	timestamps: true,
}
