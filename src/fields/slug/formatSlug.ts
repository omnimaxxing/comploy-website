import type { FieldHook } from 'payload'

export const formatSlug = (val: string): string =>
	val
		.replace(/ /g, '-')
		.replace(/[^\w-]+/g, '')
		.toLowerCase()

export const formatSlugHook =
	(fieldsToUse: string[]): FieldHook =>
	({ data, operation, originalDoc, value }) => {
		if (typeof value === 'string') {
			return formatSlug(value)
		}

		if (operation === 'create' || !data?.slug) {
			const fallbackData = fieldsToUse
				.map((field) => data?.[field])
				.filter((fieldValue) => typeof fieldValue === 'string')
				.join(' ')

			if (fallbackData) {
				return formatSlug(fallbackData)
			}
		}

		return value
	}
