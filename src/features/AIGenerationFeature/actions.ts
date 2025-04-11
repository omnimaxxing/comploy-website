'use server'

import { Groq } from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({
	apiKey: process.env.GROQ_API_KEY,
})

type AIGenerationAction = 'proofread' | 'enhance' | 'generate'

// Define response types for JSON mode
interface ProofreadResponse {
	corrected_text: string
}

interface EnhanceResponse {
	enhanced_text: string
}

interface GenerateResponse {
	generated_content: string
}

export async function generateAIContent(prompt: string, action: AIGenerationAction) {
	console.log(
		`generateAIContent called with action: ${action}, prompt length: ${prompt?.length || 0}`,
	)

	try {
		// Check if Groq API key is configured
		if (!process.env.GROQ_API_KEY) {
			console.error('GROQ_API_KEY is not defined in environment variables')
			return { error: 'GROQ_API_KEY is not defined in environment variables' }
		}

		if (!prompt) {
			console.warn('Empty prompt provided to generateAIContent')
			return { error: 'Prompt is required' }
		}

		// Prepare the system message based on the action
		let systemMessage = ''
		let userMessage = ''

		switch (action) {
			case 'proofread':
				systemMessage = `You are a professional editor and proofreader with exceptional attention to detail. 
Your task is to correct grammar, spelling, punctuation, and improve clarity without changing the meaning or style of the text. 
Maintain the author's voice and tone.

IMPORTANT: You must respond in JSON format with a single field "corrected_text" containing only the corrected version of the text.
Do not include any explanations, comments, or notes about the changes made.
Example response format:
{
  "corrected_text": "The corrected text goes here."
}`
				userMessage = `Proofread and correct the following text. Fix any grammar, spelling, or punctuation errors. Improve clarity where needed, but maintain the original meaning, style, and tone:

"${prompt}"`
				break
			case 'enhance':
				systemMessage = `You are a professional content enhancer with expertise in making text more engaging, professional, and impactful. 
Your job is to elevate the quality of writing while preserving the original meaning and intent. 
Focus on improving word choice, sentence structure, flow, and overall readability.

IMPORTANT: You must respond in JSON format with a single field "enhanced_text" containing only the enhanced version of the text.
Do not include any explanations, comments, or notes about the changes made.
Example response format:
{
  "enhanced_text": "The enhanced text goes here."
}`
				userMessage = `Enhance the following text to make it more professional, engaging, and impactful. Improve word choice, sentence structure, and flow. Add vivid details where appropriate. Maintain the original meaning but make it more compelling:

"${prompt}"`
				break
			case 'generate':
				// For generate, we need to determine if this is a prompt or selected text
				const isShortPrompt = prompt.length < 100

				if (isShortPrompt) {
					// Short prompt for generating new content
					systemMessage = `You are a professional content creator with expertise in creating high-quality, relevant content. 
Your writing is clear, engaging, and well-structured. 
You excel at developing ideas from brief prompts into comprehensive content.

IMPORTANT: You must respond in JSON format with a single field "generated_content" containing only the generated content.
Do not include any explanations, comments, or notes about the generation process.
Example response format:
{
  "generated_content": "The generated content goes here."
}`
					userMessage = `Generate comprehensive, well-structured content about the following topic. Include relevant details, examples, and explanations. Format your response with proper paragraphs separated by blank lines. Make the content engaging and informative:

"${prompt}"`
				} else {
					// Selected text to generate content from
					systemMessage = `You are a professional content creator with expertise in expanding on existing ideas. 
You can analyze text and generate new content that builds upon the themes, style, and context of the original.

IMPORTANT: You must respond in JSON format with a single field "generated_content" containing only the generated content.
Do not include any explanations, comments, or notes about the generation process.
Example response format:
{
  "generated_content": "The generated content goes here."
}`
					userMessage = `The following text has been provided as context. Generate new content that expands on the themes, ideas, and information presented. Create a continuation or related content that maintains the style, tone, and quality of the original:

"${prompt}"`
				}
				break
			default:
				return { error: 'Invalid action' }
		}

		console.log('Calling Groq API with model: llama3-8b-8192')

		// Call Groq API with JSON mode
		try {
			const completion = await groq.chat.completions.create({
				messages: [
					{
						role: 'system',
						content: systemMessage,
					},
					{
						role: 'user',
						content: userMessage,
					},
				],
				model: 'llama3-8b-8192', // Using a smaller model for faster response
				temperature: 0.7,
				max_tokens: 1000,
				top_p: 1,
				response_format: { type: 'json_object' }, // Enable JSON mode
			})

			console.log('Groq API response received')

			const content = completion.choices[0]?.message?.content
			if (!content) {
				console.error('No content in Groq API response')
				return { error: 'No response generated' }
			}

			// Parse the JSON response
			try {
				const parsedResponse = JSON.parse(content)

				// Extract the appropriate field based on the action
				let extractedContent = ''
				if (action === 'proofread' && 'corrected_text' in parsedResponse) {
					extractedContent = parsedResponse.corrected_text
				} else if (action === 'enhance' && 'enhanced_text' in parsedResponse) {
					extractedContent = parsedResponse.enhanced_text
				} else if (action === 'generate' && 'generated_content' in parsedResponse) {
					extractedContent = parsedResponse.generated_content
				} else {
					// Fallback in case the expected field is not found
					console.warn('Expected field not found in JSON response, using raw content')
					extractedContent = content
				}

				console.log(`Extracted content length: ${extractedContent.length}`)
				return { content: extractedContent }
			} catch (parseError) {
				console.error('Error parsing JSON response:', parseError)
				// If JSON parsing fails, return the raw content as a fallback
				return { content: content.trim() }
			}
		} catch (apiError: any) {
			console.error('Error calling Groq API:', apiError)

			// Check if this is a JSON validation error with failed_generation
			if (apiError?.error?.code === 'json_validate_failed' && apiError?.error?.failed_generation) {
				try {
					// Try to extract the generated content directly from the failed_generation field
					const failedGenerationStr = apiError.error.failed_generation

					// First try to parse it as JSON if possible - sometimes the failed generation
					// is actually valid JSON with formatting issues
					try {
						const fullJsonObject = JSON.parse(failedGenerationStr)
						if (fullJsonObject.generated_content) {
							return { content: fullJsonObject.generated_content }
						}
						if (fullJsonObject.corrected_text) {
							return { content: fullJsonObject.corrected_text }
						}
						if (fullJsonObject.enhanced_text) {
							return { content: fullJsonObject.enhanced_text }
						}
					} catch (jsonParseError) {
						// Continue with regex extraction if JSON parsing fails
					}

					// Check if it contains a properly formatted JSON snippet that we can parse
					// Use a more forgiving regex that can handle multiline content with escaped quotes
					const jsonMatch = failedGenerationStr.match(
						/["']?(generated_content|corrected_text|enhanced_text)["']?\s*:\s*["']([^]*?)["'](,|\s*})/,
					)

					if (jsonMatch && jsonMatch[2]) {
						console.log('Extracted content from failed_generation using regex')
						// Extract the content from the JSON key and clean it up
						const extractedContent = jsonMatch[2]
							.replace(/\\r\\n/g, '\n') // Fix Windows newlines
							.replace(/\\n/g, '\n') // Fix Unix newlines
							.replace(/\\"/g, '"') // Fix escaped quotes
							.replace(/\\\\/g, '\\') // Fix escaped backslashes

						return { content: extractedContent }
					}

					// If we couldn't match with the improved regex, try more aggressive content extraction
					// Look for content between triple backticks, which is common in LLM outputs
					const backtickMatch = failedGenerationStr.match(/```(?:json)?\s*({[^]*?})\s*```/)
					if (backtickMatch && backtickMatch[1]) {
						try {
							const parsedBacktickJson = JSON.parse(backtickMatch[1])
							if (parsedBacktickJson.generated_content) {
								return { content: parsedBacktickJson.generated_content }
							}
							if (parsedBacktickJson.corrected_text) {
								return { content: parsedBacktickJson.corrected_text }
							}
							if (parsedBacktickJson.enhanced_text) {
								return { content: parsedBacktickJson.enhanced_text }
							}
						} catch (backtickJsonError) {
							// Continue with other extraction methods
						}
					}

					// If all else fails, try more aggressive extraction based on content patterns
					const contentKeys = ['generated_content', 'corrected_text', 'enhanced_text']
					for (const key of contentKeys) {
						const contentStart = failedGenerationStr.indexOf(`"${key}": "`)
						if (contentStart > -1) {
							const startPos = contentStart + key.length + 5 // Length of '"key": "'

							// Find the closing quote by scanning for a non-escaped quote
							let endPos = startPos
							let foundEnd = false

							// Scan through the string to find the next unescaped quote
							while (!foundEnd && endPos < failedGenerationStr.length) {
								if (
									failedGenerationStr[endPos] === '"' &&
									failedGenerationStr[endPos - 1] !== '\\'
								) {
									foundEnd = true
								} else {
									endPos++
								}
							}

							if (foundEnd && endPos > startPos) {
								const extractedContent = failedGenerationStr
									.substring(startPos, endPos)
									.replace(/\\r\\n/g, '\n')
									.replace(/\\n/g, '\n')
									.replace(/\\"/g, '"')
									.replace(/\\\\/g, '\\')

								return { content: extractedContent }
							}
						}
					}

					// Last resort: If we have failed_generation but couldn't extract a specific field,
					// try to return any text content that looks reasonable
					const cleanedContent = failedGenerationStr
						.replace(
							/^{.*"generated_content":\s*"|^{.*"corrected_text":\s*"|^{.*"enhanced_text":\s*"/i,
							'',
						)
						.replace(/"}\s*$/i, '')
						.replace(/\\r\\n/g, '\n')
						.replace(/\\n/g, '\n')
						.replace(/\\"/g, '"')
						.replace(/\\\\/g, '\\')

					// Only return if it looks like we have reasonable content (not just JSON structure)
					if (cleanedContent.length > 50) {
						console.log('Extracted raw content as last resort')
						return { content: cleanedContent }
					}
				} catch (extractError) {
					console.error('Error extracting content from failed_generation:', extractError)
				}

				// If we couldn't extract content, try a simpler retry without JSON mode
				try {
					console.log('Retrying with simplified non-JSON mode')
					return await retryWithSimplifiedPrompt(userMessage, action)
				} catch (retryError) {
					console.error('Retry also failed:', retryError)
				}
			}

			// If we have a json_validate_failed error without a failed_generation or other extraction failed,
			// try the simplified retry regardless
			if (apiError?.error?.code === 'json_validate_failed' || apiError?.message?.includes('JSON')) {
				try {
					console.log('Retrying with simplified non-JSON mode after JSON validation error')
					return await retryWithSimplifiedPrompt(userMessage, action)
				} catch (retryError) {
					console.error('Simplified retry also failed:', retryError)
				}
			}

			return { error: apiError instanceof Error ? apiError.message : 'Failed to call Groq API' }
		}
	} catch (error) {
		console.error('Error in AI generation:', error)
		return { error: error instanceof Error ? error.message : 'Failed to generate content' }
	}
}

// Function to retry the AI generation with a simplified prompt that doesn't require JSON
async function retryWithSimplifiedPrompt(originalUserMessage: string, action: AIGenerationAction) {
	// Create a simpler system message without JSON requirements
	let systemMessage = ''

	switch (action) {
		case 'proofread':
			systemMessage = `You are a professional editor and proofreader with exceptional attention to detail. 
Your task is to correct grammar, spelling, punctuation, and improve clarity without changing the meaning or style of the text. 
Maintain the author's voice and tone. Return ONLY the corrected text without any additional explanation.`
			break
		case 'enhance':
			systemMessage = `You are a professional content enhancer with expertise in making text more engaging, professional, and impactful. 
Your job is to elevate the quality of writing while preserving the original meaning and intent. 
Focus on improving word choice, sentence structure, flow, and overall readability.
Return ONLY the enhanced text without any additional explanation.`
			break
		case 'generate':
			systemMessage = `You are a professional content creator with expertise in creating high-quality, relevant content. 
Your writing is clear, engaging, and well-structured. 
You excel at developing ideas from brief prompts into comprehensive content.
Return ONLY the generated content without any additional explanation or formatting.`
			break
		default:
			throw new Error('Invalid action for retry')
	}

	console.log('Calling Groq API without JSON mode for retry')

	try {
		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: 'system',
					content: systemMessage,
				},
				{
					role: 'user',
					content: originalUserMessage,
				},
			],
			model: 'llama3-8b-8192',
			temperature: 0.7,
			max_tokens: 1000,
			top_p: 1,
			// No response_format specified - get raw text
		})

		const content = completion.choices[0]?.message?.content
		if (!content) {
			return { error: 'No response generated in retry' }
		}

		// Clean up any markdown or JSON artifacts that might have been included
		const cleanedContent = content
			.replace(/```json\s*/, '')
			.replace(/```\s*$/, '')
			.replace(/^\s*{\s*"(?:generated_content|corrected_text|enhanced_text)"\s*:\s*"/, '')
			.replace(/"\s*}\s*$/, '')

		return { content: cleanedContent }
	} catch (retryError) {
		console.error('Error in simplified retry:', retryError)
		throw retryError
	}
}
