'use server'

import { Groq } from 'groq-sdk'

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
})

export async function generateGroqResponse(
	prompt: string,
	options: {
		response_format?: { type: 'text' | 'json_object' }
		temperature?: number
		max_tokens?: number
		top_p?: number
	} = {},
) {
	try {
		// Ensure temperature is within valid range for Groq
		const temperature =
			options.temperature === 0 ? 1e-8 : Math.min(Math.max(options.temperature ?? 0.7, 1e-8), 2)

		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: 'system',
					content: `You are a color theory expert and brand color specialist. Your task is to generate precise, accurate color palettes that EXACTLY match the user's requirements.

CRITICAL RULES:
1. If a specific color is mentioned (e.g., "Deloitte green"), you MUST use that exact color or its closest match as the primary color
2. If a brand color is requested, research and use the authentic brand color values
3. All generated colors must align with the specified theme/mood/brand
4. Colors must follow proper color theory and accessibility guidelines
5. Each color must serve a clear purpose in the palette

You must ALWAYS respond with a valid JSON object matching this exact structure:
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
}`,
				},
				{
					role: 'user',
					content: prompt,
				},
			],
			model: 'mixtral-8x7b-32768',
			temperature,
			max_tokens: options.max_tokens ?? 1000, // Increased for more detailed responses
			top_p: options.top_p ?? 1,
			response_format: { type: 'json_object' },
		})

		const content = completion.choices[0]?.message?.content
		if (!content) {
			throw new Error('No response generated')
		}

		try {
			// Parse the content if it's a string, or use as is if it's already an object
			const jsonResponse = typeof content === 'string' ? JSON.parse(content.trim()) : content

			// Validate basic structure
			if (!jsonResponse || typeof jsonResponse !== 'object') {
				throw new Error('Response is not a valid JSON object')
			}

			if (!Array.isArray(jsonResponse.colors)) {
				throw new Error('Response missing colors array')
			}

			return { message: jsonResponse }
		} catch (error) {
			// If JSON parsing fails, it's an API issue
			console.error('Failed to parse JSON response:', error)
			console.error('Raw content:', content)
			throw new Error(error instanceof Error ? error.message : 'Invalid JSON response from API')
		}
	} catch (error) {
		console.error('Error with Groq API:', error)
		return {
			error: error instanceof Error ? error.message : 'Failed to generate response',
		}
	}
}
