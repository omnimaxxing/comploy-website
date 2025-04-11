import type { Field } from 'payload'

export const iconField = (options?: {
	name?: string
	label?: string
	required?: boolean
	defaultValue?: string
}): Field => {
	const {
		name = 'icon',
		label = 'Icon',
		required = false,
		defaultValue = 'heroicons:sparkles',
	} = options || {}

	return {
		name,
		label,
		type: 'text',
		required,
		defaultValue,
		admin: {
			components: {
				Field: {
					path: '@/components/admin/IconSelector#default',
				},
			},
		},
	}
}
