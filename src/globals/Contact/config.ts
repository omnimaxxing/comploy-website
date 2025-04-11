import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import { seoGroup } from '@/fields/seoGroup'
import { createRevalidateGlobal } from '@/hooks/revalidateGlobal'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import type { GlobalConfig } from 'payload'

const ContactGlobal: GlobalConfig = {
	slug: 'contact-global',
	label: 'Contact Page',
	access: {
		read: anyone,
		update: admins,
	},
	admin: {
		description: 'Content for the Contact Page, displayed at /contact.',
		meta: {
			title: 'Contact Page',
			description: 'Global Settings and Content for the contact page, displayed at /contact.',
		},
		livePreview: {
			url: ({ data }) => {
				const path = generatePreviewPath({
					global: 'contact-global',
				})

				return `${getServerSideURL()}${path}`
			},
		},
		preview: (data) => {
			const path = generatePreviewPath({
				global: 'contact-global',
			})

			return `${getServerSideURL()}${path}`
		},
	},
	fields: [
		{
			type: 'tabs',
			label: 'Content Sections',
			tabs: [
				{
					label: 'SEO & Metadata',
					fields: [seoGroup()],
				},
				{
					name: 'content',
					label: 'Hero & Form',
					fields: [
						{
							name: 'title',
							type: 'text',
							required: true,
							defaultValue: 'Contact Us',
							label: 'Page Title',
						},
						{
							name: 'subtitle',
							type: 'text',
							required: true,
							defaultValue:
								"We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.",
							label: 'Page Subtitle',
						},
						{
							name: 'formTitle',
							type: 'text',
							required: true,
							defaultValue: 'Send us a message',
							label: 'Form Title',
						},
						{
							name: 'contactInfo',
							type: 'group',
							label: 'Contact Information',
							fields: [
								{
									name: 'email',
									type: 'text',
									label: 'Email Address',
									defaultValue: 'contact@example.com',
								},
								{
									name: 'phone',
									type: 'text',
									label: 'Phone Number',
									defaultValue: '(123) 456-7890',
								},
								{
									name: 'address',
									type: 'textarea',
									label: 'Address',
									defaultValue: '123 Main Street\nAnytown, USA 12345',
								},
							],
						},
					],
				},
				{
					name: 'faqSection',
					label: 'FAQ Section',
					fields: [
						{
							name: 'enabled',
							type: 'checkbox',
							label: 'Enable FAQ Section',
							defaultValue: true,
						},
						{
							name: 'title',
							type: 'text',
							required: true,
							defaultValue: 'Frequently Asked Questions',
							label: 'FAQ Title',
						},
						{
							name: 'subtitle',
							type: 'text',
							required: true,
							defaultValue: 'Quick answers to common questions about our plugin platform',
							label: 'FAQ Subtitle',
						},
						{
							name: 'faqs',
							type: 'array',
							label: 'FAQ Items',
							minRows: 1,
							fields: [
								{
									name: 'question',
									type: 'text',
									required: true,
									label: 'Question',
								},
								{
									name: 'answer',
									type: 'textarea',
									required: true,
									label: 'Answer',
								},
							],
							defaultValue: [
								{
									question: 'How do I submit my plugin?',
									answer:
										'You can submit your plugin by clicking the "Submit Your Plugin" button on the plugins page and following the submission guidelines. Make sure your plugin is well-documented and follows our quality standards.',
								},
								{
									question: 'What information should I include in my plugin submission?',
									answer:
										'Your submission should include a clear name, detailed description, GitHub repository link, installation instructions, and usage examples. Screenshots or demo links are also helpful for users to understand your plugin.',
								},
								{
									question: 'How long does the plugin approval process take?',
									answer:
										'The approval process typically takes 2-5 business days. We review each submission to ensure it meets our quality standards, security requirements, and provides value to the Payload CMS community.',
								},
							],
						},
					],
				},
				{
					name: 'ctaSection',
					label: 'Call to Action',
					fields: [
						{
							name: 'enabled',
							type: 'checkbox',
							label: 'Enable CTA Section',
							defaultValue: true,
						},
						{
							name: 'title',
							type: 'text',
							required: true,
							defaultValue: 'Ready to share your plugin?',
							label: 'CTA Title',
						},
						{
							name: 'description',
							type: 'textarea',
							required: true,
							defaultValue:
								'Contribute to the Payload CMS ecosystem by sharing your plugins with the community.',
							label: 'CTA Description',
						},
						{
							name: 'buttonText',
							type: 'text',
							required: true,
							defaultValue: 'Submit Your Plugin',
							label: 'Button Text',
						},
						{
							name: 'buttonLink',
							type: 'text',
							required: true,
							defaultValue: '/plugins/submit',
							label: 'Button Link',
						},
					],
				},
			],
		},
	],
	hooks: {
		afterChange: [createRevalidateGlobal('contact-global')],
	},
	versions: {
		drafts: {
			autosave: {
				interval: 100,
			},
		},
	},
}

export default ContactGlobal
