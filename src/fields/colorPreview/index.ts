import type { Field } from 'payload'

export const colorPreviewField = (): Field => ({
	name: 'colorPreview',
	type: 'ui',
	admin: {
		components: {
			Field: {
				path: '@/fields/colorPreview/ColorPreviewComponent#ColorPreviewComponent',
			},
		},
	},
})
