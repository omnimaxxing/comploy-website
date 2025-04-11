import deepMerge from '@/utilities/deepMerge'
import type { Field } from 'payload'

type HomeHeroGroupType = (options?: { overrides?: Record<string, unknown> }) => Field

export const homeHeroGroup: HomeHeroGroupType = ({ overrides = {} } = {}) => {
	const heroResult: Field = {
		name: 'hero',
		label: 'Hero',
		type: 'group',
		fields: [
			{
				name: 'description',
				type: 'textarea',
				label: 'Description',
				required: true,
				defaultValue:
					'We craft digital solutions that transform businesses. From web applications to custom software, we bring your vision to life with precision and innovation.',
			},
			{
				name: 'primaryButton',
				type: 'group',
				label: 'Primary Button',
				fields: [
					{
						name: 'text',
						type: 'text',
						required: true,
						defaultValue: 'Explore Our Work',
					},
					{
						name: 'href',
						type: 'text',
						required: true,
						defaultValue: '/projects',
					},
				],
			},
			{
				name: 'secondaryButton',
				type: 'group',
				label: 'Secondary Button',
				fields: [
					{
						name: 'text',
						type: 'text',
						required: true,
						defaultValue: 'Try ImgIn',
					},
					{
						name: 'href',
						type: 'text',
						required: true,
						defaultValue: '/products/imgin',
					},
				],
			},
		],
	}

	return deepMerge(heroResult, overrides)
}
