'use client'

import React, { useState } from 'react'
import { useField, Button, TextInput } from '@payloadcms/ui'
import { generateSEOContent } from '../../../app/actions/seoGenerator'

// This component will be used as a beforeFields component in the SEO group
const SEOGenerator = (props: any) => {
	const { path } = props

	// The path might be something like 'tabs.0.fields.0.seo' for the SEO group in a tab structure
	console.log('SEOGenerator props:', props)
	console.log('Raw path:', path)

	// Get field setters for all SEO fields we want to populate
	const titleField = useField({ path: `${path}.title` })
	const descriptionField = useField({ path: `${path}.description` })
	const keywordsField = useField({ path: `${path}.keywords` })
	const faqField = useField({ path: `${path}.faq` })

	console.log('SEO Fields:', {
		titlePath: `${path}.title`,
		descriptionPath: `${path}.description`,
		keywordsPath: `${path}.keywords`,
		faqPath: `${path}.faq`,
	})

	const [pageType, setPageType] = useState('')
	const [isGenerating, setIsGenerating] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState(false)

	const generateSEO = async () => {
		if (!pageType.trim()) {
			setError('Please enter a page type or description')
			return
		}

		setIsGenerating(true)
		setError('')
		setSuccess(false)

		try {
			console.log('Generating SEO content for:', pageType)
			// Call the server action to generate SEO content
			const data = await generateSEOContent(pageType)
			console.log('Generated SEO data:', data)

			// Populate the SEO fields with the generated content
			if (data.title && titleField.setValue) {
				console.log('Setting title to:', data.title)
				titleField.setValue(data.title)
			}

			if (data.description && descriptionField.setValue) {
				console.log('Setting description to:', data.description)
				descriptionField.setValue(data.description)
			}

			if (data.keywords && keywordsField.setValue) {
				console.log('Setting keywords to:', data.keywords)
				keywordsField.setValue(data.keywords)
			}

			// If FAQ items were generated, set them
			if (data.faq && Array.isArray(data.faq) && data.faq.length > 0 && faqField.setValue) {
				console.log('Setting FAQ items:', data.faq)
				faqField.setValue(
					data.faq.map((item: any) => ({
						question: item.question,
						answer: item.answer,
					})),
				)
			}

			setSuccess(true)
		} catch (err) {
			console.error('Error generating SEO content:', err)
			setError('Failed to generate SEO content. Please try again.')
		} finally {
			setIsGenerating(false)
		}
	}

	// Handle input change
	const handleInputChange = (e: any) => {
		setPageType(e.target.value)
	}

	return (
		<div className="seo-generator">
			<h3>OmniPixel AI SEO Generator</h3>
			<p className="seo-generator__description">
				Describe the page content or type (e.g., "Services page" or "About Us page"). The AI will
				generate SEO content tailored to OmniPixel's brand, expertise, and values.
			</p>

			<div className="seo-generator__input-row">
				<div className="seo-generator__input-container">
					<input
						type="text"
						value={pageType}
						onChange={handleInputChange}
						placeholder="Enter page type or description"
						className="seo-generator__input"
					/>
				</div>
				<Button onClick={generateSEO} disabled={isGenerating} buttonStyle="primary">
					{isGenerating ? 'Generating...' : 'Generate SEO'}
				</Button>
			</div>

			{error && <div className="seo-generator__message seo-generator__message--error">{error}</div>}

			{success && (
				<div className="seo-generator__message seo-generator__message--success">
					SEO content successfully generated! You can now edit the fields as needed.
				</div>
			)}

			<div className="seo-generator__info">
				<p className="seo-generator__info-title">What will be generated:</p>
				<ul className="seo-generator__info-list">
					<li>SEO title with OmniPixel branding</li>
					<li>Meta description highlighting our value proposition</li>
					<li>Industry-specific keywords</li>
					<li>FAQ items that showcase our expertise</li>
				</ul>
			</div>

			<style jsx>{`
				.seo-generator {
					margin-bottom: 24px;
					padding: 16px;
					border-radius: 4px;
					border: 1px solid var(--theme-border-color);
					background-color: var(--theme-elevation-100);
				}

				.seo-generator h3 {
					margin-top: 0;
					margin-bottom: 12px;
					color: var(--theme-text);
				}

				.seo-generator__description {
					margin-bottom: 16px;
					font-size: 14px;
					color: var(--theme-text);
				}

				.seo-generator__input-row {
					display: flex;
					gap: 8px;
					margin-bottom: 12px;
					align-items: center;
				}

				.seo-generator__input-container {
					flex: 1;
				}
				
				.seo-generator__input {
					width: 100%;
					padding: 8px;
					border: 1px solid var(--theme-border-color);
					border-radius: 4px;
					background-color: var(--theme-input-bg);
					color: var(--theme-text);
					font-family: var(--font-body);
					font-size: 14px;
				}

				.seo-generator__message {
					font-size: 14px;
					margin-top: 8px;
					padding: 8px;
					border-radius: 4px;
				}

				.seo-generator__message--error {
					background-color: var(--theme-error-500);
					color: white;
				}

				.seo-generator__message--success {
					background-color: var(--theme-success-500);
					color: white;
				}

				.seo-generator__info {
					font-size: 13px;
					margin-top: 16px;
					padding: 8px;
					border-radius: 4px;
					background-color: var(--theme-elevation-200);
					color: var(--theme-text);
				}

				.seo-generator__info-title {
					margin: 0 0 8px 0;
					font-weight: bold;
				}

				.seo-generator__info-list {
					margin: 0;
					padding-left: 20px;
				}
			`}</style>
		</div>
	)
}

export default SEOGenerator
