import type { ArrayField, Field } from 'payload'
import deepMerge from '@/utilities/deepMerge'
import { buttonField } from './buttonField'

type ButtonGroupType = (options?: {
	overrides?: Partial<ArrayField>
}) => Field

export const buttonGroup: ButtonGroupType = ({ overrides = {} } = {}) => {
	const generatedButtonGroup: Field = {
		name: 'buttons',
		type: 'array',
		fields: [buttonField()],
	}

	return deepMerge(generatedButtonGroup, overrides)
}
