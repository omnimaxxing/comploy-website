'use server'

import { revalidatePath } from 'next/cache'
import payload from 'payload'

interface SEOGenerationResult {
	title: string
	description: string
	keywords: string
	faq?: Array<{
		question: string
		answer: string
	}>
}

// Default company information as fallback
const defaultCompanyContext = {
	name: 'OmniPixel',
	tagline: 'Digital Excellence, Pixel Perfect',
	description:
		'OmniPixel is a leading digital agency specializing in web development, design, and Payload CMS solutions. We create custom digital experiences that help businesses grow and succeed online.',
	expertise: [
		'Payload CMS development and customization',
		'Web application development',
		'UI/UX design',
		'E-commerce solutions',
		'Digital strategy',
		'Content management systems',
	],
	values: [
		'Innovation and creativity',
		'Technical excellence',
		'Client-focused approach',
		'Transparency and integrity',
		'Continuous improvement',
	],
	tone: 'Professional yet approachable, expert but not overly technical, confident without being arrogant',
}

export async function generateSEOContent(pageType: string): Promise<SEOGenerationResult> {
	console.log('Server action called with pageType:', pageType)

	if (!process.env.GROQ_API_KEY) {
		console.error('GROQ_API_KEY is not defined in environment variables')
		throw new Error('GROQ_API_KEY is not defined in environment variables')
	}

	try {
		// Fetch company information from the global
		let companyContext = { ...defaultCompanyContext }

		try {
			const companyInfo = await payload.findGlobal({
				slug: 'company-info',
			})

			if (companyInfo) {
				companyContext = {
					name: companyInfo.companyName || defaultCompanyContext.name,
					tagline: companyInfo.tagline || defaultCompanyContext.tagline,
					description: companyInfo.description || defaultCompanyContext.description,
					expertise:
						companyInfo.expertise?.map((item) => item.area) || defaultCompanyContext.expertise,
					values: companyInfo.values?.map((item) => item.value) || defaultCompanyContext.values,
					tone: companyInfo.brandVoice || defaultCompanyContext.tone,
				}
			}
		} catch (error) {
			console.warn('Could not fetch company info, using defaults:', error)
		}

		// Get additional settings if available
		let temperature = 0.7
		let additionalInstructions = ''

		try {
			const companyInfo = await payload.findGlobal({
				slug: 'company-info',
			})

			if (companyInfo?.seoSettings) {
				temperature = companyInfo.seoSettings.temperature || temperature
				additionalInstructions = companyInfo.seoSettings.additionalInstructions || ''
			}
		} catch (error) {
			console.warn('Could not fetch SEO settings, using defaults:', error)
		}

		console.log('Calling Groq API with company context:', companyContext)
		// Call the Groq API to generate SEO content
		const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
			},
			body: JSON.stringify({
				model: 'llama3-70b-8192',
				messages: [
					{
						role: 'system',
						content: `You are an expert SEO content generator for ${companyContext.name}. 
						
Company Information:
- Name: ${companyContext.name}
- Tagline: "${companyContext.tagline}"
- Description: ${companyContext.description}
- Areas of Expertise: ${companyContext.expertise.join(', ')}
- Company Values: ${companyContext.values.join(', ')}
- Brand Voice: ${companyContext.tone}

Your task is to generate optimized SEO content for ${
							companyContext.name
						}'s website based on the page type or description provided. The content should reflect the company's expertise, values, and brand voice. Be specific about ${
							companyContext.name
						}'s services and approach rather than using generic placeholders.

${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ''}`,
					},
					{
						role: 'user',
						content: `Generate SEO content for a ${pageType} page for ${companyContext.name}. Include:
            1. An SEO title (50-60 characters) that includes the ${companyContext.name} brand name
            2. A meta description (150-160 characters) that clearly communicates our value proposition
            3. Relevant keywords (comma-separated) specific to our industry and services
            4. 3 FAQ items with questions and answers related to the page topic that showcase our expertise
            
            Format your response as a JSON object with the following structure:
            {
              "title": "SEO Title Here",
              "description": "Meta description here...",
              "keywords": "keyword1, keyword2, keyword3, ...",
              "faq": [
                {
                  "question": "Question 1?",
                  "answer": "Answer to question 1."
                },
                ...
              ]
            }`,
					},
				],
				temperature: temperature,
				response_format: { type: 'json_object' },
			}),
			cache: 'no-store',
		})

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: 'Failed to parse error response' }))
			console.error('Groq API error:', errorData)
			throw new Error(`Groq API error: ${response.status}`)
		}

		const data = await response.json()
		console.log('Groq API response:', data)

		let content
		try {
			// The content should already be JSON since we specified response_format: { type: 'json_object' }
			content =
				typeof data.choices[0].message.content === 'string'
					? JSON.parse(data.choices[0].message.content)
					: data.choices[0].message.content

			console.log('Parsed content:', content)
		} catch (parseError) {
			console.error('Error parsing content:', parseError)
			console.log('Raw content:', data.choices[0].message.content)
			throw new Error('Failed to parse API response')
		}

		// Return the generated SEO content
		const result = {
			title: content.title || '',
			description: content.description || '',
			keywords: content.keywords || '',
			faq: Array.isArray(content.faq) ? content.faq : [],
		}

		console.log('Returning SEO content:', result)
		return result
	} catch (error) {
		console.error('Error generating SEO content:', error)
		throw new Error('Failed to generate SEO content')
	}
}
