import { anyone } from '@/access/anyone'
import { admins } from '@/access/admins'
import type { CollectionConfig } from 'payload'
import { slugField } from '@/fields/slug'
import { iconField } from '@/fields/iconField'
import { revalidateCategory } from './hooks/revalidateCategory'
import { revalidateCategoryAfterDelete } from './hooks/revalidateCategoryAfterDelete'

export const Categories: CollectionConfig = {
	slug: 'categories',
	labels: {
		singular: 'Category',
		plural: 'Categories',
	},

	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name', 'slug', 'createdAt'],
		description: 'Categories for organizing plugins',
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
			admin: { placeholder: 'Category Name' },
		},
		{
			name: 'description',
			type: 'textarea',
			label: 'Description',
			admin: {
				description: 'Optional description of this category',
			},
		},
		iconField({
			name: 'icon',
			label: 'Icon',
			defaultValue: 'heroicons:puzzle-piece',
		}),
		...slugField(['name']),
	],
	hooks: {
		afterChange: [revalidateCategory],
		afterDelete: [revalidateCategoryAfterDelete],
	},
	timestamps: true,
}
