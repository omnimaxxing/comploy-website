import type { Field } from 'payload'
import deepMerge from '@/utilities/deepMerge'

type PublishedAt = (options?: { overrides?: Record<string, unknown> }) => Field

export const publishedAtField: PublishedAt = ({ overrides = {} } = {}) => {
	const publishedResult: Field = {
		name: 'publishedAt',
		type: 'date',
		admin: {
			date: {
				pickerAppearance: 'dayAndTime',
			},
			readOnly: true,
			position: 'sidebar',
		},
		label: 'Published At',
		hooks: {
			beforeChange: [
				({ siblingData, value }) => {
					if (siblingData._status === 'published' && !value) {
						return new Date()
					}
					return value
				},
			],
		},
	}

	return deepMerge(publishedResult, overrides)
}
