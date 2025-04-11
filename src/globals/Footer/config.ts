import { iconField } from '@/fields/iconField'
import { createRevalidateGlobal } from '@/hooks/revalidateGlobal'
import type { GlobalConfig } from 'payload'

const Footer: GlobalConfig = {
	slug: 'footer',
	admin: {
		meta: {
			title: 'Footer',
			description: 'Configure the site footer content and settings.',
		},
	},
	access: {
		read: () => true,
	},
	fields: [
		{
			name: 'tagline',
			type: 'textarea',
			defaultValue: 'Discover and share plugins for Payload CMS. Extend your headless CMS with community-built solutions.',
			admin: {
				description: 'The tagline to display in the footer.',
			},
		},
		{
			name: 'linkColumns',
			type: 'array',
			label: 'Link Columns',
			admin: {
				description: 'Configure columns of links in the footer. Add as many columns as needed.',
			},
			fields: [
				{
					name: 'heading',
					type: 'text',
					required: true,
					label: 'Column Heading',
				},
				{
					name: 'links',
					type: 'array',
					label: 'Links',
					admin: {
						description: 'Add links to display in this column',
					},
					fields: [
						{
							name: 'label',
							type: 'text',
							required: true,
							label: 'Link Label',
						},
						{
							name: 'url',
							type: 'text',
							required: true,
							label: 'Link URL',
						},
					],
				},
			],
		},
		{
			name: 'officialLinks',
			type: 'group',
			label: 'Official Payload Links',
			admin: {
				description: 'Links to official Payload resources',
			},
			fields: [
				{
					name: 'discord',
					type: 'text',
					label: 'Discord Server URL',
					defaultValue: 'https://discord.com/invite/payload',
				},
				iconField({
					name: 'discordIcon',
					label: 'Icon',
					defaultValue: 'heroicons:puzzle-piece',
				}),
				{
					name: 'github',
					type: 'text',
					label: 'GitHub Repository URL',
					defaultValue: 'https://github.com/payloadcms/payload',
				},
				iconField({
					name: 'githubIcon',
					label: 'Icon',
					defaultValue: 'heroicons:puzzle-piece',
				}),
				
				{
					name: 'website',
					type: 'text',
					label: 'Payload CMS Website URL',
					defaultValue: 'https://payloadcms.com',
				},
				iconField({
					name: 'websiteIcon',
					label: 'Icon',
					defaultValue: 'heroicons:puzzle-piece',
				}),
			],
		},
		{
			name: 'legalLinks',
			type: 'array',
			label: 'Legal Links',
			admin: {
				description: 'Links to legal documents like privacy policy and terms of service',
			},
			fields: [
				{
					name: 'document',
					type: 'relationship',
					relationTo: 'legal-docs',
					required: false,
					label: 'Legal Document',
					admin: {
						description: 'Select a legal document to link to. If not selected, you must provide a custom URL.',
					},
				},
				{
					name: 'label',
					type: 'text',
					required: true,
					label: 'Link Label',
				},
				{
					name: 'customUrl',
					type: 'text',
					required: false,
					label: 'Custom URL',
					admin: {
						description: 'Optional custom URL. Only used if no document is selected.',
						condition: (data, siblingData) => !siblingData?.document,
					},
				},
			],
			validate: (value) => {
				if (!Array.isArray(value)) return true
				
				for (const link of value as Array<{ document?: unknown; customUrl?: string }>) {
					if (!link.document && !link.customUrl) {
						return 'Each legal link must have either a document or a custom URL'
					}
				}
				return true
			},
		},
		{
			name: 'additionalSettings',
			type: 'group',
			label: 'Additional Settings',
			fields: [
				{
					name: 'copyrightText',
					type: 'text',
					label: 'Custom Copyright Text',
					admin: {
						description: 'Leave empty to use default copyright text.',
					},
				},
			],
		},
	],

	hooks: {
		afterChange: [createRevalidateGlobal('footer')],
	},
}

export default Footer
