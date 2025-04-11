import type { CheckboxField, TextField } from 'payload'

import { formatSlugHook } from './formatSlug'

type Overrides = {
	slugOverrides?: Partial<TextField>
	checkboxOverrides?: Partial<CheckboxField>
}

type Slug = (fieldsToUse?: string[], overrides?: Overrides) => [TextField, CheckboxField]

export const slugField: Slug = (fieldsToUse = ['title'], overrides = {}) => {
	const { slugOverrides, checkboxOverrides } = overrides

	const checkBoxField: CheckboxField = {
		name: 'slugLock',
		type: 'checkbox',
		defaultValue: true,
		admin: {
			hidden: true,
			position: 'sidebar',
		},
		...checkboxOverrides,
	}

	// Expect ts error here because of TypeScript mismatching Partial<TextField> with TextField
	// @ts-expect-error
	const slugField: TextField = {
		name: 'slug',
		type: 'text',
		index: true,
		label: 'Slug',
		...(slugOverrides || {}),
		hooks: {
			beforeValidate: [formatSlugHook(fieldsToUse)],
		},
		admin: {
			position: 'sidebar',
			...(slugOverrides?.admin || {}),
			components: {
				Field: {
					path: '@/fields/slug/SlugComponent#SlugComponent',
					clientProps: {
						fieldsToUse,
						checkboxFieldPath: checkBoxField.name,
					},
				},
			},
		},
	}

	return [slugField, checkBoxField]
}
