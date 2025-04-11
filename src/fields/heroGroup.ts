import deepMerge from '@/utilities/deepMerge'
import type { Field } from 'payload'
import { buttonGroup } from './buttonGroup'
import { iconField } from './iconField'
import { tailwindColorField } from './tailwindColorField'

type HeroGroupType = (options?: { overrides?: Record<string, unknown> }) => Field

export const heroGroup: HeroGroupType = ({ overrides = {} } = {}) => {
	const heroResult: Field = {
		name: 'hero',
		label: 'Hero',
		type: 'group',
		fields: [
			{
				name: 'tagText',
				type: 'text',
				label: 'Tag Text',
				required: true,
				defaultValue: 'Tag Text',
			},
			iconField({
				name: 'tagIcon',
				label: 'Tag Icon',
				required: true,
				defaultValue: 'heroicons:sparkles',
			}),
			{
				name: 'title',
				type: 'text',
				label: 'Title Text',
				required: true,
				defaultValue: 'Title Text',
			},
			{
				name: 'gradientWord',
				type: 'text',
				label: 'Gradient Word',
				required: true,
				defaultValue: 'Gradient Word',
			},
			{
				name: 'subtitle',
				type: 'textarea',
				label: 'Subtitle',
				required: false,
				defaultValue: 'Subtitle Text',
			},
			tailwindColorField({
				name: 'gradientFromColor',
				label: 'Gradient From Color',
				required: true,
				defaultValue: 'blue-500',
			}),
			tailwindColorField({
				name: 'gradientToColor',
				label: 'Gradient To Color',
				required: true,
				defaultValue: 'cyan-500',
			}),
			{
				name: 'image',
				type: 'upload',
				admin: {
					hidden: true,
				},
				relationTo: 'media',
				label: 'BackgroundImage',
				required: false,
			},
		],
	}

	return deepMerge(heroResult, overrides)
}
