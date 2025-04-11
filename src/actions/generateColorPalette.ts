'use server'

import { z } from 'zod'
import chroma from 'chroma-js'
import { generateGroqResponse } from '../app/actions'
const requestSchema = z.object({
	prompt: z.string().min(1).max(200),
	count: z.number().min(3).max(10).optional().default(5),
	type: z
		.enum(['analogous', 'complementary', 'triadic', 'tetradic', 'monochromatic'])
		.optional()
		.default('analogous'),
})

type ColorHarmony = {
	name: string
	getColors: (
		baseHue: number,
		count: number,
	) => { hue: number; saturation: number; lightness: number }[]
}

const harmonies: Record<string, ColorHarmony> = {
	analogous: {
		name: 'Analogous',
		getColors: (baseHue, count) => {
			return Array.from({ length: count }, (_, i) => ({
				hue: (baseHue + (30 / count) * i) % 360,
				saturation: 0.5 + Math.random() * 0.3,
				lightness: 0.4 + Math.random() * 0.2,
			}))
		},
	},
	complementary: {
		name: 'Complementary',
		getColors: (baseHue, count) => {
			const complementary = (baseHue + 180) % 360
			const colors: { hue: number; saturation: number; lightness: number }[] = []
			const splitCount = Math.floor(count / 2)

			// Add base color and variations
			for (let i = 0; i < splitCount; i++) {
				colors.push({
					hue: baseHue,
					saturation: 0.5 + i * 0.1,
					lightness: 0.4 + i * 0.1,
				})
			}

			// Add complementary color and variations
			for (let i = 0; i < count - splitCount; i++) {
				colors.push({
					hue: complementary,
					saturation: 0.5 + i * 0.1,
					lightness: 0.4 + i * 0.1,
				})
			}

			return colors
		},
	},
	triadic: {
		name: 'Triadic',
		getColors: (baseHue, count) => {
			const angles = [0, 120, 240]
			return Array.from({ length: count }, (_, i) => ({
				hue: (baseHue + angles[i % 3]) % 360,
				saturation: 0.5 + Math.random() * 0.3,
				lightness: 0.4 + Math.random() * 0.2,
			}))
		},
	},
	tetradic: {
		name: 'Tetradic',
		getColors: (baseHue, count) => {
			const angles = [0, 90, 180, 270]
			return Array.from({ length: count }, (_, i) => ({
				hue: (baseHue + angles[i % 4]) % 360,
				saturation: 0.5 + Math.random() * 0.3,
				lightness: 0.4 + Math.random() * 0.2,
			}))
		},
	},
	monochromatic: {
		name: 'Monochromatic',
		getColors: (baseHue, count) => {
			return Array.from({ length: count }, (_, i) => ({
				hue: baseHue,
				saturation: 0.3 + i * (0.6 / count),
				lightness: 0.2 + i * (0.6 / count),
			}))
		},
	},
}

function checkAccessibility(color: string) {
	const colorObj = chroma(color)
	const whiteContrast = chroma.contrast(colorObj, '#ffffff')
	const blackContrast = chroma.contrast(colorObj, '#000000')

	return {
		wcag2: {
			normal: {
				onWhite: whiteContrast >= 4.5,
				onBlack: blackContrast >= 4.5,
			},
			large: {
				onWhite: whiteContrast >= 3,
				onBlack: blackContrast >= 3,
			},
		},
		contrast: {
			withWhite: Math.round(whiteContrast * 100) / 100,
			withBlack: Math.round(blackContrast * 100) / 100,
		},
	}
}

interface AIColor {
	hex: string
	name: string
	role: string
	description?: string
}

interface ColorMetadata {
	hex: string
	rgb: string
	hsl: string
	name: string
	role: string
	accessibility: {
		wcag2: {
			normal: {
				onWhite: boolean
				onBlack: boolean
			}
			large: {
				onWhite: boolean
				onBlack: boolean
			}
		}
		contrast: {
			withWhite: number
			withBlack: number
		}
	}
}

