import type { Field, FieldHook } from 'payload'

// Hook to validate color values against available colors
const validateColorValue: FieldHook = async ({ value, req }) => {
	// If no value, return as is (validation for required fields happens elsewhere)
	if (!value) return value

	try {
		// Get color settings from req if available
		const colorSettings = req.payload?.globals?.['color-settings']

		// If we don't have settings yet, just return the value
		if (!colorSettings) return value

		// Check if this is a custom color (like "primary-500")
		const [family, shade] = value.split('-')

		// Validate against custom colors
		const customColor = colorSettings.customColors?.find((color) => color.name === family)
		if (customColor) {
			const validShade = customColor.shades.some((s) => s.shade === shade)
			if (validShade) return value
		}

		// Validate against enabled Tailwind colors
		const enabledTailwindColors = colorSettings.displaySettings?.enabledTailwindColors || []
		if (enabledTailwindColors.includes(family)) {
			return value
		}

		// If we get here, the color is not valid - return a default
		return 'blue-500' // Default fallback
	} catch (error) {
		console.error('Error validating color value:', error)
		return value
	}
}

export const tailwindColorField = (options?: {
	name?: string
	label?: string
	required?: boolean
	defaultValue?: string
}): Field => {
	const {
		name = 'color',
		label = 'Color',
		required = false,
		defaultValue = 'blue-500',
	} = options || {}

	return {
		name,
		label,
		type: 'text',
		required,
		defaultValue,
		hooks: {
			beforeValidate: [validateColorValue],
		},
		admin: {
			components: {
				Field: {
					path: '@/components/admin/TailwindColorSelector#default',
				},
			},
		},
	}
}
