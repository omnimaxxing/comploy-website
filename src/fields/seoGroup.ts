import deepMerge from '@/utilities/deepMerge'
import type { Field } from 'payload'

type SEOGroupType = (options?: { overrides?: Record<string, unknown> }) => Field

export const seoGroup: SEOGroupType = ({ overrides = {} } = {}) => {
	const seoResult: Field = {
		name: 'seo',
		label: 'SEO Settings',
		type: 'group',
		admin: {
			components: {
				beforeInput: ['@/components/admin/SEOGenerator'],
			},
		},
		fields: [
			{
				name: 'title',
				type: 'text',
				label: 'SEO Title',
				required: true,
				admin: {
					description:
						'Recommended length is 50-60 characters for optimal display in search results, but you can exceed this if needed.',
					components: {
						afterInput: ['@/components/admin/CharacterCounter'],
					},
				},
			},
			{
				name: 'description',
				type: 'textarea',
				label: 'Meta Description',
				required: true,
				admin: {
					description:
						'Recommended length is 150-160 characters for optimal display in search results, but you can exceed this if needed.',
					components: {
						afterInput: ['@/components/admin/CharacterCounter'],
					},
				},
			},
			{
				name: 'keywords',
				type: 'text',
				label: 'Meta Keywords',
				admin: {
					description: 'Comma-separated keywords (optional but recommended)',
				},
			},
			{
				name: 'ogImage',
				type: 'upload',
				label: 'Open Graph Image',
				relationTo: 'media',
				admin: {
					description: 'Recommended size: 1200x630 pixels. Used when sharing on social media.',
				},
			},
			{
				name: 'canonicalUrl',
				type: 'text',
				label: 'Canonical URL',
				admin: {
					description: 'Set this only if the canonical URL differs from the current page URL',
				},
			},
			{
				name: 'isAnswerPage',
				type: 'checkbox',
				label: 'Is Answer Page',
				admin: {
					description: 'Enable if this page is optimized for SERP answer boxes',
				},
			},
			{
				name: 'faq',
				type: 'array',
				label: 'FAQ Schema',
				admin: {
					description: 'Add FAQ items to generate FAQ schema',
				},
				fields: [
					{
						name: 'question',
						type: 'text',
						required: true,
					},
					{
						name: 'answer',
						type: 'textarea',
						required: true,
					},
				],
			},
			{
				name: 'howTo',
				type: 'group',
				label: 'How-To Schema',
				admin: {
					description: 'Add How-To instructions to generate How-To schema',
				},
				fields: [
					{
						name: 'name',
						type: 'text',
						label: 'How-To Title',
					},
					{
						name: 'description',
						type: 'textarea',
						label: 'How-To Description',
					},
					{
						name: 'steps',
						type: 'array',
						label: 'Steps',
						fields: [
							{
								name: 'name',
								type: 'text',
								label: 'Step Name',
								required: true,
							},
							{
								name: 'text',
								type: 'textarea',
								label: 'Step Description',
								required: true,
							},
							{
								name: 'image',
								type: 'upload',
								label: 'Step Image',
								relationTo: 'media',
							},
						],
					},
				],
			},
			{
				name: 'speakable',
				type: 'group',
				label: 'Speakable Content',
				admin: {
					description: 'Mark sections that should be prioritized for voice search',
				},
				fields: [
					{
						name: 'cssSelector',
						type: 'array',
						label: 'CSS Selectors',
						fields: [
							{
								name: 'selector',
								type: 'text',
								required: true,
							},
						],
					},
				],
			},
			{
				name: 'breadcrumbs',
				type: 'array',
				label: 'Breadcrumbs',
				admin: {
					description: 'Define the breadcrumb trail for this page',
				},
				fields: [
					{
						name: 'name',
						type: 'text',
						label: 'Name',
						required: true,
					},
					{
						name: 'item',
						type: 'text',
						label: 'URL',
						required: true,
					},
				],
			},
		],
	}

	return deepMerge(seoResult, overrides)
}
