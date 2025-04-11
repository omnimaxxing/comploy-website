import deepMerge from '@/utilities/deepMerge'
import type { Field } from 'payload'

type CTAGroupType = (options?: { overrides?: Record<string, unknown> }) => Field

export const ctaGroup: CTAGroupType = ({ overrides = {} } = {}) => {
	const ctaResult: Field = {
		name: 'cta',
		label: 'Call to Action',
		type: 'group',
		fields: [
			{
				name: 'title',
				type: 'text',
				label: 'Title',
				required: true,
				admin: {
					description: 'Use \\n for line breaks in the title',
				},
				defaultValue: 'Ready to Build Something\nExtraordinary?',
			},
			{
				name: 'subtitle',
				type: 'textarea',
				label: 'Subtitle',
				required: false,
				defaultValue:
					"Let's combine your vision with our expertise to create digital solutions that set new standards.",
			},
			{
				name: 'primaryButton',
				type: 'group',
				label: 'Primary Button',
				fields: [
					{
						name: 'text',
						type: 'text',
						label: 'Button Text',
						required: true,
						defaultValue: 'Start Your Project',
					},
					{
						name: 'href',
						type: 'text',
						label: 'Button Link',
						required: true,
						defaultValue: '/contact',
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
						label: 'Button Text',
						required: true,
						defaultValue: 'Schedule a Call',
					},
					{
						name: 'href',
						type: 'text',
						label: 'Button Link',
						required: true,
						defaultValue: '/contact/schedule-call',
					},
				],
			},
		],
	}

	return deepMerge(ctaResult, overrides)
}