function generateColorMetadata(color: string, name: string, role: string): ColorMetadata {
	const chromaColor = chroma(color)
	return {
		hex: color,
		rgb: chromaColor.css('rgb'),
		hsl: chromaColor.css('hsl'),
		name,
		role,
		accessibility: checkAccessibility(color),
	}
}

function generateColorScale(baseColor: string, name: string, role: string) {
	const chromaColor = chroma(baseColor)
	const scale = chroma
		.scale(['white', baseColor, 'black'])
		.mode('lab')
		.correctLightness()
		.padding([0.1, 0.1])

	const shades = {
		50: scale(0.05).hex(),
		100: scale(0.1).hex(),
		200: scale(0.2).hex(),
		300: scale(0.3).hex(),
		400: scale(0.4).hex(),
		500: baseColor,
		600: scale(0.6).hex(),
		700: scale(0.7).hex(),
		800: scale(0.8).hex(),
		900: scale(0.9).hex(),
	}

	return {
		name,
		role,
		base: baseColor,
		metadata: generateColorMetadata(baseColor, name, role),
		shades: Object.entries(shades).map(([shade, color]) => ({
			shade: Number(shade),
			color,
			metadata: generateColorMetadata(color, `${name} ${shade}`, role),
		})),
	}
}

interface AIResponse {
	colors: Array<AIColor & { description?: string }>
	explanation: string
	colorTheory?: {
		harmony: string
		mood: string
		context: string
	}
}

// Validate hex colors
const validHexColor = /^#[0-9A-F]{6}$/i
const validRoles = [
	'primary',
	'secondary',
	'accent',
	'success',
	'warning',
	'error',
	'info',
	'neutral',
]

// Type guard function with hex validation
function isValidColor(color: unknown): color is AIColor {
	if (
		typeof color === 'object' &&
		color !== null &&
		typeof (color as AIColor).hex === 'string' &&
		typeof (color as AIColor).name === 'string' &&
		typeof (color as AIColor).role === 'string'
	) {
		const c = color as AIColor
		return validHexColor.test(c.hex) && validRoles.includes(c.role)
	}
	return false
}

function calculateColorHarmony(baseColor: string, type: string, colors: AIColor[]): AIColor[] {
	const base = chroma(baseColor)
	const baseHsl = base.hsl()
	const [baseHue] = baseHsl

	// Enhanced harmony score calculation
	const getHarmonyScore = (color1: string, color2: string) => {
		const c1 = chroma(color1)
		const c2 = chroma(color2)
		const [h1, s1, l1] = c1.hsl()
		const [h2, s2, l2] = c2.hsl()

		// Calculate hue difference considering color wheel
		const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2))

		// Calculate weighted scores
		const saturationBalance = Math.abs(s1 - s2)
		const lightnessBalance = Math.abs(l1 - l2)
		const contrast = chroma.contrast(color1, color2)

		// Combine scores with weights
		return {
			hueDifference: hueDiff,
			saturationBalance: saturationBalance * 0.8, // Weight saturation less
			lightnessBalance: lightnessBalance * 0.6, // Weight lightness less
			contrast,
			total:
				hueDiff * 0.4 +
				saturationBalance * 0.3 +
				lightnessBalance * 0.1 +
				Math.abs(4.5 - contrast) * 0.2,
		}
	}

	const adjustColorForHarmony = (color: string, targetHue: number): string => {
		const col = chroma(color)
		const [h, s, l] = col.hsl()

		// Maintain the original color's saturation and lightness but adjust hue
		let adjustedColor = chroma.hsl(targetHue, s, l)

		// Ensure minimum contrast with base color
		const contrast = chroma.contrast(adjustedColor, baseColor)
		if (contrast < 3) {
			// Adjust lightness to improve contrast while keeping hue
			adjustedColor = contrast < 3 && l < 0.5 ? adjustedColor.brighten(1) : adjustedColor.darken(1)
		}

		return adjustedColor.hex()
	}

	// More precise ideal hues calculation
	const getIdealHues = (baseHue: number, type: string): number[] => {
		switch (type) {
			case 'analogous':
				return [baseHue, (baseHue + 30) % 360, (baseHue + 60) % 360]
			case 'complementary':
				return [baseHue, (baseHue + 180) % 360]
			case 'triadic':
				return [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360]
			case 'tetradic':
				return [baseHue, (baseHue + 90) % 360, (baseHue + 180) % 360, (baseHue + 270) % 360]
			case 'monochromatic':
				// For monochromatic, we'll vary saturation and lightness instead of hue
				return Array(5).fill(baseHue)
			default:
				return [baseHue]
		}
	}

	const idealHues = getIdealHues(baseHue, type)

	// Adjust colors for harmony
	const adjustedColors = colors.map((color, index) => {
		if (color.role === 'primary') return color

		const targetHue = idealHues[index % idealHues.length]
		const currentScore = getHarmonyScore(baseColor, color.hex)

		// More sophisticated harmony check
		const needsAdjustment =
			(type !== 'monochromatic' && currentScore.hueDifference > 20) || // Hue alignment
			currentScore.saturationBalance > 0.4 || // Saturation balance
			currentScore.contrast < 2.5 || // Minimum contrast
			currentScore.contrast > 12 || // Maximum contrast
			currentScore.total > 0.6 // Overall harmony score threshold

		if (needsAdjustment) {
			const adjustedHex = adjustColorForHarmony(color.hex, targetHue)
			return {
				...color,
				hex: adjustedHex,
				description: color.description
					? `${color.description} (harmonized)`
					: `Harmonized ${color.role} color`,
			}
		}

		return color
	})

	return adjustedColors
}

