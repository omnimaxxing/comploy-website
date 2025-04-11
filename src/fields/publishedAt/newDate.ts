import type { FieldHook } from 'payload'

export const newDate: FieldHook = ({ siblingData, value }) => {
	if (siblingData._status === 'published' && !value) {
		return new Date()
	}
	return value
}
