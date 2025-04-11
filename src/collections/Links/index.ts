import type { CollectionConfig } from 'payload'

export const Links: CollectionConfig = {
	slug: 'links',
	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name'],
	},
	fields: [
		{
			name: 'name',
			label: 'Display Name',
			type: 'text',
			required: true,
		},
		{
			name: 'description',
			label: 'Description',
			type: 'text',
			required: false,
		},
		{
			name: 'gradient',
			label: 'Gradient Colors for Navbar',
			type: 'group',
			fields: [
				{
					name: 'from',
					type: 'text',
					required: false,
					admin: {
						placeholder: 'from-orange-500',
					},
				},
				{
					name: 'to',
					type: 'text',
					required: false,
					admin: {
						placeholder: 'to-amber-500',
					},
				},
			],
		},
		{
			name: 'url',
			type: 'text',
			unique: true,
			label: 'Page Url',
			required: true,
			admin: {
				placeholder: '/about',
				description:
					'This is the URL that the link will lead to. It can lead to internal or external pages. (e.g. /shop or https://www.google.com)',
			},
		},
		{
			name: 'newTab',
			type: 'checkbox',
			label: 'Open in new tab',
			defaultValue: false,
		},
	],
}
