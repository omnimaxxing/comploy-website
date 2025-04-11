import { admins } from '@/access/admins'
import { anyone } from '@/access/anyone'
import { defaultLexical } from '@/fields/defaultLexical'
import { seoGroup } from '@/fields/seoGroup'
import { createRevalidateGlobal } from '@/hooks/revalidateGlobal'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'
import { getServerSideURL } from '@/utilities/getURL'
import type { GlobalConfig } from 'payload'

const HomeGlobalConfig: GlobalConfig = {
	slug: 'home-global',
	label: 'Home Page',
	access: {
		read: anyone,
		update: admins,
	},
	admin: {
		description: 'Configure the home page content and SEO settings.',
		meta: {
			title: 'Home Page',
			description: 'Configure the home page content and SEO settings.',
		},
		livePreview: {
			url: ({ data }) => {
				const path = generatePreviewPath({
					global: 'home-global',
				})

				return `${getServerSideURL()}${path}`
			},
		},
		preview: (data) => {
			const path = generatePreviewPath({
				global: 'home-global',
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
					description: 'SEO and metadata settings for the home page',
					fields: [seoGroup()],
				},
				{
					label: 'Hero Section',
					fields: [
						{
							name: 'hero',
							type: 'group',
							label: 'Hero',
							fields: [
								{
									type: 'text',
									name: 'headline',
									label: 'Headline',
									defaultValue: 'Discover & Share Plugins for Payload CMS',
								},
								{
									type: 'textarea',
									name: 'subtitle',
									label: 'Subtitle',
									defaultValue:
										'Extend your headless CMS with community-built plugins, components, and code examples.',
								},
								{
									type: 'group',
									name: 'exploreButton',
									label: 'Explore Button',
									fields: [
										{
											type: 'text',
											name: 'label',
											label: 'Button Label',
											defaultValue: 'Explore Plugins',
										},
										{
											type: 'text',
											name: 'url',
											label: 'Button URL',
											defaultValue: '/plugins',
										},
									],
								},
								{
									type: 'group',
									name: 'submitButton',
									label: 'Submit Button',
									fields: [
										{
											type: 'text',
											name: 'label',
											label: 'Button Label',
											defaultValue: 'Submit Your Plugin',
										},
										{
											type: 'text',
											name: 'url',
											label: 'Button URL',
											defaultValue: '/submit',
										},
									],
								},
							],
						},
					],
				},
				{
					label: 'About Section',
					fields: [
						{
							name: 'aboutSection',
							type: 'group',
							label: 'About Section',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Section Title',
									defaultValue: 'About Payload Plugins',
								},
								{
									type: 'richText',
									name: 'content',
									editor: defaultLexical,
									label: 'About Content',
								},
								{
									type: 'group',
									name: 'learnMoreButton',
									label: 'Learn More Button',
									fields: [
										{
											type: 'text',
											name: 'label',
											label: 'Button Label',
											defaultValue: 'Learn More',
										},
										{
											type: 'text',
											name: 'url',
											label: 'Button URL',
											defaultValue: '/about',
										},
									],
								},
							],
						},
					],
				},
				{
					label: 'Explore Cards',
					fields: [
						{
							name: 'exploreCards',
							type: 'array',
							label: 'Explore Cards',
							defaultValue: [
								{
									title: 'Explore Plugins',
									description: 'Discover plugins to enhance your Payload CMS setup',
									linkText: 'Browse Collection',
									linkUrl: '/plugins',
								},
								{
									title: 'Showcase Gallery',
									description: 'View websites and apps built with Payload CMS',
									linkText: 'View Projects',
									linkUrl: '/showcase',
								},
								{
									title: 'Payload Releases',
									description: 'Stay updated with Payload CMS versions and changelog',
									linkText: 'View Updates',
									linkUrl: '/releases',
								},
								{
									title: 'Resources',
									description: 'Tutorials, videos, and blog posts about Payload CMS',
									linkText: 'Access Learning Materials',
									linkUrl: '/resources',
									comingSoon: true,
								},
							],
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Card Title',
									required: true,
								},
								{
									type: 'text',
									name: 'description',
									label: 'Card Description',
									required: true,
								},
								{
									type: 'text',
									name: 'linkText',
									label: 'Link Text',
									required: true,
								},
								{
									type: 'text',
									name: 'linkUrl',
									label: 'Link URL',
									required: true,
								},
								{
									type: 'checkbox',
									name: 'comingSoon',
									label: 'Coming Soon',
									defaultValue: false,
								},
							],
						},
					],
				},
				{
					label: 'Share Section',
					fields: [
						{
							name: 'shareSection',
							type: 'group',
							label: 'Share with Community Section',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Section Title',
									defaultValue: 'Share with the Community',
								},
								{
									type: 'textarea',
									name: 'description',
									label: 'Section Description',
									defaultValue:
										'Built a plugin for Payload CMS or created a website or application using Payload? Share your work with the community to inspire others and showcase your expertise.',
								},
								{
									type: 'array',
									name: 'benefits',
									label: 'Benefits',
									defaultValue: [
										{
											title: 'Recognition',
											description:
												'Gain visibility in the Payload CMS community and establish yourself as a contributor.',
										},
										{
											title: 'Inspire Others',
											description:
												'Help developers build better applications and websites with your contributions.',
										},
										{
											title: 'Showcase Work',
											description:
												'Demonstrate your development expertise through plugins or beautifully designed websites.',
										},
										{
											title: 'Community Growth',
											description:
												'Contribute to the growing ecosystem of Payload CMS extensions and implementations.',
										},
									],
									fields: [
										{
											type: 'text',
											name: 'title',
											label: 'Benefit Title',
											required: true,
										},
										{
											type: 'textarea',
											name: 'description',
											label: 'Benefit Description',
											required: true,
										},
									],
								},
								{
									type: 'group',
									name: 'submitButton',
									label: 'Submit Plugin Button',
									fields: [
										{
											type: 'text',
											name: 'label',
											label: 'Button Label',
											defaultValue: 'Submit Your Plugin',
										},
										{
											type: 'text',
											name: 'url',
											label: 'Button URL',
											defaultValue: '/submit',
										},
									],
								},
								{
									type: 'group',
									name: 'showcaseButton',
									label: 'Showcase Button',
									fields: [
										{
											type: 'text',
											name: 'label',
											label: 'Button Label',
											defaultValue: 'Add to Showcase',
										},
										{
											type: 'text',
											name: 'url',
											label: 'Button URL',
											defaultValue: '/submit-showcase',
										},
									],
								},
							],
						},
					],
				},
				{
					label: 'Community Section',
					fields: [
						{
							name: 'communitySection',
							type: 'group',
							label: 'Community Section',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Section Title',
									defaultValue: 'Join the Payload CMS Community',
								},
								{
									type: 'textarea',
									name: 'description',
									label: 'Section Description',
									defaultValue:
										'Payload Plugins is an independent directory that works alongside the official Payload CMS community. Connect with Payload developers, get help, and stay updated with the latest news.',
								},
								{
									type: 'array',
									name: 'communityLinks',
									label: 'Community Links',
									defaultValue: [
										{
											title: 'Discord',
											description: 'Join discussions, get help, and connect with the community.',
											buttonLabel: 'Join Discord',
											buttonUrl: 'https://discord.com/invite/payload',
										},
										{
											title: 'GitHub',
											description: 'Access the source code, contribute, and report issues.',
											buttonLabel: 'Visit GitHub',
											buttonUrl: 'https://github.com/payloadcms/payload',
										},
										{
											title: 'Official Site',
											description: 'Visit the official Payload CMS website for resources and docs.',
											buttonLabel: 'Visit Website',
											buttonUrl: 'https://payloadcms.com',
										},
									],
									fields: [
										{
											type: 'text',
											name: 'title',
											label: 'Title',
											required: true,
										},
										{
											type: 'textarea',
											name: 'description',
											label: 'Description',
											required: true,
										},
										{
											type: 'text',
											name: 'buttonLabel',
											label: 'Button Label',
											required: true,
										},
										{
											type: 'text',
											name: 'buttonUrl',
											label: 'Button URL',
											required: true,
										},
									],
								},
								{
									type: 'group',
									name: 'creditSection',
									label: 'Credit Section',
									fields: [
										{
											type: 'text',
											name: 'text',
											label: 'Credit Text',
											defaultValue: 'Payload Plugins created by',
										},
										{
											type: 'text',
											name: 'linkText',
											label: 'Link Text',
											defaultValue: 'Omnipixel',
										},
										{
											type: 'text',
											name: 'linkUrl',
											label: 'Link URL',
											defaultValue: 'https://omnipixel.io',
										},
									],
								},
							],
						},
					],
				},
				{
					label: 'Powered By Section',
					fields: [
						{
							name: 'poweredBySection',
							type: 'group',
							label: 'Powered By Section',
							fields: [
								{
									type: 'text',
									name: 'title',
									label: 'Section Title',
									defaultValue: 'This site is powered by',
								},
								{
									type: 'array',
									name: 'techLogos',
									label: 'Technology Logos',
									fields: [
										{
											type: 'text',
											name: 'key',
											label: 'Key (unique identifier)',
											required: true,
										},
										{
											type: 'text',
											name: 'name',
											label: 'Name',
											required: true,
										},
										{
											type: 'upload',
											name: 'logoImage',
											label: 'Logo Image',
											relationTo: 'media',
											required: true,
										},
										{
											type: 'text',
											name: 'href',
											label: 'Link URL',
											required: true,
										},
										{
											type: 'select',
											name: 'style',
											label: 'Logo Style',
											defaultValue: 'dark',
											options: [
												{ label: 'Already White (use brightness)', value: 'white' },
												{ label: 'Dark (use invert)', value: 'dark' },
											],
										},
									],
								},
								{
									type: 'text',
									name: 'gapSize',
									label: 'Gap Between Logos',
									defaultValue: '60px',
								},
							],
						},
					],
				},
			],
		},
	],
	hooks: {
		afterChange: [createRevalidateGlobal('home-global')],
	},
}

export default HomeGlobalConfig
