import { useEffect, useState } from 'react'

type ColorShade = {
	shade: string
	hexValue: string
}

type CustomColor = {
	name: string
	shades: ColorShade[]
	description?: string
}

type DisplaySettings = {
	showCustomColorsFirst: boolean
	enabledTailwindColors: string[]
}

export type ColorSettings = {
	customColors: CustomColor[]
	displaySettings: DisplaySettings
}

export const useColorSettings = () => {
	const [colorSettings, setColorSettings] = useState<ColorSettings | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)

	useEffect(() => {
		const fetchColorSettings = async () => {
			try {
				setLoading(true)
				const response = await fetch('/api/globals/color-settings')

				if (!response.ok) {
					throw new Error('Failed to fetch color settings')
				}

				const data = await response.json()
				setColorSettings(data)
			} catch (err) {
				setError(err instanceof Error ? err : new Error('Unknown error occurred'))
			} finally {
				setLoading(false)
			}
		}

		fetchColorSettings()
	}, [])

	return { colorSettings, loading, error }
}

// Helper function to convert custom colors to the format expected by the TailwindColorSelector
export const formatCustomColorsForSelector = (customColors: CustomColor[] = []) => {
	const formattedColors: Record<string, string[]> = {}
	const colorMap: Record<string, Record<string, string>> = {}

	customColors.forEach((color) => {
		// Add color name and available shades
		formattedColors[color.name] = color.shades.map((s) => s.shade)

		// Add color hex values to the map
		colorMap[color.name] = {}

		// Make sure all shades have valid hex values
		color.shades.forEach((shade) => {
			// Ensure the hex value starts with #
			let hexValue = shade.hexValue
			if (!hexValue.startsWith('#')) {
				hexValue = `#${hexValue}`
			}

			// Validate hex format (simple validation)
			const isValidHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hexValue)

			// Use the hex value if valid, otherwise fallback to a default color
			colorMap[color.name][shade.shade] = isValidHex ? hexValue : '#cccccc'
		})
	})

	return { formattedColors, colorMap }
}
