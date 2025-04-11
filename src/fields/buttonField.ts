import type { Field } from 'payload'
import deepMerge from '@/utilities/deepMerge'

type ButtonType = (options?: { overrides?: Record<string, unknown> }) => Field

export const buttonField: ButtonType = ({ overrides = {} } = {}) => {
	const buttonResult: Field = {
		name: 'button',
		type: 'group',
		fields: [
			{
				name: 'buttonText',
				type: 'text',
				label: 'Button Text',
				required: true,
				defaultValue: 'Learn More',
			},
			{
				name: 'buttonLink',
				type: 'relationship',
				label: 'Button Link',
				relationTo: 'links',
				hasMany: false,
				required: true,
				defaultValue: 1,
			},
		],
	}

	return deepMerge(buttonResult, overrides)
}
