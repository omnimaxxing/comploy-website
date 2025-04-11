import escapeHTML from 'escape-html'
import React from 'react'

// JSX Converters for typography features
export const TypographyJSXConverters = {
	text: ({ node, key, textContent }: { node: any; key: string; textContent: string }) => {
		const styles = node.getStyle()

		if (!styles) {
			return textContent
		}

		// Parse the styles string into an object
		const styleObj: Record<string, string> = {}
		styles.split(';').forEach((style) => {
			const [property, value] = style.split(':')
			if (property && value) {
				styleObj[property.trim()] = value.trim()
			}
		})

		// Check if we have typography-related styles
		const hasTypographyStyles = styleObj.color || styleObj['font-size']

		if (!hasTypographyStyles) {
			return textContent
		}

		// Create inline style object for the span
		const inlineStyle: Record<string, string> = {}
		if (styleObj.color) inlineStyle.color = styleObj.color
		if (styleObj['font-size']) inlineStyle.fontSize = styleObj['font-size']

		// Return JSX element
		return React.createElement('span', { key, style: inlineStyle }, textContent)
	},
}

// HTML Converters for typography features
export const TypographyHTMLConverters = {
	text: ({ node, key, textContent }: { node: any; key: string; textContent: string }) => {
		const styles = node.getStyle()

		if (!styles) {
			return textContent
		}

		// Parse the styles string into an object
		const styleObj: Record<string, string> = {}
		styles.split(';').forEach((style) => {
			const [property, value] = style.split(':')
			if (property && value) {
				styleObj[property.trim()] = value.trim()
			}
		})

		// Check if we have typography-related styles
		const hasTypographyStyles = styleObj.color || styleObj['font-size']

		if (!hasTypographyStyles) {
			return textContent
		}

		// Create inline style string for the span
		let styleString = ''
		if (styleObj.color) styleString += `color: ${styleObj.color};`
		if (styleObj['font-size']) styleString += `font-size: ${styleObj['font-size']};`

		return `<span style="${escapeHTML(styleString)}">${textContent}</span>`
	},
}
