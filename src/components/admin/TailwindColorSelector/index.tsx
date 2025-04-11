'use client'

import React, { useState, useEffect } from 'react'
import { useField, FieldLabel } from '@payloadcms/ui'
import { useColorSettings, formatCustomColorsForSelector } from '@/hooks/useColorSettings'

// Define Tailwind color families and their shades
const defaultTailwindColors = {
	slate: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	gray: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	zinc: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	neutral: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	stone: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	red: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	orange: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	amber: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	yellow: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	lime: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	green: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	emerald: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	teal: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	cyan: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	sky: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	blue: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	indigo: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	violet: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	purple: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	fuchsia: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	pink: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
	rose: ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'],
}

// Map Tailwind colors to their approximate hex values for display
const defaultColorMap: Record<string, Record<string, string>> = {
	slate: {
		'50': '#f8fafc',
		'100': '#f1f5f9',
		'200': '#e2e8f0',
		'300': '#cbd5e1',
		'400': '#94a3b8',
		'500': '#64748b',
		'600': '#475569',
		'700': '#334155',
		'800': '#1e293b',
		'900': '#0f172a',
		'950': '#020617',
	},
	gray: {
		'50': '#f9fafb',
		'100': '#f3f4f6',
		'200': '#e5e7eb',
		'300': '#d1d5db',
		'400': '#9ca3af',
		'500': '#6b7280',
		'600': '#4b5563',
		'700': '#374151',
		'800': '#1f2937',
		'900': '#111827',
		'950': '#030712',
	},
	zinc: {
		'50': '#fafafa',
		'100': '#f4f4f5',
		'200': '#e4e4e7',
		'300': '#d4d4d8',
		'400': '#a1a1aa',
		'500': '#71717a',
		'600': '#52525b',
		'700': '#3f3f46',
		'800': '#27272a',
		'900': '#18181b',
		'950': '#09090b',
	},
	neutral: {
		'50': '#fafafa',
		'100': '#f5f5f5',
		'200': '#e5e5e5',
		'300': '#d4d4d4',
		'400': '#a3a3a3',
		'500': '#737373',
		'600': '#525252',
		'700': '#404040',
		'800': '#262626',
		'900': '#171717',
		'950': '#0a0a0a',
	},
	stone: {
		'50': '#fafaf9',
		'100': '#f5f5f4',
		'200': '#e7e5e4',
		'300': '#d6d3d1',
		'400': '#a8a29e',
		'500': '#78716c',
		'600': '#57534e',
		'700': '#44403c',
		'800': '#292524',
		'900': '#1c1917',
		'950': '#0c0a09',
	},
	red: {
		'50': '#fef2f2',
		'100': '#fee2e2',
		'200': '#fecaca',
		'300': '#fca5a5',
		'400': '#f87171',
		'500': '#ef4444',
		'600': '#dc2626',
		'700': '#b91c1c',
		'800': '#991b1b',
		'900': '#7f1d1d',
		'950': '#450a0a',
	},
	orange: {
		'50': '#fff7ed',
		'100': '#ffedd5',
		'200': '#fed7aa',
		'300': '#fdba74',
		'400': '#fb923c',
		'500': '#f97316',
		'600': '#ea580c',
		'700': '#c2410c',
		'800': '#9a3412',
		'900': '#7c2d12',
		'950': '#431407',
	},
	amber: {
		'50': '#fffbeb',
		'100': '#fef3c7',
		'200': '#fde68a',
		'300': '#fcd34d',
		'400': '#fbbf24',
		'500': '#f59e0b',
		'600': '#d97706',
		'700': '#b45309',
		'800': '#92400e',
		'900': '#78350f',
		'950': '#451a03',
	},
	yellow: {
		'50': '#fefce8',
		'100': '#fef9c3',
		'200': '#fef08a',
		'300': '#fde047',
		'400': '#facc15',
		'500': '#eab308',
		'600': '#ca8a04',
		'700': '#a16207',
		'800': '#854d0e',
		'900': '#713f12',
		'950': '#422006',
	},
	lime: {
		'50': '#f7fee7',
		'100': '#ecfccb',
		'200': '#d9f99d',
		'300': '#bef264',
		'400': '#a3e635',
		'500': '#84cc16',
		'600': '#65a30d',
		'700': '#4d7c0f',
		'800': '#3f6212',
		'900': '#365314',
		'950': '#1a2e05',
	},
	green: {
		'50': '#f0fdf4',
		'100': '#dcfce7',
		'200': '#bbf7d0',
		'300': '#86efac',
		'400': '#4ade80',
		'500': '#22c55e',
		'600': '#16a34a',
		'700': '#15803d',
		'800': '#166534',
		'900': '#14532d',
		'950': '#052e16',
	},
	emerald: {
		'50': '#ecfdf5',
		'100': '#d1fae5',
		'200': '#a7f3d0',
		'300': '#6ee7b7',
		'400': '#34d399',
		'500': '#10b981',
		'600': '#059669',
		'700': '#047857',
		'800': '#065f46',
		'900': '#064e3b',
		'950': '#022c22',
	},
	teal: {
		'50': '#f0fdfa',
		'100': '#ccfbf1',
		'200': '#99f6e4',
		'300': '#5eead4',
		'400': '#2dd4bf',
		'500': '#14b8a6',
		'600': '#0d9488',
		'700': '#0f766e',
		'800': '#115e59',
		'900': '#134e4a',
		'950': '#042f2e',
	},
	cyan: {
		'50': '#ecfeff',
		'100': '#cffafe',
		'200': '#a5f3fc',
		'300': '#67e8f9',
		'400': '#22d3ee',
		'500': '#06b6d4',
		'600': '#0891b2',
		'700': '#0e7490',
		'800': '#155e75',
		'900': '#164e63',
		'950': '#083344',
	},
	sky: {
		'50': '#f0f9ff',
		'100': '#e0f2fe',
		'200': '#bae6fd',
		'300': '#7dd3fc',
		'400': '#38bdf8',
		'500': '#0ea5e9',
		'600': '#0284c7',
		'700': '#0369a1',
		'800': '#075985',
		'900': '#0c4a6e',
		'950': '#082f49',
	},
	blue: {
		'50': '#eff6ff',
		'100': '#dbeafe',
		'200': '#bfdbfe',
		'300': '#93c5fd',
		'400': '#60a5fa',
		'500': '#3b82f6',
		'600': '#2563eb',
		'700': '#1d4ed8',
		'800': '#1e40af',
		'900': '#1e3a8a',
		'950': '#172554',
	},
	indigo: {
		'50': '#eef2ff',
		'100': '#e0e7ff',
		'200': '#c7d2fe',
		'300': '#a5b4fc',
		'400': '#818cf8',
		'500': '#6366f1',
		'600': '#4f46e5',
		'700': '#4338ca',
		'800': '#3730a3',
		'900': '#312e81',
		'950': '#1e1b4b',
	},
	violet: {
		'50': '#f5f3ff',
		'100': '#ede9fe',
		'200': '#ddd6fe',
		'300': '#c4b5fd',
		'400': '#a78bfa',
		'500': '#8b5cf6',
		'600': '#7c3aed',
		'700': '#6d28d9',
		'800': '#5b21b6',
		'900': '#4c1d95',
		'950': '#2e1065',
	},
	purple: {
		'50': '#faf5ff',
		'100': '#f3e8ff',
		'200': '#e9d5ff',
		'300': '#d8b4fe',
		'400': '#c084fc',
		'500': '#a855f7',
		'600': '#9333ea',
		'700': '#7e22ce',
		'800': '#6b21a8',
		'900': '#581c87',
		'950': '#3b0764',
	},
	fuchsia: {
		'50': '#fdf4ff',
		'100': '#fae8ff',
		'200': '#f5d0fe',
		'300': '#f0abfc',
		'400': '#e879f9',
		'500': '#d946ef',
		'600': '#c026d3',
		'700': '#a21caf',
		'800': '#86198f',
		'900': '#701a75',
		'950': '#4a044e',
	},
	pink: {
		'50': '#fdf2f8',
		'100': '#fce7f3',
		'200': '#fbcfe8',
		'300': '#f9a8d4',
		'400': '#f472b6',
		'500': '#ec4899',
		'600': '#db2777',
		'700': '#be185d',
		'800': '#9d174d',
		'900': '#831843',
		'950': '#500724',
	},
	rose: {
		'50': '#fff1f2',
		'100': '#ffe4e6',
		'200': '#fecdd3',
		'300': '#fda4af',
		'400': '#fb7185',
		'500': '#f43f5e',
		'600': '#e11d48',
		'700': '#be123c',
		'800': '#9f1239',
		'900': '#881337',
		'950': '#4c0519',
	},
}

