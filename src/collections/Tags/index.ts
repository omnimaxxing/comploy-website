import { anyone } from '@/access/anyone'
import { admins } from '@/access/admins'
import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'

export const Tags: CollectionConfig = {
	slug: 'tags',
	labels: {
		singular: 'Tag',
		plural: 'Tags',
	},

	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name', 'createdAt'],
		description: 'Tags for labeling plugins',
		group: 'Content',
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
			admin: { placeholder: 'Tag Name' },
			unique: true,
		},
		{
			name: 'color',
			type: 'select',
			options: [
				{ label: 'Blue', value: 'blue' },
				{ label: 'Green', value: 'green' },
				{ label: 'Red', value: 'red' },
				{ label: 'Purple', value: 'purple' },
				{ label: 'Yellow', value: 'yellow' },
				{ label: 'Orange', value: 'orange' },
				{ label: 'Pink', value: 'pink' },
				{ label: 'Gray', value: 'gray' },
			],
			defaultValue: 'blue',
			admin: {
				description: 'Color of the tag when displayed in the UI',
			},
		},
		...slugField(['name']),
	],
	timestamps: true,
}
