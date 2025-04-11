'use server'

import { Groq } from 'groq-sdk'

const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
})

export async function generateGroqResponse(
	prompt: string,
	options?: {
		response_format?: { type: 'text' | 'json_object' }
		temperature?: number
		max_tokens?: number
	},
) {
	try {
		const completion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'mixtral-8x7b-32768',
			temperature: options?.temperature ?? 0.7,
			max_tokens: options?.max_tokens ?? 100,
			top_p: 1,
			...(options?.response_format && { response_format: options.response_format }),
		})

		return { message: completion.choices[0]?.message?.content || 'No response generated' }
	} catch (error) {
		console.error('Error with Groq API:', error)
		return { error: 'Failed to generate response' }
	}
}