// Component for the Tailwind color selector
const TailwindColorSelector = (props: any) => {
	const { path, field } = props
	const { value = '', setValue } = useField<string>({ path })
	const { colorSettings, loading } = useColorSettings()

	const [showSelector, setShowSelector] = useState(false)
	const [selectedColor, setSelectedColor] = useState(value || 'blue-500')
	const [selectedFamily, setSelectedFamily] = useState('all')
	const [availableColors, setAvailableColors] =
		useState<Record<string, string[]>>(defaultTailwindColors)
	const [colorHexMap, setColorHexMap] =
		useState<Record<string, Record<string, string>>>(defaultColorMap)

	// Update available colors when color settings are loaded
	useEffect(() => {
		if (colorSettings) {
			// Filter Tailwind colors based on enabled colors in settings
			const enabledTailwindColors = colorSettings.displaySettings?.enabledTailwindColors || []
			const filteredTailwindColors: Record<string, string[]> = {}

			enabledTailwindColors.forEach((color) => {
				if (defaultTailwindColors[color]) {
					filteredTailwindColors[color] = defaultTailwindColors[color]
				}
			})

			// Add custom colors if available
			if (colorSettings.customColors?.length) {
				const { formattedColors, colorMap } = formatCustomColorsForSelector(
					colorSettings.customColors,
				)

				// Combine colors based on display preference
				const combinedColors = colorSettings.displaySettings?.showCustomColorsFirst
					? { ...formattedColors, ...filteredTailwindColors }
					: { ...filteredTailwindColors, ...formattedColors }

				setAvailableColors(combinedColors)

				// Make sure we're properly merging the color maps
				const mergedColorMap = { ...defaultColorMap }

				// Add custom color hex values to the merged map
				Object.entries(colorMap).forEach(([family, shades]) => {
					mergedColorMap[family] = { ...shades }
				})

				setColorHexMap(mergedColorMap)

				// Debug
				console.log('Custom colors loaded:', formattedColors)
				console.log('Custom color map:', colorMap)
				console.log('Merged color map:', mergedColorMap)
			} else {
				setAvailableColors(filteredTailwindColors)
			}
		}
	}, [colorSettings])

	// Update the selected color when the value changes
	useEffect(() => {
		if (value) {
			setSelectedColor(value)
		}
	}, [value])

	// Handle color selection
	const handleSelectColor = (colorName: string, shade: string) => {
		const colorValue = `${colorName}-${shade}`
		setValue(colorValue)
		setSelectedColor(colorValue)
		setShowSelector(false)
	}

	// Toggle the selector
	const toggleSelector = () => {
		setShowSelector(!showSelector)
	}

	// Get the current color's hex value for display
	const getCurrentColorHex = () => {
		const [family, shade] = selectedColor.split('-')
		return colorHexMap[family]?.[shade] || '#ffffff'
	}

	// Filter color families based on selection
	const getFilteredColors = () => {
		if (selectedFamily === 'all') {
			return Object.entries(availableColors)
		}

		return Object.entries(availableColors).filter(([family]) => family === selectedFamily)
	}

	// Get text color for contrast against background
	const getContrastColor = (hexColor: string) => {
		// Convert hex to RGB
		const r = parseInt(hexColor.slice(1, 3), 16)
		const g = parseInt(hexColor.slice(3, 5), 16)
		const b = parseInt(hexColor.slice(5, 7), 16)

		// Calculate luminance
		const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

		// Return black or white based on luminance
		return luminance > 0.5 ? '#000000' : '#ffffff'
	}

	// Get a fallback color for the family preview
	const getFamilyPreviewColor = (family: string) => {
		// For custom colors, try to find a middle shade like 500 or similar
		const shades = availableColors[family] || []
		const preferredShades = ['500', '400', '600', '300', '700', '200', '800']

		// Try to find one of the preferred shades
		for (const shade of preferredShades) {
			if (shades.includes(shade) && colorHexMap[family]?.[shade]) {
				return colorHexMap[family][shade]
			}
		}

		// If no preferred shade is found, use the first available shade
		if (shades.length > 0 && colorHexMap[family]?.[shades[0]]) {
			return colorHexMap[family][shades[0]]
		}

		// Fallback to a neutral gray
		return '#cccccc'
	}

	return (
		<div className="tailwind-color-selector">
			<div className="tailwind-color-selector__header">
				<FieldLabel htmlFor={`field-${path}`} label={field.label} required={field.required} />

				<div className="tailwind-color-selector__preview" onClick={toggleSelector}>
					<div
						className="tailwind-color-selector__current-color"
						style={{ backgroundColor: getCurrentColorHex() }}
					>
						<span
							className="tailwind-color-selector__current-color-text"
							style={{ color: getContrastColor(getCurrentColorHex()) }}
						>
							{selectedColor}
						</span>
					</div>
					<button type="button" className="tailwind-color-selector__toggle-button">
						{showSelector ? 'Close' : 'Select'}
					</button>
				</div>
			</div>

			{showSelector && (
				<div className="tailwind-color-selector__panel">
					<div className="tailwind-color-selector__controls">
						<select
							value={selectedFamily}
							onChange={(e) => setSelectedFamily(e.target.value)}
							className="tailwind-color-selector__family-selector"
						>
							<option value="all">All Color Families</option>
							{Object.keys(availableColors).map((family) => (
								<option key={family} value={family}>
									{family.charAt(0).toUpperCase() + family.slice(1)}
								</option>
							))}
						</select>
					</div>

					{loading ? (
						<div className="tailwind-color-selector__loading">Loading color settings...</div>
					) : (
						<div className="tailwind-color-selector__families">
							{getFilteredColors().map(([family, shades]) => (
								<div key={family} className="tailwind-color-selector__family">
									<h4 className="tailwind-color-selector__family-title">
										<span
											className="tailwind-color-selector__family-color-preview"
											style={{ backgroundColor: getFamilyPreviewColor(family) }}
										></span>
										{family.charAt(0).toUpperCase() + family.slice(1)}
									</h4>
									<div className="tailwind-color-selector__shades">
										{shades.map((shade) => {
											const colorKey = `${family}-${shade}`
											const hexColor = colorHexMap[family]?.[shade] || '#ffffff'
											const textColor = getContrastColor(hexColor)

											return (
												<button
													key={colorKey}
													type="button"
													className={`tailwind-color-selector__shade ${
														selectedColor === colorKey
															? 'tailwind-color-selector__shade--selected'
															: ''
													}`}
													onClick={() => handleSelectColor(family, shade)}
													title={colorKey}
													style={{ backgroundColor: hexColor }}
												>
													<span
														className="tailwind-color-selector__shade-label"
														style={{ color: textColor, opacity: 1 }}
													>
														{shade}
													</span>
												</button>
											)
										})}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			<style jsx>{`
				.tailwind-color-selector {
					margin-bottom: 16px;
				}
				
				.tailwind-color-selector__header {
					margin-bottom: 8px;
				}
				
				.tailwind-color-selector__preview {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 0;
					border: 1px solid var(--theme-border-color);
					border-radius: 6px;
					background-color: var(--theme-input-bg);
					cursor: pointer;
					margin-top: 4px;
					transition: all 0.2s ease;
					overflow: hidden;
				}
				
				.tailwind-color-selector__preview:hover {
					border-color: var(--theme-success-500);
					box-shadow: 0 0 0 1px var(--theme-success-500);
				}
				
				.tailwind-color-selector__current-color {
					flex: 1;
					height: 42px;
					display: flex;
					align-items: center;
					padding: 0 12px;
					font-family: var(--font-mono);
					font-size: 14px;
				}
				
				.tailwind-color-selector__current-color-text {
					font-weight: 500;
				}
				
				.tailwind-color-selector__toggle-button {
					height: 42px;
					padding: 0 16px;
					background-color: var(--theme-elevation-150);
					border: none;
					border-left: 1px solid var(--theme-border-color);
					color: var(--theme-text);
					cursor: pointer;
					font-size: 13px;
					font-weight: 500;
					transition: all 0.2s ease;
					white-space: nowrap;
				}
				
				.tailwind-color-selector__toggle-button:hover {
					background-color: var(--theme-elevation-200);
				}
				
				.tailwind-color-selector__panel {
					border: 1px solid var(--theme-border-color);
					border-radius: 8px;
					background-color: var(--theme-elevation-100);
					padding: 20px;
					margin-top: 8px;
					max-height: 500px;
					overflow-y: auto;
					box-shadow: 0 4px 12px rgba(0,0,0,0.08);
				}
				
				.tailwind-color-selector__controls {
					display: flex;
					gap: 8px;
					margin-bottom: 20px;
				}
				
				.tailwind-color-selector__family-selector {
					padding: 10px;
					border: 1px solid var(--theme-border-color);
					border-radius: 6px;
					background-color: var(--theme-input-bg);
					color: var(--theme-text);
					width: 100%;
					font-size: 14px;
				}
				
				.tailwind-color-selector__loading {
					padding: 20px;
					text-align: center;
					color: var(--theme-text);
					font-style: italic;
				}
				
				.tailwind-color-selector__families {
					display: flex;
					flex-direction: column;
					gap: 28px;
				}
				
				.tailwind-color-selector__family-title {
					margin: 0 0 12px 0;
					font-size: 15px;
					color: var(--theme-text);
					display: flex;
					align-items: center;
					gap: 8px;
				}
				
				.tailwind-color-selector__family-color-preview {
					width: 16px;
					height: 16px;
					border-radius: 4px;
					display: inline-block;
				}
				
				.tailwind-color-selector__shades {
					display: grid;
					grid-template-columns: repeat(auto-fill, minmax(45px, 1fr));
					gap: 10px;
				}
				
				.tailwind-color-selector__shade {
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
					width: 45px;
					height: 45px;
					border: 1px solid rgba(0,0,0,0.1);
					border-radius: 6px;
					cursor: pointer;
					transition: all 0.2s;
					overflow: hidden;
					box-shadow: 0 2px 4px rgba(0,0,0,0.05);
				}
				
				.tailwind-color-selector__shade:hover {
					transform: scale(1.1);
					z-index: 1;
					box-shadow: 0 4px 8px rgba(0,0,0,0.1);
				}
				
				.tailwind-color-selector__shade--selected {
					border: 2px solid var(--theme-success-500);
					box-shadow: 0 0 0 2px var(--theme-success-500);
				}
				
				.tailwind-color-selector__shade-label {
					font-size: 12px;
					font-weight: bold;
					text-align: center;
					text-shadow: 0 1px 2px rgba(0,0,0,0.1);
				}
			`}</style>
		</div>
	)
}

export default TailwindColorSelector