async function analyzePromptWithAI(prompt: string, type: string) {
	const aiPrompt = `Generate a color palette for the following requirements:

PROMPT: "${prompt}"
HARMONY TYPE: ${type}

REQUIREMENTS:
- If a specific color is mentioned, use it as the primary color
- If a brand color is requested, use the authentic brand color
- Generate ${type} harmony colors that complement the primary color
- Ensure all colors are accessible and follow WCAG guidelines
- Colors should work together in a real-world application

You MUST return a JSON object with EXACTLY this structure:
{
  "colors": [
    {
      "hex": "#3B82F6",
      "name": "Primary Blue",
      "role": "primary",
      "description": "A vibrant blue that commands attention"
    }
  ],
  "explanation": "string",
  "colorTheory": {
    "harmony": "string",
    "mood": "string",
    "context": "string"
  }
}

STRICT REQUIREMENTS:
1. MUST include exactly 3-5 colors
2. Each hex code MUST start with # and be 6 characters (e.g., #3B82F6)
3. Each role MUST be unique and one of: [primary, secondary, accent, success, warning, error, info, neutral]
4. Names MUST be descriptive and unique
5. Each color MUST have a description of its emotional impact
6. Explanation MUST be under 100 characters
7. ColorTheory MUST include harmony, mood, and context
8. Colors MUST follow ${type} color harmony principles
9. NO additional fields or text allowed`

	try {
		const response = await generateGroqResponse(aiPrompt, {
			temperature: 0.3,
			max_tokens: 1000,
		})

		if ('error' in response) {
			console.error('Groq API Error:', response.error)
			throw new Error(`AI service error: ${response.error}`)
		}

		let parsed: AIResponse
		try {
			// Handle both string and object responses
			const responseData = response as { message: string | object }
			const parsedData =
				typeof responseData.message === 'string'
					? JSON.parse(responseData.message)
					: responseData.message

			if (!parsedData || typeof parsedData !== 'object') {
				throw new Error('Response is not a valid object')
			}

			parsed = parsedData as AIResponse
		} catch (error) {
			console.error('Failed to parse response:', error)
			console.error('Raw response:', response)
			throw new Error('Failed to parse AI response')
		}

		// Log the parsed response for debugging
		//	console.log('Parsed AI Response:', JSON.stringify(parsed, null, 2))

		// Basic structure validation
		if (!parsed.colors || !Array.isArray(parsed.colors)) {
			console.error('Missing colors array:', parsed)
			throw new Error('Invalid AI response: missing colors array')
		}

		if (parsed.colors.length === 0) {
			console.error('Empty colors array:', parsed)
			throw new Error('Invalid AI response: empty colors array')
		}

		if (!parsed.explanation?.trim()) {
			console.error('Missing explanation:', parsed)
			throw new Error('Invalid AI response: missing explanation')
		}

		if (!parsed.colorTheory?.harmony || !parsed.colorTheory?.mood || !parsed.colorTheory?.context) {
			console.error('Missing color theory:', parsed)
			throw new Error('Invalid AI response: missing or invalid color theory details')
		}

		// Validate and process colors
		if (parsed.colors.length < 3 || parsed.colors.length > 5) {
			console.error('Invalid color count:', parsed.colors.length)
			throw new Error(`Invalid number of colors: ${parsed.colors.length} (expected 3-5)`)
		}

		const validatedColors = parsed.colors.map((color, index) => {
			if (!isValidColor(color)) {
				console.error('Invalid color:', color)
				throw new Error(`Invalid color at index ${index}: ${JSON.stringify(color)}`)
			}

			// Ensure unique roles
			const roleCount = parsed.colors.filter((c) => c.role === color.role).length
			if (roleCount > 1) {
				console.error('Duplicate role:', color.role)
				throw new Error(`Duplicate role found: ${color.role}`)
			}

			// Ensure unique names
			const nameCount = parsed.colors.filter((c) => c.name === color.name).length
			if (nameCount > 1) {
				console.error('Duplicate name:', color.name)
				throw new Error(`Duplicate name found: ${color.name}`)
			}

			return {
				...color,
				description: color.description?.trim() || `A ${color.role} color in the palette`,
			}
		})

		// After validating colors but before generating scales, adjust for harmony
		const harmonizedColors = calculateColorHarmony(
			validatedColors[0].hex, // Primary color
			type,
			validatedColors,
		)

		// Generate color scales with harmonized colors
		const colorScales = harmonizedColors.map((color) =>
			generateColorScale(color.hex, color.name, color.role),
		)

		return {
			colors: colorScales,
			explanation: parsed.explanation.trim(),
			colorTheory: {
				harmony: parsed.colorTheory.harmony.toLowerCase(),
				mood: parsed.colorTheory.mood.toLowerCase(),
				context: parsed.colorTheory.context.trim(),
			},
		}
	} catch (error) {
		console.error('Failed to analyze with AI:', error)
		// Return a fallback palette with clear indication it's a fallback
		return {
			colors: [
				generateColorScale('#FF6B6B', 'Retro Red', 'primary'),
				generateColorScale('#4ECDC4', 'Vintage Teal', 'secondary'),
				generateColorScale('#FFD93D', 'Classic Gold', 'accent'),
			],
			explanation: 'Fallback palette generated due to AI processing error.',
			colorTheory: {
				harmony: type,
				mood: 'retro',
				context: 'A classic color combination inspired by vintage design',
			},
		}
	}
}

function generateDefaultShades(baseColor: string) {
	const scale = chroma.scale(['white', baseColor, 'black']).mode('lab')
	return {
		50: scale(0.05).hex(),
		100: scale(0.1).hex(),
		200: scale(0.2).hex(),
		300: scale(0.3).hex(),
		400: scale(0.4).hex(),
		500: baseColor,
		600: scale(0.6).hex(),
		700: scale(0.7).hex(),
		800: scale(0.8).hex(),
		900: scale(0.9).hex(),
	}
}

export async function generateColorPalette(data: z.infer<typeof requestSchema>) {
	try {
		const { prompt, type } = requestSchema.parse(data)
		const analysis = await analyzePromptWithAI(prompt, type)

		return {
			success: true as const,
			data: {
				name: `${type} - ${prompt}`,
				palettes: analysis.colors,
				type,
				aiAnalysis: {
					explanation: analysis.explanation,
					colorTheory: analysis.colorTheory,
				},
			},
		}
	} catch (error) {
		console.error('Error generating palette:', error)
		return {
			success: false as const,
			error: error instanceof Error ? error.message : 'Failed to generate palette',
		}
	}
}
